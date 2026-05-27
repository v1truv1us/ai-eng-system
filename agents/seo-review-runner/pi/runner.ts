#!/usr/bin/env tsx
/**
 * Pi CLI SEO review runner.
 *
 * Usage:
 *   npx tsx runner.ts "https://example.com"
 *   npx tsx runner.ts --agent technical-seo "https://example.com"
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Args {
  url: string;
  agent?: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let agent = process.env.AI_ENG_AGENT?.trim() || undefined;
  const rest: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--agent") {
      agent = args[++i]?.trim() || agent;
    } else {
      rest.push(args[i]);
    }
  }

  return { url: rest.join(" ").trim(), agent };
}

function runPi(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = spawn("pi", ["-p", prompt], {
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
      if (code === 0) resolve(stdout.trim());
      else {
        reject(
          new Error(
            `pi exited with code ${code}${stderr ? `\nstderr: ${stderr.trim()}` : ""}`,
          ),
        );
      }
    });
  });
}

function unwrapPiOutput(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      return (
        (typeof record.content === "string" ? record.content : undefined) ??
        (typeof record.text === "string" ? record.text : undefined) ??
        raw
      );
    }
  } catch {
    // Not JSON; keep raw output.
  }
  return raw;
}

function buildPrompt(url: string, agent: string | undefined): string {
  const agentPrompt = agent ? `\n\nAgent instruction: ${agent}` : "";
  return `You are running an SEO review workflow for ${url}.${agentPrompt}

Review the URL for:
- Lighthouse-style SEO, performance, accessibility, and best-practices risks
- Core Web Vitals risks: LCP, CLS, INP, TTFB
- title, meta description, canonical, robots, viewport, Open Graph, Twitter Card
- heading hierarchy
- image alt text, sizing, modern formats, lazy loading
- internal/external links, target=_blank rel safety, descriptive anchors
- sitemap.xml and robots.txt expectations
- structured data / JSON-LD
- HTTPS, redirects, compression, caching, mixed content
- mobile and accessibility basics

If live browsing or Lighthouse is unavailable, say so and provide a confidence score. Do not invent measured scores.

Return markdown with:
1. Summary
2. Evidence gathered
3. Critical issues
4. Warnings
5. Suggestions
6. Prioritized recommendations
7. Confidence score from 0.0 to 1.0
`;
}

async function main(): Promise<void> {
  const { url, agent } = parseArgs();
  if (!url) {
    console.error('Usage: npx tsx runner.ts [--agent technical-seo] "https://example.com"');
    process.exit(1);
  }

  const prompt = buildPrompt(url, agent);
  const raw = await runPi(prompt);
  const report = unwrapPiOutput(raw).trim() || "(no report)";

  const reportsDir = join(process.cwd(), "..", "..", "..", ".ai-eng", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const safeHost = url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.-]+/g, "-").replace(/^-|-$/g, "");
  const reportPath = join(reportsDir, `seo-review-${safeHost || "site"}-${new Date().toISOString().slice(0, 10)}.md`);
  writeFileSync(reportPath, `# SEO Review: ${url}\n\n${report}\n`, "utf8");

  console.error(`SEO review written to: ${reportPath}`);
  console.log(report);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
