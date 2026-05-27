import { describe, expect, test } from "bun:test";
import { recentCommits } from "../src/shared/git-fallback.js";

const NUL = "\x00";
const RS = "\x1e";

function makeGitOutput(
    commits: {
        sha: string;
        short: string;
        author: string;
        date: string;
        subject: string;
    }[],
): string {
    return (
        commits
            .map(
                (c) =>
                    `${c.sha}${NUL}${c.short}${NUL}${c.author}${NUL}${c.date}${NUL}${c.subject}`,
            )
            .join(RS) + (commits.length > 0 ? RS : "")
    );
}

describe("git-fallback", () => {
    test("parses git log output with NUL field separators", () => {
        const fakeOutput = makeGitOutput([
            {
                sha: "abc123def456789",
                short: "abc123d",
                author: "Alice <a@example.com>",
                date: "2026-05-26T10:00:00-07:00",
                subject: "fix: handle edge case in parser",
            },
        ]);
        const commits = recentCommits({
            repoPath: "/fake/repo",
            runGit: () => fakeOutput,
        });
        expect(commits).toHaveLength(1);
        expect(commits[0]).toEqual({
            sha: "abc123def456789",
            short: "abc123d",
            author: "Alice <a@example.com>",
            date: "2026-05-26T10:00:00-07:00",
            subject: "fix: handle edge case in parser",
        });
    });

    test("returns empty array on empty git output", () => {
        const commits = recentCommits({
            repoPath: "/fake/repo",
            runGit: () => "",
        });
        expect(commits).toEqual([]);
    });

    test("parses multiple commits separated by record separator", () => {
        const fakeOutput = makeGitOutput([
            {
                sha: "111",
                short: "1111111",
                author: "A",
                date: "2026-05-26T01:00:00Z",
                subject: "first",
            },
            {
                sha: "222",
                short: "2222222",
                author: "B",
                date: "2026-05-26T02:00:00Z",
                subject: "second",
            },
            {
                sha: "333",
                short: "3333333",
                author: "C",
                date: "2026-05-26T03:00:00Z",
                subject: "third",
            },
        ]);
        const commits = recentCommits({
            repoPath: "/fake",
            runGit: () => fakeOutput,
        });
        expect(commits.map((c) => c.subject)).toEqual([
            "first",
            "second",
            "third",
        ]);
    });

    test("handles subject with embedded NUL by joining the rest", () => {
        // Real-world: subjects have colons, dashes, but never NULs. We're
        // defensive — if a subject did contain a NUL, we glue it back.
        const fakeOutput = `aaa${NUL}aaa1234${NUL}A${NUL}2026-05-26T00:00:00Z${NUL}refactor:${NUL}with extra${RS}`;
        const commits = recentCommits({
            repoPath: "/fake",
            runGit: () => fakeOutput,
        });
        expect(commits[0]!.subject).toBe(`refactor:${NUL}with extra`);
    });

    test("passes since and limit to git CLI", () => {
        let receivedArgs: string[] = [];
        recentCommits({
            repoPath: "/fake",
            since: "2 hours ago",
            limit: 5,
            runGit: (_, args) => {
                receivedArgs = args;
                return "";
            },
        });
        expect(receivedArgs).toContain("--since=2 hours ago");
        expect(receivedArgs).toContain("--max-count=5");
    });

    test("uses defaults when since and limit are unset", () => {
        let receivedArgs: string[] = [];
        recentCommits({
            repoPath: "/fake",
            runGit: (_, args) => {
                receivedArgs = args;
                return "";
            },
        });
        expect(receivedArgs).toContain("--since=24 hours ago");
        expect(receivedArgs).toContain("--max-count=20");
    });
});
