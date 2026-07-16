import { afterEach, describe, expect, it } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    appendTelemetryEvent,
    readTelemetry,
} from "../../src/install/telemetry";

describe("install telemetry", () => {
    const previousHome = process.env.HOME;
    const tempHome = mkdtempSync(join(tmpdir(), "ai-eng-telemetry-"));

    afterEach(() => {
        if (previousHome === undefined) {
            delete process.env.HOME;
        } else {
            process.env.HOME = previousHome;
        }
        rmSync(tempHome, { recursive: true, force: true });
    });

    it("resolves HOME when the event is written", () => {
        process.env.HOME = tempHome;

        appendTelemetryEvent({
            event: "install",
            timestamp: new Date().toISOString(),
            version: "test",
            platform: "cursor",
            scope: "project",
            command_count: 1,
            agent_count: 1,
            skill_count: 1,
            tool_count: 0,
        });

        expect(existsSync(join(tempHome, ".ai-eng", "telemetry.jsonl"))).toBe(
            true,
        );
        expect(readTelemetry()).toHaveLength(1);
    });
});
