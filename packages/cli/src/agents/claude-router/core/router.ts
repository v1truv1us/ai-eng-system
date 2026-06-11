/**
 * Core router — harness-neutral routing logic.
 *
 * No SDK imports. Pure functions that assess tasks and produce routing plans.
 * Adapters handle the actual execution against a specific harness.
 */

import {
    type ChainedStep,
    COMPLEXITY_KEYWORDS,
    type ExecutionPlan,
    INTENT_KEYWORDS,
    type ModelFamily,
    ROLE_LABELS,
    type RoutingDecision,
    SubagentRole,
    TaskComplexity,
    TaskIntent,
} from "./types";

// ---------------------------------------------------------------------------
// Complexity assessment
// ---------------------------------------------------------------------------

function countKeywordHits(text: string, keywords: string[]): number {
    const lower = text.toLowerCase();
    let hits = 0;
    for (const kw of keywords) {
        if (lower.includes(kw)) hits++;
    }
    return hits;
}

export function assessComplexity(text: string): TaskComplexity {
    const complexHits = countKeywordHits(
        text,
        COMPLEXITY_KEYWORDS[TaskComplexity.COMPLEX],
    );
    const moderateHits = countKeywordHits(
        text,
        COMPLEXITY_KEYWORDS[TaskComplexity.MODERATE],
    );
    const trivialHits = countKeywordHits(
        text,
        COMPLEXITY_KEYWORDS[TaskComplexity.TRIVIAL],
    );

    if (complexHits > 0) return TaskComplexity.COMPLEX;
    if (moderateHits > 0) return TaskComplexity.MODERATE;
    if (trivialHits > 0) return TaskComplexity.TRIVIAL;
    return TaskComplexity.MODERATE;
}

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------

export function detectIntent(text: string): TaskIntent {
    const scores: Record<TaskIntent, number> = {
        [TaskIntent.DEBUGGING]: countKeywordHits(
            text,
            INTENT_KEYWORDS[TaskIntent.DEBUGGING],
        ),
        [TaskIntent.REFACTORING]: countKeywordHits(
            text,
            INTENT_KEYWORDS[TaskIntent.REFACTORING],
        ),
        [TaskIntent.PLANNING]: countKeywordHits(
            text,
            INTENT_KEYWORDS[TaskIntent.PLANNING],
        ),
        [TaskIntent.IMPLEMENTATION]: countKeywordHits(
            text,
            INTENT_KEYWORDS[TaskIntent.IMPLEMENTATION],
        ),
        [TaskIntent.LOOKUP]: countKeywordHits(
            text,
            INTENT_KEYWORDS[TaskIntent.LOOKUP],
        ),
    };

    let best = TaskIntent.LOOKUP;
    let bestScore = 0;
    for (const [intent, score] of Object.entries(scores)) {
        if (score > bestScore) {
            best = intent as TaskIntent;
            bestScore = score;
        }
    }

    if (bestScore === 0) {
        const complexity = assessComplexity(text);
        if (complexity === TaskComplexity.TRIVIAL) return TaskIntent.LOOKUP;
        if (complexity === TaskComplexity.COMPLEX) return TaskIntent.PLANNING;
        return TaskIntent.IMPLEMENTATION;
    }

    return best;
}

// ---------------------------------------------------------------------------
// Role selection
// ---------------------------------------------------------------------------

export function selectRole(
    complexity: TaskComplexity,
    intent: TaskIntent,
): SubagentRole {
    switch (intent) {
        case TaskIntent.LOOKUP:
            return SubagentRole.LOOKUP;
        case TaskIntent.DEBUGGING:
            return SubagentRole.DEBUGGER;
        case TaskIntent.REFACTORING:
            return SubagentRole.REFACTORER;
        case TaskIntent.PLANNING:
            return SubagentRole.PLANNER;
        case TaskIntent.IMPLEMENTATION:
            if (complexity === TaskComplexity.COMPLEX)
                return SubagentRole.PLANNER;
            return SubagentRole.WORK;
        default:
            return SubagentRole.WORK;
    }
}

// ---------------------------------------------------------------------------
// Routing decision (model-family aware)
// ---------------------------------------------------------------------------

/**
 * Produce a routing decision using the given model family.
 * The model family maps roles to concrete model IDs for the target harness.
 */
export function route(task: string, models: ModelFamily): RoutingDecision {
    const complexity = assessComplexity(task);
    const intent = detectIntent(task);
    const role = selectRole(complexity, intent);
    const model = models[role];

    return {
        role,
        model,
        complexity,
        intent,
        reason: `Task assessed as ${complexity} complexity with ${intent} intent → routed to ${ROLE_LABELS[role]} (${model}).`,
    };
}

// ---------------------------------------------------------------------------
// Chaining
// ---------------------------------------------------------------------------

export function shouldChain(task: string): boolean {
    const lower = task.toLowerCase();
    const hasPlanningIntent = INTENT_KEYWORDS[TaskIntent.PLANNING].some((kw) =>
        lower.includes(kw),
    );
    const hasImplementationIntent = INTENT_KEYWORDS[
        TaskIntent.IMPLEMENTATION
    ].some((kw) => lower.includes(kw));
    if (hasPlanningIntent && hasImplementationIntent) return true;
    const multiStepSignals = [
        "then",
        "after that",
        "and then",
        "follow up",
        "next,",
    ];
    return multiStepSignals.some((s) => lower.includes(s));
}

/**
 * Build an execution plan using the given model family.
 */
export function buildPlan(task: string, models: ModelFamily): ExecutionPlan {
    if (!shouldChain(task)) {
        const decision = route(task, models);
        return {
            isChained: false,
            complexity: decision.complexity,
            steps: [{ index: 0, decision, prompt: task }],
        };
    }

    const planDecision = route("plan: " + task, models);
    const workDecision: RoutingDecision = {
        role: SubagentRole.WORK,
        model: models[SubagentRole.WORK],
        complexity: TaskComplexity.MODERATE,
        intent: TaskIntent.IMPLEMENTATION,
        reason: `Execution step in chain → routed to WorkAgent (${models[SubagentRole.WORK]}).`,
    };

    return {
        isChained: true,
        complexity: TaskComplexity.COMPLEX,
        steps: [
            {
                index: 0,
                decision: planDecision,
                prompt: `Create a detailed implementation plan for the following task:\n\n${task}`,
            },
            {
                index: 1,
                decision: workDecision,
                prompt: `Based on the plan from the previous step, implement the following task:\n\n${task}\n\nPrevious step output (plan):\n{previous_output}`,
            },
        ],
    };
}
