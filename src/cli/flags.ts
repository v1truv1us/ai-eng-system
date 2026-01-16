/**
 * CLI Flag Types for ai-eng ralph
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

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

    // === Ralph Loop Mode Flags (default: enabled) ===
    /** Enable loop mode (default: true) */
    loop?: boolean;
    /** Disable loop mode (single-shot execution) */
    noLoop?: boolean;
    /** Completion promise token - loop exits when this token is observed */
    completionPromise?: string;
    /** Ship mode - use default completion promise "SHIP" (auto-terminate when agent says SHIP) */
    ship?: boolean;
    /** Draft mode - loop runs for max-cycles then stops, ready for your review */
    draft?: boolean;
    /** Maximum number of loop cycles (default: 50) */
    maxCycles?: number;
    /** Checkpoint frequency (save state every N cycles, default: 1) */
    checkpointFrequency?: number;
    /** Flow directory (defaults to .ai-eng/runs/<runId>/.flow) */
    flowDir?: string;
    /** Stuck detection threshold - abort after N cycles with no progress (default: 5) */
    stuckThreshold?: number;

    /** Debug mode: print every tool invocation input/output to console and logs */
    debugWork?: boolean;
}

export interface InstallFlags {
    scope?: "project" | "global" | "auto";
    dryRun?: boolean;
    yes?: boolean;
    verbose?: boolean;
    help?: boolean;
}

export interface InitFlags {
    interactive?: boolean;
    overwrite?: boolean;
    help?: boolean;
    verbose?: boolean;
}
