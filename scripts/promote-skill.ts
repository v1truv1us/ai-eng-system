#!/usr/bin/env bun
/**
 * Self-improving skills loop — promotion stage.
 *
 * For each promotable proposal: snapshot the current skill into an immutable
 * versions/v<N>/, apply the candidate patch to the canonical SKILL.md, and
 * mark matching learnings promoted. Runs locally or in the weekly cron;
 * the resulting changes land via a human-merged PR — that PR is the only
 * SKILL.md promotion gate.
 *
 * Usage: bun scripts/promote-skill.ts [--skill=name] [--dry-run]
 */
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { applyUnifiedDiff } from "./lib/apply-diff";
import { isPromotable, type SkillProposal } from "./lib/skill-loop-schemas";

const REPO_ROOT = join(import.meta.dir, "..");

export async function nextVersionDir(skillDir: string): Promise<string> {
    const versionsDir = join(skillDir, "versions");
    let max = 0;
    if (existsSync(versionsDir)) {
        for (const entry of await readdir(versionsDir)) {
            const match = entry.match(/^v(\d+)$/);
            if (match) max = Math.max(max, Number.parseInt(match[1], 10));
        }
    }
    return join(versionsDir, `v${max + 1}`);
}

async function markLearningPromoted(
    skillDir: string,
    signature: string,
    versionLabel: string,
): Promise<void> {
    const path = join(skillDir, "learnings.md");
    if (!existsSync(path)) return;
    const content = await readFile(path, "utf-8");
    const blocks = content.split(/(?=^## L-)/m);
    const updated = blocks.map((block) => {
        if (!block.startsWith("## L-")) return block;
        if (!block.includes(signature)) return block;
        if (!block.includes("- status: active")) return block;
        return block
            .replace("- status: active", "- status: promoted")
            .replace("- promoted-to: null", `- promoted-to: ${versionLabel}`);
    });
    const result = updated.join("");
    if (result !== content) await writeFile(path, result);
}

export async function promoteProposal(
    proposal: SkillProposal,
    dryRun = false,
): Promise<string | null> {
    if (!isPromotable(proposal)) return null;
    const skillDir = join(REPO_ROOT, "skills", proposal.skill);
    const target = join(skillDir, proposal.patch!.file);
    if (!existsSync(target)) return null;

    const original = await readFile(target, "utf-8");
    const patched = applyUnifiedDiff(original, proposal.patch!.diff);
    const versionDir = await nextVersionDir(skillDir);
    const versionLabel = versionDir.slice(skillDir.length + 1);

    if (dryRun) return versionLabel;

    await mkdir(versionDir, { recursive: true });
    await cp(join(skillDir, "SKILL.md"), join(versionDir, "SKILL.md"));
    const evalsPath = join(skillDir, "evals", "evals.json");
    if (existsSync(evalsPath)) {
        await mkdir(join(versionDir, "evals"), { recursive: true });
        await cp(evalsPath, join(versionDir, "evals", "evals.json"));
    }
    await writeFile(
        join(versionDir, "PROMOTION.md"),
        [
            `# Promotion ${versionLabel}`,
            ``,
            `- proposal: ${proposal.id}`,
            `- skill: ${proposal.skill}`,
            `- failure signature: ${proposal.failure_signature}`,
            `- shadow eval: ${JSON.stringify(proposal.shadow_eval)}`,
            `- date: ${new Date().toISOString().slice(0, 10)}`,
            ``,
        ].join("\n"),
    );

    await writeFile(target, patched);
    await markLearningPromoted(
        skillDir,
        proposal.failure_signature,
        versionLabel,
    );
    return versionLabel;
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const skillArg = args
        .find((arg) => arg.startsWith("--skill="))
        ?.split("=")[1];
    const dryRun = args.includes("--dry-run");

    const proposalsRoot = join(REPO_ROOT, "reports", "skill-proposals");
    if (!existsSync(proposalsRoot)) {
        console.log("promote-skill: no proposals — nothing to do");
        return;
    }

    let promoted = 0;
    for (const skill of await readdir(proposalsRoot)) {
        if (skillArg && skill !== skillArg) continue;
        const dir = join(proposalsRoot, skill);
        for (const file of await readdir(dir)) {
            if (!file.endsWith(".json")) continue;
            const path = join(dir, file);
            const proposal = JSON.parse(
                await readFile(path, "utf-8"),
            ) as SkillProposal;
            if (!isPromotable(proposal)) continue;
            const versionLabel = await promoteProposal(proposal, dryRun);
            if (!versionLabel) continue;
            promoted++;
            console.log(
                `${dryRun ? "DRY-RUN would promote" : "PROMOTED"} ${skill}/${proposal.id} → ${versionLabel}`,
            );
            if (!dryRun) {
                proposal.decision = "approved";
                proposal.decided_by = "human-pr";
                await writeFile(path, `${JSON.stringify(proposal, null, 2)}\n`);
            }
        }
    }

    console.log(
        `promote-skill: ${promoted} promoted${dryRun ? " (dry run)" : ""}`,
    );
}

const isMain = import.meta.path === Bun.main;
if (isMain) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
