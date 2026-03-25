/**
 * Multi-agent code review executor for the Ferg Engineering System.
 * Coordinates multiple specialized agents to perform comprehensive code reviews.
 */
import type { AgentCoordinator } from "./coordinator";
import { type CodeReviewInput, type CodeReviewOutput } from "./types";
export declare class CodeReviewExecutor {
    private coordinator;
    constructor(coordinator: AgentCoordinator);
    /**
     * Execute a comprehensive code review using multiple agents
     */
    executeCodeReview(input: CodeReviewInput): Promise<CodeReviewOutput>;
    /**
     * Execute a focused code review for specific aspects
     */
    executeFocusedReview(input: CodeReviewInput, focus: "security" | "performance" | "frontend" | "general"): Promise<CodeReviewOutput>;
    /**
     * Execute incremental code review for changed files
     */
    executeIncrementalReview(input: CodeReviewInput, baseBranch?: string): Promise<CodeReviewOutput>;
    /**
     * Create review tasks for different code aspects
     */
    private createReviewTasks;
    /**
     * Aggregate findings from multiple agents
     */
    private aggregateFindings;
    /**
     * Generate summary of findings
     */
    private generateSummary;
    /**
     * Generate recommendations based on findings
     */
    private generateRecommendations;
    /**
     * Calculate overall code quality score
     */
    private calculateOverallScore;
    /**
     * Determine if security review should be included
     */
    private shouldIncludeSecurityReview;
    /**
     * Determine if performance review should be included
     */
    private shouldIncludePerformanceReview;
    /**
     * Determine if frontend review should be included
     */
    private shouldIncludeFrontendReview;
    /**
     * Check if files list contains frontend files
     */
    private hasFrontendFiles;
    /**
     * Convert confidence level to numeric value
     */
    private getConfidenceValue;
}
