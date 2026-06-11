/**
 * Dynamic Router — core types.
 *
 * Harness-neutral. No SDK imports. The router decides *what* to run;
 * adapters decide *how* to run it.
 */

/** Subagent roles the conductor can dispatch to. */
export enum SubagentRole {
    LOOKUP = "lookup",
    WORK = "work",
    PLANNER = "planner",
    DEBUGGER = "debugger",
    REFACTORER = "refactorer",
}

/** Human-readable labels for logging and error messages. */
export const ROLE_LABELS: Record<SubagentRole, string> = {
    [SubagentRole.LOOKUP]: "LookupAgent",
    [SubagentRole.WORK]: "WorkAgent",
    [SubagentRole.PLANNER]: "PlannerAgent",
    [SubagentRole.DEBUGGER]: "DebuggerAgent",
    [SubagentRole.REFACTORER]: "RefactorAgent",
};

/** Coarse-grained task complexity assessed by the conductor. */
export enum TaskComplexity {
    TRIVIAL = "trivial",
    MODERATE = "moderate",
    COMPLEX = "complex",
}

/** Keyword categories for heuristic complexity classification. */
export const COMPLEXITY_KEYWORDS: Record<TaskComplexity, string[]> = {
    [TaskComplexity.TRIVIAL]: [
        "lookup",
        "find",
        "scan",
        "search",
        "list",
        "grep",
        "where",
        "what is",
        "quick",
        "show me",
        "where is",
        "how many",
        "does it",
    ],
    [TaskComplexity.MODERATE]: [
        "implement",
        "fix",
        "bug",
        "debug",
        "write",
        "add",
        "update",
        "change",
        "refactor",
        "test",
        "function",
        "method",
        "endpoint",
        "api",
        "component",
    ],
    [TaskComplexity.COMPLEX]: [
        "architect",
        "design",
        "plan",
        "strategy",
        "migrate",
        "rewrite",
        "system",
        "architecture",
        "trade-off",
        "tradeoff",
        "evaluate",
        "assess",
        "multiple",
        "end-to-end",
        "full",
        "comprehensive",
    ],
};

/** Intent categories derived from task text. */
export enum TaskIntent {
    LOOKUP = "lookup",
    IMPLEMENTATION = "implementation",
    PLANNING = "planning",
    DEBUGGING = "debugging",
    REFACTORING = "refactoring",
}

/** Intent keywords for heuristic classification. */
export const INTENT_KEYWORDS: Record<TaskIntent, string[]> = {
    [TaskIntent.LOOKUP]: [
        "find",
        "search",
        "lookup",
        "where",
        "list",
        "show",
        "scan",
        "grep",
    ],
    [TaskIntent.IMPLEMENTATION]: [
        "implement",
        "create",
        "add",
        "write",
        "build",
        "make",
        "develop",
    ],
    [TaskIntent.PLANNING]: [
        "plan",
        "architect",
        "design",
        "strategy",
        "evaluate",
        "assess",
        "decide",
    ],
    [TaskIntent.DEBUGGING]: [
        "fix",
        "debug",
        "error",
        "bug",
        "trace",
        "investigate",
        "diagnose",
        "crash",
    ],
    [TaskIntent.REFACTORING]: [
        "refactor",
        "restructure",
        "simplify",
        "clean up",
        "reorganize",
        "rework",
        "rewrite",
    ],
};

/** Input to the conductor. */
export interface TaskInput {
    task: string;
    cwd?: string;
    context?: Record<string, unknown>;
}

/** A single routing decision. */
export interface RoutingDecision {
    role: SubagentRole;
    model: string;
    complexity: TaskComplexity;
    intent: TaskIntent;
    reason: string;
}

/** A subagent step in a chain. */
export interface ChainedStep {
    index: number;
    decision: RoutingDecision;
    prompt: string;
}

/** A full execution plan — single step or chain. */
export interface ExecutionPlan {
    isChained: boolean;
    steps: ChainedStep[];
    complexity: TaskComplexity;
}

/** Result from a single subagent. */
export interface SubagentResult {
    role: SubagentRole;
    model: string;
    success: boolean;
    output: string;
    executionTimeMs: number;
    error?: string;
}

/** Final result from the conductor. */
export interface ConductorResult {
    plan: ExecutionPlan;
    results: SubagentResult[];
    success: boolean;
    summary: string;
    totalTimeMs: number;
}

// ---------------------------------------------------------------------------
// Model family config — maps roles to model IDs per harness
// ---------------------------------------------------------------------------

/** Maps each subagent role to a model identifier for a specific harness. */
export type ModelFamily = Record<SubagentRole, string>;

/** Harness names that have built-in model families. */
export type HarnessName = "anthropic" | "cursor" | "opencode" | "codex" | "pi";

/** Adapter interface — one per harness. */
export interface RouterAdapter {
    /** Which harness this adapter targets. */
    name: HarnessName;
    /** Model family: role → model ID mapping. */
    models: ModelFamily;
    /** Execute a prompt with the given routing decision. */
    execute(decision: RoutingDecision, prompt: string): Promise<SubagentResult>;
}
