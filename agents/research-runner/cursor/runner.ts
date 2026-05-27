/**
 * Cursor SDK research runner.
 *
 * Usage:
 *   npx tsx runner.ts "your research question"
 *   npx tsx runner.ts --templates A1,M2 "targeted question"
 */

import { createDriver } from "../../runner-shared/drivers/index.js";
import { parseArgs } from "../../runner-shared/parse.js";
import { formatPrompt } from "../../runner-shared/prompt.js";
import { mapLimit } from "../../runner-shared/pool.js";
import { loadTemplates, type QueryTemplate } from "../shared/templates.ts";
import {
  synthesize,
  writeBrief,
  type TemplateResult,
} from "../shared/output.ts";

async function runTemplate(
  driver: Awaited<ReturnType<typeof createDriver>>,
  template: QueryTemplate,
  systemPrompt: string,
  query: string,
  agent: string | undefined,
): Promise<TemplateResult> {
  const prompt = formatPrompt(systemPrompt, template.text, query, agent);
  const text = await driver.runPrompt(prompt);
  return { id: template.id, name: template.name, text };
}

async function main(): Promise<void> {
  const { positionals, flags } = parseArgs(process.argv.slice(2), [
    "--templates",
    "--agent",
  ]);

  const query = positionals.join(" ").trim();
  if (!query) {
    console.error(
      'Usage: npx tsx runner.ts [--templates A1,M2] "research question"',
    );
    process.exit(1);
  }

  const agent = (flags["--agent"] as string | undefined) ??
    process.env.AI_ENG_AGENT?.trim() ||
    undefined;
  const templateFilter = ((flags["--templates"] as string) ?? "")
    .split(",")
    .filter(Boolean);

  const data = loadTemplates();
  const templates = templateFilter.length > 0
    ? data.templates.filter((t) => templateFilter.includes(t.id))
    : data.templates;

  if (templates.length === 0) {
    console.error(`No templates matched: ${templateFilter.join(",")}`);
    process.exit(1);
  }

  console.error(`Running ${templates.length} template(s) via Cursor driver…`);

  const driver = await createDriver("cursor");
  try {
    const results = await mapLimit(
      templates,
      3,
      (t) => runTemplate(driver, t, data.systemPrompt, query, agent),
    );

    const synthesis = await synthesize(query, results);
    const briefPath = writeBrief(query, results, "cursor", synthesis);
    console.error(`Brief written to: ${briefPath}`);
  } finally {
    await driver.close?.();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
