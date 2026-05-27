import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendTelemetry, failureRow } from "../src/shared/telemetry.js";

describe("telemetry", () => {
    let tmp: string;
    let target: string;
    beforeEach(() => {
        tmp = mkdtempSync(join(tmpdir(), "telemetry-"));
        target = join(tmp, "telemetry.jsonl");
    });
    afterEach(() => {
        rmSync(tmp, { recursive: true, force: true });
    });

    test("appends a single JSONL row per call", () => {
        const row = {
            workflow: "tomorrow" as const,
            started_at: "2026-05-26T17:00:00.000Z",
            duration_ms: 12345,
            prompt_tokens: 100,
            completion_tokens: 50,
            total_cost_usd: 0.012,
            sources_succeeded: ["atlassian-mcp"],
            sources_failed: [],
            error_kind: null,
        };
        appendTelemetry(row, target);
        const lines = readFileSync(target, "utf-8").split("\n").filter(Boolean);
        expect(lines).toHaveLength(1);
        const parsed = JSON.parse(lines[0]!);
        expect(parsed).toEqual(row);
    });

    test("multiple appends produce multiple lines (no truncation)", () => {
        for (let i = 0; i < 3; i++) {
            appendTelemetry(
                {
                    workflow: "tomorrow",
                    started_at: `2026-05-26T17:0${i}:00.000Z`,
                    duration_ms: 100 * (i + 1),
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_cost_usd: 0,
                    sources_succeeded: [],
                    sources_failed: [],
                    error_kind: null,
                },
                target,
            );
        }
        const lines = readFileSync(target, "utf-8").split("\n").filter(Boolean);
        expect(lines).toHaveLength(3);
    });

    test("each row is a valid JSON object", () => {
        appendTelemetry(
            {
                workflow: "tomorrow",
                started_at: "2026-05-26T17:00:00.000Z",
                duration_ms: 1,
                prompt_tokens: 0,
                completion_tokens: 0,
                total_cost_usd: 0,
                sources_succeeded: ["a", "b"],
                sources_failed: [],
                error_kind: null,
            },
            target,
        );
        const content = readFileSync(target, "utf-8");
        const parsed = JSON.parse(content.trim());
        expect(parsed.sources_succeeded).toEqual(["a", "b"]);
    });

    test("failureRow sets error_kind from Error", () => {
        const row = failureRow(
            {
                workflow: "tomorrow",
                started_at: "2026-05-26T17:00:00.000Z",
                prompt_tokens: 0,
                completion_tokens: 0,
                total_cost_usd: 0,
                startedAt: new Date(Date.now() - 2000),
            },
            new TypeError("boom"),
        );
        expect(row.error_kind).toBe("TypeError");
        expect(row.duration_ms).toBeGreaterThanOrEqual(2000);
    });

    test("failureRow handles non-Error throws", () => {
        const row = failureRow(
            {
                workflow: "tomorrow",
                started_at: "2026-05-26T17:00:00.000Z",
                prompt_tokens: 0,
                completion_tokens: 0,
                total_cost_usd: 0,
                startedAt: new Date(),
            },
            "string error",
        );
        expect(row.error_kind).toBe("StringError");
    });

    test("failureRow includes empty source arrays by default", () => {
        const row = failureRow(
            {
                workflow: "tomorrow",
                started_at: "2026-05-26T17:00:00.000Z",
                prompt_tokens: 0,
                completion_tokens: 0,
                total_cost_usd: 0,
                startedAt: new Date(),
            },
            new Error("x"),
        );
        expect(row.sources_succeeded).toEqual([]);
        expect(row.sources_failed).toEqual([]);
    });
});
