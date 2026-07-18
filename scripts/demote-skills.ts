#!/usr/bin/env bun
/**
 * Demote public-knowledge skills from model-invoked (auto-load) to user-invoked
 * (opt-in). Removes startup routing cost; commands that load the skill by path
 * keep working. Idempotent.
 *
 *   bun scripts/demote-skills.ts <skill-path> [<skill-path>...]
 *   bun scripts/demote-skills.ts --dry-run <skill-path>...
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
const DRY = process.argv.includes("--dry-run");

function demote(skillPath: string): string {
    const md = join(ROOT, "skills", skillPath, "SKILL.md");
    let content: string;
    try {
        content = readFileSync(md, "utf-8");
    } catch {
        return `  ✗ not found: ${skillPath}`;
    }
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) return `  ✗ no frontmatter: ${skillPath}`;
    let body = fm[1];

    if (/category:\s*user-invoked/.test(body)) {
        return `  · already user-invoked: ${skillPath}`;
    }
    if (!/category:\s*model-invoked/.test(body)) {
        return `  · not model-invoked (skip): ${skillPath}`;
    }

    body = body.replace(/category:\s*model-invoked/, "category: user-invoked");
    if (!/disable-model-invocation:\s*true/.test(body)) {
        body = body.replace(/\s*$/, "") + "\ndisable-model-invocation: true";
    }
    const updated = content.replace(fm[0], `---\n${body}\n---`);
    if (!DRY) writeFileSync(md, updated);
    return `  ✓ demoted: ${skillPath}`;
}

for (const p of args) console.log(demote(p));
