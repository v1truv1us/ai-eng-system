#!/usr/bin/env tsx
/**
 * Anthropic Claude Agent SDK SEO review runner.
 *
 * Usage:
 *   npx tsx runner.ts "https://example.com"
 *   npx tsx runner.ts --agent technical-seo "https://example.com"
 *
 * Requires ANTHROPIC_API_KEY set in the environment.
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildPrompt, parseArgs, writeReport } from "../shared/prompt.ts";

async function main(): Promise<void> {
  const { url, agent } = parseArgs();
  if (!url) {
    console.error('Usage: npx tsx runner.ts [--agent technical-seo] "https://example.com"');
    process.exit(1);
  }

  const prompt = buildPrompt(url, agent);
  console.error(`Running SEO review via Claude Agent SDK for ${url}…`);

  let report = "(no text response)";
  for await (const message of query({
    prompt,
    options: { allowedTools: [] },
  })) {
    if ("result" in message && typeof message.result === "string") {
      report = message.result;
    }
  }

  const reportPath = writeReport(url, report.trim() || "(no report)", "anthropic");
  console.error(`SEO review written to: ${reportPath}`);
  console.log(report);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
