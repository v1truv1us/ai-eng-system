/**
 * Schemas for the self-improving skills loop.
 * Single source of truth for run-history, learnings, and proposal records.
 * Imported by skill-improve.ts, skill-candidate-eval.ts, promote-skill.ts,
 * rollback-skill.ts, and the session-outcome hook tests.
 */

export const SKILL_LOOP_SCHEMA_VERSION = 1;

// --- run-history.jsonl (per skill, gitignored) ---

export type RunOutcome = "success" | "failure" | "unknown";

export interface RunSignals {
    verify_passed: boolean | null;
    eval_pass_rate: number | null;
    user_feedback: "positive" | "negative" | null;
}

export interface RunHistoryEntry {
    schema: number;
    ts: number; // epoch seconds
    skill: string; // namespaced path, e.g. "pstack/poteto-mode"
    session_id: string;
    run_id: string | null;
    outcome: RunOutcome;
    signals: RunSignals;
    failure_signature?: string; // normalized failing assertion / error class
    severity?: "high" | "normal";
    source: "wrap-up" | "manual" | "cron";
}

export function parseRunHistoryLine(line: string): RunHistoryEntry | null {
    try {
        const value = JSON.parse(line) as RunHistoryEntry;
        if (value.schema !== SKILL_LOOP_SCHEMA_VERSION) return null;
        if (typeof value.skill !== "string" || value.skill.length === 0)
            return null;
        if (!["success", "failure", "unknown"].includes(value.outcome))
            return null;
        return value;
    } catch {
        return null;
    }
}

// --- learnings.md entries (per skill, committed) ---

export type LearningStatus = "active" | "promoted" | "expired" | "rolled-back";

export interface LearningEntry {
    id: string; // L-YYYYMMDD-NNN
    status: LearningStatus;
    evidence: string; // e.g. "3 runs (r1,r2,r3)" or "1 high-severity incident"
    evidenceCount: number;
    expires: string; // ISO date, 90d from creation unless re-observed
    text: string;
    promotedTo: string | null; // e.g. "versions/v3"
}

export const LEARNING_EVIDENCE_THRESHOLD = 3;
export const LEARNING_EXPIRY_DAYS = 90;

export function formatLearningEntry(entry: LearningEntry): string {
    return [
        `## ${entry.id}`,
        `- status: ${entry.status}`,
        `- evidence: ${entry.evidence}`,
        `- expires: ${entry.expires}`,
        `- text: ${entry.text}`,
        `- promoted-to: ${entry.promotedTo ?? "null"}`,
        ``,
    ].join("\n");
}

export function parseLearningId(line: string): string | null {
    const match = line.match(/^## (L-\d{8}-\d{3})\s*$/);
    return match ? match[1] : null;
}

export function nextLearningId(existingIds: string[], date: Date): string {
    const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
    let max = 0;
    for (const id of existingIds) {
        const match = id.match(/^L-(\d{8})-(\d{3})$/);
        if (match && match[1] === ymd) {
            max = Math.max(max, Number.parseInt(match[2], 10));
        }
    }
    return `L-${ymd}-${String(max + 1).padStart(3, "0")}`;
}

// --- proposals (reports/skill-proposals/<skill>/<date>-<id>.json, gitignored) ---

export type ProposalKind = "learning" | "skill_edit";
export type ProposalDecision = "pending" | "approved" | "rejected";

export interface ShadowEvalResult {
    baseline_pass: number; // 0..1 holdout pass rate
    candidate_pass: number;
    delta_pp: number; // percentage points
    runtime_delta_pct: number;
}

export interface SkillProposal {
    schema: number;
    id: string;
    skill: string;
    kind: ProposalKind;
    created: string; // ISO date
    evidence_run_ids: string[];
    failure_signature: string;
    patch: { file: string; diff: string } | null;
    safety_check: "pass" | "fail" | null;
    shadow_eval: ShadowEvalResult | null;
    decision: ProposalDecision;
    decided_by: "human-pr" | "auto-learning" | null;
}

// --- promotion rule (tested constants) ---

export const PROMOTE_MIN_DELTA_PP = 3;
export const PROMOTE_MAX_RUNTIME_REGRESSION_PCT = 10;

export function isPromotable(proposal: SkillProposal): boolean {
    if (proposal.kind !== "skill_edit") return false;
    if (proposal.decision !== "approved") return false;
    if (proposal.safety_check !== "pass") return false;
    const evalResult = proposal.shadow_eval;
    if (!evalResult) return false;
    if (evalResult.delta_pp < PROMOTE_MIN_DELTA_PP) return false;
    if (evalResult.runtime_delta_pct > PROMOTE_MAX_RUNTIME_REGRESSION_PCT)
        return false;
    return true;
}
