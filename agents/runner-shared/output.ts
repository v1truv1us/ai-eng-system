/**
 * Shared output utilities for workflow runners.
 *
 * Replaces fragile ../../.. relative path escapes with repo-root discovery.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Walk up from startDir looking for a directory that contains a git repo
 * or a package.json. Returns process.cwd() as fallback.
 */
export function findRepoRoot(startDir: string): string {
    let dir = startDir;
    for (let i = 0; i < 8; i++) {
        if (
            existsSync(join(dir, ".git")) ||
            existsSync(join(dir, "package.json"))
        ) {
            return dir;
        }
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return process.cwd();
}

/**
 * Write a workflow report to .ai-eng/reports/ under the repo root.
 *
 * @param url        URL or query that was reviewed
 * @param report     Markdown report content
 * @param runtime    Driver name (e.g. "pi", "cursor")
 * @param prefix     File prefix (e.g. "seo-review", "research")
 * @returns Path to the written file
 */
export function writeReport(
    url: string,
    report: string,
    runtime: string,
    prefix: string,
): string {
    const repoRoot = findRepoRoot(process.cwd());
    const reportsDir = join(repoRoot, ".ai-eng", "reports");
    mkdirSync(reportsDir, { recursive: true });

    const safeHost = url
        .replace(/^https?:\/\//, "")
        .replace(/[^a-zA-Z0-9.-]+/g, "-")
        .replace(/^-|-$/g, "");
    const date = new Date().toISOString().slice(0, 10);
    const reportPath = join(
        reportsDir,
        `${prefix}-${safeHost || "site"}-${date}-${runtime}.md`,
    );
    writeFileSync(
        reportPath,
        `# ${prefix}: ${url} (${runtime})\n\n${report}\n`,
        "utf8",
    );
    return reportPath;
}
