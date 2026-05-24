/**
 * Cursor SDK research runner.
 *
 * Creates one Cursor Agent per query template, runs all in parallel,
 * then writes a brief to the vault.
 *
 * Usage:
 *   npx tsx runner.ts "your research question"
 *   npx tsx runner.ts --templates A1,M2 "targeted question"
 *
 * Requires:
 *   CURSOR_API_KEY    — from cursor.com/dashboard
 *   ANTHROPIC_API_KEY — for the synthesis step (or falls back to claude CLI)
 */

import "dotenv/config";
import { Agent } from "@cursor/sdk";
import { loadTemplates, type QueryTemplate } from "../shared/templates.ts";
import {
  synthesize,
  writeBrief,
  type TemplateResult,
} from "../shared/output.ts";

async function runTemplate(
  apiKey: string,
  systemPrompt: string,
  template: QueryTemplate,
  query: string,
): Promise<TemplateResult> {
  const agent = await Agent.create({
    apiKey,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });

  const fullPrompt = `${systemPrompt}\n\n${template.text}\n\nQuery context: ${query}`;
  const run = await agent.send(fullPrompt);

  let text = "";
  for await (const event of run.stream()) {
    // Collect text from whatever shape the event arrives in
    const e = event as unknown as Record<string, unknown>;
    if (typeof e["text"] === "string") {
      text += e["text"];
    } else if (e["type"] === "text" && typeof e["content"] === "string") {
      text += e["content"];
    } else if (
      e["type"] === "message" &&
      typeof (e as Record<string, unknown>)["text"] === "string"
    ) {
      text += (e as Record<string, unknown>)["text"] as string;
    } else if (typeof e["delta"] === "string") {
      text += e["delta"];
    }
  }

  return {
    id: template.id,
    name: template.name,
    text: text.trim() || "(no text response)",
  };
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

  const query = rest.join(" ").trim();
  return { query, templateFilter };
}

async function main(): Promise<void> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "Error: CURSOR_API_KEY is not set.\n" +
        "Add it to agents/research-runner/cursor/.env:\n" +
        "  CURSOR_API_KEY=your-key-from-cursor.com/dashboard",
    );
    process.exit(1);
  }

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

  console.error(`Running ${templates.length} Cursor agent(s) in parallel…`);

  const results = await Promise.all(
    templates.map((t) => runTemplate(apiKey, data.systemPrompt, t, query)),
  );

  const synthesis = await synthesize(query, results);
  const briefPath = writeBrief(query, results, "cursor", synthesis);
  console.error(`Brief written to: ${briefPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
