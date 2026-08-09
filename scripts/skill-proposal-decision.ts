#!/usr/bin/env bun
/**
 * Mark a skill proposal approved or rejected.
 * Invoked by /ai-eng/skill-learning-approve and /ai-eng/skill-learning-dismiss.
 *
 * Usage: bun scripts/skill-proposal-decision.ts <skill>:<proposal-id> approve|reject
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SkillProposal } from "./lib/skill-loop-schemas";

const REPO_ROOT = join(import.meta.dir, "..");

async function main(): Promise<void> {
    const [target, action] = process.argv.slice(2);
    if (!target || (action !== "approve" && action !== "reject")) {
        console.error(
            "Usage: bun scripts/skill-proposal-decision.ts <skill>:<proposal-id> approve|reject",
        );
        process.exit(1);
    }

    const separator = target.lastIndexOf(":");
    if (separator <= 0) {
        console.error(`Invalid target: ${target} (expected <skill>:<id>)`);
        process.exit(1);
    }
    const skill = target.slice(0, separator);
    const id = target.slice(separator + 1);
    if (skill.includes("..") || skill.startsWith("/")) {
        console.error(`Invalid skill path: ${skill}`);
        process.exit(1);
    }

    const proposalPath = join(
        REPO_ROOT,
        "reports",
        "skill-proposals",
        skill,
        `${id}.json`,
    );
    if (!existsSync(proposalPath)) {
        console.error(`Proposal not found: ${proposalPath}`);
        process.exit(1);
    }

    const proposal = JSON.parse(
        await readFile(proposalPath, "utf-8"),
    ) as SkillProposal;
    if (proposal.decision !== "pending") {
        console.log(`Proposal ${id} already decided: ${proposal.decision}`);
        return;
    }

    proposal.decision = action === "approve" ? "approved" : "rejected";
    proposal.decided_by = "auto-learning";
    await writeFile(proposalPath, `${JSON.stringify(proposal, null, 2)}\n`);
    console.log(`Proposal ${skill}:${id} → ${proposal.decision}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
