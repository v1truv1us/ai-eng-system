#!/usr/bin/env bun
import { describe, expect, it } from "bun:test";
import {
    holdoutEvals,
    isHoldoutEval,
    type SkillEvalCase,
} from "../scripts/lib/skill-holdout";
import {
    isPromotable,
    PROMOTE_MIN_DELTA_PP,
    type SkillProposal,
} from "../scripts/lib/skill-loop-schemas";

function makeProposal(deltaPp: number, runtimeDeltaPct = 0): SkillProposal {
    return {
        schema: 1,
        id: "20260808-001",
        skill: "demo",
        kind: "skill_edit",
        created: "2026-08-08",
        evidence_run_ids: ["s:s1"],
        failure_signature: "sig",
        patch: { file: "SKILL.md", diff: "@@ ..." },
        safety_check: "pass",
        shadow_eval: {
            baseline_pass: 0.7,
            candidate_pass: 0.7 + deltaPp / 100,
            delta_pp: deltaPp,
            runtime_delta_pct: runtimeDeltaPct,
        },
        decision: "approved",
        decided_by: "auto-learning",
    };
}

describe("promotion rule", () => {
    it("rejects +2.9pp", () => {
        expect(isPromotable(makeProposal(2.9))).toBe(false);
    });

    it("accepts exactly +3pp", () => {
        expect(isPromotable(makeProposal(PROMOTE_MIN_DELTA_PP))).toBe(true);
    });

    it("rejects runtime regression above 10%", () => {
        expect(isPromotable(makeProposal(5, 11))).toBe(false);
        expect(isPromotable(makeProposal(5, 10))).toBe(true);
    });

    it("rejects failed safety checks and pending decisions", () => {
        const unsafe = makeProposal(10);
        unsafe.safety_check = "fail";
        expect(isPromotable(unsafe)).toBe(false);
        const pending = makeProposal(10);
        pending.decision = "pending";
        expect(isPromotable(pending)).toBe(false);
    });

    it("rejects learning-kind proposals", () => {
        const learning = makeProposal(10);
        learning.kind = "learning";
        expect(isPromotable(learning)).toBe(false);
    });
});

describe("holdout split", () => {
    it("honors explicit split markers", () => {
        const evals: SkillEvalCase[] = [
            { name: "a", split: "holdout" },
            { name: "b", split: "train" },
            { name: "c" },
        ];
        expect(isHoldoutEval(evals[0], evals)).toBe(true);
        expect(isHoldoutEval(evals[1], evals)).toBe(false);
        // unmarked evals default to train when any explicit split exists
        expect(isHoldoutEval(evals[2], evals)).toBe(false);
    });

    it("hash-splits deterministically when no explicit split exists", () => {
        const evals: SkillEvalCase[] = Array.from({ length: 20 }, (_, i) => ({
            name: `eval-${i}`,
        }));
        const first = holdoutEvals(evals);
        const second = holdoutEvals(evals);
        expect(first.map((e) => e.name)).toEqual(second.map((e) => e.name));
        // ~30% holdout: expect between 1 and 8 of 20
        expect(first.length).toBeGreaterThanOrEqual(1);
        expect(first.length).toBeLessThanOrEqual(8);
    });
});
