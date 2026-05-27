#!/usr/bin/env tsx
/**
 * Cursor SDK SEO review runner.
 *
 * Usage:
 *   npx tsx runner.ts "https://example.com"
 *   npx tsx runner.ts --agent technical-seo "https://example.com"
 *
 * Requires CURSOR_API_KEY set in the environment (from cursor.com/dashboard).
 */

import "dotenv/config";
import { Agent } from "@cursor/sdk";
import { buildPrompt, parseArgs, writeReport } from "../shared/prompt.ts";

async function main(): Promise<void> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "Error: CURSOR_API_KEY is not set.\n" +
        "Add it to agents/seo-review-runner/cursor/.env:\n" +
        "  CURSOR_API_KEY=your-key-from-cursor.com/dashboard",
    );
    process.exit(1);
  }

  const { url, agent: agentInstruction } = parseArgs();
  if (!url) {
    console.error('Usage: npx tsx runner.ts [--agent technical-seo] "https://example.com"');
    process.exit(1);
  }

  const prompt = buildPrompt(url, agentInstruction);
  console.error(`Running SEO review via Cursor SDK for ${url}…`);

  const agent = await Agent.create({
    apiKey,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });

  try {
    const agentRun = await agent.send(prompt);
    let report = "";

    for await (const event of agentRun.stream()) {
      const e = event as unknown as Record<string, unknown>;
      if (typeof e["text"] === "string") {
        report += e["text"];
      } else if (e["type"] === "text" && typeof e["content"] === "string") {
        report += e["content"];
      } else if (typeof e["delta"] === "string") {
        report += e["delta"];
      }
    }

    const reportPath = writeReport(url, report.trim() || "(no report)", "cursor");
    console.error(`SEO review written to: ${reportPath}`);
    console.log(report);
  } finally {
    await agent[Symbol.asyncDispose]();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
