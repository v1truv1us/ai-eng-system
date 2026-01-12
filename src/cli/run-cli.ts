/**
 * CLI execution mode for ai-eng ralph
 *
 * Non-TUI execution with interactive prompts using @clack/prompts
 */
import { select, isCancel, outro, spinner } from "@clack/prompts";
import type { AiEngConfig } from "../config/schema.js";
import type { RalphFlags } from "./flags.js";
import { PromptOptimizer } from "../prompt-optimization/optimizer.js";
import { OpenCodeClient } from "../backends/opencode/client.js";
import { UI } from "./ui.js";
import { Log } from "../util/log.js";

const log = Log.create({ service: "run-cli" });

/**
 * Cleanup handler to ensure OpenCode server is properly shut down
 */
let activeClient: OpenCodeClient | null = null;

async function setupCleanupHandlers(): Promise<void> {
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
            } else if (action === "approve") {
                optimizer.approveStep(session, step.id);
            } else {
                optimizer.rejectStep(session, step.id);
            }
        }
    }

    // Execute
    UI.header("Execution");
    const s = spinner();
    s.start("Connecting to OpenCode...");

    try {
        // Create OpenCode client - this will either spawn a new server or connect to existing one
        activeClient = await OpenCodeClient.create({
            existingServerUrl: process.env.OPENCODE_URL,
            serverStartupTimeout: 10000, // Allow 10 seconds for server to start
        });

        const openSession = await activeClient.createSession(
            session.finalPrompt,
        );
        log.info("Created OpenCode session", { id: openSession.id });

        s.stop("Connected");

        // Send prompt and stream response
        UI.println();
        UI.println(
            UI.Style.TEXT_DIM + "Executing task..." + UI.Style.TEXT_NORMAL,
        );

        const response = await openSession.sendMessage(
            "Execute this task and provide a detailed result summary.",
        );

        UI.println();
        UI.success("Execution complete");
        UI.println();
        UI.println(response.content);

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
