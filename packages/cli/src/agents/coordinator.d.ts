/**
 * Core agent coordination engine for the AI Engineering System.
 * Handles agent orchestration, execution strategies, and result aggregation.
 */
import { EventEmitter } from "node:events";
import type { AgentRegistry } from "./registry";
import type {
    AgentCoordinatorConfig,
    AgentMetrics,
    AgentProgress,
    AgentTask,
    AgentTaskResult,
    AgentType,
    AggregationStrategy,
} from "./types";
export declare class AgentCoordinator extends EventEmitter {
    private config;
    private runningTasks;
    private completedTasks;
    private metrics;
    private cache;
    private registry;
    private executorBridge;
    constructor(config: AgentCoordinatorConfig, registry?: AgentRegistry);
    /**
     * Execute a collection of agent tasks with the specified strategy
     */
    executeTasks(
        tasks: AgentTask[],
        strategy: AggregationStrategy,
    ): Promise<AgentTaskResult[]>;
    /**
     * Execute a single agent task
     */
    executeTask(task: AgentTask): Promise<AgentTaskResult>;
    /**
     * Get current execution progress
     */
    getProgress(): AgentProgress;
    /**
     * Get metrics for all agent types
     */
    getMetrics(): Map<AgentType, AgentMetrics>;
    /**
     * Clear all caches and reset state
     */
    reset(): void;
    private executeParallel;
    private executeSequential;
    private executeConditional;
    private executeAgent;
    private aggregateResults;
    private mergeResults;
    private voteResults;
    private weightedResults;
    private priorityResults;
    private resolveDependencies;
    private checkTaskDependencies;
    private shouldRetry;
    private evaluateCondition;
    private generateCacheKey;
    private initializeMetrics;
    private updateMetrics;
    private getAgentSuccessRate;
    private getConfidenceValue;
    private getConfidenceFromValue;
    private emitEvent;
    private sleep;
    private log;
}
