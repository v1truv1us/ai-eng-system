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
export declare function resolveModel(config: AiEngConfig, taskType?: TaskType): string;
/**
 * Get all configured models
 */
export declare function getAllModels(config: AiEngConfig): Record<TaskType | "default", string>;
