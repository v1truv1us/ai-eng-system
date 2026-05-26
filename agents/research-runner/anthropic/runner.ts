/**
 * Anthropic Claude Agent SDK research runner.
 *
 * Runs all 9 query templates in parallel against a single research question,
 * then writes a brief to the vault's wiki/briefs/ directory.
 *
 * Usage:
 *   npx tsx runner.ts "your research question"
 *   npx tsx runner.ts --templates A1,M1 "targeted question"
 *
 * Requires ANTHROPIC_API_KEY set in the environment (or .env at repo root).
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { loadTemplates, type QueryTemplate } from "../shared/templates.ts";
import {
  synthesize,
  writeBrief,
  type TemplateResult,
} from "../shared/output.ts";

async function runTemplate(
  systemPrompt: string,
  template: QueryTemplate,
  research: string,
): Promise<TemplateResult> {
  const prompt = `${systemPrompt}\n\n${template.text}\n\nQuery context: ${research}`;
  let result = "(no text response)";

  for await (const message of query({
    prompt,
    options: {
      // No file-system or web tools — pure text synthesis.
      // An empty allowedTools list keeps the loop to a single turn.
      allowedTools: [],
    },
  })) {
    if ("result" in message && typeof message.result === "string") {
      result = message.result;
    }
  }

  return { id: template.id, name: template.name, text: result };
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

  const q = rest.join(" ").trim();
  return { query: q, templateFilter };
}

async function main(): Promise<void> {
  const { query: research, templateFilter } = parseArgs();
  if (!research) {
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

  console.error(`Running ${templates.length} template(s) in parallel via Claude Agent SDK…`);

  const results = await Promise.all(
    templates.map((t) => runTemplate(data.systemPrompt, t, research)),
  );

  const synthesis = await synthesize(research, results);
  const briefPath = writeBrief(research, results, "anthropic", synthesis);
  console.error(`Brief written to: ${briefPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
