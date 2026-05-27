/**
 * MCP server tool-call type contracts. The MCP contract tests in
 * tests/mcp/ lock the shape of the responses we expect from each tool.
 * Recording fixtures once + replaying them in tests gives us a hard
 * failure if the MCP shape changes upstream — better than silently
 * corrupting briefs.
 *
 * The actual MCP client is wired in B5; this file ships only the
 * type contract + a parser that converts a captured tool result into
 * the typed shape.
 */

export interface AtlassianTicketResult {
    key: string; // e.g. "RF-9421"
    summary: string;
    status: string; // "Open" | "In Progress" | "Done" | etc.
    assignee: string | null;
    updated: string; // ISO-8601
    url: string;
}

export interface BitbucketCommitResult {
    sha: string;
    short: string;
    author: string;
    date: string;
    subject: string;
    repo: string;
}

export interface GrafanaAlertResult {
    name: string;
    state: "ok" | "alerting" | "no_data" | "pending";
    folder: string;
    summary?: string;
}

export class McpContractError extends Error {
    constructor(
        message: string,
        public readonly tool: string,
        public readonly missingFields: string[],
    ) {
        super(message);
        this.name = "McpContractError";
    }
}

function requireFields<T>(
    raw: unknown,
    tool: string,
    fields: ReadonlyArray<keyof T>,
): T {
    if (typeof raw !== "object" || raw === null) {
        throw new McpContractError(
            `${tool}: expected object, got ${typeof raw}`,
            tool,
            fields.map((f) => String(f)),
        );
    }
    const missing: string[] = [];
    for (const field of fields) {
        if (!(field in raw)) missing.push(String(field));
    }
    if (missing.length > 0) {
        throw new McpContractError(
            `${tool}: missing required fields: ${missing.join(", ")}`,
            tool,
            missing,
        );
    }
    return raw as T;
}

export function parseAtlassianTicket(raw: unknown): AtlassianTicketResult {
    return requireFields<AtlassianTicketResult>(raw, "atlassian.searchTickets", [
        "key",
        "summary",
        "status",
        "updated",
        "url",
    ]);
}

export function parseBitbucketCommit(raw: unknown): BitbucketCommitResult {
    return requireFields<BitbucketCommitResult>(raw, "bitbucket.recentCommits", [
        "sha",
        "short",
        "author",
        "date",
        "subject",
        "repo",
    ]);
}

export function parseGrafanaAlert(raw: unknown): GrafanaAlertResult {
    return requireFields<GrafanaAlertResult>(raw, "grafana.alerts", [
        "name",
        "state",
        "folder",
    ]);
}

export const MCP_TOOL_PARSERS = {
    "atlassian.searchTickets": parseAtlassianTicket,
    "bitbucket.recentCommits": parseBitbucketCommit,
    "grafana.alerts": parseGrafanaAlert,
} as const;
