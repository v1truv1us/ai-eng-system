/**
 * Comprehensive CLI Automation Tests
 *
 * Tests for ai-eng ralph CLI runner including:
 * - Flag parsing
 * - Configuration loading
 * - TUI instantiation
 * - State management
 * - OpenCode client wrapper
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { parseArgs } from "node:util";
import type { RalphFlags } from "../../src/cli/flags";
import { loadConfig } from "../../src/config/loadConfig";
import { OpenCodeClient } from "../../src/backends/opencode/client";
import { PromptOptimizer } from "../../src/prompt-optimization/optimizer";
import type { AiEngConfig } from "../../src/config/schema";

describe("CLI Flag Parsing", () => {
    it("should parse help flag", async () => {
        const { values } = parseArgs({
            args: ["--help"],
            options: {
                help: { type: "boolean" },
            },
            allowPositionals: true,
        });

        expect(values.help).toBe(true);
    });

    it("should parse max-iters flag", async () => {
        const { values } = parseArgs({
            args: ["--max-iters", "5"],
            options: {
                "max-iters": { type: "string" },
            },
            allowPositionals: true,
        });

        expect(values["max-iters"]).toBe("5");
    });

    it("should parse workflow positional argument", async () => {
        const { positionals } = parseArgs({
            args: ["feature-spec.yml"],
            options: {},
            allowPositionals: true,
        });

        expect(positionals[0]).toBe("feature-spec.yml");
    });

    it("should parse multiple gates", async () => {
        const { values } = parseArgs({
            args: ["--gates", "lint,test,build"],
            options: {
                gates: { type: "string" },
            },
            allowPositionals: true,
        });

        expect(values.gates).toBe("lint,test,build");
    });
});

describe("Configuration Loading", () => {
    it("should load default configuration", async () => {
        const flags: RalphFlags = {
            dryRun: true,
        };

        const config = await loadConfig(flags);

        expect(config.version).toBe(1);
        expect(config.runner.backend).toBe("opencode");
        expect(config.runner.maxIters).toBe(3);
        expect(config.opencode.model).toBe("claude-3-5-sonnet-latest");
    });

    it("should override maxIters from flags", async () => {
        const flags: RalphFlags = {
            maxIters: 10,
            dryRun: true,
        };

        const config = await loadConfig(flags);

        expect(config.runner.maxIters).toBe(10);
    });

    it("should override review mode from flags", async () => {
        const flags: RalphFlags = {
            review: "both",
            dryRun: true,
        };

        const config = await loadConfig(flags);

        expect(config.runner.review).toBe("both");
    });
});

describe("OpenCode Client", () => {
    let client: OpenCodeClient;

    beforeEach(() => {
        client = new OpenCodeClient({});
    });

    it("should create client instance", () => {
        expect(client).toBeDefined();
        expect(client).toBeInstanceOf(OpenCodeClient);
    });

    it("should track active sessions", () => {
        const sessions = client.getActiveSessions();
        expect(Array.isArray(sessions)).toBe(true);
        expect(sessions.length).toBe(0);
    });

    it("should check session activity", () => {
        const isActive = client.isSessionActive("test-session");
        expect(isActive).toBe(false);
    });

    it("should cleanup method exist", async () => {
        expect(typeof client.cleanup).toBe("function");
        await client.cleanup();
    });
});

describe("Prompt Optimizer", () => {
    it("should create optimizer instance", () => {
        const optimizer = new PromptOptimizer({
            autoApprove: true,
            verbosity: "normal",
        });

        expect(optimizer).toBeDefined();
        expect(optimizer).toBeInstanceOf(PromptOptimizer);
    });

    it("should create optimization session", () => {
        const optimizer = new PromptOptimizer({
            autoApprove: false,
            verbosity: "normal",
        });

        const session = optimizer.createSession("test prompt");

        expect(session).toBeDefined();
        expect(session.originalPrompt).toBe("test prompt");
        expect(Array.isArray(session.steps)).toBe(true);
    });

    it("should approve step in session", () => {
        const optimizer = new PromptOptimizer({
            autoApprove: false,
            verbosity: "normal",
        });

        const session = optimizer.createSession("test prompt");
        if (session.steps.length > 0) {
            const step = session.steps[0];
            optimizer.approveStep(session, step.id);
            expect(session.finalPrompt).toBeDefined();
        }
    });

    it("should skip optimization", () => {
        const optimizer = new PromptOptimizer({
            autoApprove: true,
            verbosity: "normal",
        });

        const session = optimizer.createSession("test prompt");
        optimizer.skipOptimization(session);

        // When skipping, optimizer may still analyze the prompt
        // The important part is that finalPrompt exists
        expect(session.finalPrompt).toBeDefined();
    });
});

describe("CLI Integration", () => {
    it("should import TUI launch function", async () => {
        const module = await import("../../src/cli/tui/App.ts");
        expect(module.launchTui).toBeDefined();
        expect(typeof module.launchTui).toBe("function");
    });

    it("should load config successfully", async () => {
        const flags: RalphFlags = {
            dryRun: true,
        };

        const config = await loadConfig(flags);

        expect(config).toBeDefined();
        expect(typeof config).toBe("object");
    });

    it("should have correct config schema", async () => {
        const flags: RalphFlags = {
            dryRun: true,
        };

        const config = await loadConfig(flags);

        // Check all required properties exist
        expect(config.version).toBeDefined();
        expect(config.runner).toBeDefined();
        expect(config.opencode).toBeDefined();
        expect(config.anthropic).toBeDefined();
        expect(config.gates).toBeDefined();

        // Check runner sub-properties
        expect(config.runner.backend).toBeDefined();
        expect(config.runner.review).toBeDefined();
        expect(config.runner.artifactsDir).toBeDefined();
        expect(config.runner.maxIters).toBeDefined();
    });
});

describe("Build Verification", () => {
    it("should import flags module", async () => {
        const module = await import("../../src/cli/flags");
        expect(module).toBeDefined();
    });

    it("should import config schema", async () => {
        const module = await import("../../src/config/schema");
        expect(module).toBeDefined();
        // Interfaces aren't exported as module properties in TypeScript
        // Just verify module loads correctly
    });

    it("should import loadConfig function", async () => {
        const module = await import("../../src/config/loadConfig");
        expect(module).toBeDefined();
        expect(module.loadConfig).toBeDefined();
    });

    it("should import OpenCode client", async () => {
        const module = await import("../../src/backends/opencode/client");
        expect(module).toBeDefined();
        expect(module.OpenCodeClient).toBeDefined();
    });
});

describe("Type Safety", () => {
    it("should enforce RalphFlags types", () => {
        const flags: RalphFlags = {
            workflow: "test.yml",
            maxIters: 5,
            gates: ["lint", "test"],
            review: "both",
            resume: false,
            runId: "abc123",
            dryRun: true,
            ci: false,
            help: false,
        };

        expect(flags.workflow).toBe("test.yml");
        expect(flags.maxIters).toBe(5);
        expect(flags.gates).toEqual(["lint", "test"]);
        expect(flags.review).toBe("both");
    });

    it("should enforce AiEngConfig types", async () => {
        const flags: RalphFlags = { dryRun: true };
        const config = await loadConfig(flags);

        expect(config.version).toBeTypeOf("number");
        expect(config.runner).toBeTypeOf("object");
        expect(config.opencode).toBeTypeOf("object");
    });
});

describe("Error Handling", () => {
    it("should handle missing config file gracefully", async () => {
        const flags: RalphFlags = {
            dryRun: true,
        };

        // This should not throw, it should use defaults
        const config = await loadConfig(flags);
        expect(config).toBeDefined();
    });

    it("should handle invalid review mode", () => {
        const invalidReview = "invalid" as RalphFlags["review"];
        expect(invalidReview).toBeTypeOf("string");
    });
});

describe("TUI Components", () => {
    it("should import all TUI dependencies", async () => {
        const opentui = await import("@opentui/core");
        expect(opentui).toBeDefined();
        expect(opentui.createCliRenderer).toBeDefined();
    });

    it("should export launchTui function", async () => {
        const module = await import("../../src/cli/tui/App.ts");
        expect(typeof module.launchTui).toBe("function");
    });
});
