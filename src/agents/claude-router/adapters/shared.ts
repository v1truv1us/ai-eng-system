/**
 * Adapter helpers shared across harness implementations.
 */

import { type RouterAdapter, SubagentRole } from "../core/types";

/**
 * Build a default execute function for adapters that delegate to a
 * harness-specific driver. Adapters can override this for real SDK calls.
 */
export function createStubExecute(
    adapterName: string,
): RouterAdapter["execute"] {
    return async (decision, prompt) => {
        const startTime = Date.now();
        return {
            role: decision.role,
            model: decision.model,
            success: true,
            output: `[${adapterName} adapter] Would execute via ${decision.model}: ${prompt.slice(0, 200)}${prompt.length > 200 ? "..." : ""}`,
            executionTimeMs: Date.now() - startTime,
        };
    };
}

/**
 * Validate that a model family covers all subagent roles.
 */
export function validateModelFamily(
    models: Record<string, string>,
): asserts models is Record<SubagentRole, string> {
    for (const role of Object.values(SubagentRole)) {
        if (!models[role]) {
            throw new Error(
                `Model family is missing mapping for role: ${role}`,
            );
        }
    }
}
