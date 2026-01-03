/**
 * Prompt Optimizer
 *
 * Main orchestrator for step-by-step prompt optimization.
 * Manages optimization sessions and applies approved techniques.
 */

import { analyzePrompt } from "./analyzer";
import { ALL_TECHNIQUES, getTechniqueById } from "./techniques";
import type {
    AnalysisResult,
    Complexity,
    ExpectedImprovement,
    OptimizationConfig,
    OptimizationSession,
    OptimizationStep,
    TechniqueContext,
    TechniqueId,
    UserPreferences,
} from "./types";

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: OptimizationConfig = {
    enabled: true,
    autoApprove: false,
    verbosity: "normal",
    defaultTechniques: [
        "analysis",
        "expert_persona",
        "reasoning_chain",
        "stakes_language",
        "self_evaluation",
    ],
    skipForSimplePrompts: false,
    escapePrefix: "!",
};

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
    skipTechniques: [],
    customPersonas: {
        security: "",
        frontend: "",
        backend: "",
        database: "",
        devops: "",
        architecture: "",
        testing: "",
        general: "",
    },
    autoApproveDefault: false,
    verbosityDefault: "normal",
};

/**
 * Prompt Optimizer class
 */
export class PromptOptimizer {
    private config: OptimizationConfig;
    private preferences: UserPreferences;

    constructor(
        config: Partial<OptimizationConfig> = {},
        preferences: Partial<UserPreferences> = {},
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.preferences = { ...DEFAULT_PREFERENCES, ...preferences };
    }

    /**
     * Update configuration
     */
    updateConfig(updates: Partial<OptimizationConfig>): void {
        this.config = { ...this.config, ...updates };
    }

    /**
     * Update preferences
     */
    updatePreferences(updates: Partial<UserPreferences>): void {
        this.preferences = { ...this.preferences, ...updates };
    }

    /**
     * Get current configuration
     */
    getConfig(): OptimizationConfig {
        return { ...this.config };
    }

    /**
     * Get current preferences
     */
    getPreferences(): UserPreferences {
        return { ...this.preferences };
    }

    /**
     * Check if optimization should be skipped (escape hatch)
     */
    shouldSkipOptimization(prompt: string): boolean {
        return prompt.startsWith(this.config.escapePrefix);
    }

    /**
     * Strip escape prefix from prompt
     */
    stripEscapePrefix(prompt: string): string {
        return prompt.slice(this.config.escapePrefix.length).trim();
    }

    /**
     * Check if optimization should be skipped for simple prompts
     */
    shouldSkipForComplexity(complexity: Complexity): boolean {
        if (!this.config.skipForSimplePrompts) {
            return false;
        }
        return complexity === "simple";
    }

    /**
     * Create a new optimization session
     */
    createSession(prompt: string): OptimizationSession {
        // Check escape hatch
        if (this.shouldSkipOptimization(prompt)) {
            const stripped = this.stripEscapePrefix(prompt);
            return {
                id: generateId(),
                originalPrompt: stripped,
                complexity: "simple",
                domain: "general",
                steps: [],
                finalPrompt: stripped,
                verbosity: this.config.verbosity,
                autoApprove: this.config.autoApprove,
                preferences: this.preferences,
                createdAt: new Date(),
            };
        }

        // Analyze prompt
        const analysis = analyzePrompt(prompt);

        // Check if should skip for complexity
        if (this.shouldSkipForComplexity(analysis.complexity)) {
            return {
                id: generateId(),
                originalPrompt: prompt,
                complexity: analysis.complexity,
                domain: analysis.domain,
                steps: [],
                finalPrompt: prompt,
                verbosity: this.config.verbosity,
                autoApprove: this.config.autoApprove,
                preferences: this.preferences,
                createdAt: new Date(),
            };
        }

        // Generate optimization steps
        const steps = this.generateSteps(analysis);

        // Build final prompt (initial version)
        const finalPrompt = this.buildFinalPrompt(prompt, steps);

        return {
            id: generateId(),
            originalPrompt: prompt,
            complexity: analysis.complexity,
            domain: analysis.domain,
            steps,
            finalPrompt,
            verbosity: this.config.verbosity,
            autoApprove: this.config.autoApprove,
            preferences: this.preferences,
            createdAt: new Date(),
        };
    }

    /**
     * Generate optimization steps based on analysis
     */
    private generateSteps(analysis: AnalysisResult): OptimizationStep[] {
        const steps: OptimizationStep[] = [];
        let stepId = 1;

        for (const techniqueId of analysis.suggestedTechniques) {
            // Skip if user always skips this technique
            if (this.preferences.skipTechniques.includes(techniqueId)) {
                continue;
            }

            const technique = getTechniqueById(techniqueId);
            if (!technique) {
                continue;
            }

            const context: TechniqueContext = {
                originalPrompt: "",
                complexity: analysis.complexity,
                domain: analysis.domain,
                previousSteps: steps,
                preferences: this.preferences,
            };

            steps.push({
                id: stepId++,
                technique: techniqueId,
                name: technique.name,
                description: technique.description,
                content: technique.generate(context),
                status: "pending",
                skippable: techniqueId !== "analysis", // Analysis can't be skipped
                appliesTo: technique.appliesTo,
                researchBasis: technique.researchBasis,
            });
        }

        // Auto-approve if enabled
        if (this.config.autoApprove) {
            for (const step of steps) {
                step.status = "approved";
            }
        }

        return steps;
    }

    /**
     * Build final prompt from original + approved steps
     */
    buildFinalPrompt(
        originalPrompt: string,
        steps: OptimizationStep[],
    ): string {
        const approvedSteps = steps.filter(
            (s) => s.status === "approved" || s.status === "modified",
        );

        if (approvedSteps.length === 0) {
            return originalPrompt;
        }

        // Build enhanced prompt
        const parts: string[] = [];

        for (const step of approvedSteps) {
            const content = step.modifiedContent || step.content;
            if (content) {
                parts.push(content);
            }
        }

        // Add original task at the end
        parts.push(`\n\nTask: ${originalPrompt}`);

        return parts.join("\n\n");
    }

    /**
     * Update final prompt based on current steps
     */
    updateFinalPrompt(session: OptimizationSession): void {
        session.finalPrompt = this.buildFinalPrompt(
            session.originalPrompt,
            session.steps,
        );
    }

    /**
     * Approve a step
     */
    approveStep(session: OptimizationSession, stepId: number): void {
        const step = session.steps.find((s) => s.id === stepId);
        if (step) {
            step.status = "approved";
            this.updateFinalPrompt(session);
        }
    }

    /**
     * Reject a step
     */
    rejectStep(session: OptimizationSession, stepId: number): void {
        const step = session.steps.find((s) => s.id === stepId);
        if (step) {
            step.status = "rejected";
            this.updateFinalPrompt(session);
        }
    }

    /**
     * Modify a step
     */
    modifyStep(
        session: OptimizationSession,
        stepId: number,
        newContent: string,
    ): void {
        const step = session.steps.find((s) => s.id === stepId);
        if (step) {
            step.modifiedContent = newContent;
            step.status = "modified";
            this.updateFinalPrompt(session);
        }
    }

    /**
     * Approve all steps
     */
    approveAll(session: OptimizationSession): void {
        for (const step of session.steps) {
            if (step.status === "pending") {
                step.status = "approved";
            }
        }
        this.updateFinalPrompt(session);
    }

    /**
     * Skip optimization (reject all non-analysis steps)
     */
    skipOptimization(session: OptimizationSession): void {
        for (const step of session.steps) {
            if (step.technique !== "analysis") {
                step.status = "rejected";
            }
        }
        this.updateFinalPrompt(session);
    }

    /**
     * Save preference to always skip a technique
     */
    saveSkipPreference(techniqueId: TechniqueId): void {
        if (!this.preferences.skipTechniques.includes(techniqueId)) {
            this.preferences.skipTechniques.push(techniqueId);
        }
    }

    /**
     * Save custom persona for a domain
     */
    saveCustomPersona(
        domain:
            | "security"
            | "frontend"
            | "backend"
            | "database"
            | "devops"
            | "architecture"
            | "testing"
            | "general",
        persona: string,
    ): void {
        this.preferences.customPersonas[domain] = persona;
    }

    /**
     * Toggle auto-approve
     */
    toggleAutoApprove(enabled?: boolean): void {
        this.config.autoApprove =
            enabled !== undefined ? enabled : !this.config.autoApprove;
    }

    /**
     * Set verbosity
     */
    setVerbosity(verbosity: "quiet" | "normal" | "verbose"): void {
        this.config.verbosity = verbosity;
    }

    /**
     * Calculate expected improvement
     */
    calculateExpectedImprovement(
        session: OptimizationSession,
    ): ExpectedImprovement {
        const approvedTechniques = session.steps.filter(
            (s) => s.status === "approved" || s.status === "modified",
        );
        const techniquesApplied = approvedTechniques.map((s) => s.technique);

        // Approximate quality improvement based on research
        const improvementMap: Record<TechniqueId, number> = {
            analysis: 5,
            expert_persona: 60,
            reasoning_chain: 46,
            stakes_language: 45,
            challenge_framing: 115,
            self_evaluation: 10,
        };

        let totalImprovement = 0;
        for (const techniqueId of techniquesApplied) {
            totalImprovement += improvementMap[techniqueId] || 0;
        }

        // Cap at reasonable maximum (diminishing returns)
        const effectiveImprovement = Math.min(totalImprovement, 150);

        return {
            qualityImprovement: effectiveImprovement,
            techniquesApplied,
            researchBasis:
                "Combined research-backed techniques (MBZUAI, Google DeepMind, ICLR 2024)",
        };
    }

    /**
     * Get session summary
     */
    getSessionSummary(session: OptimizationSession): string {
        const improvement = this.calculateExpectedImprovement(session);
        const approvedCount = session.steps.filter(
            (s) => s.status === "approved" || s.status === "modified",
        ).length;

        return (
            `Optimization Session ${session.id}\n` +
            `  Complexity: ${session.complexity}\n` +
            `  Domain: ${session.domain}\n` +
            `  Steps Applied: ${approvedCount}/${session.steps.length}\n` +
            `  Expected Improvement: ~${improvement.qualityImprovement}%`
        );
    }
}
