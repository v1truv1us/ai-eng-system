/**
 * Anthropic adapter — uses claude-haiku-4-5, claude-sonnet-4-6, claude-opus-4-8.
 *
 * Source: https://docs.anthropic.com/en/docs/about-claude/models (2025-05)
 *
 * In production, execute() would call the Anthropic API with the mapped model
 * and the subagent's system prompt. Currently returns a structured stub result
 * for testing and skill-layer dispatch.
 */

import { type RouterAdapter, SubagentRole } from "../core/types";
import { createStubExecute } from "./shared";

export const ANTHROPIC_MODELS = {
    HAIKU: "claude-haiku-4-5-20251001",
    SONNET: "claude-sonnet-4-6",
    OPUS: "claude-opus-4-8",
} as const;

export const ANTHROPIC_MODEL_FAMILY = {
    [SubagentRole.LOOKUP]: ANTHROPIC_MODELS.HAIKU,
    [SubagentRole.WORK]: ANTHROPIC_MODELS.SONNET,
    [SubagentRole.PLANNER]: ANTHROPIC_MODELS.OPUS,
    [SubagentRole.DEBUGGER]: ANTHROPIC_MODELS.SONNET,
    [SubagentRole.REFACTORER]: ANTHROPIC_MODELS.OPUS,
} satisfies Record<SubagentRole, string>;

export const anthropicAdapter: RouterAdapter = {
    name: "anthropic",
    models: ANTHROPIC_MODEL_FAMILY,
    execute: createStubExecute("anthropic"),
};
