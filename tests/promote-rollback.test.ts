#!/usr/bin/env bun
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SkillProposal } from "../scripts/lib/skill-loop-schemas";
import { nextVersionDir, promoteProposal } from "../scripts/promote-skill";
import { rollbackSkill } from "../scripts/rollback-skill";

const REPO_ROOT = join(import.meta.dir, "..");
const SKILL = "_test-promote";
const skillDir = join(REPO_ROOT, "skills", SKILL);

const ORIGINAL_SKILL_MD = `---
name: ${SKILL}
description: test skill
---

# Test

Original body.
`;

function promotableProposal(diff: string): SkillProposal {
    return {
        schema: 1,
        id: "20260808-001",
        skill: SKILL,
        kind: "skill_edit",
        created: "2026-08-08",
        evidence_run_ids: ["s:s1"],
        failure_signature: "needs more detail",
        patch: { file: "SKILL.md", diff },
        safety_check: "pass",
        shadow_eval: {
            baseline_pass: 0.7,
            candidate_pass: 0.8,
            delta_pp: 10,
            runtime_delta_pct: 0,
        },
        decision: "approved",
        decided_by: "auto-learning",
    };
}

const DIFF = `--- a/SKILL.md
+++ b/SKILL.md
@@ -6,4 +6,5 @@
 # Test
 
 Original body.
+More detail.
`;

describe("promote/rollback", () => {
    beforeEach(async () => {
        await mkdir(join(skillDir, "evals"), { recursive: true });
        await writeFile(join(skillDir, "SKILL.md"), ORIGINAL_SKILL_MD);
        await writeFile(
            join(skillDir, "evals", "evals.json"),
            JSON.stringify({ evals: [{ name: "a" }] }),
        );
    });

    afterEach(async () => {
        await rm(skillDir, { recursive: true, force: true });
    });

    it("numbers versions monotonically", async () => {
        expect(await nextVersionDir(skillDir)).toEndWith("versions/v1");
        await mkdir(join(skillDir, "versions", "v3"), { recursive: true });
        expect(await nextVersionDir(skillDir)).toEndWith("versions/v4");
    });

    it("promotes: snapshots v1, applies patch, restores byte-identical on rollback", async () => {
        const versionLabel = await promoteProposal(promotableProposal(DIFF));
        expect(versionLabel).toBe("versions/v1");

        const patched = await readFile(join(skillDir, "SKILL.md"), "utf-8");
        expect(patched).toContain("More detail.");

        const snapshot = await readFile(
            join(skillDir, "versions", "v1", "SKILL.md"),
            "utf-8",
        );
        expect(snapshot).toBe(ORIGINAL_SKILL_MD);
        expect(
            existsSync(join(skillDir, "versions", "v1", "PROMOTION.md")),
        ).toBe(true);

        await rollbackSkill(SKILL, "v1");
        const restored = await readFile(join(skillDir, "SKILL.md"), "utf-8");
        expect(restored).toBe(ORIGINAL_SKILL_MD);
    });

    it("refuses to promote non-promotable proposals", async () => {
        const proposal = promotableProposal(DIFF);
        proposal.shadow_eval!.delta_pp = 1;
        const result = await promoteProposal(proposal);
        expect(result).toBeNull();
        expect(existsSync(join(skillDir, "versions"))).toBe(false);
    });

    it("marks promoted learnings rolled-back", async () => {
        await writeFile(
            join(skillDir, "learnings.md"),
            [
                "# Learnings",
                "",
                "## L-20260808-001",
                "- status: promoted",
                "- evidence: 3 runs",
                "- expires: 2026-11-06",
                "- text: needs more detail",
                "- promoted-to: versions/v1",
                "",
            ].join("\n"),
        );
        await promoteProposal(promotableProposal(DIFF));
        await rollbackSkill(SKILL, "v1");
        const learnings = await readFile(
            join(skillDir, "learnings.md"),
            "utf-8",
        );
        expect(learnings).toContain("- status: rolled-back");
    });
});
