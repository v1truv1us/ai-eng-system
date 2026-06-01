/**
 * Pi adapter — hybrid OpenAI + Kimi routing.
 *
 * Uses Kimi (kimi-k2.6) for fast cost-efficient tasks (lookup, work, debugging)
 * and OpenAI (gpt-5.5) for heavy reasoning (planning, refactoring).
 * Pi supports multiple providers via its model routing.
 *
 * Default mapping:
 *   LookupAgent  → kimi-k2.6      (fast, cheap)
 *   WorkAgent    → kimi-k2.6      (balanced, cost-efficient)
 *   PlannerAgent → gpt-5.5        (strongest reasoning)
 *   DebuggerAgent → kimi-k2.6     (fast, cost-efficient)
 *   RefactorAgent → gpt-5.5       (strong reasoning)
 *
 * Override per-role via env vars: PI_MODEL_LOOKUP, PI_MODEL_WORK, etc.
 */

import { type RouterAdapter, SubagentRole } from "../core/types";
import { createStubExecute } from "./shared";

const KIMI = process.env.PI_MODEL ?? "kimi-k2.6";
const OPENAI_HEAVY = process.env.PI_MODEL_PLANNER ?? "gpt-5.5";

export const PI_MODEL_FAMILY = {
    [SubagentRole.LOOKUP]: process.env.PI_MODEL_LOOKUP ?? KIMI,
    [SubagentRole.WORK]: process.env.PI_MODEL_WORK ?? KIMI,
    [SubagentRole.PLANNER]: OPENAI_HEAVY,
    [SubagentRole.DEBUGGER]: process.env.PI_MODEL_DEBUGGER ?? KIMI,
    [SubagentRole.REFACTORER]: process.env.PI_MODEL_REFACTORER ?? OPENAI_HEAVY,
} satisfies Record<SubagentRole, string>;

export const piAdapter: RouterAdapter = {
    name: "pi",
    models: PI_MODEL_FAMILY,
    execute: createStubExecute("pi"),
};
