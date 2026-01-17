/**
 * Configuration Loader for ai-eng ralph
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import type { RalphFlags } from "../cli/flags";
import type { AiEngConfig, DEFAULT_CONFIG } from "./schema";
import { DEFAULT_CONFIG as HARDCODED_DEFAULTS } from "./schema";

// Use current working directory where command is called from
// This ensures .ai-eng/config.yaml is loaded from user's project directory
const ROOT = process.env.TEST_ROOT ?? process.cwd();

/**
 * Environment variable to config key mapping
 */
const ENV_VAR_MAPPING: Record<string, keyof AiEngConfig> = {
    // OpenCode
    OPENCODE_URL: "opencode",
    OPENCODE_DIRECTORY: "opencode",
    OPENCODE_PROMPT_TIMEOUT_MS: "opencode",
    // Discord (non-secret)
    DISCORD_BOT_USERNAME: "notifications",
    DISCORD_BOT_AVATAR_URL: "notifications",
    // UI
    AI_ENG_SILENT: "ui",
    // Loop
    AI_ENG_CYCLE_RETRIES: "loop",
    // Debug
    AI_ENG_DEBUG_WORK: "debug",
    // Gates (commands)
    AI_ENG_TEST_CMD: "gates",
    AI_ENG_LINT_CMD: "gates",
    AI_ENG_ACCEPTANCE_CMD: "gates",
    AI_ENG_TYPECHECK_CMD: "gates",
    AI_ENG_BUILD_CMD: "gates",
};

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
        if (current && typeof current === "object" && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown,
): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce<Record<string, unknown>>((current, key) => {
        if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
        }
        return current[key] as Record<string, unknown>;
    }, obj);
    target[lastKey] = value;
}

/**
 * Apply environment variable overrides to config
 */
function applyEnvOverrides(config: AiEngConfig): void {
    // OpenCode overrides
    if (process.env.OPENCODE_URL) {
        config.opencode.serverUrl = process.env.OPENCODE_URL;
    }
    if (process.env.OPENCODE_DIRECTORY) {
        config.opencode.directory = process.env.OPENCODE_DIRECTORY;
    }
    if (process.env.OPENCODE_PROMPT_TIMEOUT_MS) {
        const timeout = Number.parseInt(
            process.env.OPENCODE_PROMPT_TIMEOUT_MS,
            10,
        );
        if (Number.isNaN(timeout)) {
            config.opencode.promptTimeoutMs = timeout;
        }
    }

    // Discord overrides (non-secret)
    if (process.env.DISCORD_BOT_USERNAME) {
        config.notifications.discord.username =
            process.env.DISCORD_BOT_USERNAME;
    }
    if (process.env.DISCORD_BOT_AVATAR_URL) {
        config.notifications.discord.avatarUrl =
            process.env.DISCORD_BOT_AVATAR_URL;
    }

    // UI override
    if (process.env.AI_ENG_SILENT) {
        config.ui.silent =
            process.env.AI_ENG_SILENT === "1" ||
            process.env.AI_ENG_SILENT === "true";
    }

    // Loop overrides
    if (process.env.AI_ENG_CYCLE_RETRIES) {
        const retries = Number.parseInt(process.env.AI_ENG_CYCLE_RETRIES, 10);
        if (!Number.isNaN(retries)) {
            config.loop.cycleRetries = retries;
        }
    }

    // Debug overrides
    if (process.env.AI_ENG_DEBUG_WORK) {
        config.debug.work =
            process.env.AI_ENG_DEBUG_WORK === "1" ||
            process.env.AI_ENG_DEBUG_WORK === "true";
    }

    // Gate command overrides
    if (process.env.AI_ENG_TEST_CMD) {
        config.gates.test.command = process.env.AI_ENG_TEST_CMD;
    }
    if (process.env.AI_ENG_LINT_CMD) {
        config.gates.lint.command = process.env.AI_ENG_LINT_CMD;
    }
    if (process.env.AI_ENG_ACCEPTANCE_CMD) {
        config.gates.acceptance.command = process.env.AI_ENG_ACCEPTANCE_CMD;
    }
    if (process.env.AI_ENG_TYPECHECK_CMD) {
        config.gates.typecheck.command = process.env.AI_ENG_TYPECHECK_CMD;
    }
    if (process.env.AI_ENG_BUILD_CMD) {
        config.gates.build.command = process.env.AI_ENG_BUILD_CMD;
    }
}

/**
 * Deep merge two objects (target <- source)
 */
function deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>,
): T {
    const result = { ...target } as T;
    for (const key of Object.keys(source) as Array<keyof T>) {
        const sourceValue = source[key];
        const targetValue = target[key];

        if (sourceValue === undefined) continue;

        if (
            sourceValue &&
            typeof sourceValue === "object" &&
            !Array.isArray(sourceValue)
        ) {
            if (
                targetValue &&
                typeof targetValue === "object" &&
                !Array.isArray(targetValue)
            ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result[key] = deepMerge(
                    targetValue as any,
                    sourceValue as any,
                ) as any;
            } else {
                (result as any)[key] = sourceValue;
            }
        } else {
            (result as any)[key] = sourceValue;
        }
    }
    return result;
}

/**
 * Merge gate command configs (handle legacy string format)
 */
function mergeGateConfig(
    existing: { command: string },
    incoming: string | { command?: string },
): { command: string } {
    if (typeof incoming === "string") {
        return { command: incoming };
    }
    return {
        command: incoming.command ?? existing.command,
    };
}

/**
 * Load configuration from .ai-eng/config.yaml
 */
export async function loadConfig(flags: RalphFlags): Promise<AiEngConfig> {
    // Start with default config
    const config: AiEngConfig = {
        version: HARDCODED_DEFAULTS.version,
        runner: { ...HARDCODED_DEFAULTS.runner },
        loop: { ...HARDCODED_DEFAULTS.loop },
        debug: { ...HARDCODED_DEFAULTS.debug },
        opencode: { ...HARDCODED_DEFAULTS.opencode },
        anthropic: { ...HARDCODED_DEFAULTS.anthropic },
        gates: {
            lint: { ...HARDCODED_DEFAULTS.gates.lint },
            typecheck: { ...HARDCODED_DEFAULTS.gates.typecheck },
            test: { ...HARDCODED_DEFAULTS.gates.test },
            build: { ...HARDCODED_DEFAULTS.gates.build },
            acceptance: { ...HARDCODED_DEFAULTS.gates.acceptance },
        },
        models: { ...HARDCODED_DEFAULTS.models },
        notifications: {
            discord: { ...HARDCODED_DEFAULTS.notifications.discord },
        },
        ui: { ...HARDCODED_DEFAULTS.ui },
    };

    // Try to load from config file
    const configPath = join(ROOT, ".ai-eng", "config.yaml");
    try {
        const configContent = await readFile(configPath, "utf-8");
        const userConfig = YAML.parse(configContent);

        if (userConfig.version) {
            config.version = userConfig.version;
        }
        if (userConfig.runner) {
            config.runner = { ...config.runner, ...userConfig.runner };
        }
        if (userConfig.loop) {
            config.loop = { ...config.loop, ...userConfig.loop };
        }
        if (userConfig.debug) {
            config.debug = { ...config.debug, ...userConfig.debug };
        }
        if (userConfig.opencode) {
            config.opencode = { ...config.opencode, ...userConfig.opencode };
        }
        if (userConfig.anthropic) {
            config.anthropic = { ...config.anthropic, ...userConfig.anthropic };
        }
        if (userConfig.gates) {
            if (userConfig.gates.lint) {
                config.gates.lint = mergeGateConfig(
                    config.gates.lint,
                    userConfig.gates.lint,
                );
            }
            if (userConfig.gates.typecheck) {
                config.gates.typecheck = mergeGateConfig(
                    config.gates.typecheck,
                    userConfig.gates.typecheck,
                );
            }
            if (userConfig.gates.test) {
                config.gates.test = mergeGateConfig(
                    config.gates.test,
                    userConfig.gates.test,
                );
            }
            if (userConfig.gates.build) {
                config.gates.build = mergeGateConfig(
                    config.gates.build,
                    userConfig.gates.build,
                );
            }
            if (userConfig.gates.acceptance) {
                config.gates.acceptance = mergeGateConfig(
                    config.gates.acceptance,
                    userConfig.gates.acceptance,
                );
            }
        }
        if (userConfig.models) {
            config.models = { ...config.models, ...userConfig.models };
        }
        if (userConfig.notifications) {
            if (userConfig.notifications.discord) {
                config.notifications.discord = {
                    ...config.notifications.discord,
                    ...userConfig.notifications.discord,
                };
            }
        }
        if (userConfig.ui) {
            config.ui = { ...config.ui, ...userConfig.ui };
        }
    } catch (error) {
        // Config file not found or invalid - use defaults
        if (!(error instanceof Error && error.message.includes("ENOENT"))) {
            console.warn(
                `Warning: Failed to load config from ${configPath}, using defaults`,
            );
        }
    }

    // Apply environment variable overrides (env takes precedence over yaml)
    applyEnvOverrides(config);

    // Override with CLI flags (highest priority)
    if (flags.maxIters !== undefined) {
        config.runner.maxIters = flags.maxIters;
    }
    if (flags.review !== undefined) {
        config.runner.review = flags.review;
    }
    if (flags.maxCycles !== undefined) {
        config.loop.maxCycles = flags.maxCycles;
    }
    if (flags.stuckThreshold !== undefined) {
        config.loop.stuckThreshold = flags.stuckThreshold;
    }
    if (flags.checkpointFrequency !== undefined) {
        config.loop.checkpointFrequency = flags.checkpointFrequency;
    }
    if (flags.printLogs !== undefined) {
        config.runner.printLogs = flags.printLogs;
    }
    if (flags.logLevel !== undefined) {
        config.runner.logLevel = flags.logLevel;
    }
    if (flags.verbose) {
        config.runner.logLevel = "DEBUG";
    }
    if (flags.workingDir !== undefined) {
        config.opencode.directory = flags.workingDir;
    }
    if (flags.dryRun !== undefined) {
        // dryRun could be used by gates or other components
    }

    return config;
}
