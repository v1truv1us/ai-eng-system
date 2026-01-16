/**
 * Initialize ai-eng configuration file
 */

import { existsSync, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import type { InitFlags } from "../cli/flags";
import { UI } from "../cli/ui";
import { DEFAULT_CONFIG } from "../config/schema";

/**
 * Default configuration template
 */
const CONFIG_TEMPLATE = {
    version: 1,
    runner: {
        backend: "opencode",
        review: "opencode",
        artifactsDir: ".ai-eng/runs",
        maxIters: 3,
        printLogs: false,
        logLevel: "INFO",
    },
    loop: {
        maxCycles: 50,
        cycleRetries: 2,
        checkpointFrequency: 1,
        stuckThreshold: 5,
    },
    debug: {
        work: false,
    },
    opencode: {
        model: "claude-3-5-sonnet-latest",
        temperature: 0.2,
        promptTimeoutMs: 120000,
    },
    anthropic: {
        enabled: false,
        model: "claude-3-5-sonnet-latest",
    },
    gates: {
        lint: { command: "bun run lint" },
        typecheck: { command: "bun run typecheck" },
        test: { command: "bun test" },
        build: { command: "bun run build" },
        acceptance: { command: "git diff --name-only" },
    },
    models: {
        research: "github-copilot/gpt-5.2",
        planning: "github-copilot/gpt-5.2",
        exploration: "github-copilot/gpt-5.2",
        coding: "github-copilot/gpt-5.2",
        default: "github-copilot/gpt-5.2",
    },
    notifications: {
        discord: {
            enabled: false,
            username: "Ralph",
            webhook: {
                source: "env",
                envVar: "DISCORD_WEBHOOK_URL",
            },
        },
    },
    ui: {
        silent: false,
    },
};

/**
 * Initialize configuration file
 */
export async function initConfig(flags: InitFlags): Promise<void> {
    const configDir = join(process.cwd(), ".ai-eng");
    const configPath = join(configDir, "config.yaml");

    // Check if config already exists
    if (existsSync(configPath) && !flags.overwrite) {
        UI.error("Configuration file already exists:");
        console.error(`  ${configPath}`);
        console.error(
            "Use --overwrite to replace it, or edit the existing file.",
        );
        process.exit(1);
    }

    if (flags.interactive) {
        console.log("⚠️  Interactive mode requires additional dependencies.");
        console.log("  npm install @clack/prompts");
        console.log("For now, creating config with defaults...\n");
    }

    // Write default configuration
    try {
        const yamlContent = YAML.stringify(CONFIG_TEMPLATE, {
            indent: 2,
            lineWidth: 0,
        });

        await writeFile(configPath, yamlContent, "utf-8");
        console.log("✅ Initialized .ai-eng/config.yaml with defaults");
        console.log("\n📋 Next steps:");
        console.log("  1. Edit .ai-eng/config.yaml to customize settings");
        console.log("  2. Set up AI models and backends");
        console.log("  3. Configure quality gates for your project");
        console.log(
            "  4. Run 'ai-eng ralph \"your task\"' to start development",
        );
    } catch (error) {
        console.error("Failed to write configuration file");
        process.exit(1);
    }
}
