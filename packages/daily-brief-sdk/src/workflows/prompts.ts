/**
 * Workflow prompt builders. Pure functions: take run-time inputs (date,
 * source list, free-text user nudge) and return the assembled prompt
 * string. The prompt-snapshot tests in tests/prompts/ lock the wording
 * of these functions so accidental drift fails CI.
 */

import type { WorkflowName } from "../shared/paths.js";

export interface BasePromptInputs {
    forDate: string; // YYYY-MM-DD
    sources: string[]; // ordered list of MCPs the workflow has access to
    userNudge?: string; // optional free-text guidance
}

const PROVENANCE_RULE =
    "Every numeric metric you cite MUST include a sourceToolCallId field that references the tool_use id from your actual tool calls. Briefs whose metrics cite unknown ids will be rejected by the ProvenanceValidator.";

const BANNED_INVENTION =
    "Do NOT invent metrics, ticket counts, or commit shas. If a number isn't in a tool result, omit it.";

const SECRETS_RULE =
    "Do NOT include credentials, API tokens, or anything matching SMTP_PASS/ATLASSIAN_API_TOKEN/BITBUCKET_API_TOKEN/GRAFANA_API_TOKEN substrings in any field of the output.";

export function buildTomorrowPrompt(inputs: BasePromptInputs): string {
    const sources = inputs.sources.length > 0 ? inputs.sources.join(", ") : "(none)";
    const nudge = inputs.userNudge ? `\nUser guidance: ${inputs.userNudge}` : "";
    return [
        "You are the Tomorrow workflow of daily-brief-sdk.",
        `Build a brief for date ${inputs.forDate}.`,
        `Sources available: ${sources}.`,
        "",
        "Sections to populate:",
        "- startFreshOn (max 3): tickets/PRs to begin tomorrow with",
        "- carryovers (max 5): in-flight items to continue",
        "- skipOrNoise: items the user can ignore",
        "- calendar: tomorrow's events (only if calendar source is configured)",
        "- risks: explicit hazards for tomorrow",
        "- sources: status footer for each MCP attempted",
        "",
        PROVENANCE_RULE,
        BANNED_INVENTION,
        SECRETS_RULE,
        nudge,
    ].join("\n");
}

export function buildMorningPrompt(inputs: BasePromptInputs): string {
    const sources = inputs.sources.length > 0 ? inputs.sources.join(", ") : "(none)";
    const nudge = inputs.userNudge ? `\nUser guidance: ${inputs.userNudge}` : "";
    return [
        "You are the Morning workflow of daily-brief-sdk.",
        `Build a brief for date ${inputs.forDate}.`,
        `Sources available: ${sources}.`,
        "",
        "Focus on overnight changes:",
        "- new commits, comments, or PR updates since 5pm yesterday",
        "- tickets that changed state",
        "- failed CI runs that need attention",
        "",
        PROVENANCE_RULE,
        BANNED_INVENTION,
        SECRETS_RULE,
        nudge,
    ].join("\n");
}

export function buildWeekAheadPrompt(inputs: BasePromptInputs): string {
    const sources = inputs.sources.length > 0 ? inputs.sources.join(", ") : "(none)";
    const nudge = inputs.userNudge ? `\nUser guidance: ${inputs.userNudge}` : "";
    return [
        "You are the Week-Ahead workflow of daily-brief-sdk.",
        `Build a brief projecting the upcoming week starting ${inputs.forDate}.`,
        `Sources available: ${sources}.`,
        "",
        "Focus on:",
        "- sprint state and planned epics for the week",
        "- meeting load and conflicts",
        "- carryover risks from this week",
        "",
        PROVENANCE_RULE,
        BANNED_INVENTION,
        SECRETS_RULE,
        nudge,
    ].join("\n");
}

export function buildDreamDigestPrompt(inputs: BasePromptInputs): string {
    const nudge = inputs.userNudge ? `\nUser guidance: ${inputs.userNudge}` : "";
    return [
        "You are the Dream-Digest workflow of daily-brief-sdk.",
        `Build a weekly digest for the week ending ${inputs.forDate}.`,
        "",
        "Read every .md file under ~/.claude/projects/<id>/memory/ READ-ONLY.",
        "Identify cross-session patterns: recurring frictions, repeated user",
        "corrections, project-spanning preferences. A pattern requires",
        "supporting citations from at least 2 different memory files.",
        "",
        "OUTPUT TARGET: ~/.claude/cook-and-brief/dream-digest/. NEVER write",
        "to ~/.claude/projects/<id>/memory/ — that's auto-memory and",
        "speculative synthesis would poison future sessions.",
        "",
        PROVENANCE_RULE,
        BANNED_INVENTION,
        SECRETS_RULE,
        nudge,
    ].join("\n");
}

export const PROMPT_BUILDERS: Record<WorkflowName, (inputs: BasePromptInputs) => string> = {
    tomorrow: buildTomorrowPrompt,
    morning: buildMorningPrompt,
    "week-ahead": buildWeekAheadPrompt,
    "dream-digest": buildDreamDigestPrompt,
};
