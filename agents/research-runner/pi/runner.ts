/**
 * Pi coding-agent research runner.
 *
 * Spawns one `pi` process per query template in parallel (print mode, --json),
 * collects results, then writes a brief to the vault.
 *
 * Requires: `pi` CLI installed and on PATH (https://github.com/badlogic/lemmy)
 *
 * Usage:
 *   npx tsx runner.ts "your research question"
 *   npx tsx runner.ts --templates A1,M2 "targeted question"
 */

import { spawn } from "node:child_process";
import { loadTemplates, type QueryTemplate } from "../shared/templates.ts";
import {
  synthesize,
  writeBrief,
  type TemplateResult,
} from "../shared/output.ts";

function runPi(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = spawn("pi", ["-p", prompt, "--json"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(
          new Error(
            `pi exited with code ${code}${stderr ? `\nstderr: ${stderr.trim()}` : ""}`,
          ),
        );
      }
    });
  });
}

async function runTemplate(
  template: QueryTemplate,
  systemPrompt: string,
  query: string,
): Promise<TemplateResult> {
  const fullPrompt = `${systemPrompt}\n\n${template.text}\n\nQuery context: ${query}`;
  const raw = await runPi(fullPrompt);

  // pi --json wraps output in { content: string } or { text: string };
  // fall back to raw string if it's not parseable JSON
  let text = raw;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const p = parsed as Record<string, unknown>;
      text = (typeof p.content === "string" ? p.content : null)
        ?? (typeof p.text === "string" ? p.text : null)
        ?? raw;
    }
  } catch {
    // Not JSON — use raw string as-is
  }

  return { id: template.id, name: template.name, text };
}

function parseArgs(): { query: string; templateFilter: string[] } {
  const args = process.argv.slice(2);
  const flagIdx = args.indexOf("--templates");
  let templateFilter: string[] = [];
  let rest = [...args];

  if (flagIdx !== -1) {
    templateFilter = (args[flagIdx + 1] ?? "").split(",").filter(Boolean);
    rest = args.filter((_, i) => i !== flagIdx && i !== flagIdx + 1);
  }

  return { query: rest.join(" ").trim(), templateFilter };
}

async function main(): Promise<void> {
  const { query, templateFilter } = parseArgs();
  if (!query) {
    console.error(
      'Usage: npx tsx runner.ts [--templates A1,M2] "research question"',
    );
    process.exit(1);
  }

  const data = loadTemplates();
  const templates =
    templateFilter.length > 0
      ? data.templates.filter((t) => templateFilter.includes(t.id))
      : data.templates;

  if (templates.length === 0) {
    console.error(`No templates matched: ${templateFilter.join(",")}`);
    process.exit(1);
  }

  console.error(`Spawning ${templates.length} pi instance(s) in parallel…`);

  const results = await Promise.all(
    templates.map((t) => runTemplate(t, data.systemPrompt, query)),
  );

  const synthesis = await synthesize(query, results);
  const briefPath = writeBrief(query, results, "pi", synthesis);
  console.error(`Brief written to: ${briefPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
