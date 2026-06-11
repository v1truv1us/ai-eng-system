/**
 * Codex / OpenAI adapter — uses GPT-5 series models.
 *
 * Source: https://platform.openai.com/docs/models (2025-05)
 *
 * Maps subagent roles to OpenAI model tiers:
 *   LookupAgent  → gpt-5.4-mini    (fast, cheap)
 *   WorkAgent    → gpt-5.4          (balanced)
 *   PlannerAgent → gpt-5.5          (flagship reasoning)
 *   DebuggerAgent → gpt-5.4         (balanced)
 *   RefactorAgent → gpt-5.5         (flagship reasoning)
 *
 * Override via OPENAI_MODEL env var or adapter config.
 */

import { type RouterAdapter, SubagentRole } from "../core/types";
import { createStubExecute } from "./shared";

const DEFAULT = process.env.OPENAI_MODEL ?? "gpt-5.4";

export const CODEX_MODEL_FAMILY = {
    [SubagentRole.LOOKUP]: process.env.OPENAI_MODEL_LOOKUP ?? "gpt-5.4-mini",
    [SubagentRole.WORK]: process.env.OPENAI_MODEL_WORK ?? DEFAULT,
    [SubagentRole.PLANNER]: process.env.OPENAI_MODEL_PLANNER ?? "gpt-5.5",
    [SubagentRole.DEBUGGER]: process.env.OPENAI_MODEL_DEBUGGER ?? DEFAULT,
    [SubagentRole.REFACTORER]: process.env.OPENAI_MODEL_REFACTORER ?? "gpt-5.5",
} satisfies Record<SubagentRole, string>;

export const codexAdapter: RouterAdapter = {
    name: "codex",
    models: CODEX_MODEL_FAMILY,
    execute: createStubExecute("codex"),
};
