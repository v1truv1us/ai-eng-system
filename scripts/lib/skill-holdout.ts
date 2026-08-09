/**
 * Held-out eval split for the self-improving skills loop.
 * An eval is holdout when it declares "split": "holdout", or — absent any
 * explicit splits in the file — when a stable hash of its name lands in the
 * last 30% of buckets. Deterministic across runs and machines.
 */

export interface SkillEvalCase {
    id?: number | string;
    name: string;
    prompt?: string;
    expected_output?: string;
    assertions?: string[];
    split?: "holdout" | "train";
}

function stableHash(input: string): number {
    // FNV-1a 32-bit
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash;
}

export function isHoldoutEval(
    evalCase: SkillEvalCase,
    allEvals: SkillEvalCase[],
): boolean {
    if (evalCase.split === "holdout") return true;
    if (evalCase.split === "train") return false;
    const hasExplicitSplit = allEvals.some(
        (entry) => entry.split !== undefined,
    );
    if (hasExplicitSplit) return false;
    return stableHash(evalCase.name) % 10 >= 7; // deterministic ~30% holdout
}

export function holdoutEvals(evals: SkillEvalCase[]): SkillEvalCase[] {
    return evals.filter((evalCase) => isHoldoutEval(evalCase, evals));
}
