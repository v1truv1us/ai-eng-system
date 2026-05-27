import { describe, expect, test } from "bun:test";
import {
    buildDreamDigestPrompt,
    buildMorningPrompt,
    buildTomorrowPrompt,
    buildWeekAheadPrompt,
} from "../../src/workflows/prompts.js";

/**
 * Prompt snapshot tests. The exact wording of each workflow's prompt
 * matters — small drifts ("plan tomorrow morning" vs "plan next workday")
 * silently degrade brief quality and never fail schema validation.
 *
 * These tests pin the prompt text. When you change a prompt on purpose,
 * update the snapshot here in the same commit so the diff is visible
 * in review. If a test fails unexpectedly, the prompt drifted without
 * intent.
 */

const FIXED_INPUTS = {
    forDate: "2026-05-27",
    sources: ["atlassian-mcp", "bitbucket-mcp"],
};

describe("prompt snapshots", () => {
    test("tomorrow prompt", () => {
        const prompt = buildTomorrowPrompt(FIXED_INPUTS);
        expect(prompt).toBe(
            [
                "You are the Tomorrow workflow of daily-brief-sdk.",
                "Build a brief for date 2026-05-27.",
                "Sources available: atlassian-mcp, bitbucket-mcp.",
                "",
                "Sections to populate:",
                "- startFreshOn (max 3): tickets/PRs to begin tomorrow with",
                "- carryovers (max 5): in-flight items to continue",
                "- skipOrNoise: items the user can ignore",
                "- calendar: tomorrow's events (only if calendar source is configured)",
                "- risks: explicit hazards for tomorrow",
                "- sources: status footer for each MCP attempted",
                "",
                "Every numeric metric you cite MUST include a sourceToolCallId field that references the tool_use id from your actual tool calls. Briefs whose metrics cite unknown ids will be rejected by the ProvenanceValidator.",
                "Do NOT invent metrics, ticket counts, or commit shas. If a number isn't in a tool result, omit it.",
                "Do NOT include credentials, API tokens, or anything matching SMTP_PASS/ATLASSIAN_API_TOKEN/BITBUCKET_API_TOKEN/GRAFANA_API_TOKEN substrings in any field of the output.",
                "",
            ].join("\n"),
        );
    });

    test("morning prompt", () => {
        const prompt = buildMorningPrompt(FIXED_INPUTS);
        expect(prompt).toContain("You are the Morning workflow");
        expect(prompt).toContain("Focus on overnight changes:");
        expect(prompt).toContain(
            "- new commits, comments, or PR updates since 5pm yesterday",
        );
        expect(prompt).toContain("Build a brief for date 2026-05-27.");
        expect(prompt).toContain(
            "Sources available: atlassian-mcp, bitbucket-mcp.",
        );
    });

    test("week-ahead prompt", () => {
        const prompt = buildWeekAheadPrompt(FIXED_INPUTS);
        expect(prompt).toContain("You are the Week-Ahead workflow");
        expect(prompt).toContain("upcoming week starting 2026-05-27");
        expect(prompt).toContain(
            "- sprint state and planned epics for the week",
        );
    });

    test("dream-digest prompt", () => {
        const prompt = buildDreamDigestPrompt({
            forDate: "2026-05-27",
            sources: [],
        });
        expect(prompt).toContain("You are the Dream-Digest workflow");
        expect(prompt).toContain(
            "OUTPUT TARGET: ~/.claude/cook-and-brief/dream-digest/",
        );
        expect(prompt).toContain(
            "NEVER write\nto ~/.claude/projects/<id>/memory/",
        );
    });

    test("all prompts include the provenance rule", () => {
        const inputs = { forDate: "2026-05-27", sources: ["atlassian-mcp"] };
        const prompts = [
            buildTomorrowPrompt(inputs),
            buildMorningPrompt(inputs),
            buildWeekAheadPrompt(inputs),
            buildDreamDigestPrompt(inputs),
        ];
        for (const prompt of prompts) {
            expect(prompt).toContain("sourceToolCallId");
            expect(prompt).toContain("ProvenanceValidator");
        }
    });

    test("all prompts include the no-invention rule", () => {
        const inputs = { forDate: "2026-05-27", sources: ["atlassian-mcp"] };
        const prompts = [
            buildTomorrowPrompt(inputs),
            buildMorningPrompt(inputs),
            buildWeekAheadPrompt(inputs),
            buildDreamDigestPrompt(inputs),
        ];
        for (const prompt of prompts) {
            expect(prompt).toContain("Do NOT invent metrics");
        }
    });

    test("all prompts include the secrets rule", () => {
        const inputs = { forDate: "2026-05-27", sources: ["atlassian-mcp"] };
        const prompts = [
            buildTomorrowPrompt(inputs),
            buildMorningPrompt(inputs),
            buildWeekAheadPrompt(inputs),
            buildDreamDigestPrompt(inputs),
        ];
        for (const prompt of prompts) {
            expect(prompt).toContain("SMTP_PASS");
            expect(prompt).toContain("ATLASSIAN_API_TOKEN");
        }
    });

    test("user nudge is appended when provided", () => {
        const prompt = buildTomorrowPrompt({
            ...FIXED_INPUTS,
            userNudge: "Focus on RF-9421 first.",
        });
        expect(prompt).toContain("User guidance: Focus on RF-9421 first.");
    });

    test("empty source list renders as (none)", () => {
        const prompt = buildTomorrowPrompt({
            forDate: "2026-05-27",
            sources: [],
        });
        expect(prompt).toContain("Sources available: (none).");
    });
});
