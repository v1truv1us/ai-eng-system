/**
 * Tests for Ralph Loop Runner and Flow Store
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RalphFlags } from "../../src/cli/flags";
import type { AiEngConfig } from "../../src/config/schema";
import { FlowStore } from "../../src/execution/flow-store";
import {
    type CycleState,
    FLOW_SCHEMA_VERSION,
    Phase,
    RunStatus,
    StopReason,
} from "../../src/execution/flow-types";
import { RalphLoopRunner } from "../../src/execution/ralph-loop";
import { PromptOptimizer } from "../../src/prompt-optimization/optimizer";

describe("Flow Store", () => {
    let tempDir: string;
    let flowStore: FlowStore;
    const testRunId = "test-run-123";

    beforeEach(() => {
        // Create temp directory for test
        tempDir = mkdtempSync(join(tmpdir(), "flow-store-test-"));
        flowStore = new FlowStore({
            flowDir: tempDir,
            runId: testRunId,
        });
    });

    afterEach(() => {
        // Cleanup
        if (tempDir) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("initializes directory structure", () => {
        flowStore.initialize();

        const basePath = flowStore.basePath;
        expect(join(basePath, "iterations")).toBeTruthy();
        expect(join(basePath, "contexts")).toBeTruthy();
        expect(join(basePath, "gates")).toBeTruthy();
    });

    it("creates initial state", () => {
        flowStore.initialize();

        const state = flowStore.createInitialState({
            prompt: "Test prompt",
            completionPromise: "<promise>SHIP</promise>",
            maxCycles: 50,
            stuckThreshold: 5,
            gates: ["tests", "lint"],
        });

        expect(state.schemaVersion).toBe(FLOW_SCHEMA_VERSION);
        expect(state.runId).toBe(testRunId);
        expect(state.prompt).toBe("Test prompt");
        expect(state.completionPromise).toBe("<promise>SHIP</promise>");
        expect(state.maxCycles).toBe(50);
        expect(state.stuckThreshold).toBe(5);
        expect(state.gates).toEqual(["tests", "lint"]);
        expect(state.status).toBe(RunStatus.PENDING);
        expect(state.currentCycle).toBe(0);
    });

    it("loads existing state", () => {
        flowStore.initialize();
        flowStore.createInitialState({
            prompt: "Test prompt",
            completionPromise: "<promise>SHIP</promise>",
            maxCycles: 30,
            stuckThreshold: 3,
            gates: ["acceptance"],
        });

        const loaded = flowStore.load();

        expect(loaded).not.toBeNull();
        expect(loaded?.prompt).toBe("Test prompt");
        expect(loaded?.maxCycles).toBe(30);
    });

    it("returns null for non-existent state", () => {
        const emptyStore = new FlowStore({
            flowDir: tempDir,
            runId: "non-existent",
        });
        expect(emptyStore.load()).toBeNull();
    });

    it("saves and retrieves iterations", () => {
        flowStore.initialize();
        flowStore.createInitialState({
            prompt: "Test",
            completionPromise: "<promise>DONE</promise>",
            maxCycles: 10,
            stuckThreshold: 5,
            gates: [],
        });

        const cycle: CycleState = {
            cycleNumber: 1,
            status: "completed",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            durationMs: 1000,
            phases: {
                [Phase.RESEARCH]: {
                    phase: Phase.RESEARCH,
                    prompt: "Research prompt",
                    response: "Research response",
                    summary: "Research complete",
                    timestamp: new Date().toISOString(),
                },
            },
            gateResults: [
                {
                    gate: "tests",
                    passed: true,
                    message: "All tests passed",
                    timestamp: new Date().toISOString(),
                },
            ],
            completionPromiseObserved: false,
            outputHash: "abc123",
        };

        flowStore.saveIteration(cycle);
        const loaded = flowStore.getIteration(1);

        expect(loaded).not.toBeNull();
        expect(loaded?.cycleNumber).toBe(1);
        expect(loaded?.status).toBe("completed");
        expect(loaded?.phases[Phase.RESEARCH]?.summary).toBe(
            "Research complete",
        );
        expect(loaded?.gateResults[0]?.gate).toBe("tests");
    });

    it("tracks cycle counters", () => {
        flowStore.initialize();
        flowStore.createInitialState({
            prompt: "Test",
            completionPromise: "<promise>DONE</promise>",
            maxCycles: 10,
            stuckThreshold: 5,
            gates: [],
        });

        const state = flowStore.load();
        expect(state?.completedCycles).toBe(0);
        expect(state?.failedCycles).toBe(0);
        expect(state?.stuckCount).toBe(0);

        // Record a successful cycle
        const cycle: CycleState = {
            cycleNumber: 1,
            status: "completed",
            startTime: new Date().toISOString(),
            phases: {},
            gateResults: [],
            completionPromiseObserved: false,
        };

        flowStore.recordSuccessfulCycle(cycle, "Test summary");

        const updatedState = flowStore.load();
        expect(updatedState?.completedCycles).toBe(1);
        expect(updatedState?.stuckCount).toBe(0);
    });

    it("detects stuck state after threshold", () => {
        flowStore.initialize();
        flowStore.createInitialState({
            prompt: "Test",
            completionPromise: "<promise>DONE</promise>",
            maxCycles: 10,
            stuckThreshold: 3,
            gates: [],
        });

        const cycle: CycleState = {
            cycleNumber: 1,
            status: "failed",
            startTime: new Date().toISOString(),
            phases: {},
            gateResults: [],
            completionPromiseObserved: false,
            error: "Test failure",
        };

        // Record 3 failed cycles
        for (let i = 1; i <= 3; i++) {
            cycle.cycleNumber = i;
            flowStore.recordFailedCycle(cycle);
        }

        const state = flowStore.load();
        expect(state?.failedCycles).toBe(3);
        expect(state?.stuckCount).toBe(3);
    });

    it("saves and loads checkpoints", () => {
        flowStore.initialize();
        const state = flowStore.createInitialState({
            prompt: "Test",
            completionPromise: "<promise>DONE</promise>",
            maxCycles: 10,
            stuckThreshold: 5,
            gates: [],
        });

        const phases: CycleState["phases"] = {
            [Phase.RESEARCH]: {
                phase: Phase.RESEARCH,
                prompt: "",
                response: "",
                summary: "Research done",
                timestamp: new Date().toISOString(),
            },
        };

        flowStore.saveCheckpoint(state, phases);

        const checkpoint = flowStore.loadCheckpoint();
        expect(checkpoint).not.toBeNull();
        expect(checkpoint?.cycleNumber).toBe(0);
        expect(checkpoint?.lastPhaseOutputs[Phase.RESEARCH]?.summary).toBe(
            "Research done",
        );
    });
});

describe("Flow State Types", () => {
    it("has correct schema version", () => {
        expect(FLOW_SCHEMA_VERSION).toBe("1.0.0");
    });

    it("has all expected phases", () => {
        expect(Object.values(Phase)).toEqual([
            Phase.RESEARCH,
            Phase.SPECIFY,
            Phase.PLAN,
            Phase.WORK,
            Phase.REVIEW,
        ]);
    });

    it("has all expected stop reasons", () => {
        expect(Object.values(StopReason)).toEqual([
            StopReason.COMPLETION_PROMISE,
            StopReason.MAX_CYCLES,
            StopReason.GATE_FAILURE,
            StopReason.STUCK,
            StopReason.USER_ABORT,
            StopReason.ERROR,
        ]);
    });
});

describe("RalphLoopRunner Configuration", () => {
    const baseConfig: AiEngConfig = {
        version: 1,
        runner: {
            backend: "opencode",
            review: "opencode",
            artifactsDir: ".ai-eng/runs",
            maxIters: 3,
            printLogs: false,
            logLevel: "INFO",
        },
        opencode: {
            model: "claude-3-5-sonnet-latest",
            temperature: 0.2,
        },
        anthropic: {
            enabled: false,
            model: "claude-3-5-sonnet-latest",
        },
        gates: {
            lint: "bun run lint",
            typecheck: "bun run typecheck",
            test: "bun run test",
            build: "bun run build",
        },
        models: {
            research: "github-copilot/gpt-5.2",
            planning: "github-copilot/gpt-5.2",
            exploration: "github-copilot/gpt-5.2",
            coding: "github-copilot/gpt-5.2",
            default: "github-copilot/gpt-5.2",
        },
    };

    it("draft mode allows no completion promise (default behavior)", () => {
        const flags: RalphFlags = {
            workflow: "Test prompt",
            loop: true,
            noLoop: false,
            completionPromise: undefined,
            ship: false,
            draft: true,
        };

        const optimizer = new PromptOptimizer({
            autoApprove: true,
            verbosity: "normal",
        });

        // Draft mode should not throw - it runs for max-cycles without checking completion promise
        const runner = new RalphLoopRunner(flags, baseConfig, optimizer);
        expect(runner).toBeTruthy();
    });

    it("accepts completion promise via flag", () => {
        const flags: RalphFlags = {
            workflow: "Test prompt",
            loop: true,
            noLoop: false,
            completionPromise: "<promise>DONE</promise>",
            ship: false,
        };

        const optimizer = new PromptOptimizer({
            autoApprove: true,
            verbosity: "normal",
        });

        const runner = new RalphLoopRunner(flags, baseConfig, optimizer);
        expect(runner).toBeTruthy();
    });

    it("uses --ship to set default completion promise", () => {
        const flags: RalphFlags = {
            workflow: "Test prompt",
            loop: true,
            noLoop: false,
            completionPromise: undefined,
            ship: true,
        };

        const optimizer = new PromptOptimizer({
            autoApprove: true,
            verbosity: "normal",
        });

        const runner = new RalphLoopRunner(flags, baseConfig, optimizer);
        expect(runner).toBeTruthy();
    });
});
