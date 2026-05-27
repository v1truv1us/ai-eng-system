import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
    McpContractError,
    parseAtlassianTicket,
    parseBitbucketCommit,
    parseGrafanaAlert,
    MCP_TOOL_PARSERS,
} from "../../src/shared/brief-mcp.js";

const FIXTURE_DIR = join(import.meta.dirname, "fixtures");

function loadFixture(name: string): {
    tool: string;
    results: unknown[];
} {
    const raw = readFileSync(join(FIXTURE_DIR, name), "utf-8");
    return JSON.parse(raw);
}

describe("MCP contract tests", () => {
    describe("Atlassian", () => {
        test("parses recorded fixture into AtlassianTicketResult", () => {
            const { results } = loadFixture("atlassian.json");
            const tickets = results.map(parseAtlassianTicket);
            expect(tickets).toHaveLength(2);
            expect(tickets[0]!.key).toBe("RF-9421");
            expect(tickets[0]!.status).toBe("In Progress");
            expect(tickets[1]!.assignee).toBeNull();
        });

        test("rejects raw missing the `key` field", () => {
            let caught: unknown;
            try {
                parseAtlassianTicket({
                    summary: "x",
                    status: "Open",
                    updated: "2026-05-26T00:00:00Z",
                    url: "https://x",
                });
            } catch (error) {
                caught = error;
            }
            expect(caught).toBeInstanceOf(McpContractError);
            if (caught instanceof McpContractError) {
                expect(caught.missingFields).toContain("key");
            }
        });

        test("rejects null input", () => {
            expect(() => parseAtlassianTicket(null)).toThrow(McpContractError);
        });
    });

    describe("Bitbucket", () => {
        test("parses recorded fixture into BitbucketCommitResult", () => {
            const { results } = loadFixture("bitbucket.json");
            const commits = results.map(parseBitbucketCommit);
            expect(commits).toHaveLength(2);
            expect(commits[0]!.short).toBe("abc123d");
            expect(commits[0]!.repo).toBe("rainfocus/platform-api");
        });

        test("rejects raw missing the `sha` field", () => {
            expect(() =>
                parseBitbucketCommit({
                    short: "abc",
                    author: "x",
                    date: "2026-05-26T00:00:00Z",
                    subject: "y",
                    repo: "r",
                }),
            ).toThrow(McpContractError);
        });
    });

    describe("Grafana", () => {
        test("parses recorded fixture into GrafanaAlertResult", () => {
            const { results } = loadFixture("grafana.json");
            const alerts = results.map(parseGrafanaAlert);
            expect(alerts).toHaveLength(2);
            expect(alerts[0]!.state).toBe("ok");
            expect(alerts[1]!.state).toBe("alerting");
        });

        test("rejects raw missing the `state` field", () => {
            expect(() =>
                parseGrafanaAlert({ name: "x", folder: "y" }),
            ).toThrow(McpContractError);
        });
    });

    describe("MCP_TOOL_PARSERS dispatch table", () => {
        test("registers all three parsers under their tool names", () => {
            expect(MCP_TOOL_PARSERS["atlassian.searchTickets"]).toBe(
                parseAtlassianTicket,
            );
            expect(MCP_TOOL_PARSERS["bitbucket.recentCommits"]).toBe(
                parseBitbucketCommit,
            );
            expect(MCP_TOOL_PARSERS["grafana.alerts"]).toBe(parseGrafanaAlert);
        });
    });
});
