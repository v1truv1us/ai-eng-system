/**
 * Adapter registry — one per harness.
 */

import type { HarnessName, RouterAdapter } from "../core/types";
import {
    ANTHROPIC_MODEL_FAMILY,
    ANTHROPIC_MODELS,
    anthropicAdapter,
} from "./anthropic";
import { CODEX_MODEL_FAMILY, codexAdapter } from "./codex";
import { CURSOR_MODEL_FAMILY, cursorAdapter } from "./cursor";
import { OPENCODE_MODEL_FAMILY, opencodeAdapter } from "./opencode";
import { PI_MODEL_FAMILY, piAdapter } from "./pi";

export {
    ANTHROPIC_MODEL_FAMILY,
    ANTHROPIC_MODELS,
    anthropicAdapter,
} from "./anthropic";
export { CODEX_MODEL_FAMILY, codexAdapter } from "./codex";
export { CURSOR_MODEL_FAMILY, cursorAdapter } from "./cursor";
export { OPENCODE_MODEL_FAMILY, opencodeAdapter } from "./opencode";
export { PI_MODEL_FAMILY, piAdapter } from "./pi";
export { createStubExecute, validateModelFamily } from "./shared";

const ADAPTERS: Record<HarnessName, RouterAdapter> = {
    anthropic: anthropicAdapter,
    cursor: cursorAdapter,
    opencode: opencodeAdapter,
    codex: codexAdapter,
    pi: piAdapter,
};

/** Look up an adapter by harness name. */
export function getAdapter(name: HarnessName): RouterAdapter {
    const adapter = ADAPTERS[name];
    if (!adapter) throw new Error(`Unknown harness adapter: ${name}`);
    return adapter;
}

/** All built-in adapters keyed by harness name. */
export const ALL_ADAPTERS = ADAPTERS;
