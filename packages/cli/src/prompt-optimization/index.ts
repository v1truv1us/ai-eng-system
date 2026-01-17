/**
 * Prompt Optimization System
 *
 * Step-by-step prompt optimization with research-backed techniques.
 * Works on both OpenCode and Claude Code.
 */

// Type definitions
export type {
    Complexity,
    Domain,
    TechniqueId,
    StepStatus,
    Verbosity,
} from "./types";

export type {
    OptimizationStep,
    OptimizationSession,
    OptimizationConfig,
    UserPreferences,
    AnalysisResult,
    TechniqueContext,
    TechniqueConfig,
    FormattedOutput,
    Action,
    ExpectedImprovement,
} from "./types";

// Core exports
export {
    PromptOptimizer,
    DEFAULT_CONFIG,
    DEFAULT_PREFERENCES,
} from "./optimizer";
export { analyzePrompt } from "./analyzer";
export {
    ALL_TECHNIQUES,
    expertPersona,
    reasoningChain,
    stakesLanguage,
    challengeFraming,
    selfEvaluation,
    analysisStep,
    getTechniqueById,
    getTechniquesForComplexity,
} from "./techniques";
export {
    formatOutput,
    formatQuiet,
    formatNormal,
    formatVerbose,
    formatFinalReview,
} from "./formatter";
