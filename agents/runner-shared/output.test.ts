import { describe, expect, test } from "bun:test";
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findRepoRoot, writeReport } from "./output.js";

describe("findRepoRoot", () => {
    test("finds directory with .git", () => {
        const tmp = mkdtempSync(join(tmpdir(), "test-"));
        mkdirSync(join(tmp, ".git"), { recursive: true });
        writeFileSync(join(tmp, ".git", "config"), "", "utf-8");
        const actual = findRepoRoot(join(tmp, "deep", "nested"));
        expect(actual).toBe(tmp);
        rmSync(tmp, { recursive: true });
    });

    test("falls back to cwd when nothing found", () => {
        const tmp = mkdtempSync(join(tmpdir(), "test-"));
        const actual = findRepoRoot(tmp);
        expect(actual).toBe(process.cwd());
        rmSync(tmp, { recursive: true });
    });
});

describe("writeReport", () => {
    test("writes report to .ai-eng/reports/ under resolved root", () => {
        const tmp = mkdtempSync(join(tmpdir(), "test-"));
        writeFileSync(join(tmp, "package.json"), "{}", "utf-8");

        const origCwd = process.cwd;
        process.cwd = () => tmp;

        try {
            const path = writeReport(
                "https://example.com",
                "# Report",
                "pi",
                "seo-review",
            );
            expect(path).toContain(".ai-eng/reports/");
            expect(existsSync(path)).toBe(true);
        } finally {
            process.cwd = origCwd;
            rmSync(tmp, { recursive: true });
        }
    });
});
