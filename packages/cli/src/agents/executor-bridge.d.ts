/**
 * ExecutorBridge - Hybrid execution with Task tool and local TypeScript
 *
 * Key responsibilities:
 * 1. Determine execution mode based on task type
 * 2. Build enhanced prompts with incentive prompting
 * 3. Map AgentType to Task tool subagent_type
 * 4. Execute local operations for file/search tasks
 */
import type { AgentRegistry } from "./registry";
import { type AgentDefinition, type AgentOutput, type AgentTask, AgentType, type ExecutionMode, type LocalOperation, type LocalResult } from "./types";
export declare class ExecutorBridge {
    private registry;
    private sessionManager?;
    constructor(registry: AgentRegistry, sessionManager?: any);
    /**
     * Select execution mode based on task characteristics
     */
    selectExecutionMode(task: AgentTask): ExecutionMode;
    /**
     * Get default execution mode when agent not in registry
     */
    private getDefaultExecutionMode;
    /**
     * Execute a task using the appropriate mode
     */
    execute(task: AgentTask): Promise<AgentOutput>;
    private executeInternal;
    /**
     * Cleanup resources
     *
     * Note: MCP-based Task-tool execution was removed. This bridge now only supports
     * local execution in standalone mode.
     */
    cleanup(): Promise<void>;
    /**
     * Execute using Task tool subagents.
     *
     * IMPORTANT: In this repository, running Task tool subagents requires the
     * OpenCode runtime (where the Task tool executes in-process). The ai-eng-system
     * package is a standalone orchestration layer and does not invoke OpenCode.
     *
     * For now, we fail gracefully with a clear message.
     */
    private executeWithTaskTool;
    /**
     * Execute locally using TypeScript functions
     */
    private executeLocally;
    /**
     * Map AgentType to Task tool subagent_type
     */
    mapToSubagentType(type: AgentType): string;
    /**
     * Build enhanced prompt with incentive prompting techniques
     */
    buildEnhancedPrompt(agent: AgentDefinition, task: AgentTask): Promise<string>;
    private buildExpertPersona;
    private buildTaskContext;
    private buildIncentivePrompting;
    /**
     * Execute local operations
     */
    executeLocal(operation: LocalOperation): Promise<LocalResult>;
    private generateTests;
    private analyzeSEO;
    private checkDeployment;
    private countLines;
    private analyzeCode;
}
