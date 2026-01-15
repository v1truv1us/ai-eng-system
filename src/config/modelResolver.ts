/**
 * Model Resolution Utilities
 *
 * Handles model selection with proper precedence:
 * 1. Task-specific model from config.models.<taskType>
 * 2. Default model from config.models.default
 * 3. Fallback to config.opencode.model
 * 4. Error if no model configured
 */

import type { AiEngConfig } from "./schema";

export type TaskType = "research" | "planning" | "exploration" | "coding";

/**
 * Resolve the model to use for a specific task type
 * @throws Error if no model is configured
 */
export function resolveModel(config: AiEngConfig, taskType?: TaskType): string {
    // Priority 1: Task-specific model
    if (taskType && config.models[taskType]) {
        return config.models[taskType];
    }

    // Priority 2: Default model from models config
    if (config.models.default) {
        return config.models.default;
    }

    // Priority 3: OpenCode model
    if (config.opencode.model) {
        return config.opencode.model;
    }

    // Priority 4: Error - no model configured
    const taskMsg = taskType ? ` for task type '${taskType}'` : "";
    throw new Error(
        `No model configured${taskMsg}. Please configure a model in .ai-eng/config.yaml:\n` +
            `  models:\n` +
            `    default: claude-3-5-sonnet-latest\n` +
            `  or set opencode.model in the config.`,
    );
}

/**
 * Get all configured models
 */
export function getAllModels(
    config: AiEngConfig,
): Record<TaskType | "default", string> {
    return {
        research: resolveModel(config, "research"),
        planning: resolveModel(config, "planning"),
        exploration: resolveModel(config, "exploration"),
        coding: resolveModel(config, "coding"),
        default: resolveModel(config),
    };
}
