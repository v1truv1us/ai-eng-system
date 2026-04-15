/**
 * Plan parser for the Ferg Engineering System.
 * Handles YAML parsing, validation, and dependency resolution for execution plans.
 */
import { type AgentTask } from "../agents/types";
import { type Plan, type Task, type ValidationError } from "./types";
export declare class PlanParser {
    private errors;
    private warnings;
    /**
     * Parse a plan file from the filesystem
     */
    parseFile(filePath: string): Plan;
    /**
     * Parse plan content from string
     */
    parseContent(content: string, source?: string): Plan;
    /**
     * Get validation errors from the last parse
     */
    getErrors(): ValidationError[];
    /**
     * Get validation warnings from the last parse
     */
    getWarnings(): string[];
    private validateTopLevelStructure;
    private parseMetadata;
    private parseTasks;
    private parseTask;
    private parseQualityGates;
    private parseQualityGate;
    private validateTaskDependencies;
    private detectCircularDependencies;
    /**
     * Check if a task type is an agent task type
     */
    private isAgentTaskType;
    /**
     * Parse and validate an agent task
     */
    private parseAgentTask;
    /**
     * Validate agent task dependencies
     */
    private validateAgentTaskDependencies;
    /**
     * Check if a task is an agent task
     */
    private isAgentTask;
    /**
     * Get all agent tasks from a plan
     */
    getAgentTasks(plan: Plan): AgentTask[];
    /**
     * Get all shell tasks from a plan
     */
    getShellTasks(plan: Plan): Task[];
    /**
     * Validate agent task configuration
     */
    validateAgentTaskConfiguration(plan: Plan): {
        isValid: boolean;
        errors: ValidationError[];
        warnings: string[];
    };
}
