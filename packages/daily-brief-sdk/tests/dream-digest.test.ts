import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    statSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    DreamDigestPathError,
    nextAvailablePath,
    writeDreamDigest,
} from "../src/shared/dream-digest-router.js";

describe("dream-digest router", () => {
    let tmp: string;
    beforeEach(() => {
        tmp = mkdtempSync(join(tmpdir(), "dream-"));
    });
    afterEach(() => {
        rmSync(tmp, { recursive: true, force: true });
    });

    test("writes weekly-YYYY-MM-DD.html on first run", () => {
        const result = writeDreamDigest({
            date: "2026-05-25",
            html: "<p>digest</p>",
            outputDir: tmp,
        });
        expect(result.path).toBe(join(tmp, "weekly-2026-05-25.html"));
        expect(existsSync(result.path)).toBe(true);
    });

    test("filename collision triggers numeric suffix, never overwrites", () => {
        const first = writeDreamDigest({
            date: "2026-05-25",
            html: "<p>first</p>",
            outputDir: tmp,
        });
        const second = writeDreamDigest({
            date: "2026-05-25",
            html: "<p>second</p>",
            outputDir: tmp,
        });
        expect(second.path).toBe(join(tmp, "weekly-2026-05-25-2.html"));
        expect(first.path).not.toBe(second.path);
        // First file remains untouched.
        const firstContent = require("node:fs").readFileSync(
            first.path,
            "utf-8",
        );
        expect(firstContent).toBe("<p>first</p>");
    });

    test("third collision uses -3 suffix", () => {
        writeDreamDigest({ date: "2026-05-25", html: "1", outputDir: tmp });
        writeDreamDigest({ date: "2026-05-25", html: "2", outputDir: tmp });
        const third = writeDreamDigest({
            date: "2026-05-25",
            html: "3",
            outputDir: tmp,
        });
        expect(third.path).toBe(join(tmp, "weekly-2026-05-25-3.html"));
    });

    test("nextAvailablePath returns base path when nothing exists", () => {
        expect(nextAvailablePath("2026-05-25", tmp)).toBe(
            join(tmp, "weekly-2026-05-25.html"),
        );
    });

    test("REFUSES to write into ~/.claude/projects/<id>/memory/", () => {
        // Construct a fake memory path inside the temp dir.
        const fakeMemory = join(tmp, ".claude", "projects", "test", "memory");
        mkdirSync(fakeMemory, { recursive: true });
        let caught: unknown;
        try {
            writeDreamDigest({
                date: "2026-05-25",
                html: "<p>poison</p>",
                outputDir: fakeMemory,
            });
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(DreamDigestPathError);
        if (caught instanceof DreamDigestPathError) {
            expect(caught.message).toContain("auto-memory");
        }
    });

    test("memory-isolation invariant: existing memory files are never modified", () => {
        // Simulate a memory file with a known mtime.
        const fakeMemory = join(tmp, ".claude", "projects", "x", "memory");
        mkdirSync(fakeMemory, { recursive: true });
        const memoryFile = join(fakeMemory, "MEMORY.md");
        writeFileSync(memoryFile, "real auto-memory content", "utf-8");
        const beforeMtime = statSync(memoryFile).mtimeMs;

        // Run the digest writer multiple times against the legitimate
        // dream-digest output dir (which is OUTSIDE memory).
        const dreamDir = join(tmp, ".claude", "cook-and-brief", "dream-digest");
        for (let i = 0; i < 3; i++) {
            writeDreamDigest({
                date: "2026-05-25",
                html: `<p>run ${i}</p>`,
                outputDir: dreamDir,
            });
        }

        const afterMtime = statSync(memoryFile).mtimeMs;
        expect(afterMtime).toBe(beforeMtime);
        // And the content is unchanged.
        const content = require("node:fs").readFileSync(memoryFile, "utf-8");
        expect(content).toBe("real auto-memory content");
    });
});
