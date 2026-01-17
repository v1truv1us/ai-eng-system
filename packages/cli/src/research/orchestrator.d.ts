/**
 * Core research orchestration engine for Ferg Engineering System.
 * Coordinates 3-phase research process: discovery, analysis, and synthesis.
 */
import { EventEmitter } from "node:events";
import { type ResearchConfig, type ResearchEvent, type ResearchMetrics, type ResearchProgress, type ResearchQuery, type SynthesisReport } from "./types";
/**
 * Main research orchestrator class
 */
export declare class ResearchOrchestrator extends EventEmitter {
    private agentCoordinator;
    private config;
    private discoveryHandler;
    private analysisHandler;
    private synthesisHandler;
    private startTime?;
    private currentPhase;
    private progress;
    private anyEventListeners;
    constructor(config: ResearchConfig);
    /**
     * Main research method - executes complete 3-phase workflow
     */
    research(query: ResearchQuery): Promise<SynthesisReport>;
    /**
     * Subscribe to all emitted research events (convenience API for tests/UI)
     */
    onAny(handler: (event: ResearchEvent["type"], data?: any) => void): void;
    /**
     * Get current research progress
     */
    getProgress(): ResearchProgress;
    /**
     * Get research metrics
     */
    getMetrics(): ResearchMetrics | null;
    /**
     * Reset orchestrator state
     */
    reset(): void;
    /**
     * Execute discovery phase
     */
    private executeDiscoveryPhase;
    /**
     * Execute analysis phase
     */
    private executeAnalysisPhase;
    /**
     * Execute synthesis phase
     */
    private executeSynthesisPhase;
    /**
     * Validate research query
     */
    private validateQuery;
    /**
     * Update progress tracking
     */
    private updateProgress;
    /**
     * Handle errors during execution
     */
    private handleError;
    /**
     * Get suggested action for error
     */
    private getSuggestedAction;
    /**
     * Set up event listeners
     */
    private setupEventListeners;
    /**
     * Emit research event
     */
    private emitEvent;
    /**
     * Generate unique ID
     */
    private generateId;
}
