/**
 * AI Engineering System Configuration Schema
 */

/**
 * Runner Configuration
 */
export interface RunnerConfig {
    /** Backend to use for execution */
    backend: "opencode" | "anthropic";
    /** Review mode for AI reviews */
    review: "none" | "opencode" | "anthropic" | "both";
    /** Directory for run artifacts */
    artifactsDir: string;
    /** Maximum iterations per run */
    maxIters: number;
    /** Print logs to stderr */
    printLogs?: boolean;
    /** Log level */
    logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR";
}

/**
 * Loop Configuration
 */
export interface LoopConfig {
    /** Maximum number of loop cycles */
    maxCycles: number;
    /** Number of retry attempts per cycle on failure */
    cycleRetries: number;
    /** Checkpoint frequency (save state every N cycles) */
    checkpointFrequency: number;
    /** Stuck detection threshold - abort after N cycles with no progress */
    stuckThreshold: number;
}

/**
 * Debug Configuration
 */
export interface DebugConfig {
    /** Print every tool invocation input/output to console and logs */
    work: boolean;
}

/**
 * OpenCode Configuration
 */
export interface OpenCodeConfig {
    /** Model to use for OpenCode */
    model: string;
    /** Temperature for generation */
    temperature: number;
    /** Existing server URL (optional - will spawn if not provided) */
    serverUrl?: string;
    /** Working directory for OpenCode session */
    directory?: string;
    /** Prompt timeout in milliseconds */
    promptTimeoutMs?: number;
}

/**
 * Anthropic Configuration
 */
export interface AnthropicConfig {
    /** Whether Anthropic backend is enabled */
    enabled: boolean;
    /** Model to use for Anthropic */
    model: string;
}

/**
 * Gate Command Configuration
 */
export interface GateCommandConfig {
    /** Command to execute for this gate */
    command: string;
}

/**
 * Quality Gates Configuration
 */
export interface GatesConfig {
    /** Lint gate configuration */
    lint: GateCommandConfig;
    /** Type check gate configuration */
    typecheck: GateCommandConfig;
    /** Test gate configuration */
    test: GateCommandConfig;
    /** Build gate configuration */
    build: GateCommandConfig;
    /** Acceptance gate configuration (e.g., git diff --name-only) */
    acceptance: GateCommandConfig;
}

/**
 * Models Configuration
 */
export interface ModelsConfig {
    /** Model for research tasks */
    research: string;
    /** Model for planning tasks */
    planning: string;
    /** Model for codebase exploration */
    exploration: string;
    /** Model for coding/implementation */
    coding: string;
    /** Default fallback model */
    default: string;
}

/**
 * Notification Configuration
 */
export interface NotificationsConfig {
    /** Discord notification settings */
    discord: {
        /** Enable Discord notifications */
        enabled: boolean;
        /** Bot username */
        username: string;
        /** Bot avatar URL */
        avatarUrl?: string;
        /** Webhook URL (should come from env, never hardcoded) */
        webhook?: {
            /** Source type - only 'env' supported for secrets */
            source: "env";
            /** Environment variable name for the webhook URL */
            envVar: string;
        };
    };
}

/**
 * UI Configuration
 */
export interface UiConfig {
    /** Suppress noisy warnings/logs */
    silent: boolean;
}

/**
 * Main Configuration Schema
 */
export interface AiEngConfig {
    /** Configuration version */
    version: number;
    /** Runner configuration */
    runner: RunnerConfig;
    /** Loop configuration */
    loop: LoopConfig;
    /** Debug configuration */
    debug: DebugConfig;
    /** OpenCode configuration */
    opencode: OpenCodeConfig;
    /** Anthropic configuration */
    anthropic: AnthropicConfig;
    /** Quality gates configuration */
    gates: GatesConfig;
    /** Models configuration */
    models: ModelsConfig;
    /** Notifications configuration */
    notifications: NotificationsConfig;
    /** UI configuration */
    ui: UiConfig;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: AiEngConfig = {
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
        maxCycles: 10,
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
        serverUrl: undefined,
        directory: undefined,
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
            avatarUrl: undefined,
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
