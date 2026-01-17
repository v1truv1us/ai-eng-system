/**
 * Task executor for the Ferg Engineering System.
 * Handles task execution, dependency resolution, and result tracking.
 */
import type { AgentCoordinator } from "../agents/coordinator";
import { type AgentTask, type AgentType, type AggregationStrategy } from "../agents/types";
import { type ExecutableTask, type ExecutionOptions, type Plan, type TaskResult } from "./types";
export declare class TaskExecutor {
    private options;
    private taskResults;
    private runningTasks;
    private agentCoordinator?;
    constructor(options?: ExecutionOptions);
    /**
     * Set agent coordinator for executing agent tasks
     */
    setAgentCoordinator(coordinator: AgentCoordinator): void;
    /**
     * Execute all tasks in a plan with dependency resolution
     */
    executePlan(plan: Plan): Promise<TaskResult[]>;
    /**
     * Execute a single task
     */
    executeTask(task: ExecutableTask): Promise<TaskResult>;
    /**
     * Get the result of a previously executed task
     */
    getTaskResult(taskId: string): TaskResult | undefined;
    /**
     * Get all task results
     */
    getAllResults(): TaskResult[];
    /**
     * Clear all task results
     */
    clearResults(): void;
    private resolveExecutionOrder;
    private checkDependencies;
    private executeWithRetry;
    private executeCommand;
    private sleep;
    /**
     * Check if a task is an agent task
     */
    private isAgentTask;
    /**
     * Execute an agent task using the agent coordinator
     */
    private executeAgentTask;
    /**
     * Convert agent task status to regular task status
     */
    private convertAgentStatus;
    /**
     * Execute multiple agent tasks with coordination
     */
    executeAgentTasks(tasks: AgentTask[], strategy?: AggregationStrategy): Promise<TaskResult[]>;
    /**
     * Get agent execution progress
     */
    getAgentProgress(): any;
    /**
     * Get agent execution metrics
     */
    getAgentMetrics(): Map<AgentType, any> | null;
    private log;
}
