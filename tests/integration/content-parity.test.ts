#!/usr/bin/env bun

/**
 * Content parity validation tests
 * Verifies that docs, inventories, and file surfaces are consistent
 */

import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function countFiles(dir: string, pattern: RegExp): number {
    if (!existsSync(dir)) return 0;
    return readdirSync(dir).filter((f) => pattern.test(f)).length;
}

function countSkillsRecursive(dir: string): number {
    if (!existsSync(dir)) return 0;
    let count = 0;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const skillPath = join(dir, entry.name, "SKILL.md");
            if (existsSync(skillPath)) {
                count++;
            } else {
                count += countSkillsRecursive(join(dir, entry.name));
            }
        }
    }
    return count;
}

describe("Content Parity", () => {
    describe("File counts", () => {
        it("should have matching content/commands and .claude/commands counts", () => {
            const contentCount = countFiles(join(ROOT, "content/commands"), /\.md$/);
            const claudeCount = countFiles(join(ROOT, ".claude/commands"), /\.md$/);
            expect(claudeCount).toBe(contentCount);
        });

        it("should have at least 32 skills", () => {
            const count = countSkillsRecursive(join(ROOT, "skills"));
            expect(count).toBeGreaterThanOrEqual(32);
        });

        it("should have at least 38 agents", () => {
            const count = countFiles(join(ROOT, "content/agents"), /\.md$/);
            expect(count).toBeGreaterThanOrEqual(38);
        });

        it("should have at least 47 content commands", () => {
            const count = countFiles(join(ROOT, "content/commands"), /\.md$/);
            expect(count).toBeGreaterThanOrEqual(47);
        });
    });

    describe("Lifecycle skills", () => {
        const requiredSkills = [
            "idea-refine",
            "spec-driven-development",
            "planning-and-task-breakdown",
            "test-driven-development",
            "context-engineering",
            "source-driven-development",
            "frontend-ui-engineering",
            "api-and-interface-design",
            "browser-testing-with-devtools",
            "security-and-hardening",
            "performance-optimization",
            "git-workflow-and-versioning",
            "ci-cd-and-automation",
            "deprecation-and-migration",
            "documentation-and-adrs",
            "shipping-and-launch",
        ];

        for (const skill of requiredSkills) {
            it(`should have lifecycle skill: ${skill}`, () => {
                const path = join(ROOT, "skills", skill, "SKILL.md");
                expect(existsSync(path)).toBe(true);
            });
        }
    });

    describe("Lifecycle aliases", () => {
        const aliases = ["spec", "build", "test", "code-simplify", "ship"];

        for (const alias of aliases) {
            it(`should have alias command: /${alias}`, () => {
                const path = join(ROOT, ".claude/commands", `${alias}.md`);
                expect(existsSync(path)).toBe(true);
            });
        }
    });

    describe("New agents", () => {
        const agents = [
            "planner",
            "tdd-guide",
            "build-error-resolver",
            "docs-lookup",
            "e2e-runner",
            "harness-optimizer",
        ];

        for (const agent of agents) {
            it(`should have agent: ${agent}`, () => {
                const path = join(ROOT, "content/agents", `${agent}.md`);
                expect(existsSync(path)).toBe(true);
            });
        }
    });

    describe("Skill frontmatter", () => {
        const skillDirs = readdirSync(join(ROOT, "skills"), {
            withFileTypes: true,
        })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);

        for (const dir of skillDirs) {
            const skillPath = join(ROOT, "skills", dir, "SKILL.md");
            if (!existsSync(skillPath)) continue;

            it(`skill ${dir} should have valid frontmatter`, () => {
                const content = readFileSync(skillPath, "utf-8");
                expect(content).toMatch(/^---\n/);
                expect(content).toMatch(/name:\s+\S+/);
                expect(content).toMatch(/description:\s+.+/);
            });
        }
    });

    describe("Reference docs", () => {
        it("should have skills-first-map.md", () => {
            expect(
                existsSync(join(ROOT, "docs/reference/skills-first-map.md"))
            ).toBe(true);
        });

        it("should have workflow-surface-matrix.md", () => {
            expect(
                existsSync(
                    join(ROOT, "docs/reference/workflow-surface-matrix.md")
                )
            ).toBe(true);
        });

        it("skills reference should mention 32 skills", () => {
            const content = readFileSync(
                join(ROOT, "docs/reference/skills.md"),
                "utf-8"
            );
            expect(content).toContain("32");
        });

        it("agents reference should mention 38 agents", () => {
            const content = readFileSync(
                join(ROOT, "docs/reference/agents.md"),
                "utf-8"
            );
            expect(content).toContain("38");
        });
    });
});
