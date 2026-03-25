/**
 * Self-Improvement System for Agent Coordination
 *
 * Tracks agent performance, identifies improvement opportunities,
 * and implements enhancements to the system.
 */
import { EventEmitter } from "node:events";
import type { MemoryManager } from "../context/memory";
import type { AgentCoordinator } from "./coordinator";
import type { AgentRegistry } from "./registry";
import { type AgentExecution, type AgentType } from "./types";
export interface PerformancePattern {
    agentType: AgentType;
    pattern: "success-rate" | "execution-time" | "error-frequency" | "quality-score";
    trend: "improving" | "declining" | "stable";
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    evidence: string[];
    suggestedActions: string[];
}
export interface SystemImprovement {
    id: string;
    type: "agent-prompt" | "capability" | "workflow" | "coordination" | "communication";
    target: AgentType | "system";
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
    complexity: "low" | "medium" | "high";
    prerequisites: string[];
    implementation: string[];
    successMetrics: string[];
    status: "proposed" | "approved" | "implementing" | "completed" | "failed";
    createdAt: Date;
    implementedAt?: Date;
    effectiveness?: number;
}
/**
 * Self-Improvement Tracker
 * Monitors system performance and implements enhancements
 */
export declare class SelfImprovementTracker extends EventEmitter {
    private memoryManager;
    private registry;
    private coordinator;
    private improvements;
    private performanceHistory;
    constructor(memoryManager: MemoryManager, registry: AgentRegistry, coordinator: AgentCoordinator);
    /**
     * Record agent execution for performance analysis
     */
    recordExecution(execution: AgentExecution): Promise<void>;
    /**
     * Analyze performance patterns and suggest improvements
     */
    analyzePerformancePatterns(agentType?: AgentType): Promise<PerformancePattern[]>;
    /**
     * Generate improvement suggestion based on performance pattern
     */
    generateImprovementSuggestion(pattern: PerformancePattern): Promise<string>;
    /**
     * Implement an approved improvement
     */
    implementImprovement(improvementId: string): Promise<boolean>;
    /**
     * Get pending improvement suggestions
     */
    getPendingImprovements(): SystemImprovement[];
    /**
     * Get implemented improvements with effectiveness ratings
     */
    getImplementedImprovements(): SystemImprovement[];
    /**
     * Measure effectiveness of implemented improvements
     */
    measureEffectiveness(improvementId: string): Promise<number>;
    private analyzeSuccessRate;
    private analyzeExecutionTime;
    private analyzeErrorPatterns;
    private mapPatternToImprovementType;
    private executeImprovement;
    private updateAgentPrompt;
    private addAgentCapability;
    private optimizeWorkflow;
    private improveCoordination;
    private enhanceCommunication;
    private setupEventListeners;
    /**
     * Get system improvement statistics
     */
    getStats(): {
        totalImprovements: number;
        completedImprovements: number;
        averageEffectiveness: number;
        pendingSuggestions: number;
    };
}
export declare function getSelfImprovementTracker(memoryManager?: MemoryManager, registry?: AgentRegistry, coordinator?: AgentCoordinator): SelfImprovementTracker;
