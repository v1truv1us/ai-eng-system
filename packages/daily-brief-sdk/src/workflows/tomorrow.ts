/**
 * Tomorrow workflow. Pulls open Jira tickets + recent commits via MCP,
 * asks Claude to assemble a TomorrowBrief, validates provenance and
 * schema, writes HTML, optionally emails.
 *
 * For B2-live runs (real Atlassian MCP, real SMTP), pass mcpServers via
 * the workflow input. For dry-run smoke tests with no MCP, pass
 * `mcpServers: {}` and the agent will produce an empty brief that still
 * exercises the full pipeline.
 */

import {
    query,
    type Options as SdkOptions,
} from "@anthropic-ai/claude-agent-sdk";
import { AnyBriefSchema, type TomorrowBrief } from "../shared/brief-schema.js";
import type { EmailTransport } from "../shared/email.js";
import { routeBrief } from "../shared/output-router.js";
import {
    ProvenanceError,
    ProvenanceValidator,
} from "../shared/provenance-validator.js";
import { assertNoSecretLeak } from "../shared/secrets.js";
import {
    appendTelemetry,
    failureRow,
    type TelemetryRow,
} from "../shared/telemetry.js";
import { buildTomorrowPrompt } from "./prompts.js";

export interface TomorrowWorkflowInput {
    forDate: string;
    sources: string[];
    mcpServers?: SdkOptions["mcpServers"];
    transport?: EmailTransport;
    dryRun?: boolean;
    /** Override telemetry target (used by tests). */
    telemetryFile?: string;
    /** Override the output dir (used by tests). */
    outputDir?: string;
    /** Test seam: inject a mock query() that returns a finite stream. */
    sdkQuery?: typeof query;
    /** Optional user nudge passed through to the prompt. */
    userNudge?: string;
}

export interface TomorrowWorkflowResult {
    brief: TomorrowBrief;
    htmlPath: string;
    emailed: boolean;
    telemetry: TelemetryRow;
}

const STRUCTURED_OUTPUT_HINT = `

Return ONLY a JSON object matching this exact shape (no prose, no markdown fences):

{
  "workflow": "tomorrow",
  "generatedAt": "<ISO-8601 datetime>",
  "forDate": "<YYYY-MM-DD>",
  "startFreshOn": [
    { "title": "<string>", "url": "<optional url>", "why": "<optional>", "sourceToolCallId": "<tool_use id>", "metrics": [] }
  ],
  "carryovers": [/* same shape as items, max 5 */],
  "skipOrNoise": [/* same shape as items */],
  "calendar": [
    { "title": "<string>", "start": "<datetime>", "end": "<datetime>", "sourceToolCallId": "<tool_use id>" }
  ],
  "risks": [
    { "title": "<string>", "severity": "low" | "medium" | "high", "sourceToolCallId": "<tool_use id>" }
  ],
  "sources": {
    "<source-name>": { "status": "ok" | "degraded" | "unavailable", "note": "<optional>" }
  }
}

CRITICAL:
- "sources" is an OBJECT keyed by source name, NOT an array.
- Empty arrays are fine for any list (carryovers, calendar, risks, skipOrNoise).
- If you have no tool_use IDs to cite (e.g. no MCP servers configured), return empty arrays for the item lists rather than fabricating sourceToolCallId values.
- Begin your response with \`{\` and end with \`}\`.
`;

function extractFinalJson(result: string): unknown {
    const trimmed = result.trim();
    // Strip optional markdown fence.
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    const candidate = fenced ? fenced[1]! : trimmed;
    return JSON.parse(candidate);
}

export async function runTomorrow(
    input: TomorrowWorkflowInput,
): Promise<TomorrowWorkflowResult> {
    const startedAt = new Date();
    const validator = new ProvenanceValidator();
    const sdk = input.sdkQuery ?? query;

    const sourcesSucceeded: string[] = [];
    const sourcesFailed: string[] = [];

    let resultText = "";
    let totalCostUsd = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let durationMs = 0;

    try {
        const stream = sdk({
            prompt:
                buildTomorrowPrompt({
                    forDate: input.forDate,
                    sources: input.sources,
                    userNudge: input.userNudge,
                }) + STRUCTURED_OUTPUT_HINT,
            options: {
                mcpServers: input.mcpServers ?? {},
                tools: input.mcpServers
                    ? undefined
                    : { type: "preset", preset: "claude_code" },
                permissionMode: "bypassPermissions",
            } as SdkOptions,
        });

        for await (const message of stream) {
            validator.observe(message);
            if (
                typeof message === "object" &&
                message !== null &&
                "type" in message &&
                (message as { type: string }).type === "result"
            ) {
                const r = message as {
                    subtype?: string;
                    result?: string;
                    total_cost_usd?: number;
                    usage?: {
                        input_tokens?: number;
                        output_tokens?: number;
                    };
                    duration_ms?: number;
                };
                if (r.subtype === "success" && typeof r.result === "string") {
                    resultText = r.result;
                    totalCostUsd = r.total_cost_usd ?? 0;
                    promptTokens = r.usage?.input_tokens ?? 0;
                    completionTokens = r.usage?.output_tokens ?? 0;
                    durationMs = r.duration_ms ?? 0;
                }
            }
        }

        if (resultText === "") {
            throw new Error(
                "Tomorrow workflow: SDK stream completed without a success result.",
            );
        }

        let raw: unknown;
        try {
            raw = extractFinalJson(resultText);
        } catch (parseError) {
            const preview = resultText.slice(0, 500);
            throw new Error(
                `Tomorrow workflow: SDK result was not valid JSON. ${
                    parseError instanceof Error ? parseError.message : ""
                }\n--- result preview (first 500 chars) ---\n${preview}`,
            );
        }
        // If the response is missing the workflow discriminator, inject it.
        // The agent is encouraged to include it via the prompt, but a Sonnet
        // run sometimes returns the right shape without the literal field.
        if (typeof raw === "object" && raw !== null && !("workflow" in raw)) {
            (raw as { workflow: string }).workflow = "tomorrow";
        }
        const parsed = AnyBriefSchema.parse(raw);
        if (parsed.workflow !== "tomorrow") {
            throw new Error(
                `Tomorrow workflow: expected workflow="tomorrow", got "${parsed.workflow}".`,
            );
        }
        validator.assertProvenance(parsed);

        // Belt-and-braces: scan the rendered brief for secret leaks BEFORE
        // we hand it to the output router. The router itself doesn't see
        // process.env at this stage; if the agent leaked a secret into a
        // field, this catches it.
        assertNoSecretLeak(JSON.stringify(parsed), "tomorrow.brief.json");

        const route = await routeBrief({
            workflow: "tomorrow",
            brief: parsed,
            transport: input.transport,
            dryRun: input.dryRun,
            outputDir: input.outputDir,
        });

        sourcesSucceeded.push(...Object.keys(parsed.sources));

        const telemetry: TelemetryRow = {
            workflow: "tomorrow",
            started_at: startedAt.toISOString(),
            duration_ms: durationMs || Date.now() - startedAt.getTime(),
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_cost_usd: totalCostUsd,
            sources_succeeded: sourcesSucceeded,
            sources_failed: sourcesFailed,
            error_kind: null,
        };

        if (!input.dryRun) {
            appendTelemetry(telemetry, input.telemetryFile);
        }

        return {
            brief: parsed,
            htmlPath: route.htmlPath,
            emailed: route.emailed,
            telemetry,
        };
    } catch (error) {
        const row = failureRow(
            {
                workflow: "tomorrow",
                started_at: startedAt.toISOString(),
                prompt_tokens: promptTokens,
                completion_tokens: completionTokens,
                total_cost_usd: totalCostUsd,
                startedAt,
                sourcesSucceeded,
                sourcesFailed,
            },
            error,
        );
        if (!input.dryRun) {
            appendTelemetry(row, input.telemetryFile);
        }
        // Propagate ProvenanceError + others so the caller sees what failed.
        if (error instanceof ProvenanceError) throw error;
        throw error;
    }
}
