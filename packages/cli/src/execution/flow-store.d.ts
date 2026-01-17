/**
 * Flow Store - State persistence layer for Ralph Loop Runner
 *
 * Persists run state to `.ai-eng/runs/<runId>/.flow/`:
 * - state.json: Main run state
 * - checkpoint.json: Last successful checkpoint for fast resume
 * - iterations/<n>.json: Per-cycle detailed outputs
 * - contexts/<n>.md: Re-anchoring context snapshots
 * - gates/<n>.json: Quality gate results
 */
import type { Checkpoint, CycleState, FlowState } from "./flow-types";
import { RunStatus, type StopReason } from "./flow-types";
/** Flow store options */
export interface FlowStoreOptions {
    flowDir: string;
    runId: string;
}
/**
 * Flow Store - manages persistence of loop run state
 */
export declare class FlowStore {
    private flowDir;
    private runId;
    constructor(options: FlowStoreOptions);
    /** Get the base flow directory path */
    get basePath(): string;
    /** Get path to a specific file in .flow */
    private path;
    /** Initialize flow directory structure */
    initialize(): void;
    /** Check if flow state exists (for resume) */
    exists(): boolean;
    /** Load existing run state for resume */
    load(): FlowState | null;
    /** Create initial run state */
    createInitialState(options: {
        prompt: string;
        completionPromise: string;
        maxCycles: number;
        stuckThreshold: number;
        gates: string[];
    }): FlowState;
    /** Save run state to state.json */
    saveState(state: FlowState): void;
    /** Save a checkpoint for fast resume */
    saveCheckpoint(state: FlowState, lastPhaseOutputs: CycleState["phases"]): void;
    /** Load checkpoint for resume */
    loadCheckpoint(): Checkpoint | null;
    /** Save iteration cycle output */
    saveIteration(cycle: CycleState): void;
    /** Save gate results for iteration */
    saveGateResults(cycleNumber: number, results: CycleState["gateResults"]): void;
    /** Generate re-anchoring context content for a cycle */
    private generateContextContent;
    /** Get iteration by number */
    getIteration(cycleNumber: number): CycleState | null;
    /** Get all iterations */
    getAllIterations(): CycleState[];
    /** Update state status */
    updateStatus(status: RunStatus, stopReason?: StopReason, error?: string): void;
    /** Increment cycle counter */
    incrementCycle(): number;
    /** Record a failed cycle */
    recordFailedCycle(cycle: CycleState): void;
    /** Record a successful cycle */
    recordSuccessfulCycle(cycle: CycleState, summary: string): void;
    /** Clean up flow directory */
    cleanup(): void;
}
