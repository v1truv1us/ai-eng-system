/**
 * Shared domain types extracted to break circular dependencies.
 *
 * Rule: types/ must not import from cli/, config/, execution/, agents/, or context/.
 *       Those modules import from types/ — never the reverse.
 */

// ─── CLI Flags (breaks cli ↔ config, cli ↔ execution) ───────────────

/** Log severity levels */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

/** CLI flags shared across config loading and execution */
export interface RalphFlags {
    /** Workflow specification file path */
    workflow?: string;
    /** Maximum iterations (for loop mode) */
    maxIters?: number;
    /** Comma-separated list of quality gates */
    gates?: string[];
    /** Review mode: none|opencode|anthropic|both */
    review?: "none" | "opencode" | "anthropic" | "both";
    /** Resume previous run */
    resume?: boolean;
    /** Specific run ID to resume */
    runId?: string;
    /** Dry run mode */
    dryRun?: boolean;
    /** CI mode (no interactive prompts) */
    ci?: boolean;
    /** Show help message */
    help?: boolean;
    /** Print logs to stderr */
    printLogs?: boolean;
    /** Log level */
    logLevel?: LogLevel;
    /** Verbose output (alias for logLevel=DEBUG) */
    verbose?: boolean;
    /** Use TUI mode instead of CLI */
    tui?: boolean;
    /** Disable streaming output (buffered mode) */
    noStream?: boolean;
    /** Working directory to use for spawned OpenCode server */
    workingDir?: string;
    /** Enable loop mode (default: true) */
    loop?: boolean;
    /** Disable loop mode (single-shot execution) */
    noLoop?: boolean;
    /** Completion promise token - loop exits when this token is observed */
    completionPromise?: string;
    /** Ship mode - use default completion promise "SHIP" */
    ship?: boolean;
    /** Draft mode - loop runs for max-cycles then stops */
    draft?: boolean;
    /** Maximum number of loop cycles (default: 10) */
    maxCycles?: number;
    /** Checkpoint frequency (save state every N cycles, default: 1) */
    checkpointFrequency?: number;
    /** Flow directory (defaults to .ai-eng/runs/<runId>/.flow) */
    flowDir?: string;
    /** Stuck detection threshold - abort after N cycles with no progress (default: 5) */
    stuckThreshold?: number;
    /** Debug mode: print every tool invocation input/output */
    debugWork?: boolean;
}

// ─── Domain Types (breaks agents ↔ context) ──────────────────────────

/** A tracked task in the system */
export interface Task {
    id: string;
    content: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    createdAt: string;
    completedAt?: string;
}

/** A recorded architectural or design decision */
export interface Decision {
    id: string;
    title: string;
    description: string;
    rationale: string;
    alternatives?: string[];
    createdAt: string;
    tags: string[];
}

/** Agent type classification */
export enum AgentType {
    ORCHESTRATOR = "orchestrator",
    WORKER = "worker",
    REVIEWER = "reviewer",
    PLANNER = "planner",
    RESEARCHER = "researcher",
    ANALYZER = "analyzer",
    COORDINATOR = "coordinator",
}

/** Status of an agent task */
export enum AgentTaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    BLOCKED = "blocked",
}

/** An agent task to be executed */
export interface AgentTask {
    id: string;
    type: AgentType;
    description: string;
    status: AgentTaskStatus;
    dependencies: string[];
    result?: unknown;
    error?: string;
    metadata?: Record<string, unknown>;
}

/** Result of executing an agent task */
export interface AgentTaskResult {
    taskId: string;
    success: boolean;
    data?: unknown;
    error?: string;
    duration?: number;
}

/** Memory entry for agent context */
export interface MemoryEntry {
    id: string;
    agentId: string;
    type: string;
    content: string;
    timestamp: string;
    relevance: number;
    metadata?: Record<string, unknown>;
}

/** Context envelope for agent communication */
export interface ContextEnvelope {
    id: string;
    agentId: string;
    type: string;
    content: unknown;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

/** Interface for memory management (breaks agents ↔ context) */
export interface IMemoryManager {
    store(
        agentId: string,
        type: string,
        content: string,
        relevance?: number,
    ): Promise<string>;
    retrieve(
        agentId: string,
        query: string,
        limit?: number,
    ): Promise<MemoryEntry[]>;
    delete(entryId: string): Promise<boolean>;
}
