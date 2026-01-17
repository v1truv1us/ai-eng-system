/**
 * Plan generation from descriptions using agent collaboration.
 * Coordinates multiple agents to create comprehensive implementation plans.
 */
import type { AgentCoordinator } from "./coordinator";
import { ConfidenceLevel, type PlanGenerationInput, type PlanGenerationOutput } from "./types";
export declare class PlanGenerator {
    private coordinator;
    constructor(coordinator: AgentCoordinator);
    /**
     * Generate a comprehensive plan from a natural language description
     */
    generatePlan(input: PlanGenerationInput): Promise<PlanGenerationOutput>;
    /**
     * Generate a plan with specific scope constraints
     */
    generateScopedPlan(input: PlanGenerationInput, scope: "architecture" | "implementation" | "review" | "full"): Promise<PlanGenerationOutput>;
    /**
     * Validate and enhance an existing plan
     */
    validatePlan(plan: any): Promise<{
        isValid: boolean;
        issues: string[];
        enhancements: string[];
        confidence: ConfidenceLevel;
    }>;
    /**
     * Create agent tasks for plan generation
     */
    private createPlanGenerationTasks;
    /**
     * Aggregate results from multiple agents into a comprehensive plan
     */
    private aggregatePlanResults;
    /**
     * Calculate overall confidence from multiple agent results
     */
    private calculateOverallConfidence;
    /**
     * Generate reasoning for the plan
     */
    private generateReasoning;
    /**
     * Generate suggestions for plan improvement
     */
    private generateSuggestions;
    /**
     * Aggregate validation results
     */
    private aggregateValidationResults;
    /**
     * Check if SEO planning is relevant for this input
     */
    private isSEORelevant;
    /**
     * Generate a descriptive plan name
     */
    private generatePlanName;
    /**
     * Generate a comprehensive plan description
     */
    private generatePlanDescription;
    /**
     * Deduplicate and organize tasks from multiple agents
     */
    private deduplicateAndOrganizeTasks;
    /**
     * Resolve and organize dependencies
     */
    private resolveDependencies;
}
