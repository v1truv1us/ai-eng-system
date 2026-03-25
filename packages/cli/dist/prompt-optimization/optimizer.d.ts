/**
 * Prompt Optimizer
 *
 * Main orchestrator for step-by-step prompt optimization.
 * Manages optimization sessions and applies approved techniques.
 */
import type { Complexity, ExpectedImprovement, OptimizationConfig, OptimizationSession, OptimizationStep, TechniqueId, UserPreferences } from "./types";
/**
 * Default configuration
 */
export declare const DEFAULT_CONFIG: OptimizationConfig;
/**
 * Default user preferences
 */
export declare const DEFAULT_PREFERENCES: UserPreferences;
/**
 * Prompt Optimizer class
 */
export declare class PromptOptimizer {
    private config;
    private preferences;
    constructor(config?: Partial<OptimizationConfig>, preferences?: Partial<UserPreferences>);
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<OptimizationConfig>): void;
    /**
     * Update preferences
     */
    updatePreferences(updates: Partial<UserPreferences>): void;
    /**
     * Get current configuration
     */
    getConfig(): OptimizationConfig;
    /**
     * Get current preferences
     */
    getPreferences(): UserPreferences;
    /**
     * Check if optimization should be skipped (escape hatch)
     */
    shouldSkipOptimization(prompt: string): boolean;
    /**
     * Strip escape prefix from prompt
     */
    stripEscapePrefix(prompt: string): string;
    /**
     * Check if optimization should be skipped for simple prompts
     */
    shouldSkipForComplexity(complexity: Complexity): boolean;
    /**
     * Create a new optimization session
     */
    createSession(prompt: string): OptimizationSession;
    /**
     * Generate optimization steps based on analysis
     */
    private generateSteps;
    /**
     * Build final prompt from original + approved steps
     */
    buildFinalPrompt(originalPrompt: string, steps: OptimizationStep[]): string;
    /**
     * Update final prompt based on current steps
     */
    updateFinalPrompt(session: OptimizationSession): void;
    /**
     * Approve a step
     */
    approveStep(session: OptimizationSession, stepId: number): void;
    /**
     * Reject a step
     */
    rejectStep(session: OptimizationSession, stepId: number): void;
    /**
     * Modify a step
     */
    modifyStep(session: OptimizationSession, stepId: number, newContent: string): void;
    /**
     * Approve all steps
     */
    approveAll(session: OptimizationSession): void;
    /**
     * Skip optimization (reject all non-analysis steps)
     */
    skipOptimization(session: OptimizationSession): void;
    /**
     * Save preference to always skip a technique
     */
    saveSkipPreference(techniqueId: TechniqueId): void;
    /**
     * Save custom persona for a domain
     */
    saveCustomPersona(domain: "security" | "frontend" | "backend" | "database" | "devops" | "architecture" | "testing" | "general", persona: string): void;
    /**
     * Toggle auto-approve
     */
    toggleAutoApprove(enabled?: boolean): void;
    /**
     * Set verbosity
     */
    setVerbosity(verbosity: "quiet" | "normal" | "verbose"): void;
    /**
     * Calculate expected improvement
     */
    calculateExpectedImprovement(session: OptimizationSession): ExpectedImprovement;
    /**
     * Get session summary
     */
    getSessionSummary(session: OptimizationSession): string;
}
