import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
    existsSync,
    mkdtempSync,
    readFileSync,
    rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InMemoryTransport } from "../src/shared/email.js";
import { ProvenanceError } from "../src/shared/provenance-validator.js";
import { runTomorrow } from "../src/workflows/tomorrow.js";

/**
 * Fake SDK that produces a deterministic stream:
 *   1. Assistant message containing one tool_use block
 *   2. Result message with `result` carrying the brief JSON
 *
 * The fake's signature mirrors `query()` enough to satisfy `sdkQuery` injection.
 */
function fakeSdk(briefJson: string, toolUseId = "toolu_fake_01") {
    return ((_params: unknown) => {
        const messages = [
            {
                type: "assistant",
                message: {
                    id: "msg_fake",
                    role: "assistant",
                    content: [
                        { type: "text", text: "Here is the brief:" },
                        {
                            type: "tool_use",
                            id: toolUseId,
                            name: "search",
                            input: {},
                        },
                    ],
                },
                parent_tool_use_id: null,
                uuid: "00000000-0000-0000-0000-000000000001",
                session_id: "sess_fake",
            },
            {
                type: "result",
                subtype: "success",
                duration_ms: 1234,
                duration_api_ms: 1000,
                is_error: false,
                num_turns: 1,
                result: briefJson,
                stop_reason: "end_turn",
                total_cost_usd: 0.0042,
                usage: { input_tokens: 100, output_tokens: 50 },
                modelUsage: {},
                permission_denials: [],
                uuid: "00000000-0000-0000-0000-000000000002",
                session_id: "sess_fake",
            },
        ];
        async function* iterate() {
            for (const m of messages) yield m;
        }
        const iterator = iterate();
        // The real Query is an async-iterator-with-extras; we only need
        // [Symbol.asyncIterator].
        return iterator as unknown as ReturnType<typeof import("@anthropic-ai/claude-agent-sdk").query>;
    }) as unknown as typeof import("@anthropic-ai/claude-agent-sdk").query;
}

const VALID_BRIEF = {
    workflow: "tomorrow" as const,
    generatedAt: "2026-05-27T17:00:00.000Z",
    forDate: "2026-05-28",
    startFreshOn: [
        {
            title: "RF-9421: investigate auth flow",
            sourceToolCallId: "toolu_fake_01",
            metrics: [],
        },
    ],
    carryovers: [],
    skipOrNoise: [],
    calendar: [],
    risks: [],
    sources: { "atlassian-mcp": { status: "ok" as const } },
};

describe("runTomorrow (SDK orchestration)", () => {
    let tmp: string;
    let telemetryFile: string;
    beforeEach(() => {
        tmp = mkdtempSync(join(tmpdir(), "tomorrow-"));
        telemetryFile = join(tmp, "telemetry.jsonl");
    });
    afterEach(() => {
        rmSync(tmp, { recursive: true, force: true });
    });

    test("happy path: stream -> validate -> write HTML -> append telemetry", async () => {
        const sdk = fakeSdk(JSON.stringify(VALID_BRIEF));
        const result = await runTomorrow({
            forDate: "2026-05-28",
            sources: ["atlassian-mcp"],
            sdkQuery: sdk,
            outputDir: tmp,
            telemetryFile,
        });

        expect(result.brief.workflow).toBe("tomorrow");
        expect(result.brief.startFreshOn[0]!.title).toBe(
            "RF-9421: investigate auth flow",
        );
        expect(existsSync(result.htmlPath)).toBe(true);
        expect(result.htmlPath).toContain("tomorrow-2026-05-28.html");

        // Telemetry row exists with real cost from the fake result
        const telemetry = readFileSync(telemetryFile, "utf-8")
            .split("\n")
            .filter(Boolean)
            .map((line) => JSON.parse(line));
        expect(telemetry).toHaveLength(1);
        expect(telemetry[0].workflow).toBe("tomorrow");
        expect(telemetry[0].total_cost_usd).toBe(0.0042);
        expect(telemetry[0].prompt_tokens).toBe(100);
        expect(telemetry[0].completion_tokens).toBe(50);
        expect(telemetry[0].sources_succeeded).toContain("atlassian-mcp");
        expect(telemetry[0].error_kind).toBeNull();
    });

    test("dry-run skips file write and telemetry append", async () => {
        const sdk = fakeSdk(JSON.stringify(VALID_BRIEF));
        const result = await runTomorrow({
            forDate: "2026-05-28",
            sources: ["atlassian-mcp"],
            sdkQuery: sdk,
            outputDir: tmp,
            telemetryFile,
            dryRun: true,
        });
        expect(result.htmlPath).toContain(tmp);
        expect(existsSync(result.htmlPath)).toBe(false);
        expect(existsSync(telemetryFile)).toBe(false);
    });

    test("emails through transport when provided", async () => {
        const transport = new InMemoryTransport();
        const sdk = fakeSdk(JSON.stringify(VALID_BRIEF));
        const result = await runTomorrow({
            forDate: "2026-05-28",
            sources: ["atlassian-mcp"],
            sdkQuery: sdk,
            outputDir: tmp,
            telemetryFile,
            transport,
        });
        expect(result.emailed).toBe(true);
        expect(transport.sent).toHaveLength(1);
        expect(transport.sent[0]!.subject).toBe(
            "tomorrow brief — 2026-05-28",
        );
    });

    test("rejects an invented metric via ProvenanceValidator + writes failure telemetry", async () => {
        const inventedBrief = {
            ...VALID_BRIEF,
            startFreshOn: [
                {
                    title: "invented",
                    sourceToolCallId: "toolu_never_seen",
                    metrics: [],
                },
            ],
        };
        const sdk = fakeSdk(JSON.stringify(inventedBrief));
        let caught: unknown;
        try {
            await runTomorrow({
                forDate: "2026-05-28",
                sources: ["atlassian-mcp"],
                sdkQuery: sdk,
                outputDir: tmp,
                telemetryFile,
            });
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(ProvenanceError);
        if (caught instanceof ProvenanceError) {
            expect(caught.missingId).toBe("toolu_never_seen");
        }
        // Failure telemetry row was still appended
        const telemetry = readFileSync(telemetryFile, "utf-8")
            .split("\n")
            .filter(Boolean)
            .map((line) => JSON.parse(line));
        expect(telemetry).toHaveLength(1);
        expect(telemetry[0].error_kind).toBe("ProvenanceError");
    });

    test("fails when SDK stream emits no result message", async () => {
        const sdk = (() => {
            async function* iterate() {
                yield { type: "assistant", message: { content: [] } };
            }
            return iterate() as unknown as ReturnType<
                typeof import("@anthropic-ai/claude-agent-sdk").query
            >;
        }) as unknown as typeof import("@anthropic-ai/claude-agent-sdk").query;
        let caught: unknown;
        try {
            await runTomorrow({
                forDate: "2026-05-28",
                sources: ["atlassian-mcp"],
                sdkQuery: sdk,
                outputDir: tmp,
                telemetryFile,
            });
        } catch (error) {
            caught = error;
        }
        expect((caught as Error).message).toContain(
            "completed without a success result",
        );
        const telemetry = readFileSync(telemetryFile, "utf-8")
            .split("\n")
            .filter(Boolean)
            .map((line) => JSON.parse(line));
        expect(telemetry).toHaveLength(1);
        expect(telemetry[0].error_kind).toBe("Error");
    });

    test("strips markdown fences from the result string", async () => {
        const fenced = "```json\n" + JSON.stringify(VALID_BRIEF) + "\n```";
        const sdk = fakeSdk(fenced);
        const result = await runTomorrow({
            forDate: "2026-05-28",
            sources: ["atlassian-mcp"],
            sdkQuery: sdk,
            outputDir: tmp,
            telemetryFile,
        });
        expect(result.brief.workflow).toBe("tomorrow");
    });
});
