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
            if (entry.name === "gtm") continue;
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
            const contentCount = countFiles(
                join(ROOT, "content/commands"),
                /\.md$/,
            );
            const claudeCount = countFiles(
                join(ROOT, ".claude/commands"),
                /\.md$/,
            );
            expect(claudeCount).toBe(contentCount);
        });

        it("should have at least 32 skills", () => {
            const count = countSkillsRecursive(join(ROOT, "skills"));
            expect(count).toBeGreaterThanOrEqual(32);
        });

        it("should have at least 44 agents", () => {
            const count = countFiles(join(ROOT, "content/agents"), /\.md$/);
            expect(count).toBeGreaterThanOrEqual(44);
        });

        it("should have at least 28 content commands", () => {
            const count = countFiles(join(ROOT, "content/commands"), /\.md$/);
            expect(count).toBeGreaterThanOrEqual(28);
        });
    });

    describe("Lifecycle skills", () => {
        const requiredSkills = [
            "spec-driven-development",
            "planning-and-task-breakdown",
            "test-driven-development",
            "source-driven-development",
            "browser-testing-with-devtools",
            "security-and-hardening",
            "ci-cd-and-automation",
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
        const aliases = ["spec", "ship"];

        for (const alias of aliases) {
            it(`should have alias command: /${alias}`, () => {
                const path = join(ROOT, ".claude/commands", `${alias}.md`);
                expect(existsSync(path)).toBe(true);
            });
        }
    });

    describe("Core agents", () => {
        const agents = [
            "claude-conductor",
            "claude-planner-agent",
            "claude-work-agent",
            "claude-debugger-agent",
            "claude-refactor-agent",
            "claude-lookup-agent",
            "code-reviewer",
            "security-scanner",
            "performance-engineer",
            "architect-advisor",
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
                existsSync(join(ROOT, "docs/reference/skills-first-map.md")),
            ).toBe(true);
        });

        it("should have workflow-surface-matrix.md", () => {
            expect(
                existsSync(
                    join(ROOT, "docs/reference/workflow-surface-matrix.md"),
                ),
            ).toBe(true);
        });

        it("skills reference should mention current skill count", () => {
            const content = readFileSync(
                join(ROOT, "docs/reference/skills.md"),
                "utf-8",
            );
            const count = countSkillsRecursive(join(ROOT, "skills"));
            expect(content).toContain(String(count));
        });

        it("agents reference should mention current agent count", () => {
            const content = readFileSync(
                join(ROOT, "docs/reference/agents.md"),
                "utf-8",
            );
            const count = countFiles(join(ROOT, "content/agents"), /\.md$/);
            expect(content).toContain(String(count));
        });
    });
    describe("Source tree", () => {
        it("should not have legacy root src/ tree", () => {
            expect(existsSync(join(ROOT, "src"))).toBe(false);
        });

        it("should keep canonical runtime under packages/cli/src", () => {
            expect(existsSync(join(ROOT, "packages/cli/src/index.ts"))).toBe(
                true,
            );
        });
    });

    // --- Claude plugin / OpenCode parity ---
    // Every catalog item must land in at least one marketplace plugin so the
    // Claude Code plugins collectively ship the same content OpenCode gets.
    function listSkillRels(dir: string, prefix = ""): string[] {
        if (!existsSync(dir)) return [];
        const out: string[] = [];
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            if (entry.name === "gtm") continue; // opt-in, excluded from default
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (existsSync(join(dir, entry.name, "SKILL.md"))) out.push(rel);
            else out.push(...listSkillRels(join(dir, entry.name), rel));
        }
        return out;
    }

    function listPluginUnion(
        dirName: "skills" | "agents" | "commands",
    ): Set<string> {
        const set = new Set<string>();
        const pluginsDir = join(ROOT, "plugins");
        if (!existsSync(pluginsDir)) return set;
        for (const plugin of readdirSync(pluginsDir, { withFileTypes: true })) {
            if (!plugin.isDirectory() || !plugin.name.startsWith("ai-eng-"))
                continue;
            const sub = join(pluginsDir, plugin.name, dirName);
            if (!existsSync(sub)) continue;
            if (dirName === "skills") {
                for (const rel of listSkillRels(sub)) set.add(rel);
            } else {
                for (const f of readdirSync(sub).filter((f) =>
                    f.endsWith(".md"),
                ))
                    set.add(f);
            }
        }
        return set;
    }

    describe("Claude plugin parity (vs OpenCode catalog)", () => {
        it("every catalog skill appears in at least one marketplace plugin", () => {
            const catalog = listSkillRels(join(ROOT, "skills"));
            const union = listPluginUnion("skills");
            const missing = catalog.filter((s) => !union.has(s));
            expect(missing).toEqual([]);
        });

        it("every catalog agent appears in at least one marketplace plugin", () => {
            const agents = readdirSync(join(ROOT, "content/agents")).filter(
                (f) => f.endsWith(".md"),
            );
            const union = listPluginUnion("agents");
            const missing = agents.filter((a) => !union.has(a));
            expect(missing).toEqual([]);
        });

        it("every catalog command appears in at least one marketplace plugin", () => {
            const commands = readdirSync(join(ROOT, "content/commands")).filter(
                (f) => f.endsWith(".md"),
            );
            const union = listPluginUnion("commands");
            const missing = commands.filter((c) => !union.has(c));
            expect(missing).toEqual([]);
        });
    });
});
