/**
 * Cursor adapter — uses Cursor SDK models.
 *
 * Cursor's model naming differs from direct API calls. The "composer" family
 * is Cursor's agent-grade model; specific model IDs can be overridden via
 * config or environment variables.
 *
 * Default mapping:
 *   LookupAgent  → composer-mini     (fast, cheap)
 *   WorkAgent    → composer-2.5      (balanced)
 *   PlannerAgent → composer-2.5      (strongest available)
 *   DebuggerAgent → composer-2.5     (balanced reasoning)
 *   RefactorAgent → composer-2.5     (strong reasoning)
 */

import { type RouterAdapter, SubagentRole } from "../core/types";
import { createStubExecute } from "./shared";

export const CURSOR_MODEL_FAMILY = {
    [SubagentRole.LOOKUP]: "composer-mini",
    [SubagentRole.WORK]: "composer-2.5",
    [SubagentRole.PLANNER]: "composer-2.5",
    [SubagentRole.DEBUGGER]: "composer-2.5",
    [SubagentRole.REFACTORER]: "composer-2.5",
} satisfies Record<SubagentRole, string>;

export const cursorAdapter: RouterAdapter = {
    name: "cursor",
    models: CURSOR_MODEL_FAMILY,
    execute: createStubExecute("cursor"),
};
