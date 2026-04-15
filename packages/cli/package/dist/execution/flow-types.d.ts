/**
 * Flow State Types for Ralph Loop Runner
 *
 * State is persisted to `.ai-eng/runs/<runId>/.flow/` for:
 * - Resume support across runs
 * - Fresh context per iteration (re-anchoring from disk)
 * - Audit trail of all cycle outputs
 */
/** Schema version for forward compatibility */
export declare const FLOW_SCHEMA_VERSION = "1.0.0";
/** Run status enum */
export declare enum RunStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    ABORTED = "aborted",
    STUCK = "stuck"
}
/** Stop reason for completed runs */
export declare enum StopReason {
    COMPLETION_PROMISE = "completion_promise",
    MAX_CYCLES = "max_cycles",
    GATE_FAILURE = "gate_failure",
    STUCK = "stuck",
    USER_ABORT = "user_abort",
    ERROR = "error"
}
/** Phase names in the workflow */
export declare enum Phase {
    RESEARCH = "research",
    SPECIFY = "specify",
    PLAN = "plan",
    WORK = "work",
    REVIEW = "review"
}
/** Gate result type */
export interface GateResult {
    gate: string;
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
}
/** Phase output */
export interface PhaseOutput {
    phase: Phase;
    prompt: string;
    response: string;
    summary: string;
    timestamp: string;
    /** Tool invocations captured during this phase */
    tools?: ToolInvocation[];
}
/** Tool invocation captured from OpenCode stream */
export interface ToolInvocation {
    /** Unique tool ID */
    id: string;
    /** Tool name (e.g., "bash", "read", "write", "edit") */
    name: string;
    /** Input arguments (may be truncated/redacted for secrets) */
    input?: Record<string, unknown>;
    /** Output result (may be truncated) */
    output?: string;
    /** Whether the tool call succeeded */
    status: "ok" | "error";
    /** Error message if status is error */
    error?: string;
    /** When the tool call started (ISO timestamp) */
    startedAt?: string;
    /** When the tool call completed (ISO timestamp) */
    completedAt?: string;
}
/** Single iteration cycle state */
export interface CycleState {
    cycleNumber: number;
    status: "pending" | "running" | "completed" | "failed";
    startTime: string;
    endTime?: string;
    durationMs?: number;
    phases: {
        [key in Phase]?: PhaseOutput;
    };
    gateResults: GateResult[];
    completionPromiseObserved: boolean;
    stopReason?: StopReason;
    error?: string;
    outputHash?: string;
}
/** Main flow state */
export interface FlowState {
    /** Schema version for migrations */
    schemaVersion: string;
    /** Run identification */
    runId: string;
    prompt: string;
    /** Run status */
    status: RunStatus;
    stopReason?: StopReason;
    /** Loop parameters */
    completionPromise: string;
    maxCycles: number;
    stuckThreshold: number;
    gates: string[];
    /** Cycle tracking */
    currentCycle: number;
    completedCycles: number;
    failedCycles: number;
    stuckCount: number;
    /** Timestamps */
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    /** Last successful checkpoint for re-anchoring */
    lastCheckpoint?: {
        cycleNumber: number;
        summary: string;
        timestamp: string;
    };
    /** Error info if failed */
    error?: string;
}
/** Checkpoint for fast resume */
export interface Checkpoint {
    schemaVersion: string;
    runId: string;
    cycleNumber: number;
    timestamp: string;
    state: FlowState;
    lastPhaseOutputs: {
        [key in Phase]?: PhaseOutput;
    };
}
/** Configuration for the loop runner */
export interface LoopConfig {
    runId: string;
    prompt: string;
    completionPromise: string;
    maxCycles: number;
    stuckThreshold: number;
    gates: string[];
    checkpointFrequency: number;
    flowDir: string;
    dryRun: boolean;
    /** Number of retry attempts per cycle on failure */
    cycleRetries: number;
    /** OpenCode prompt timeout in ms (used as idle timeout) */
    promptTimeout?: number;
    /** Phase hard timeout in ms (runner-side watchdog) */
    phaseTimeoutMs?: number;
    /** Cycle hard timeout in ms */
    cycleTimeoutMs?: number;
    /** Run hard timeout in ms */
    runTimeoutMs?: number;
    /** Debug mode: print tool invocations to console/logs */
    debugWork: boolean;
}
