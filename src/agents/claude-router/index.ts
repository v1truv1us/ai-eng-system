/**
 * Public API for the dynamic router.
 *
 * Core routing logic is harness-neutral. Adapters provide per-harness
 * model families and execution.
 */

// Adapters
export {
    ALL_ADAPTERS,
    ANTHROPIC_MODEL_FAMILY,
    ANTHROPIC_MODELS,
    anthropicAdapter,
    CODEX_MODEL_FAMILY,
    CURSOR_MODEL_FAMILY,
    codexAdapter,
    cursorAdapter,
    getAdapter,
    OPENCODE_MODEL_FAMILY,
    opencodeAdapter,
    PI_MODEL_FAMILY,
    piAdapter,
} from "./adapters";
// Conductor (high-level API)
// Backward-compatible re-exports from conductor
export {
    assessComplexity as assessComplexityTask,
    buildPlan as buildTaskPlan,
    conduct,
    detectIntent as detectTaskIntent,
    planTask,
    route as routeTaskDefault,
    routeTask,
    selectRole as selectTaskRole,
    shouldChain as shouldChainTask,
} from "./conductor";
export {
    assessComplexity,
    buildPlan,
    detectIntent,
    route,
    selectRole,
    shouldChain,
} from "./core/router";
// Core types and routing functions
export * from "./core/types";
