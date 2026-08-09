#!/usr/bin/env bun
/**
 * Self-improving skills loop — rollback.
 *
 * Restore a skill's SKILL.md (and evals) from an immutable versions/v<N>/
 * snapshot and mark the promoted learnings rolled-back. The restore lands
 * via a human-merged PR, same gate as promotion.
 *
 * Usage: bun scripts/rollback-skill.ts <skill> --to=v<N>
 */
import { existsSync } from "node:fs";
import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..");

export async function rollbackSkill(
    skill: string,
    version: string,
): Promise<void> {
    if (skill.includes("..") || skill.startsWith("/")) {
        throw new Error(`Invalid skill path: ${skill}`);
    }
    if (!/^v\d+$/.test(version)) {
        throw new Error(`Invalid version label: ${version} (expected v<N>)`);
    }
    const skillDir = join(REPO_ROOT, "skills", skill);
    const versionDir = join(skillDir, "versions", version);
    if (!existsSync(join(versionDir, "SKILL.md"))) {
        throw new Error(`Version snapshot not found: ${versionDir}`);
    }

    await cp(join(versionDir, "SKILL.md"), join(skillDir, "SKILL.md"));
    const versionEvals = join(versionDir, "evals", "evals.json");
    if (existsSync(versionEvals)) {
        await cp(versionEvals, join(skillDir, "evals", "evals.json"));
    }

    const learningsPath = join(skillDir, "learnings.md");
    if (existsSync(learningsPath)) {
        const content = await readFile(learningsPath, "utf-8");
        const blocks = content.split(/(?=^## L-)/m);
        const updated = blocks.map((block) => {
            if (!block.startsWith("## L-")) return block;
            if (!block.includes(`- promoted-to: versions/${version}`)) {
                return block;
            }
            return block.replace("- status: promoted", "- status: rolled-back");
        });
        const result = updated.join("");
        if (result !== content) await writeFile(learningsPath, result);
    }
}

async function main(): Promise<void> {
    const [skill, versionArg] = process.argv.slice(2);
    const version = versionArg?.replace(/^--to=/, "");
    if (!skill || !version) {
        console.error("Usage: bun scripts/rollback-skill.ts <skill> --to=v<N>");
        process.exit(1);
    }
    await rollbackSkill(skill, version);
    console.log(`Rolled back ${skill} to versions/${version}`);
}

const isMain = import.meta.path === Bun.main;
if (isMain) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
