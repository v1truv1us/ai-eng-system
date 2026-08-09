#!/usr/bin/env bun
/**
 * Self-improving skills loop — safety gate.
 *
 * Rejects candidate patches that touch automation-immutable regions:
 *   - SKILL.md frontmatter keys matching scope|permission|security|tools|mode
 *   - sections titled ## Safety, ## Scope, or ## Boundaries
 *   - evals.json patches that shrink the eval count
 *
 * Writes safety_check back into each proposal JSON. Exit 1 if any approved
 * proposal fails the check.
 *
 * Usage: bun scripts/check-skill-safety.ts [--skill=name]
 */
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { applyUnifiedDiff } from "./lib/apply-diff";
import type { SkillProposal } from "./lib/skill-loop-schemas";

const REPO_ROOT = join(import.meta.dir, "..");
const SENSITIVE_FRONTMATTER = /^(scope|permissions?|security|tools|mode)\b/i;

export function extractFrontmatter(content: string): string {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    return match ? match[1] : "";
}

export function frontmatterKeys(frontmatter: string): Set<string> {
    const keys = new Set<string>();
    for (const line of frontmatter.split("\n")) {
        const match = line.match(/^([A-Za-z_-]+):/);
        if (match) keys.add(match[1]);
    }
    return keys;
}

export function extractSection(content: string, title: string): string | null {
    const sections = content.split(/(?=^## )/m);
    for (const section of sections) {
        if (
            section.startsWith(`## ${title}\n`) ||
            section.trimEnd() === `## ${title}`
        ) {
            return section.replace(/^## [^\n]*\n?/, "").trim();
        }
    }
    return null;
}

export interface SafetyViolation {
    rule: string;
    detail: string;
}

export function checkPatchSafety(
    originalContent: string,
    patchedContent: string,
    file: string,
): SafetyViolation[] {
    const violations: SafetyViolation[] = [];

    if (file === "SKILL.md") {
        const oldFm = extractFrontmatter(originalContent);
        const newFm = extractFrontmatter(patchedContent);
        if (oldFm !== newFm) {
            const oldKeys = frontmatterKeys(oldFm);
            const newKeys = frontmatterKeys(newFm);
            for (const key of new Set([...oldKeys, ...newKeys])) {
                if (!SENSITIVE_FRONTMATTER.test(key)) continue;
                const oldValue = oldFm.match(
                    new RegExp(`^${key}:.*$`, "im"),
                )?.[0];
                const newValue = newFm.match(
                    new RegExp(`^${key}:.*$`, "im"),
                )?.[0];
                if (oldValue !== newValue) {
                    violations.push({
                        rule: "immutable-frontmatter",
                        detail: `frontmatter key "${key}" changed`,
                    });
                }
            }
            // Nested tool/permission flips inside frontmatter blocks.
            for (const line of newFm.split("\n")) {
                if (
                    /^\s+(write|edit|bash|webfetch):\s*true/.test(line) &&
                    !oldFm.includes(line.trim())
                ) {
                    violations.push({
                        rule: "immutable-frontmatter",
                        detail: `tool permission enabled: ${line.trim()}`,
                    });
                }
            }
        }

        for (const title of ["Safety", "Scope", "Boundaries"]) {
            const oldSection = extractSection(originalContent, title);
            const newSection = extractSection(patchedContent, title);
            if (oldSection !== newSection) {
                violations.push({
                    rule: "immutable-section",
                    detail: `section "## ${title}" changed`,
                });
            }
        }
    }

    if (file.endsWith("evals.json")) {
        try {
            const oldCount = (JSON.parse(originalContent).evals ?? []).length;
            const newCount = (JSON.parse(patchedContent).evals ?? []).length;
            if (newCount < oldCount) {
                violations.push({
                    rule: "eval-shrink",
                    detail: `eval count shrank ${oldCount} → ${newCount}`,
                });
            }
        } catch {
            violations.push({
                rule: "eval-parse",
                detail: "patched evals.json is not valid JSON",
            });
        }
    }

    return violations;
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const skillArg = args
        .find((arg) => arg.startsWith("--skill="))
        ?.split("=")[1];

    const proposalsRoot = join(REPO_ROOT, "reports", "skill-proposals");
    if (!existsSync(proposalsRoot)) {
        console.log("check-skill-safety: no proposals directory — pass");
        return;
    }

    let failures = 0;
    let checked = 0;

    for (const skill of await readdir(proposalsRoot)) {
        if (skillArg && skill !== skillArg) continue;
        const dir = join(proposalsRoot, skill);
        for (const file of await readdir(dir)) {
            if (!file.endsWith(".json")) continue;
            const path = join(dir, file);
            const proposal = JSON.parse(
                await readFile(path, "utf-8"),
            ) as SkillProposal;
            if (proposal.decision !== "approved" || !proposal.patch) continue;

            checked++;
            const target = join(
                REPO_ROOT,
                "skills",
                skill,
                proposal.patch.file,
            );
            if (!existsSync(target)) {
                proposal.safety_check = "fail";
                failures++;
                await writeFile(path, `${JSON.stringify(proposal, null, 2)}\n`);
                console.error(
                    `FAIL ${skill}/${proposal.id}: missing ${proposal.patch.file}`,
                );
                continue;
            }

            try {
                const original = await readFile(target, "utf-8");
                const patched = applyUnifiedDiff(original, proposal.patch.diff);
                const violations = checkPatchSafety(
                    original,
                    patched,
                    proposal.patch.file,
                );
                proposal.safety_check =
                    violations.length === 0 ? "pass" : "fail";
                if (violations.length > 0) {
                    failures++;
                    for (const violation of violations) {
                        console.error(
                            `FAIL ${skill}/${proposal.id}: ${violation.rule} — ${violation.detail}`,
                        );
                    }
                }
            } catch (error) {
                proposal.safety_check = "fail";
                failures++;
                console.error(
                    `FAIL ${skill}/${proposal.id}: patch does not apply — ${error instanceof Error ? error.message : error}`,
                );
            }
            await writeFile(path, `${JSON.stringify(proposal, null, 2)}\n`);
        }
    }

    console.log(`check-skill-safety: ${checked} checked, ${failures} failed`);
    if (failures > 0) process.exit(1);
}

const isMain = import.meta.path === Bun.main;
if (isMain) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
