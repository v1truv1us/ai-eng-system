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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Log } from "../util/log";
import type { Checkpoint, CycleState, FlowState } from "./flow-types";
import { FLOW_SCHEMA_VERSION, RunStatus, type StopReason } from "./flow-types";

const log = Log.create({ service: "flow-store" });

/** Flow store options */
export interface FlowStoreOptions {
    flowDir: string;
    runId: string;
}

/**
 * Flow Store - manages persistence of loop run state
 */
export class FlowStore {
    private flowDir: string;
    private runId: string;

    constructor(options: FlowStoreOptions) {
        this.flowDir = options.flowDir;
        this.runId = options.runId;
    }

    /** Get the base flow directory path */
    get basePath(): string {
        return join(this.flowDir, this.runId, ".flow");
    }

    /** Get path to a specific file in .flow */
    private path(relPath: string): string {
        return join(this.basePath, relPath);
    }

    /** Initialize flow directory structure */
    initialize(): void {
        // Create .flow directory and subdirectories
        const dirs = ["iterations", "contexts", "gates"];

        for (const dir of dirs) {
            const dirPath = this.path(dir);
            if (!existsSync(dirPath)) {
                mkdirSync(dirPath, { recursive: true });
                log.debug("Created directory", { path: dirPath });
            }
        }

        log.info("Flow store initialized", {
            runId: this.runId,
            basePath: this.basePath,
        });
    }

    /** Check if flow state exists (for resume) */
    exists(): boolean {
        return existsSync(this.path("state.json"));
    }

    /** Load existing run state for resume */
    load(): FlowState | null {
        const statePath = this.path("state.json");
        if (!existsSync(statePath)) {
            return null;
        }

        try {
            const content = readFileSync(statePath, "utf-8");
            const state = JSON.parse(content) as FlowState;

            // Validate schema version
            if (state.schemaVersion !== FLOW_SCHEMA_VERSION) {
                log.warn("Flow schema version mismatch", {
                    expected: FLOW_SCHEMA_VERSION,
                    found: state.schemaVersion,
                });
            }

            log.info("Loaded flow state", {
                runId: state.runId,
                status: state.status,
                currentCycle: state.currentCycle,
            });

            return state;
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);
            log.error("Failed to load flow state", { error: errorMsg });
            return null;
        }
    }

    /** Create initial run state */
    createInitialState(options: {
        prompt: string;
        completionPromise: string;
        maxCycles: number;
        stuckThreshold: number;
        gates: string[];
    }): FlowState {
        const now = new Date().toISOString();

        const state: FlowState = {
            schemaVersion: FLOW_SCHEMA_VERSION,
            runId: this.runId,
            prompt: options.prompt,
            status: RunStatus.PENDING,
            completionPromise: options.completionPromise,
            maxCycles: options.maxCycles,
            stuckThreshold: options.stuckThreshold,
            gates: options.gates,
            currentCycle: 0,
            completedCycles: 0,
            failedCycles: 0,
            stuckCount: 0,
            createdAt: now,
            updatedAt: now,
        };

        this.saveState(state);
        return state;
    }

    /** Save run state to state.json */
    saveState(state: FlowState): void {
        const statePath = this.path("state.json");
        state.updatedAt = new Date().toISOString();
        writeFileSync(statePath, JSON.stringify(state, null, 2));
        log.debug("Saved flow state", { runId: state.runId });
    }

    /** Save a checkpoint for fast resume */
    saveCheckpoint(
        state: FlowState,
        lastPhaseOutputs: CycleState["phases"],
    ): void {
        const checkpointPath = this.path("checkpoint.json");
        const checkpoint: Checkpoint = {
            schemaVersion: FLOW_SCHEMA_VERSION,
            runId: state.runId,
            cycleNumber: state.currentCycle,
            timestamp: new Date().toISOString(),
            state,
            lastPhaseOutputs,
        };
        writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
        log.debug("Saved checkpoint", {
            runId: state.runId,
            cycle: state.currentCycle,
        });
    }

    /** Load checkpoint for resume */
    loadCheckpoint(): Checkpoint | null {
        const checkpointPath = this.path("checkpoint.json");
        if (!existsSync(checkpointPath)) {
            return null;
        }

        try {
            const content = readFileSync(checkpointPath, "utf-8");
            return JSON.parse(content) as Checkpoint;
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);
            log.error("Failed to load checkpoint", { error: errorMsg });
            return null;
        }
    }

    /** Save iteration cycle output */
    saveIteration(cycle: CycleState): void {
        const cyclePath = this.path(`iterations/${cycle.cycleNumber}.json`);
        writeFileSync(cyclePath, JSON.stringify(cycle, null, 2));

        // Save re-anchoring context
        const contextPath = this.path(`contexts/${cycle.cycleNumber}.md`);
        const contextContent = this.generateContextContent(cycle);
        writeFileSync(contextPath, contextContent);

        log.debug("Saved iteration", { cycle: cycle.cycleNumber });
    }

    /** Save gate results for iteration */
    saveGateResults(
        cycleNumber: number,
        results: CycleState["gateResults"],
    ): void {
        const gatePath = this.path(`gates/${cycleNumber}.json`);
        writeFileSync(gatePath, JSON.stringify(results, null, 2));
    }

    /** Generate re-anchoring context content for a cycle */
    private generateContextContent(cycle: CycleState): string {
        const lines: string[] = [
            `# Cycle ${cycle.cycleNumber} Context`,
            "",
            `**Timestamp:** ${cycle.startTime}`,
            `**Status:** ${cycle.status}`,
            `**Completion Promise Observed:** ${cycle.completionPromiseObserved}`,
            "",
            "## Phase Summaries",
            "",
        ];

        for (const [phase, output] of Object.entries(cycle.phases)) {
            if (output) {
                lines.push(`### ${phase.toUpperCase()}`);
                lines.push("");
                lines.push(output.summary || output.response.slice(0, 500));
                lines.push("");
            }
        }

        if (cycle.gateResults.length > 0) {
            lines.push("## Gate Results");
            lines.push("");
            for (const gate of cycle.gateResults) {
                const status = gate.passed ? "✅ PASS" : "❌ FAIL";
                lines.push(`- **${gate.gate}:** ${status} - ${gate.message}`);
            }
            lines.push("");
        }

        if (cycle.error) {
            lines.push("## Errors");
            lines.push("");
            lines.push(cycle.error);
            lines.push("");
        }

        return lines.join("\n");
    }

    /** Get iteration by number */
    getIteration(cycleNumber: number): CycleState | null {
        const cyclePath = this.path(`iterations/${cycleNumber}.json`);
        if (!existsSync(cyclePath)) {
            return null;
        }

        try {
            const content = readFileSync(cyclePath, "utf-8");
            return JSON.parse(content) as CycleState;
        } catch {
            return null;
        }
    }

    /** Get all iterations */
    getAllIterations(): CycleState[] {
        const iterations: CycleState[] = [];
        let n = 1;

        while (true) {
            const cycle = this.getIteration(n);
            if (!cycle) break;
            iterations.push(cycle);
            n++;
        }

        return iterations;
    }

    /** Update state status */
    updateStatus(
        status: RunStatus,
        stopReason?: StopReason,
        error?: string,
    ): void {
        const state = this.load();
        if (!state) {
            throw new Error("No flow state to update");
        }

        state.status = status;
        if (stopReason) state.stopReason = stopReason;
        if (error) state.error = error;
        if (status === RunStatus.COMPLETED || status === RunStatus.FAILED) {
            state.completedAt = new Date().toISOString();
        }

        this.saveState(state);
    }

    /** Increment cycle counter */
    incrementCycle(): number {
        const state = this.load();
        if (!state) {
            throw new Error("No flow state to update");
        }

        state.currentCycle++;
        this.saveState(state);
        return state.currentCycle;
    }

    /** Record a failed cycle */
    recordFailedCycle(cycle: CycleState): void {
        const state = this.load();
        if (!state) {
            throw new Error("No flow state to update");
        }

        state.failedCycles++;
        state.stuckCount++;
        this.saveIteration(cycle);
        this.saveState(state);

        log.info("Cycle failed", {
            runId: this.runId,
            cycle: cycle.cycleNumber,
            failedCycles: state.failedCycles,
            stuckCount: state.stuckCount,
        });
    }

    /** Record a successful cycle */
    recordSuccessfulCycle(cycle: CycleState, summary: string): void {
        const state = this.load();
        if (!state) {
            throw new Error("No flow state to update");
        }

        state.completedCycles++;
        state.stuckCount = 0; // Reset stuck counter on success
        state.lastCheckpoint = {
            cycleNumber: cycle.cycleNumber,
            summary,
            timestamp: new Date().toISOString(),
        };

        this.saveIteration(cycle);
        this.saveState(state);

        log.info("Cycle completed", {
            runId: this.runId,
            cycle: cycle.cycleNumber,
            completedCycles: state.completedCycles,
        });
    }

    /** Clean up flow directory */
    cleanup(): void {
        // Implementation would remove the .flow directory
        // For now, just log
        log.info("Flow store cleanup requested", { runId: this.runId });
    }
}
