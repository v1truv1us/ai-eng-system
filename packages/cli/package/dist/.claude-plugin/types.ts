/**
 * Prompt Optimization System - Core Type Definitions
 *
 * Defines the data structures and interfaces for the step-by-step
 * prompt optimization system with research-backed techniques.
 */

/**
 * Complexity levels for prompt analysis
 */
export type Complexity = "simple" | "medium" | "complex";

/**
 * Detected domain for context-aware optimization
 */
export type Domain =
    | "security"
    | "frontend"
    | "backend"
    | "database"
    | "devops"
    | "architecture"
    | "testing"
    | "general";

/**
 * Available optimization techniques
 */
export type TechniqueId =
    | "analysis"
    | "expert_persona"
    | "reasoning_chain"
    | "stakes_language"
    | "challenge_framing"
    | "self_evaluation";

/**
 * Status of an optimization step
 */
export type StepStatus = "pending" | "approved" | "rejected" | "modified";

/**
 * Verbosity levels for output formatting
 */
export type Verbosity = "quiet" | "normal" | "verbose";

/**
 * Represents a single optimization step in the process
 */
export interface OptimizationStep {
    /** Step identifier (1, 2, 3, ...) */
    id: number;
    /** Technique being applied */
    technique: TechniqueId;
    /** Human-readable name */
    name: string;
    /** Description of what this technique does */
    description: string;
    /** The content this step adds to the prompt */
    content: string;
    /** User's modified version (if they changed it) */
    modifiedContent?: string;
    /** Current status of this step */
    status: StepStatus;
    /** Can user skip this step? */
    skippable: boolean;
    /** Which complexity levels this applies to */
    appliesTo: Complexity[];
    /** Research basis for effectiveness */
    researchBasis: string;
}

/**
 * An optimization session for a single user prompt
 */
export interface OptimizationSession {
    /** Unique session identifier */
    id: string;
    /** Original user prompt */
    originalPrompt: string;
    /** Detected complexity */
    complexity: Complexity;
    /** Detected domain */
    domain: Domain;
    /** Steps in this optimization process */
    steps: OptimizationStep[];
    /** Final optimized prompt */
    finalPrompt: string;
    /** Output verbosity level */
    verbosity: Verbosity;
    /** Auto-approve mode enabled? */
    autoApprove: boolean;
    /** User preferences for this session */
    preferences: UserPreferences;
    /** When this session was created */
    createdAt: Date;
}

/**
 * User preferences that persist across sessions
 */
export interface UserPreferences {
    /** Techniques user always skips */
    skipTechniques: TechniqueId[];
    /** Custom personas per domain */
    customPersonas: Record<Domain, string>;
    /** Default auto-approve setting */
    autoApproveDefault: boolean;
    /** Default verbosity level */
    verbosityDefault: Verbosity;
}

/**
 * Global configuration for prompt optimization
 */
export interface OptimizationConfig {
    /** Is optimization enabled? */
    enabled: boolean;
    /** Auto-approve all steps by default? */
    autoApprove: boolean;
    /** Output verbosity level */
    verbosity: Verbosity;
    /** Techniques to apply by default */
    defaultTechniques: TechniqueId[];
    /** Skip optimization for simple prompts? */
    skipForSimplePrompts: boolean;
    /** Prefix to escape optimization (e.g., "!") */
    escapePrefix: string;
}

/**
 * Result of prompt analysis
 */
export interface AnalysisResult {
    /** Detected complexity */
    complexity: Complexity;
    /** Detected domain */
    domain: Domain;
    /** Keywords found in prompt */
    keywords: string[];
    /** Missing context identified */
    missingContext: string[];
    /** Suggested techniques for this prompt */
    suggestedTechniques: TechniqueId[];
}

/**
 * Context for generating technique content
 */
export interface TechniqueContext {
    /** Original user prompt */
    originalPrompt: string;
    /** Detected complexity */
    complexity: Complexity;
    /** Detected domain */
    domain: Domain;
    /** Previous steps (for context-aware generation) */
    previousSteps: OptimizationStep[];
    /** User preferences */
    preferences: UserPreferences;
}

/**
 * Technique configuration
 */
export interface TechniqueConfig {
    /** Technique identifier */
    id: TechniqueId;
    /** Human-readable name */
    name: string;
    /** Description of what it does */
    description: string;
    /** Research basis */
    researchBasis: string;
    /** Which complexity levels this applies to */
    appliesTo: Complexity[];
    /** Generate technique content */
    generate: (context: TechniqueContext) => string;
}

/**
 * Formatted output for display
 */
export interface FormattedOutput {
    /** Text to display to user */
    display: string;
    /** Available actions */
    actions: Action[];
}

/**
 * User action options
 */
export type Action =
    | { type: "approve"; stepId?: number }
    | { type: "reject"; stepId?: number }
    | { type: "modify"; stepId?: number }
    | { type: "approve_all" }
    | { type: "skip_optimization" }
    | { type: "edit_final" }
    | { type: "execute" }
    | { type: "cancel" };

/**
 * Expected improvement metrics
 */
export interface ExpectedImprovement {
    /** Expected quality improvement percentage */
    qualityImprovement: number;
    /** Applied techniques */
    techniquesApplied: TechniqueId[];
    /** Research basis */
    researchBasis: string;
}
