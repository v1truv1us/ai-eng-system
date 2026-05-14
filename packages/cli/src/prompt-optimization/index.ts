/**
 * Prompt Optimization System
 *
 * Step-by-step prompt optimization with research-backed techniques.
 * Works on both OpenCode and Claude Code.
 */

export { analyzePrompt } from "./analyzer";
export {
    formatFinalReview,
    formatNormal,
    formatOutput,
    formatQuiet,
    formatVerbose,
} from "./formatter";

// Core exports
export {
    DEFAULT_CONFIG,
    DEFAULT_PREFERENCES,
    PromptOptimizer,
} from "./optimizer";
export {
    ALL_TECHNIQUES,
    analysisStep,
    challengeFraming,
    expertPersona,
    getTechniqueById,
    getTechniquesForComplexity,
    reasoningChain,
    selfEvaluation,
    stakesLanguage,
} from "./techniques";
// Type definitions
export type {
    Action,
    AnalysisResult,
    Complexity,
    Domain,
    ExpectedImprovement,
    FormattedOutput,
    OptimizationConfig,
    OptimizationSession,
    OptimizationStep,
    StepStatus,
    TechniqueConfig,
    TechniqueContext,
    TechniqueId,
    UserPreferences,
    Verbosity,
} from "./types";
