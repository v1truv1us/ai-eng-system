/**
 * CLI Flag Types for ai-eng ralph
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface RalphFlags {
    /** Workflow specification file path */
    workflow?: string;
    /** Maximum iterations */
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
}
