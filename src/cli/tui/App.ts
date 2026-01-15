/**
 * ai-eng ralph - Minimal TUI
 *
 * Simple terminal UI using OpenTUI core API directly.
 */

import {
    createCliRenderer,
    type CliRendererConfig,
    BoxRenderable,
    TextRenderable,
    TextAttributes,
    type RenderContext,
} from "@opentui/core";
import type { AiEngConfig } from "../../config/schema";
import type { RalphFlags } from "../../cli/flags";
import { PromptOptimizer } from "../../prompt-optimization/optimizer";
import type { OptimizationSession } from "../../prompt-optimization/types";
import { OpenCodeClient } from "../../backends/opencode/client";

/**
 * TUI State
 */
type View =
    | "welcome"
    | "input"
    | "optimizing"
    | "review"
    | "executing"
    | "results";

interface State {
    view: View;
    prompt: string;
    session: OptimizationSession | null;
    selectedStep: number;
    error: string | null;
    result: string | null;
    executingMessage: string;
    // OpenCode session management
    opencodeSessionId: string | null;
    connectionStatus: "disconnected" | "connecting" | "error" | "connected";
}

/**
 * Main TUI Application
 */
class TuiApp {
    private renderer: Awaited<ReturnType<typeof createCliRenderer>> | null =
        null;
    private state: State;
    private optimizer: PromptOptimizer;
    private config: AiEngConfig;
    private flags: RalphFlags;
    private opencodeClient: OpenCodeClient;

    constructor(config: AiEngConfig, flags: RalphFlags) {
        this.state = {
            view: "welcome",
            prompt: "",
            session: null,
            selectedStep: 0,
            error: null,
            result: null,
            executingMessage: "",
            opencodeSessionId: null,
            connectionStatus: "disconnected",
        };
        this.optimizer = new PromptOptimizer({
            autoApprove: flags.dryRun ?? false,
            verbosity: "normal",
        });
        this.config = config;
        this.flags = flags;
        this.opencodeClient = new OpenCodeClient({});
    }

    /**
     * Run TUI
     */
    async run(): Promise<void> {
        // Create renderer
        const config: CliRendererConfig = {
            exitOnCtrlC: true,
            useAlternateScreen: true,
        };

        this.renderer = await createCliRenderer(config);

        // Set up keyboard input handler AFTER renderer is created
        this.setupInput();

        // Initial render
        this.render();

        // Start render loop
        this.renderer.start();
    }

    /**
     * Setup keyboard input handler
     */
    private setupInput(): void {
        // Now that renderer exists, we can attach to keyboard handler
        if (!this.renderer) return;

        this.renderer.keyInput.on("keypress", (event) => {
            const key = event.name;
            this.handleKeyPress(key);
        });
    }

    /**
     * Handle keyboard input
     */
    private handleKeyPress(key: string): void {
        switch (this.state.view) {
            case "welcome":
                if (key === "enter") {
                    this.state.view = "input";
                    this.render();
                }
                if (key === "q" || key === "Q") {
                    this.cleanup();
                    process.exit(0);
                }
                break;

            case "input":
                if (key === "enter") {
                    const prompt = this.state.prompt.trim();
                    if (!prompt) {
                        this.state.error = "Please enter a prompt first";
                        this.render();
                        return;
                    }
                    this.startOptimization();
                } else if (key === "backspace") {
                    this.state.prompt = this.state.prompt.slice(0, -1);
                    this.render();
                } else if (key === "escape") {
                    this.state.view = "welcome";
                    this.render();
                } else if (key.length === 1) {
                    this.state.prompt += key;
                    this.render();
                } else if (key === "q" || key === "Q") {
                    this.cleanup();
                    process.exit(0);
                }
                break;

            case "optimizing":
                // No user interaction - just wait for optimization to complete
                break;

            case "review":
                if (key === "enter" || key === "a" || key === "A") {
                    this.approveStep();
                } else if (key === "r" || key === "R") {
                    this.rejectStep();
                } else if (key === "s" || key === "S") {
                    this.skipAll();
                } else if (key === "escape") {
                    this.state.selectedStep = 0;
                    this.state.view = "input";
                    this.render();
                } else if (key === "q" || key === "Q") {
                    this.cleanup();
                    process.exit(0);
                }
                break;

            case "executing":
                // This view transitions automatically - no user input needed
                break;

            case "results":
                if (key === "enter") {
                    this.reset();
                } else if (key === "q" || key === "Q") {
                    this.cleanup();
                    process.exit(0);
                }
                break;
        }
    }

    /**
     * Start prompt optimization
     */
    private async startOptimization(): Promise<void> {
        const prompt = this.state.prompt.trim();
        if (!prompt) {
            this.state.error = "Please enter a prompt first";
            this.render();
            return;
        }

        this.state.view = "optimizing";
        this.state.error = null;
        this.render();

        try {
            this.state.session = this.optimizer.createSession(prompt);
            this.state.view = "review";
            this.state.selectedStep = 0;
        } catch (err) {
            this.state.error =
                err instanceof Error ? err.message : "Optimization failed";
            this.state.view = "input";
        }
        this.render();
    }

    /**
     * Approve current step
     */
    private approveStep(): void {
        if (!this.state.session) return;
        const step = this.state.session.steps[this.state.selectedStep];
        if (step) {
            this.optimizer.approveStep(this.state.session, step.id);
        }
        this.nextStepOrExecute();
    }

    /**
     * Reject current step
     */
    private rejectStep(): void {
        if (!this.state.session) return;
        const step = this.state.session.steps[this.state.selectedStep];
        if (step) {
            this.optimizer.rejectStep(this.state.session, step.id);
        }
        this.nextStepOrExecute();
    }

    /**
     * Skip all remaining steps
     */
    private skipAll(): void {
        if (!this.state.session) return;
        this.optimizer.skipOptimization(this.state.session);
        this.execute();
    }

    /**
     * Move to next step or execute
     */
    private nextStepOrExecute(): void {
        if (!this.state.session) return;
        const next = this.state.selectedStep + 1;
        if (next < this.state.session.steps.length) {
            this.state.selectedStep = next;
        } else {
            this.execute();
        }
        this.render();
    }

    /**
     * Execute optimized prompt
     */
    private async execute(): Promise<void> {
        this.state.view = "executing";
        this.render();

        try {
            // Create OpenCode session
            const session = await this.opencodeClient.createSession(
                this.state.session?.finalPrompt || this.state.prompt,
            );
            this.state.opencodeSessionId = session.id;
            this.state.connectionStatus = "connected";

            // Send execution message
            const response = await session.sendMessage(
                "Execute this task and provide a detailed result summary.",
            );

            // Update state
            this.state.result = response.content;
            this.state.executingMessage = "";
            this.state.view = "results";
        } catch (err) {
            this.state.result = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
            this.state.connectionStatus = "error";
            this.state.view = "results";
        }

        this.render();
    }

    /**
     * Reset to initial state
     */
    private reset(): void {
        this.state = {
            view: "welcome",
            prompt: "",
            session: null,
            selectedStep: 0,
            error: null,
            result: null,
            executingMessage: "",
            opencodeSessionId: null,
            connectionStatus: "disconnected",
        };
        this.render();
    }

    /**
     * Cleanup resources on quit
     */
    private async cleanup(): Promise<void> {
        // Stop renderer
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }

        // Close OpenCode sessions
        if (this.state.opencodeSessionId) {
            try {
                await this.opencodeClient.cleanup();
            } catch (error) {
                console.warn("Error closing session:", error);
            }
            this.state.opencodeSessionId = null;
        }
    }

    /**
     * Render UI
     */
    private render(): void {
        if (!this.renderer) return;

        const ctx = this.renderer as unknown as RenderContext;
        const root = this.renderer.root;

        // Create main container
        const container = new BoxRenderable(ctx, {
            id: "main",
            flexDirection: "column",
            width: "100%",
            height: "100%",
        });

        // Header with bold
        const header = new TextRenderable(ctx, {
            id: "header",
            content: "ai-eng ralph - Iteration Loop Runner",
            fg: "#58a6ff",
            attributes: TextAttributes.BOLD,
        });
        container.add(header);

        const divider = new TextRenderable(ctx, {
            id: "divider",
            content: "──────────────────────────────────────────────────",
            fg: "#8b949e",
        });
        container.add(divider);

        // Render content based on view
        this.renderContent(ctx, container);

        // Footer
        const footerDivider = new TextRenderable(ctx, {
            id: "footer-divider",
            content: "──────────────────────────────────────────────────",
            fg: "#484f58",
        });
        container.add(footerDivider);

        const footer = new TextRenderable(ctx, {
            id: "footer",
            content: "Press [Q] to quit",
            fg: "#8b949e",
        });
        container.add(footer);

        // Mount
        root.add(container);
    }

    /**
     * Render content based on current view
     */
    private renderContent(ctx: RenderContext, container: BoxRenderable): void {
        switch (this.state.view) {
            case "welcome":
                this.renderWelcome(ctx, container);
                break;
            case "input":
                this.renderInput(ctx, container);
                break;
            case "optimizing":
                this.renderOptimizing(ctx, container);
                break;
            case "review":
                this.renderReview(ctx, container);
                break;
            case "executing":
                this.renderExecuting(ctx, container);
                break;
            case "results":
                this.renderResults(ctx, container);
                break;
        }
    }

    /**
     * Render welcome screen
     */
    private renderWelcome(ctx: RenderContext, container: BoxRenderable): void {
        const title = new TextRenderable(ctx, {
            id: "welcome-title",
            content: "Welcome to ai-eng ralph!",
            fg: "#cccccc",
            marginTop: 2,
        });
        container.add(title);

        const desc = new TextRenderable(ctx, {
            id: "welcome-desc",
            content: "An iteration loop runner for AI-assisted development.",
            fg: "#8b949e",
            marginTop: 1,
        });
        container.add(desc);

        const start = new TextRenderable(ctx, {
            id: "welcome-start",
            content: "Press [Enter] to get started",
            fg: "#cccccc",
            marginTop: 2,
        });
        container.add(start);
    }

    /**
     * Render input screen
     */
    private renderInput(ctx: RenderContext, container: BoxRenderable): void {
        const title = new TextRenderable(ctx, {
            id: "input-title",
            content: "What would you like to do?",
            fg: "#cccccc",
            attributes: TextAttributes.BOLD,
            marginTop: 2,
        });
        container.add(title);

        const subtitle = new TextRenderable(ctx, {
            id: "input-subtitle",
            content: "Enter your task or goal below:",
            fg: "#8b949e",
            marginTop: 1,
        });
        container.add(subtitle);

        const prompt = new TextRenderable(ctx, {
            id: "input-prompt",
            content: this.state.prompt || "(type your prompt here...)",
            fg: "#f0f0f0",
            marginTop: 2,
        });
        container.add(prompt);

        if (this.state.error) {
            const error = new TextRenderable(ctx, {
                id: "input-error",
                content: `Error: ${this.state.error}`,
                fg: "#ff6b6b",
                marginTop: 1,
            });
            container.add(error);
        }

        const help = new TextRenderable(ctx, {
            id: "input-help",
            content: "[Enter] optimize | [Escape] back | [Q] quit",
            fg: "#8b949e",
            marginTop: 2,
        });
        container.add(help);
    }

    /**
     * Render optimizing screen
     */
    private renderOptimizing(
        ctx: RenderContext,
        container: BoxRenderable,
    ): void {
        const title = new TextRenderable(ctx, {
            id: "optimizing-title",
            content: "Optimizing your prompt...",
            fg: "#cccccc",
            marginTop: 2,
        });
        container.add(title);

        const desc = new TextRenderable(ctx, {
            id: "optimizing-desc",
            content: "Applying research-backed techniques",
            fg: "#8b949e",
            marginTop: 1,
        });
        container.add(desc);
    }

    /**
     * Render review screen
     */
    private renderReview(ctx: RenderContext, container: BoxRenderable): void {
        const title = new TextRenderable(ctx, {
            id: "review-title",
            content: "Prompt Optimization",
            fg: "#cccccc",
            attributes: TextAttributes.BOLD,
            marginTop: 2,
        });
        container.add(title);

        const subtitle = new TextRenderable(ctx, {
            id: "review-subtitle",
            content: "Review and approve optimization steps:",
            fg: "#8b949e",
            marginTop: 1,
        });
        container.add(subtitle);

        if (this.state.session) {
            this.state.session.steps.forEach((step, index) => {
                const isSelected = index === this.state.selectedStep;
                const color = isSelected ? "#58a6ff" : "#8b949e";

                const stepText = new TextRenderable(ctx, {
                    id: `step-${index}`,
                    content: `${isSelected ? "> " : "  "}${step.name}`,
                    fg: color,
                    marginTop: 1,
                });
                container.add(stepText);

                const stepDesc = new TextRenderable(ctx, {
                    id: `step-desc-${index}`,
                    content: `    ${step.description}`,
                    fg: "#8b949e",
                });
                container.add(stepDesc);
            });
        }

        const help = new TextRenderable(ctx, {
            id: "review-help",
            content:
                "[A]pprove | [R]eject | [S]kip all | [Escape] back | [Q] quit",
            fg: "#8b949e",
            marginTop: 2,
        });
        container.add(help);
    }

    /**
     * Render executing screen
     */
    private renderExecuting(
        ctx: RenderContext,
        container: BoxRenderable,
    ): void {
        const title = new TextRenderable(ctx, {
            id: "executing-title",
            content: "Executing your task...",
            fg: "#cccccc",
            marginTop: 2,
        });
        container.add(title);

        const desc = new TextRenderable(ctx, {
            id: "executing-desc",
            content: "Running iteration with quality gates",
            fg: "#8b949e",
            marginTop: 1,
        });
        container.add(desc);

        // Show session status
        if (this.state.opencodeSessionId) {
            const sessionId = new TextRenderable(ctx, {
                id: "session-id",
                content: `Session: ${this.state.opencodeSessionId}`,
                fg: "#8b949e",
                marginTop: 1,
            });
            container.add(sessionId);
        }
    }

    /**
     * Render results screen
     */
    private renderResults(ctx: RenderContext, container: BoxRenderable): void {
        const title = new TextRenderable(ctx, {
            id: "results-title",
            content: "Execution Complete!",
            fg: "#3fb950",
            attributes: TextAttributes.BOLD,
            marginTop: 2,
        });
        container.add(title);

        const result = new TextRenderable(ctx, {
            id: "results-result",
            content: this.state.result || "",
            fg: "#cccccc",
            marginTop: 1,
        });
        container.add(result);

        const help = new TextRenderable(ctx, {
            id: "results-help",
            content: "Press [Enter] to start over | [Q] to quit",
            fg: "#8b949e",
            marginTop: 2,
        });
        container.add(help);
    }
}

/**
 * Launch TUI
 */
export async function launchTui(
    config: AiEngConfig,
    flags: RalphFlags,
): Promise<void> {
    const app = new TuiApp(config, flags);
    await app.run();
}

export default launchTui;
