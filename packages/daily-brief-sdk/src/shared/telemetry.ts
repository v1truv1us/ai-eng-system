/**
 * JSONL telemetry appender. One row per workflow run, even on failure.
 * No native deps (better-sqlite3 was rejected — see SPEC §8).
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { WorkflowName } from "./paths.js";
import { COOK_AND_BRIEF_DIR, TELEMETRY_FILE } from "./paths.js";

export interface TelemetryRow {
    workflow: WorkflowName;
    started_at: string; // ISO-8601
    duration_ms: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost_usd: number;
    sources_succeeded: string[];
    sources_failed: string[];
    error_kind: string | null;
}

/**
 * Append a single JSONL row to ~/.claude/cook-and-brief/telemetry.jsonl.
 * Synchronous append is intentional: telemetry is the last operation in a
 * workflow run, and we'd rather block than lose the row.
 */
export function appendTelemetry(
    row: TelemetryRow,
    target: string = TELEMETRY_FILE,
): void {
    const dir = dirname(target);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    if (!existsSync(COOK_AND_BRIEF_DIR)) {
        mkdirSync(COOK_AND_BRIEF_DIR, { recursive: true });
    }
    const line = `${JSON.stringify(row)}\n`;
    appendFileSync(target, line, { encoding: "utf-8" });
}

/**
 * Build a failure row. Always include the error_kind; never omit the
 * row to "make telemetry cleaner."
 */
export function failureRow(
    base: Omit<
        TelemetryRow,
        "duration_ms" | "sources_succeeded" | "sources_failed" | "error_kind"
    > & {
        startedAt: Date;
        sourcesSucceeded?: string[];
        sourcesFailed?: string[];
    },
    error: unknown,
): TelemetryRow {
    const error_kind =
        error instanceof Error
            ? error.name
            : typeof error === "string"
              ? "StringError"
              : "UnknownError";

    return {
        workflow: base.workflow,
        started_at: base.started_at,
        duration_ms: Date.now() - base.startedAt.getTime(),
        prompt_tokens: base.prompt_tokens,
        completion_tokens: base.completion_tokens,
        total_cost_usd: base.total_cost_usd,
        sources_succeeded: base.sourcesSucceeded ?? [],
        sources_failed: base.sourcesFailed ?? [],
        error_kind,
    };
}
