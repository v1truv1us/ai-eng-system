/**
 * Ralph Loop Runner - Bash-loop style iteration with fresh context per cycle
 *
 * Implements the original Ralph Wiggum vision:
 * - Fresh OpenCode session per iteration (no transcript carry-over)
 * - File I/O as state (.ai-eng/runs/<runId>/.flow)
 * - Deterministic re-anchoring from disk state each cycle
 * - Multi-phase workflow (research → specify → plan → work → review)
 * - Quality gates that block until passed
 */
import type { RalphFlags } from "../cli/flags";
import type { AiEngConfig } from "../config/schema";
import { PromptOptimizer } from "../prompt-optimization/optimizer";
/**
 * Ralph Loop Runner - orchestrates iteration loops with fresh sessions
 */
export declare class RalphLoopRunner {
    private config;
    private flowStore;
    private flags;
    private baseConfig;
    private optimizer;
    private discordWebhook;
    constructor(flags: RalphFlags, baseConfig: AiEngConfig, optimizer: PromptOptimizer);
    /** Build loop config from flags */
    private buildLoopConfig;
    /** Get default flow directory path */
    private getDefaultFlowDir;
    /** Generate a unique run ID */
    private generateRunId;
    /** Generate a hash of output for stuck detection */
    private hashOutput;
    /** Run the loop */
    run(): Promise<void>;
    /** Start a fresh run */
    private startFresh;
    /** Resume from previous run */
    private resume;
    /** Main loop execution */
    private runLoop;
    /** Determine if a failure should trigger a retry */
    private shouldRetryFailure;
    /** Determine if an error should trigger a retry */
    private shouldRetryOnError;
    /** Build re-anchored context for a cycle */
    private buildReAnchoredContext;
    /** Collect all tool invocations from a cycle state */
    private collectAllTools;
    /** Load relevant specs from specs/ directory matching the prompt */
    private loadRelevantSpecs;
    /** Get git status for context */
    private getGitStatus;
    /** Execute a single cycle with fresh session */
    private executeCycle;
    /** Execute a single phase */
    private executePhase;
    /** Generate summary for a phase */
    private generatePhaseSummary;
    /** Generate cycle summary */
    private generateCycleSummary;
    /** Run quality gates */
    private runQualityGates;
    /** Run a single quality gate */
    private runGate;
    /** Get gate configuration from baseConfig */
    private getGateConfig;
    /** Run a gate command and capture results */
    private runGateCommand;
    /** Check acceptance criteria */
    private checkAcceptance;
    /** Check if cycle has progress signal (tools or gate commands executed) */
    private hasProgressSignal;
    /** Handle loop stop */
    private handleStop;
}
/** Create Ralph Loop Runner from flags */
export declare function createRalphLoopRunner(flags: RalphFlags, baseConfig: AiEngConfig): Promise<RalphLoopRunner>;
