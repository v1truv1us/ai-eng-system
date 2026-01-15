/**
 * CLI execution mode for ai-eng ralph
 *
 * Non-TUI execution with interactive prompts using @clack/prompts
 *
 * Supports two modes:
 * - Loop mode (default): Iterates with fresh OpenCode sessions per cycle
 * - Single-shot mode (--no-loop): Single execution with prompt optimization
 */
import { select, isCancel, outro, spinner } from "@clack/prompts";
import type { AiEngConfig } from "../config/schema.js";
import type { RalphFlags } from "./flags.js";
import { PromptOptimizer } from "../prompt-optimization/optimizer.js";
import {
    OpenCodeClient,
    type MessageResponse,
} from "../backends/opencode/client.js";
import {
    createRalphLoopRunner,
    RalphLoopRunner,
} from "../execution/ralph-loop.js";
import { UI } from "./ui.js";
import { Log } from "../util/log.js";

const log = Log.create({ service: "run-cli" });

/**
 * Cleanup handler to ensure OpenCode server is properly shut down
 */
let activeClient: OpenCodeClient | null = null;
let cleanupHandlersRegistered = false;

async function setupCleanupHandlers(): Promise<void> {
    if (cleanupHandlersRegistered) return;
    cleanupHandlersRegistered = true;
    const cleanupFn = async () => {
        if (activeClient) {
            try {
                log.info("Cleanup signal received, closing OpenCode server...");
                await activeClient.cleanup();
                log.info("OpenCode server closed successfully");
            } catch (error) {
                const errorMsg =
                    error instanceof Error ? error.message : String(error);
                log.error("Error during cleanup", { error: errorMsg });
            }
            activeClient = null;
        }
        process.exit(0);
    };

    // Handle various exit signals
    process.on("SIGINT", cleanupFn);
    process.on("SIGTERM", cleanupFn);
    process.on("SIGHUP", cleanupFn);

    // Handle uncaught errors
    process.on("uncaughtException", async (error) => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error("Uncaught exception", {
            error: errorMsg,
            stack: error instanceof Error ? error.stack : undefined,
        });
        await cleanupFn();
    });

    process.on("unhandledRejection", async (reason) => {
        const errorMsg =
            reason instanceof Error ? reason.message : String(reason);
        log.error("Unhandled rejection", {
            error: errorMsg,
            stack: reason instanceof Error ? reason.stack : undefined,
        });
        await cleanupFn();
    });
}

export async function runCli(
    config: AiEngConfig,
    flags: RalphFlags,
): Promise<void> {
    // Setup cleanup handlers
    await setupCleanupHandlers();

    log.info("Starting CLI execution", { workflow: flags.workflow });

    const prompt = flags.workflow;
    if (!prompt) {
        UI.error("No prompt or workflow provided");
        process.exit(1);
    }

    // Initialize optimizer
    const optimizer = new PromptOptimizer({
        autoApprove: flags.ci ?? false,
        verbosity: flags.verbose ? "verbose" : "normal",
    });

    // Create optimization session
    UI.header("Prompt Optimization");
    const session = optimizer.createSession(prompt);
    log.debug("Created optimization session", { steps: session.steps.length });

    // Review steps interactively (unless CI mode)
    if (!flags.ci) {
        for (const step of session.steps) {
            const action = await select({
                message: `Apply "${step.name}"?\n  ${step.description}`,
                options: [
                    {
                        value: "approve",
                        label: "Approve",
                        hint: "Apply this optimization",
                    },
                    {
                        value: "reject",
                        label: "Reject",
                        hint: "Skip this optimization",
                    },
                    {
                        value: "skip-all",
                        label: "Skip all",
                        hint: "Use original prompt",
                    },
                ],
            });

            if (isCancel(action)) {
                log.info("User cancelled");
                process.exit(0);
            }

            if (action === "skip-all") {
                optimizer.skipOptimization(session);
                break;
            }
            if (action === "approve") {
                optimizer.approveStep(session, step.id);
            } else {
                optimizer.rejectStep(session, step.id);
            }
        }
    }

    // Route to loop mode or single-shot mode
    if (flags.loop !== false) {
        // Loop mode (default)
        await runLoopMode(config, flags, session.finalPrompt);
    } else {
        // Single-shot mode (--no-loop)
        await runSingleShotMode(config, flags, session.finalPrompt);
    }
}

/**
 * Run in Ralph loop mode (default) - iterates with fresh sessions per cycle
 */
async function runLoopMode(
    config: AiEngConfig,
    flags: RalphFlags,
    _optimizedPrompt: string,
): Promise<void> {
    UI.header("Ralph Loop Mode");
    UI.info("Running with fresh OpenCode sessions per iteration");

    // Show mode info
    if (flags.ship) {
        UI.info(
            "Mode: SHIP (auto-exit when agent outputs '<promise>SHIP</promise>')",
        );
        UI.info("Completion promise: <promise>SHIP</promise>");
    } else if (flags.draft || (!flags.ship && !flags.completionPromise)) {
        UI.info("Mode: DRAFT (runs for max-cycles then stops for your review)");
        UI.info("Completion promise: none (will run all cycles)");
    } else {
        UI.info("Mode: Custom completion promise");
        UI.info(`Completion promise: ${flags.completionPromise}`);
    }

    UI.info(`Max cycles: ${flags.maxCycles ?? 50}`);
    UI.info(`Stuck threshold: ${flags.stuckThreshold ?? 5}`);
    UI.println();

    try {
        const runner = await createRalphLoopRunner(flags, config);
        await runner.run();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log.error("Loop execution failed", { error: message });
        UI.error(message);
        process.exit(1);
    }

    outro("Done!");
}

/**
 * Run in single-shot mode (--no-loop) - single execution
 */
async function runSingleShotMode(
    config: AiEngConfig,
    flags: RalphFlags,
    optimizedPrompt: string,
): Promise<void> {
    // Execute single-shot
    UI.header("Execution");
    const s = spinner();
    s.start("Connecting to OpenCode...");

    try {
        // Create OpenCode client - this will either spawn a new server or connect to existing one
        activeClient = await OpenCodeClient.create({
            existingServerUrl: process.env.OPENCODE_URL,
            serverStartupTimeout: 10000, // Allow 10 seconds for server to start
        });

        const openSession = await activeClient.createSession(optimizedPrompt);
        log.info("Created OpenCode session", { id: openSession.id });

        s.stop("Connected");

        // Send prompt and stream response
        UI.println();
        UI.println(
            `${UI.Style.TEXT_DIM}Executing task...${UI.Style.TEXT_NORMAL}`,
        );

        let response: MessageResponse;

        if (!flags.noStream) {
            // Streaming mode (default)
            const streamingResponse = await openSession.sendMessageStream(
                "Execute this task and provide a detailed result summary.",
            );

            UI.println();

            // Stream content to stderr in real-time
            const reader = streamingResponse.stream.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    if (value) {
                        const text = decoder.decode(value, { stream: true });
                        UI.print(text);
                    }
                }
            } finally {
                reader.releaseLock();
            }

            // Get complete response for cleanup
            response = await streamingResponse.complete;
        } else {
            // Buffered mode (when --no-stream flag is used)
            UI.println();
            UI.println(
                `${UI.Style.TEXT_DIM}Buffering response...${UI.Style.TEXT_NORMAL}`,
            );

            response = await openSession.sendMessage(
                "Execute this task and provide a detailed result summary.",
            );

            UI.println();
            UI.println(response.content);
        }

        UI.println();
        UI.success("Execution complete");

        // Cleanup resources
        if (activeClient) {
            await activeClient.cleanup();
            activeClient = null;
        }

        log.info("Execution complete");
    } catch (error) {
        s.stop("Connection failed");
        const message = error instanceof Error ? error.message : String(error);
        log.error("Execution failed", { error: message });
        UI.error(message);

        // Ensure cleanup on error
        if (activeClient) {
            try {
                await activeClient.cleanup();
            } catch (cleanupError) {
                const cleanupMsg =
                    cleanupError instanceof Error
                        ? cleanupError.message
                        : String(cleanupError);
                log.error("Error during error cleanup", { error: cleanupMsg });
            }
            activeClient = null;
        }

        process.exit(1);
    }

    outro("Done!");
}
