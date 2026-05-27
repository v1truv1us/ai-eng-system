#!/usr/bin/env tsx
/**
 * Pi CLI SEO review runner.
 *
 * Usage:
 *   npx tsx runner.ts "https://example.com"
 *   npx tsx runner.ts --agent technical-seo "https://example.com"
 */

import { createDriver } from "../../runner-shared/drivers/index.js";
import { parseArgs } from "../../runner-shared/parse.js";
import { buildSeoPrompt } from "../../runner-shared/seo-prompt.js";
import { writeReport } from "../../runner-shared/output.js";

async function main(): Promise<void> {
  const { positionals, flags } = parseArgs(process.argv.slice(2), ["--agent"]);

  const url = positionals.join(" ").trim();
  if (!url) {
    console.error('Usage: npx tsx runner.ts [--agent technical-seo] "https://example.com"');
    process.exit(1);
  }

  const agent = (flags["--agent"] as string | undefined) ??
    process.env.AI_ENG_AGENT?.trim() ||
    undefined;

  const prompt = buildSeoPrompt(url, agent);

  const driver = await createDriver("pi");
  try {
    const report = await driver.runPrompt(prompt);
    const reportPath = writeReport(url, report, "pi", "seo-review");
    console.error(`SEO review written to: ${reportPath}`);
    console.log(report);
  } finally {
    await driver.close?.();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
