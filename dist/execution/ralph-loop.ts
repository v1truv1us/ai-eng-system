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

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, parse } from "node:path";
import { OpenCodeClient, type Session } from "../backends/opencode/client";
import type { RalphFlags } from "../cli/flags";
import { UI } from "../cli/ui";
import type { AiEngConfig, GateCommandConfig } from "../config/schema";
import { PromptOptimizer } from "../prompt-optimization/optimizer";
import type { DiscordWebhookClient } from "../util/discord-webhook";
import { createDiscordWebhookFromEnv } from "../util/discord-webhook";
import { Log } from "../util/log";
import { FlowStore, type FlowStoreOptions } from "./flow-store";
import type {
    CycleState,
    GateResult,
    LoopConfig,
    ToolInvocation,
} from "./flow-types";
import {
    FLOW_SCHEMA_VERSION,
    Phase,
    RunStatus,
    StopReason,
} from "./flow-types";

const log = Log.create({ service: "ralph-loop" });

/** Default quality gates */
const DEFAULT_GATES = ["test", "lint", "acceptance"];

/** Default max cycles */
const DEFAULT_MAX_CYCLES = 50;

/** Default stuck threshold */
const DEFAULT_STUCK_THRESHOLD = 5;

/** Default checkpoint frequency */
const DEFAULT_CHECKPOINT_FREQUENCY = 1;

/** Default cycle retries */
const DEFAULT_CYCLE_RETRIES = 2;

/** Secrets patterns to redact in debug output */
const SECRET_PATTERNS = [
    /api[_-]?key/i,
    /token/i,
    /secret/i,
    /password/i,
    /credential/i,
    /webhook/i,
    /auth/i,
    /bearer/i,
    /private[_-]?key/i,
];

/**
 * Redact secrets from a string
 */
function redactSecrets(text: string): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result = text;
    for (const pattern of SECRET_PATTERNS) {
        result = result.replace(
            new RegExp(
                `${pattern.source}["']?\\s*[:=]\\s*["']?([^"'",\\s]+)`,
                "gi",
            ),
            `${pattern.source}="[REDACTED]"`,
        );
    }
    return result;
}

/**
 * Truncate long output for logging
 */
function truncateOutput(text: string, maxLength = 1000): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}\n... [truncated ${text.length - maxLength} chars]`;
}

/**
 * Ralph Loop Runner - orchestrates iteration loops with fresh sessions
 */
export class RalphLoopRunner {
    private config: LoopConfig;
    private flowStore: FlowStore;
    private flags: RalphFlags;
    private baseConfig: AiEngConfig;
    private optimizer: PromptOptimizer;
    private discordWebhook: DiscordWebhookClient | null;

    constructor(
        flags: RalphFlags,
        baseConfig: AiEngConfig,
        optimizer: PromptOptimizer,
    ) {
        this.flags = flags;
        this.baseConfig = baseConfig;
        this.optimizer = optimizer;

        // Build loop config from flags
        this.config = this.buildLoopConfig();
        const flowStoreOptions: FlowStoreOptions = {
            flowDir: this.config.flowDir,
            runId: this.config.runId,
        };
        this.flowStore = new FlowStore(flowStoreOptions);

        // Initialize Discord webhook from environment
        this.discordWebhook = createDiscordWebhookFromEnv();
    }

    /** Build loop config from flags */
    private buildLoopConfig(): LoopConfig {
        // Determine completion promise based on mode
        let completionPromise = this.flags.completionPromise ?? "";

        if (this.flags.ship) {
            // Ship mode: auto-exit when agent outputs SHIP
            completionPromise = "<promise>SHIP</promise>";
        } else if (this.flags.draft) {
            // Draft mode: run for max-cycles, stop for review (no auto-exit)
            completionPromise = "";
        } else if (!completionPromise) {
            // No flag specified and no completion promise: default to draft mode
            completionPromise = "";
        }

        // Generate run ID if not resuming
        let runId = this.flags.runId;
        if (!runId) {
            // Check for existing flow state
            const defaultRunId = this.generateRunId();
            const defaultFlowDir = this.getDefaultFlowDir(defaultRunId);
            const checkStore = new FlowStore({
                flowDir: this.flags.workingDir
                    ? join(this.flags.workingDir, ".ai-eng")
                    : ".ai-eng",
                runId: defaultRunId,
            });
            runId = defaultRunId;
        }

        return {
            runId,
            prompt: this.flags.workflow ?? "",
            completionPromise,
            maxCycles: this.flags.maxCycles ?? DEFAULT_MAX_CYCLES,
            stuckThreshold:
                this.flags.stuckThreshold ?? DEFAULT_STUCK_THRESHOLD,
            gates: this.flags.gates ?? DEFAULT_GATES,
            checkpointFrequency:
                this.flags.checkpointFrequency ?? DEFAULT_CHECKPOINT_FREQUENCY,
            flowDir: this.getDefaultFlowDir(runId),
            dryRun: this.flags.dryRun ?? false,
            cycleRetries:
                this.baseConfig.loop?.cycleRetries ?? DEFAULT_CYCLE_RETRIES,
            debugWork:
                this.flags.debugWork ?? this.baseConfig.debug?.work ?? false,
        };
    }

    /** Get default flow directory path */
    private getDefaultFlowDir(runId: string): string {
        const artifactsDir = this.baseConfig.runner.artifactsDir;
        if (this.flags.workingDir) {
            return join(this.flags.workingDir, artifactsDir);
        }
        return join(process.cwd(), artifactsDir);
    }

    /** Generate a unique run ID */
    private generateRunId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `run-${timestamp}-${random}`;
    }

    /** Generate a hash of output for stuck detection */
    private hashOutput(output: string): string {
        return createHash("sha256")
            .update(output)
            .digest("hex")
            .substring(0, 16);
    }

    /** Run the loop */
    async run(): Promise<void> {
        UI.header("Ralph Loop Runner");

        // Check for resume
        if (this.flags.resume) {
            await this.resume();
            return;
        }

        // Start fresh run
        await this.startFresh();
    }

    /** Start a fresh run */
    private async startFresh(): Promise<void> {
        log.info("Starting fresh Ralph loop", {
            runId: this.config.runId,
            prompt: this.config.prompt.substring(0, 100),
            completionPromise: this.config.completionPromise,
            maxCycles: this.config.maxCycles,
        });

        // Initialize flow store
        this.flowStore.initialize();

        // Create initial state
        const initialState = this.flowStore.createInitialState({
            prompt: this.config.prompt,
            completionPromise: this.config.completionPromise,
            maxCycles: this.config.maxCycles,
            stuckThreshold: this.config.stuckThreshold,
            gates: this.config.gates,
        });

        // Update status to running
        this.flowStore.updateStatus(RunStatus.RUNNING);

        // Run the loop
        await this.runLoop();
    }

    /** Resume from previous run */
    private async resume(): Promise<void> {
        log.info("Resuming Ralph loop", { runId: this.config.runId });

        const state = this.flowStore.load();
        if (!state) {
            throw new Error(
                `No flow state found for run ID: ${this.config.runId}. Cannot resume.`,
            );
        }

        if (state.status === RunStatus.COMPLETED) {
            UI.warn("This run has already completed.");
            UI.info(`Stop reason: ${state.stopReason}`);
            return;
        }

        if (state.status === RunStatus.FAILED) {
            UI.warn("This run previously failed.");
            UI.info(`Error: ${state.error}`);
        }

        // Resume the loop
        await this.runLoop();
    }

    /** Main loop execution */
    private async runLoop(): Promise<void> {
        const state = this.flowStore.load();
        if (!state) {
            throw new Error("No flow state found");
        }

        UI.info(`Run ID: ${this.config.runId}`);
        UI.info(`Flow directory: ${this.flowStore.basePath}`);
        UI.info(
            `Completion promise: ${this.config.completionPromise || "(none)"}`,
        );
        UI.info(`Max cycles: ${this.config.maxCycles}`);
        UI.info(`Cycle retries: ${this.config.cycleRetries}`);
        UI.info(`Stuck threshold: ${this.config.stuckThreshold}`);
        UI.info(
            `Debug work: ${this.config.debugWork ? "enabled" : "disabled"}`,
        );
        UI.println();

        // Check if we should skip optimization (already done on initial ingest)
        // For loop mode, we skip re-optimization each cycle

        // Run cycles
        for (
            let cycleNumber = state.currentCycle + 1;
            cycleNumber <= this.config.maxCycles;
            cycleNumber++
        ) {
            UI.header(`Cycle ${cycleNumber}/${this.config.maxCycles}`);

            // Notify Discord: cycle started
            const runStartTime = Date.now();
            this.discordWebhook?.notifyCycleStart(
                cycleNumber,
                this.config.maxCycles,
                this.config.prompt,
            );

            // Execute cycle with retry logic
            let attempt = 0;
            let result: {
                success: boolean;
                cycleState: CycleState;
                summary: string;
                stopReason?: StopReason;
            } | null = null;
            let lastError: string | null = null;

            while (attempt <= this.config.cycleRetries) {
                attempt++;
                const isRetry = attempt > 1;

                if (isRetry) {
                    UI.info(
                        `Retry attempt ${attempt}/${this.config.cycleRetries + 1}`,
                    );
                    log.info("Retrying cycle", {
                        cycleNumber,
                        attempt,
                        lastError,
                    });
                }

                // Create fresh OpenCode session for this cycle
                const client = await OpenCodeClient.create({
                    serverStartupTimeout: 10000,
                });

                try {
                    // Re-anchor context from disk (with retry failure injected if this is a retry)
                    const context = await this.buildReAnchoredContext(
                        cycleNumber,
                        isRetry ? (lastError ?? undefined) : undefined,
                    );

                    // Execute the cycle with fresh session
                    result = await this.executeCycle(
                        cycleNumber,
                        client,
                        context,
                    );

                    // Record the cycle
                    if (result.success) {
                        this.flowStore.recordSuccessfulCycle(
                            result.cycleState,
                            result.summary,
                        );

                        // Notify Discord: cycle completed
                        const durationMs = Date.now() - runStartTime;
                        this.discordWebhook?.notifyCycleComplete(
                            cycleNumber,
                            this.flowStore.load()?.completedCycles ??
                                cycleNumber,
                            result.summary,
                            durationMs,
                        );
                    } else {
                        this.flowStore.recordFailedCycle(result.cycleState);

                        // Notify Discord: cycle failed
                        this.discordWebhook?.notifyError(
                            cycleNumber,
                            result.cycleState.phases[
                                Object.keys(
                                    result.cycleState.phases,
                                ).pop() as keyof typeof result.cycleState.phases
                            ]?.phase ?? "unknown",
                            result.cycleState.error ?? "Unknown error",
                        );
                    }

                    // Break retry loop on success or non-retryable failure
                    if (result.success) {
                        break;
                    }

                    // Determine if we should retry this failure
                    const shouldRetry = this.shouldRetryFailure(result);
                    if (!shouldRetry) {
                        break;
                    }

                    lastError = result.summary;
                } catch (error) {
                    const errorMsg =
                        error instanceof Error ? error.message : String(error);
                    lastError = errorMsg;

                    // Check if we should retry this error
                    const shouldRetry = this.shouldRetryOnError(error);
                    if (shouldRetry && attempt <= this.config.cycleRetries) {
                        log.warn("Cycle error, will retry", {
                            cycleNumber,
                            attempt,
                            error: errorMsg,
                        });
                    } else {
                        // Non-retryable or max retries exceeded
                        break;
                    }
                } finally {
                    // Clean up the session for this cycle
                    await client.cleanup();
                }
            }

            // If result is null after all retries, we had a catastrophic failure
            if (!result) {
                this.discordWebhook?.notifyStuckOrAborted(
                    cycleNumber,
                    "FAILED_ALL_RETRIES",
                );
                await this.handleStop(
                    StopReason.ERROR,
                    `Cycle ${cycleNumber} failed after ${this.config.cycleRetries + 1} attempts: ${lastError ?? "unknown error"}`,
                );
                return;
            }

            // Check stop conditions
            if (result.stopReason) {
                // Notify Discord: run stopped
                await this.handleStop(result.stopReason, result.summary);
                return;
            }

            // Check if stuck
            const currentState = this.flowStore.load();
            if (
                currentState &&
                currentState.stuckCount >= this.config.stuckThreshold
            ) {
                // Notify Discord: stuck
                this.discordWebhook?.notifyStuckOrAborted(cycleNumber, "STUCK");
                await this.handleStop(
                    StopReason.STUCK,
                    `No progress for ${this.config.stuckThreshold} consecutive cycles`,
                );
                return;
            }

            // Save checkpoint if needed
            if (cycleNumber % this.config.checkpointFrequency === 0) {
                this.flowStore.saveCheckpoint(
                    this.flowStore.load()!,
                    result.cycleState.phases,
                );
            }

            UI.println();
        }

        // Max cycles reached - notify Discord
        this.discordWebhook?.notifyRunComplete(
            state.completedCycles,
            Date.now() - new Date(state.createdAt).getTime(),
            `Completed ${state.completedCycles} cycles (max ${this.config.maxCycles})`,
        );
        await this.handleStop(StopReason.MAX_CYCLES, "Maximum cycles reached");
    }

    /** Determine if a failure should trigger a retry */
    private shouldRetryFailure(result: {
        success: boolean;
        cycleState: CycleState;
        summary: string;
    }): boolean {
        // Check for gate failures
        const failedGates = result.cycleState.gateResults.filter(
            (g) => !g.passed,
        );
        if (failedGates.length > 0) {
            return true;
        }

        // Check for empty work response (our acceptance rule)
        const workPhase = result.cycleState.phases[Phase.WORK];
        if (workPhase && !workPhase.response.trim()) {
            return true;
        }

        return false;
    }

    /** Determine if an error should trigger a retry */
    private shouldRetryOnError(error: unknown): boolean {
        if (error instanceof Error) {
            // Retry on timeout
            if (error.message.includes("timeout")) {
                return true;
            }
            // Retry on stream errors
            if (error.message.includes("stream")) {
                return true;
            }
            // Retry on OpenCode connection errors
            if (error.message.includes("OpenCode")) {
                return true;
            }
        }
        return false;
    }

    /** Build re-anchored context for a cycle */
    private async buildReAnchoredContext(
        cycleNumber: number,
        retryFailure?: string,
    ): Promise<string> {
        const contextParts: string[] = [];

        // Always start with the original prompt
        contextParts.push(`# Original Task\n\n${this.config.prompt}\n`);

        // Add retry failure info if this is a retry
        if (retryFailure) {
            contextParts.push(
                `# Previous Attempt Failed\n\nThe previous attempt had an issue:\n${retryFailure}\n\nPlease analyze what went wrong and try a different approach.\n`,
            );
        }

        // Add previous cycle summary if available
        const previousCycle = this.flowStore.getIteration(cycleNumber - 1);
        if (previousCycle) {
            contextParts.push(
                `# Previous Cycle (${cycleNumber - 1}) Summary\n\n`,
            );
            contextParts.push(previousCycle.error ? "FAILED\n" : "COMPLETED\n");

            if (previousCycle.error) {
                contextParts.push(`Error: ${previousCycle.error}\n`);
            }

            // Add gate results
            if (previousCycle.gateResults.length > 0) {
                contextParts.push("\n## Gate Results\n\n");
                for (const gate of previousCycle.gateResults) {
                    const status = gate.passed ? "✅" : "❌";
                    contextParts.push(
                        `- ${status} ${gate.gate}: ${gate.message}\n`,
                    );
                }
            }

            // Add tool usage summary from previous cycle
            const allTools = this.collectAllTools(previousCycle);
            if (allTools.length > 0) {
                contextParts.push("\n## Tool Usage in Previous Cycle\n\n");
                for (const tool of allTools.slice(0, 10)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const statusIcon = tool.status === "ok" ? "✅" : "❌";
                    contextParts.push(
                        `${statusIcon} ${tool.name}: ${tool.status}\n`,
                    );
                }
                if (allTools.length > 10) {
                    contextParts.push(
                        `... and ${allTools.length - 10} more tools\n`,
                    );
                }
            }
        }

        // Add last checkpoint summary
        const state = this.flowStore.load();
        if (state?.lastCheckpoint) {
            contextParts.push(
                `\n# Last Checkpoint\n\nCycle ${state.lastCheckpoint.cycleNumber}: ${state.lastCheckpoint.summary}\n`,
            );
        }

        // Auto-load relevant specs from specs/ directory
        const specsContext = await this.loadRelevantSpecs();
        if (specsContext) {
            contextParts.push(specsContext);
        }

        // Add git status if available
        try {
            const gitStatus = await this.getGitStatus();
            if (gitStatus) {
                contextParts.push(`\n# Git Status\n\n${gitStatus}\n`);
            }
        } catch {
            // Git status not available, skip
        }

        // Add completion criteria reminder
        contextParts.push(
            `\n# Completion Criteria\n\nLoop exits when you output exactly: ${this.config.completionPromise || "(none - will run all cycles)"}\n`,
        );

        return contextParts.join("\n");
    }

    /** Collect all tool invocations from a cycle state */
    private collectAllTools(cycle: CycleState): ToolInvocation[] {
        const tools: ToolInvocation[] = [];
        for (const phase of Object.values(cycle.phases)) {
            if (phase?.tools) {
                tools.push(...phase.tools);
            }
        }
        return tools;
    }

    /** Load relevant specs from specs/ directory matching the prompt */
    private async loadRelevantSpecs(): Promise<string | null> {
        const specsDir = join(process.cwd(), "specs");
        let specs: string[];
        try {
            specs = await readdir(specsDir);
        } catch {
            // No specs directory, skip
            return null;
        }

        const promptLower = this.config.prompt.toLowerCase();
        const promptTokens = new Set(
            promptLower.split(/\W+/).filter((t) => t.length > 2),
        );

        const matches: { dir: string; score: number; title?: string }[] = [];

        for (const specDir of specs) {
            // Skip special directories
            if (specDir.startsWith(".")) continue;

            const specPath = join(specsDir, specDir, "spec.md");
            try {
                const specContent = await readFile(specPath, "utf-8");
                const specContentLower = specContent.toLowerCase();

                // Extract title from spec
                const titleMatch = specContent.match(/^# (.+)$/m);
                const title = titleMatch?.[1];

                // Calculate simple token overlap score
                let score = 0;
                const specTokens = new Set(
                    specContentLower.split(/\W+/).filter((t) => t.length > 2),
                );

                for (const token of promptTokens) {
                    if (specTokens.has(token)) {
                        score++;
                    }
                }

                // Bonus for directory name match
                const dirLower = specDir.toLowerCase();
                if (
                    promptLower.includes(dirLower) ||
                    dirLower.includes("fleettools")
                ) {
                    score += 5;
                }

                if (score > 0) {
                    matches.push({ dir: specDir, score, title });
                }
            } catch {
                // No spec.md in this directory, skip
            }
        }

        // Sort by score and take top 2
        matches.sort((a, b) => b.score - a.score);
        const topMatches = matches.slice(0, 2);

        if (topMatches.length === 0) {
            return null;
        }

        const result = [`\n# Relevant Specifications\n`];

        for (const match of topMatches) {
            const specPath = join(specsDir, match.dir, "spec.md");
            try {
                const specContent = await readFile(specPath, "utf-8");

                // Include overview and acceptance criteria sections
                const overviewMatch = specContent.match(
                    /^(# .+?)(?:\n\n## Overview\n\n)([\s\S]*?)(?=\n\n## |\n\n### )/m,
                );
                const userStoriesMatch = specContent.match(
                    /^(## User Stories\n\n)([\s\S]*?)(?=\n\n## |\n\n### )/m,
                );

                result.push(`\n## ${match.title || match.dir}\n`);

                if (overviewMatch) {
                    result.push(overviewMatch[2].trim());
                    result.push("\n");
                }

                if (userStoriesMatch) {
                    // Include first 3 user stories
                    const stories = userStoriesMatch[2]
                        .split(/\n### /)
                        .slice(0, 3);
                    result.push("\n### Key User Stories\n");
                    for (const story of stories) {
                        if (story.trim()) {
                            result.push(`\n### ${story.trim()}\n`);
                        }
                    }
                }

                log.debug("Loaded spec for context", {
                    spec: match.dir,
                    score: match.score,
                });
            } catch {
                log.warn("Failed to read spec", { spec: match.dir });
            }
        }

        return result.join("\n");
    }

    /** Get git status for context */
    private async getGitStatus(): Promise<string | null> {
        try {
            const { execSync } = await import("node:child_process");
            const diff = execSync("git diff --stat", {
                encoding: "utf-8",
                cwd: process.cwd(),
            });
            const status = execSync("git status --short", {
                encoding: "utf-8",
                cwd: process.cwd(),
            });
            return `\`\`\`\n${diff}\n${status}\n\`\`\``;
        } catch {
            return null;
        }
    }

    /** Execute a single cycle with fresh session */
    private async executeCycle(
        cycleNumber: number,
        client: OpenCodeClient,
        context: string,
    ): Promise<{
        success: boolean;
        cycleState: CycleState;
        summary: string;
        stopReason?: StopReason;
    }> {
        const startTime = new Date().toISOString();
        const cycleState: CycleState = {
            cycleNumber,
            status: "running",
            startTime,
            phases: {},
            gateResults: [],
            completionPromiseObserved: false,
        };

        try {
            // Create session with context as initial prompt (will be combined with first message)
            const session = await client.createSession(context);

            // Execute workflow phases
            for (const phase of [
                Phase.RESEARCH,
                Phase.SPECIFY,
                Phase.PLAN,
                Phase.WORK,
                Phase.REVIEW,
            ]) {
                const phaseResult = await this.executePhase(
                    session,
                    phase,
                    cycleNumber,
                );

                if (phaseResult.error) {
                    cycleState.phases[phase] = {
                        phase,
                        prompt: phaseResult.prompt,
                        response: "",
                        summary: `Error: ${phaseResult.error}`,
                        timestamp: new Date().toISOString(),
                    };
                    throw new Error(
                        `${phase} phase failed: ${phaseResult.error}`,
                    );
                }

                cycleState.phases[phase] = {
                    phase,
                    prompt: phaseResult.prompt,
                    response: phaseResult.response,
                    summary: phaseResult.summary,
                    timestamp: new Date().toISOString(),
                    tools: phaseResult.tools,
                };

                // Check for completion promise during phase execution
                // Only check in ship mode (when completionPromise is set)
                if (
                    this.config.completionPromise &&
                    phaseResult.response.includes(this.config.completionPromise)
                ) {
                    cycleState.completionPromiseObserved = true;
                }

                UI.println(
                    `${UI.Style.TEXT_DIM}  → ${phase}: done${UI.Style.TEXT_NORMAL}`,
                );
            }

            // Run quality gates
            UI.println(
                `${UI.Style.TEXT_DIM}Running quality gates...${UI.Style.TEXT_NORMAL}`,
            );
            const gateResults = await this.runQualityGates(
                cycleNumber,
                cycleState,
            );
            cycleState.gateResults = gateResults;

            // Check if any required gate failed
            const requiredFailed = gateResults.find(
                (g) => !g.passed && this.config.gates.includes(g.gate),
            );

            let failedPhaseInfo = "";
            if (requiredFailed) {
                // Find which phase had the most recent failure
                const phasesWithGates = Object.entries(cycleState.phases);
                const lastPhase =
                    phasesWithGates[phasesWithGates.length - 1]?.[0] ??
                    "unknown";
                failedPhaseInfo = `${lastPhase} gate failed`;
            }

            cycleState.status = "completed";
            cycleState.endTime = new Date().toISOString();
            cycleState.durationMs = Date.now() - new Date(startTime).getTime();

            // Generate summary
            const summary = this.generateCycleSummary(cycleState);

            // Check stop conditions
            // Only check completion promise in ship mode (when completionPromise is set)
            if (
                this.config.completionPromise &&
                cycleState.completionPromiseObserved
            ) {
                return {
                    success: true,
                    cycleState,
                    summary,
                    stopReason: StopReason.COMPLETION_PROMISE,
                };
            }

            if (requiredFailed) {
                return {
                    success: false,
                    cycleState,
                    summary: `${failedPhaseInfo}: ${requiredFailed.message}`,
                    stopReason: StopReason.GATE_FAILURE,
                };
            }

            // Calculate output hash for stuck detection
            cycleState.outputHash = this.hashOutput(
                Object.values(cycleState.phases)
                    .map((p) => p?.response ?? "")
                    .join("|"),
            );

            return { success: true, cycleState, summary };
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);

            cycleState.status = "failed";
            cycleState.endTime = new Date().toISOString();
            cycleState.durationMs = Date.now() - new Date(startTime).getTime();
            cycleState.error = errorMsg;

            return {
                success: false,
                cycleState,
                summary: `Cycle failed: ${errorMsg}`,
                stopReason: StopReason.ERROR,
            };
        }
    }

    /** Execute a single phase */
    private async executePhase(
        session: Session,
        phase: Phase,
        cycleNumber: number,
    ): Promise<{
        prompt: string;
        response: string;
        summary: string;
        tools: ToolInvocation[];
        error?: string;
    }> {
        const phasePrompts: Record<Phase, string> = {
            [Phase.RESEARCH]: `## Phase 1: Research

Research the codebase to understand the current state. Focus on:
- File structure and key modules
- Existing patterns and conventions
- Dependencies and configurations
- Any relevant documentation

Provide a concise summary of your findings.`,

            [Phase.SPECIFY]: `## Phase 2: Specify

Based on the research, create a detailed specification for the task:
- Requirements and acceptance criteria
- Technical approach
- Potential challenges and mitigation strategies
- Dependencies on existing code

Output a structured specification.`,

            [Phase.PLAN]: `## Phase 3: Plan

Create an implementation plan:
- Step-by-step tasks
- Files to modify/create
- Order of operations
- Testing strategy

Output a detailed plan.`,

            [Phase.WORK]: `## Phase 4: Work

Execute the implementation plan. Make concrete changes to the codebase.

IMPORTANT: You MUST:
1. Use tools (Read, Write, Edit, Bash) to make actual file changes
2. Report each file you modify as you go (e.g., "Creating file X...", "Modifying Y...")
3. Run actual tests and report results
4. Ensure the final summary lists:
   - All files created/modified (with paths) OR explicitly "NO CHANGES: <reason>" if no files needed
   - All test results (pass/fail)
   - Any errors encountered and how they were resolved

If no changes are needed, explicitly state "NO CHANGES: <reason>" and why.

Provide a comprehensive summary of concrete work completed.`,

            [Phase.REVIEW]: `## Phase 5: Review

Review the completed work:
- Verify all acceptance criteria are met
- Check code quality and consistency
- Ensure tests pass
- Identify any remaining issues

Output: <promise>SHIP</promise> if all criteria are met, or list remaining issues.`,
        };

        const prompt = phasePrompts[phase];

        // Use streaming for real-time feedback
        const streamingResponse = await session.sendMessageStream(prompt);

        let fullResponse = "";
        const tools: ToolInvocation[] = [];

        UI.println(`${UI.Style.TEXT_DIM}  [${phase}]${UI.Style.TEXT_NORMAL}`);

        const reader = streamingResponse.stream.getReader();
        const decoder = new TextDecoder();

        // Runner-side watchdog: prevent indefinite hangs
        const phaseTimeoutMs =
            (this.config.phaseTimeoutMs ??
                (this.config.promptTimeout ?? 300000) * 5) ||
            900000;
        let phaseTimedOut = false;

        const watchdogTimer = setTimeout(() => {
            phaseTimedOut = true;
            log.warn("Phase watchdog triggered", {
                cycleNumber,
                phase,
                timeoutMs: phaseTimeoutMs,
            });
            reader.cancel(`Phase timeout after ${phaseTimeoutMs}ms`);
        }, phaseTimeoutMs);

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (phaseTimedOut) {
                    throw new Error(
                        `Phase ${phase} timed out after ${phaseTimeoutMs}ms (watchdog)`,
                    );
                }

                if (done) break;

                if (value) {
                    const text = decoder.decode(value, { stream: true });
                    fullResponse += text;
                    UI.print(text);
                }
            }
        } catch (error) {
            if (
                phaseTimedOut ||
                (error instanceof Error && error.message.includes("timeout"))
            ) {
                this.discordWebhook?.notifyTimeout(
                    cycleNumber,
                    phase,
                    phaseTimeoutMs,
                );
                throw new Error(
                    `Phase ${phase} timed out after ${phaseTimeoutMs}ms - OpenCode stream did not complete`,
                );
            }
            throw error;
        } finally {
            clearTimeout(watchdogTimer);
            reader.releaseLock();
        }

        await streamingResponse.complete;

        // Collect tool invocations from session if available
        // Note: This is a placeholder - the actual tool capture would come from
        // session events in a more complete implementation
        const sessionTools = (
            session as { _toolInvocations?: ToolInvocation[] }
        )._toolInvocations;
        if (sessionTools && sessionTools.length > 0) {
            tools.push(...sessionTools);

            // Debug output for tools
            if (this.config.debugWork) {
                for (const tool of sessionTools) {
                    const redactedInput = tool.input
                        ? redactSecrets(JSON.stringify(tool.input))
                        : undefined;
                    const redactedOutput = tool.output
                        ? truncateOutput(redactSecrets(tool.output))
                        : undefined;

                    UI.println(
                        `${UI.Style.TEXT_DIM}  [TOOL] ${tool.name}: ${tool.status}${UI.Style.TEXT_NORMAL}`,
                    );
                    log.debug("Tool invocation", {
                        phase,
                        tool: tool.name,
                        status: tool.status,
                        input: redactedInput,
                        output: redactedOutput,
                    });
                }
            }
        }

        // Generate summary from response
        const summary = this.generatePhaseSummary(fullResponse);

        // Notify Discord: phase completed
        this.discordWebhook?.notifyPhaseComplete(cycleNumber, phase, summary);

        return {
            prompt,
            response: fullResponse,
            summary,
            tools,
        };
    }

    /** Generate summary for a phase */
    private generatePhaseSummary(response: string): string {
        // Take first 200 characters as summary
        const trimmed = response.trim();
        if (trimmed.length <= 200) {
            return trimmed;
        }
        return `${trimmed.substring(0, 200)}...`;
    }

    /** Generate cycle summary */
    private generateCycleSummary(cycle: CycleState): string {
        const parts: string[] = [];

        for (const [phase, output] of Object.entries(cycle.phases)) {
            if (output) {
                parts.push(`${phase}: ${output.summary}`);
            }
        }

        return parts.join(" | ");
    }

    /** Run quality gates */
    private async runQualityGates(
        cycleNumber: number,
        cycle: CycleState,
    ): Promise<GateResult[]> {
        const results: GateResult[] = [];
        const now = new Date().toISOString();

        for (const gate of this.config.gates) {
            const result = await this.runGate(gate, cycle);
            results.push({
                gate,
                passed: result.passed,
                message: result.message,
                details: result.details,
                timestamp: now,
            });

            // Save gate results
            this.flowStore.saveGateResults(cycleNumber, results);
        }

        return results;
    }

    /** Run a single quality gate */
    private async runGate(
        gate: string,
        cycle: CycleState,
    ): Promise<{
        passed: boolean;
        message: string;
        details?: Record<string, unknown>;
    }> {
        const gateConfig = this.getGateConfig(gate);

        switch (gate.toLowerCase()) {
            case "test":
            case "tests": {
                const result = await this.runGateCommand(
                    "test",
                    gateConfig.command,
                );
                return {
                    passed: result.passed,
                    message: result.passed
                        ? "All tests passed"
                        : "Some tests failed",
                    details: result.details,
                };
            }
            case "lint": {
                const result = await this.runGateCommand(
                    "lint",
                    gateConfig.command,
                );
                return {
                    passed: result.passed,
                    message: result.passed
                        ? "Linting passed"
                        : "Linting issues found",
                    details: result.details,
                };
            }
            case "acceptance": {
                const passed = await this.checkAcceptance(cycle);
                return {
                    passed,
                    message: passed
                        ? "Acceptance criteria met"
                        : "Acceptance criteria not fully met",
                };
            }
            default:
                return {
                    passed: false,
                    message: `Unknown gate: ${gate}`,
                };
        }
    }

    /** Get gate configuration from baseConfig */
    private getGateConfig(gate: string): GateCommandConfig {
        // Normalize gate names: canonical is "test", accept "tests" for backward compat
        const normalizedGate =
            gate.toLowerCase() === "tests" ? "test" : gate.toLowerCase();
        const gateKey = normalizedGate as keyof typeof this.baseConfig.gates;
        const configGate = this.baseConfig.gates[gateKey];
        if (
            configGate &&
            typeof configGate === "object" &&
            "command" in configGate
        ) {
            return configGate as GateCommandConfig;
        }
        // Fallback for legacy string format
        return { command: String(configGate ?? "") };
    }

    /** Run a gate command and capture results */
    private async runGateCommand(
        gateName: string,
        command: string,
    ): Promise<{
        passed: boolean;
        details: {
            command: string;
            exitCode: number | null;
            stdout: string;
            stderr: string;
            durationMs: number;
        };
    }> {
        const startTime = Date.now();
        let exitCode: number | null = null;
        let stdout = "";
        let stderr = "";

        UI.info(`  Running ${gateName}: ${command}`);

        try {
            // Run the command
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = execSync(command, {
                encoding: "utf-8",
                cwd: this.flags.workingDir ?? process.cwd(),
                timeout: 120000, // 2 minute timeout for gates
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            });
            stdout = result;
            exitCode = 0;
        } catch (error) {
            if (error instanceof Error && "status" in error) {
                exitCode = (error as { status: number }).status ?? 1;
                stderr = error instanceof Error ? error.message : String(error);
                // Capture stdout from failed command if available
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ("stdout" in error && error.stdout) {
                    stdout = String(error.stdout);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ("stderr" in error && error.stderr) {
                    stderr = String(error.stderr);
                }
            } else {
                stderr = error instanceof Error ? error.message : String(error);
            }
        }

        const durationMs = Date.now() - startTime;

        const passed = exitCode === 0;

        log.debug("Gate command result", {
            gate: gateName,
            command,
            exitCode,
            durationMs,
            stdoutLength: stdout.length,
            stderrLength: stderr.length,
        });

        return {
            passed,
            details: {
                command,
                exitCode,
                stdout: truncateOutput(stdout, 2000),
                stderr: truncateOutput(stderr, 1000),
                durationMs,
            },
        };
    }

    /** Check acceptance criteria */
    private async checkAcceptance(cycle: CycleState): Promise<boolean> {
        log.debug("Checking acceptance criteria", {
            cycleNumber: cycle.cycleNumber,
        });

        // Get the work phase output
        const workPhase = cycle.phases[Phase.WORK];
        if (!workPhase) {
            log.warn("No work phase found in cycle");
            return false;
        }

        const workResponse = workPhase.response.trim();

        // Rule 1: work.response must be non-empty
        if (!workResponse) {
            log.debug("Acceptance failed: empty work response");
            return false;
        }

        // Rule 2: Check for progress signal
        // Progress signal = (NO CHANGES marker with reason) OR (at least one tool invoked in any phase)
        const hasNoChangesMarker = /NO\s*CHANGES?[:\s]/i.test(workResponse);
        const hasProgressSignal = this.hasProgressSignal(cycle);

        if (hasNoChangesMarker) {
            // Check if there's a reason provided
            const hasReason = /NO\s*CHANGES?[:\s]+[A-Z]/.test(workResponse);
            if (hasReason) {
                log.debug("Acceptance passed: NO CHANGES with reason");
                return true;
            }
        }

        if (hasProgressSignal) {
            log.debug("Acceptance passed: progress signal detected");
            return true;
        }

        // Check if response is just fluff (too short, no actionable content)
        if (workResponse.length < 20) {
            log.debug("Acceptance failed: response too short/fluffy");
            return false;
        }

        // Check for common "I will" patterns that indicate no action
        const willPattern =
            /\bI (will|need to|should|must|have to|am going to)\b/i;
        if (willPattern.test(workResponse)) {
            log.debug(
                "Acceptance failed: response contains 'I will' pattern (no action taken)",
            );
            return false;
        }

        // If we got here and none of the above, it might still be valid if it mentions changes
        const mentionsChanges =
            /\b(change|modify|create|update|delete|add|fix|implement|refactor|write|run|test)\b/i.test(
                workResponse,
            );
        if (mentionsChanges) {
            log.debug(
                "Acceptance passed: response mentions actionable changes",
            );
            return true;
        }

        log.debug("Acceptance failed: no valid progress signal");
        return false;
    }

    /** Check if cycle has progress signal (tools or gate commands executed) */
    private hasProgressSignal(cycle: CycleState): boolean {
        // Check for any tool invocations in any phase
        const allTools = this.collectAllTools(cycle);
        if (allTools.length > 0) {
            return true;
        }

        // Check if gates actually ran (non-empty details indicate execution)
        for (const gateResult of cycle.gateResults) {
            if (
                gateResult.details &&
                "command" in gateResult.details &&
                gateResult.details.command
            ) {
                return true;
            }
        }

        return false;
    }

    /** Handle loop stop */
    private async handleStop(
        reason: StopReason,
        summary: string,
    ): Promise<void> {
        const state = this.flowStore.load();
        if (state) {
            let runStatus: RunStatus;
            switch (reason) {
                case StopReason.COMPLETION_PROMISE:
                    runStatus = RunStatus.COMPLETED;
                    break;
                case StopReason.STUCK:
                    runStatus = RunStatus.STUCK;
                    // Notify Discord: stuck
                    this.discordWebhook?.notifyStuckOrAborted(
                        state.currentCycle,
                        "STUCK",
                    );
                    break;
                case StopReason.USER_ABORT:
                    runStatus = RunStatus.ABORTED;
                    // Notify Discord: aborted
                    this.discordWebhook?.notifyStuckOrAborted(
                        state.currentCycle,
                        "ABORTED",
                    );
                    break;
                case StopReason.ERROR:
                    runStatus = RunStatus.FAILED;
                    break;
                default:
                    runStatus = RunStatus.FAILED;
            }
            this.flowStore.updateStatus(runStatus, reason);
        }

        UI.header("Loop Complete");
        UI.info(`Stop reason: ${reason}`);
        UI.info(`Summary: ${summary}`);

        log.info("Ralph loop stopped", { reason, summary });
    }
}

/** Create Ralph Loop Runner from flags */
export async function createRalphLoopRunner(
    flags: RalphFlags,
    baseConfig: AiEngConfig,
): Promise<RalphLoopRunner> {
    // Create optimizer for initial prompt processing
    const optimizer = new PromptOptimizer({
        autoApprove: flags.ci ?? false,
        verbosity: flags.verbose ? "verbose" : "normal",
    });

    return new RalphLoopRunner(flags, baseConfig, optimizer);
}
