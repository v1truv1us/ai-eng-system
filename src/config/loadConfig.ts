/**
 * Configuration Loader for ai-eng ralph
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import type { AiEngConfig, DEFAULT_CONFIG } from "./schema.js";
import type { RalphFlags } from "../cli/flags.js";

// Use current working directory where command is called from
// This ensures .ai-eng/config.yaml is loaded from user's project directory
const ROOT = process.env.TEST_ROOT ?? process.cwd();

/**
 * Load configuration from .ai-eng/config.yaml
 */
export async function loadConfig(flags: RalphFlags): Promise<AiEngConfig> {
    // Start with default config
    const config: AiEngConfig = {
        version: 1,
        runner: {
            backend: "opencode",
            review: "opencode",
            artifactsDir: ".ai-eng/runs",
            maxIters: 3,
        },
        opencode: {
            model: "claude-3-5-sonnet-latest",
            temperature: 0.2,
        },
        anthropic: {
            enabled: false,
            model: "claude-3-5-sonnet-latest",
        },
        gates: {
            lint: "bun run lint",
            typecheck: "bun run typecheck",
            test: "bun run test",
            build: "bun run build",
        },
        models: {
            research: "github-copilot/gpt-5.2",
            planning: "github-copilot/gpt-5.2",
            exploration: "github-copilot/gpt-5.2",
            coding: "github-copilot/gpt-5.2",
            default: "github-copilot/gpt-5.2",
        },
    };

    // Try to load from config file
    const configPath = join(ROOT, ".ai-eng", "config.yaml");
    try {
        const configContent = await readFile(configPath, "utf-8");
        const userConfig = YAML.parse(configContent);

        // Merge user config with defaults
        if (userConfig.runner) {
            config.runner = { ...config.runner, ...userConfig.runner };
        }
        if (userConfig.opencode) {
            config.opencode = { ...config.opencode, ...userConfig.opencode };
        }
        if (userConfig.anthropic) {
            config.anthropic = {
                ...config.anthropic,
                ...userConfig.anthropic,
            };
        }
        if (userConfig.gates) {
            config.gates = { ...config.gates, ...userConfig.gates };
        }
        if (userConfig.models) {
            config.models = { ...config.models, ...userConfig.models };
        }

        if (userConfig.version) {
            config.version = userConfig.version;
        }
    } catch (error) {
        // Config file not found or invalid - use defaults
        if (!(error instanceof Error && error.message.includes("ENOENT"))) {
            console.warn(
                `Warning: Failed to load config from ${configPath}, using defaults`,
            );
        }
    }

    // Override with flags
    if (flags.maxIters !== undefined) {
        config.runner.maxIters = flags.maxIters;
    }
    if (flags.review !== undefined) {
        config.runner.review = flags.review;
    }
    if (flags.gates !== undefined && flags.gates.length > 0) {
        // Override specific gates
        flags.gates.forEach((gateName) => {
            if (config.gates[gateName as keyof typeof config.gates]) {
                // Gate value would come from config parsing
                // This is a simplified version
            }
        });
    }

    return config;
}
