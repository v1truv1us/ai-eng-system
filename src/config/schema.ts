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
}

/**
 * OpenCode Configuration
 */
export interface OpenCodeConfig {
    /** Model to use for OpenCode */
    model: string;
    /** Temperature for generation */
    temperature: number;
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
 * Quality Gates Configuration
 */
export interface GatesConfig {
    /** Lint gate command */
    lint: string;
    /** Type check gate command */
    typecheck: string;
    /** Test gate command */
    test: string;
    /** Build gate command */
    build: string;
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
 * Main Configuration Schema
 */
export interface AiEngConfig {
    /** Configuration version */
    version: number;
    /** Runner configuration */
    runner: RunnerConfig;
    /** OpenCode configuration */
    opencode: OpenCodeConfig;
    /** Anthropic configuration */
    anthropic: AnthropicConfig;
    /** Quality gates configuration */
    gates: GatesConfig;
    /** Models configuration */
    models: ModelsConfig;
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
