import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function buildPrompt(url: string, agent: string | undefined): string {
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

export function parseArgs(): { url: string; agent?: string } {
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

export function writeReport(url: string, report: string, runtime: string): string {
  const reportsDir = join(process.cwd(), "..", "..", "..", ".ai-eng", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const safeHost = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = join(reportsDir, `seo-review-${safeHost || "site"}-${date}-${runtime}.md`);
  writeFileSync(reportPath, `# SEO Review: ${url} (${runtime})\n\n${report}\n`, "utf8");
  return reportPath;
}
