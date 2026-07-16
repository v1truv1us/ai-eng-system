import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
function markdownFiles(directory: string): string[] {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);
        if (entry === "gtm") return [];
        if (statSync(path).isDirectory()) return markdownFiles(path);
        return entry.endsWith(".md") ? [path] : [];
    });
}

const files = [
    ...markdownFiles(join(ROOT, "content/agents")),
    ...markdownFiles(join(ROOT, "content/commands")),
    ...markdownFiles(join(ROOT, "skills")).filter((file) =>
        file.endsWith("/SKILL.md"),
    ),
];

const bannedPatterns = [
    /^## Pi Context-Aware Execution$/m,
    /^## Critical Importance$/m,
    /^## The Challenge$/m,
    /^## .*Confidence Assessment$/m,
    /Systematic approach required/i,
    /rate your confidence/i,
    /worth \$\d+/i,
    /I bet you/i,
    /take a deep breath/i,
    /your expertise is highly sought/i,
    /legendary in the industry/i,
    /^You are .*years of experience.*(?:companies|having| at )/im,
];

describe("canonical prompt efficiency", () => {
    test("sets a compact default output contract", () => {
        const missing = files.filter(
            (file) => !readFileSync(file, "utf8").includes("Default output:"),
        );
        expect(missing).toEqual([]);
    });

    test("rejects no-op prompting language", () => {
        const violations = files.flatMap((file) => {
            const content = readFileSync(file, "utf8");
            return bannedPatterns
                .filter((pattern) => pattern.test(content))
                .map((pattern) => `${file}: ${pattern}`);
        });
        expect(violations).toEqual([]);
    });
});
