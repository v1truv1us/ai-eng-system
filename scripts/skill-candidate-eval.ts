#!/usr/bin/env bun
/**
 * Self-improving skills loop — shadow evaluation gate.
 *
 * For each approved, safety-passed proposal:
 *   1. Snapshot baseline (current SKILL.md + evals) and candidate (patched)
 *      under skills/<name>/versions/candidates/<id>/
 *   2. Grade each variant's recorded outputs against held-out eval assertions
 *      (outputs live in <variant>/outputs/eval-<name>/output.md and are
 *      produced by the ablation harness or a human/agent run)
 *   3. Record shadow_eval results in the proposal JSON and report whether
 *      the promotion rule passes
 *
 * --ablation: run benchmarks/evaluation/skill-ablation.ts first to regenerate
 *             outputs (requires a live OpenCode server; cron-only).
 * --heuristic-only: grade with the deterministic assertion grader (default).
 *
 * Usage: bun scripts/skill-candidate-eval.ts [--skill=name] [--ablation]
 */
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gradeAssertion } from "./grade-skill-evals";
import { applyUnifiedDiff } from "./lib/apply-diff";
import { holdoutEvals, type SkillEvalCase } from "./lib/skill-holdout";
import { isPromotable, type SkillProposal } from "./lib/skill-loop-schemas";

const REPO_ROOT = join(import.meta.dir, "..");

interface VariantScore {
    passRate: number | null;
    runtimeMs: number | null;
}

async function gradeVariant(
    variantDir: string,
    holdouts: SkillEvalCase[],
): Promise<VariantScore> {
    let passed = 0;
    let total = 0;
    let sawOutput = false;

    for (const evalCase of holdouts) {
        const outputPath = join(
            variantDir,
            "outputs",
            `eval-${evalCase.name}`,
            "output.md",
        );
        if (!existsSync(outputPath)) continue;
        sawOutput = true;
        const outputText = await readFile(outputPath, "utf-8");
        for (const assertion of evalCase.assertions ?? []) {
            total++;
            if ((await gradeAssertion(assertion, outputText)).passed) passed++;
        }
    }

    let runtimeMs: number | null = null;
    const metaPath = join(variantDir, "outputs", "meta.json");
    if (existsSync(metaPath)) {
        try {
            const meta = JSON.parse(await readFile(metaPath, "utf-8"));
            if (typeof meta.runtime_ms === "number")
                runtimeMs = meta.runtime_ms;
        } catch {
            // ignore malformed meta
        }
    }

    if (!sawOutput || total === 0) return { passRate: null, runtimeMs };
    return { passRate: passed / total, runtimeMs };
}

async function evalProposal(
    proposal: SkillProposal,
): Promise<"promotable" | "rejected" | "skipped"> {
    const skillDir = join(REPO_ROOT, "skills", proposal.skill);
    const candidateRoot = join(skillDir, "versions", "candidates", proposal.id);
    const baselineDir = join(candidateRoot, "baseline");
    const candidateDir = join(candidateRoot, "candidate");

    await mkdir(baselineDir, { recursive: true });
    await mkdir(candidateDir, { recursive: true });
    await cp(join(skillDir, "SKILL.md"), join(baselineDir, "SKILL.md"));

    const evalsPath = join(skillDir, "evals", "evals.json");
    if (!existsSync(evalsPath)) {
        console.log(`SKIP ${proposal.skill}/${proposal.id}: no evals`);
        return "skipped";
    }
    await mkdir(join(baselineDir, "evals"), { recursive: true });
    await mkdir(join(candidateDir, "evals"), { recursive: true });
    await cp(evalsPath, join(baselineDir, "evals", "evals.json"));

    let patchedSkill: string;
    let patchedEvals: string | null = null;
    try {
        const originalSkill = await readFile(
            join(skillDir, "SKILL.md"),
            "utf-8",
        );
        const originalEvals = await readFile(evalsPath, "utf-8");
        if (proposal.patch!.file === "SKILL.md") {
            patchedSkill = applyUnifiedDiff(
                originalSkill,
                proposal.patch!.diff,
            );
            patchedEvals = originalEvals;
        } else {
            patchedSkill = originalSkill;
            patchedEvals = applyUnifiedDiff(
                originalEvals,
                proposal.patch!.diff,
            );
        }
    } catch (error) {
        console.log(
            `REJECT ${proposal.skill}/${proposal.id}: patch no longer applies — ${error instanceof Error ? error.message : error}`,
        );
        proposal.shadow_eval = null;
        return "rejected";
    }
    await writeFile(join(candidateDir, "SKILL.md"), patchedSkill);
    await writeFile(join(candidateDir, "evals", "evals.json"), patchedEvals!);

    const evals = (JSON.parse(await readFile(evalsPath, "utf-8")).evals ??
        []) as SkillEvalCase[];
    const holdouts = holdoutEvals(evals);
    if (holdouts.length === 0) {
        console.log(`SKIP ${proposal.skill}/${proposal.id}: no holdout evals`);
        return "skipped";
    }

    const baseline = await gradeVariant(baselineDir, holdouts);
    const candidate = await gradeVariant(candidateDir, holdouts);
    if (baseline.passRate === null || candidate.passRate === null) {
        console.log(
            `SKIP ${proposal.skill}/${proposal.id}: no recorded outputs for holdout evals (run the ablation harness)`,
        );
        return "skipped";
    }

    const runtimeDelta =
        baseline.runtimeMs && candidate.runtimeMs
            ? ((candidate.runtimeMs - baseline.runtimeMs) /
                  baseline.runtimeMs) *
              100
            : 0;

    proposal.shadow_eval = {
        baseline_pass: baseline.passRate,
        candidate_pass: candidate.passRate,
        delta_pp:
            Math.round((candidate.passRate - baseline.passRate) * 1000) / 10,
        runtime_delta_pct: Math.round(runtimeDelta * 10) / 10,
    };

    return isPromotable(proposal) ? "promotable" : "rejected";
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const skillArg = args
        .find((arg) => arg.startsWith("--skill="))
        ?.split("=")[1];
    const withAblation = args.includes("--ablation");

    const proposalsRoot = join(REPO_ROOT, "reports", "skill-proposals");
    if (!existsSync(proposalsRoot)) {
        console.log("skill-candidate-eval: no proposals — nothing to do");
        return;
    }

    if (withAblation) {
        const proc = Bun.spawn(
            ["bun", join(REPO_ROOT, "benchmarks/evaluation/skill-ablation.ts")],
            { cwd: REPO_ROOT, stdout: "inherit", stderr: "inherit" },
        );
        await proc.exited;
    }

    const counts = { promotable: 0, rejected: 0, skipped: 0 };
    for (const skill of await readdir(proposalsRoot)) {
        if (skillArg && skill !== skillArg) continue;
        const dir = join(proposalsRoot, skill);
        for (const file of await readdir(dir)) {
            if (!file.endsWith(".json")) continue;
            const path = join(dir, file);
            const proposal = JSON.parse(
                await readFile(path, "utf-8"),
            ) as SkillProposal;
            if (
                proposal.kind !== "skill_edit" ||
                proposal.decision !== "approved" ||
                proposal.safety_check !== "pass" ||
                !proposal.patch
            ) {
                continue;
            }
            const verdict = await evalProposal(proposal);
            counts[verdict]++;
            await writeFile(path, `${JSON.stringify(proposal, null, 2)}\n`);
            if (verdict === "promotable") {
                const evalResult = proposal.shadow_eval!;
                console.log(
                    `PROMOTABLE ${skill}/${proposal.id}: ${(evalResult.baseline_pass * 100).toFixed(0)}% → ${(evalResult.candidate_pass * 100).toFixed(0)}% (+${evalResult.delta_pp}pp, runtime ${evalResult.runtime_delta_pct}%)`,
                );
            } else if (verdict === "rejected" && proposal.shadow_eval) {
                const evalResult = proposal.shadow_eval;
                console.log(
                    `REJECT ${skill}/${proposal.id}: delta ${evalResult.delta_pp}pp, runtime ${evalResult.runtime_delta_pct}%`,
                );
            }
        }
    }

    console.log(
        `skill-candidate-eval: ${counts.promotable} promotable, ${counts.rejected} rejected, ${counts.skipped} skipped`,
    );
}

const isMain = import.meta.path === Bun.main;
if (isMain) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
