/**
 * Local git CLI shell-out used when the Bitbucket MCP is unavailable.
 * Returns commit/PR-equivalent shapes so the workflow can still produce
 * a "Recent commits" section in the brief.
 */

import { execFileSync } from "node:child_process";

export interface CommitSummary {
    sha: string;
    short: string;
    author: string;
    date: string; // ISO-8601
    subject: string;
}

export interface GitFallbackOptions {
    repoPath: string;
    since?: string; // anything `git log --since` accepts; default: 24h
    limit?: number;
    /** Test seam: defaults to execFileSync. */
    runGit?: (repoPath: string, args: string[]) => string;
}

const DEFAULT_RUN_GIT = (repoPath: string, args: string[]): string =>
    execFileSync("git", ["-C", repoPath, ...args], { encoding: "utf-8" });

/**
 * Read recent commits from a local clone. Output format mirrors what
 * the Bitbucket MCP would surface for "Recent commits in this repo."
 */
export function recentCommits(opts: GitFallbackOptions): CommitSummary[] {
    const limit = opts.limit ?? 20;
    const since = opts.since ?? "24 hours ago";
    const run = opts.runGit ?? DEFAULT_RUN_GIT;

    // Field separator: NUL (\0). Field order: full SHA, short SHA, author,
    // ISO-8601 date, subject. Subject ends at the next \0.
    const format = "%H%x00%h%x00%an%x00%aI%x00%s";
    const args = [
        "log",
        `--since=${since}`,
        `--max-count=${limit}`,
        `--pretty=format:${format}%x1e`,
    ];

    const raw = run(opts.repoPath, args).trim();
    if (raw === "") return [];

    const records = raw.split("\x1e").filter((r) => r.trim() !== "");
    return records.map((record) => {
        const trimmed = record.replace(/^\n/, "");
        const [sha, short, author, date, ...subjectParts] =
            trimmed.split("\x00");
        return {
            sha: sha ?? "",
            short: short ?? "",
            author: author ?? "",
            date: date ?? "",
            subject: subjectParts.join("\x00"),
        };
    });
}
