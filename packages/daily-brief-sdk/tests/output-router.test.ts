import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TomorrowBrief } from "../src/shared/brief-schema.js";
import { InMemoryTransport } from "../src/shared/email.js";
import { routeBrief } from "../src/shared/output-router.js";

function fixtureBrief(): TomorrowBrief {
    return {
        workflow: "tomorrow",
        generatedAt: "2026-05-26T17:00:00.000Z",
        forDate: "2026-05-27",
        startFreshOn: [
            { title: "RF-9421: auth", sourceToolCallId: "toolu_01", metrics: [] },
        ],
        carryovers: [],
        skipOrNoise: [],
        calendar: [],
        risks: [],
        sources: { "atlassian-mcp": { status: "ok" } },
    };
}

describe("output-router", () => {
    let tmp: string;
    beforeEach(() => {
        tmp = mkdtempSync(join(tmpdir(), "brief-out-"));
    });
    afterEach(() => {
        rmSync(tmp, { recursive: true, force: true });
    });

    test("renders to HTML and writes to disk", async () => {
        const result = await routeBrief({
            workflow: "tomorrow",
            brief: fixtureBrief(),
            outputDir: tmp,
        });
        expect(result.htmlPath).toContain(tmp);
        expect(result.emailed).toBe(false);
        const content = readFileSync(result.htmlPath, "utf-8");
        expect(content).toContain("<!doctype html>");
        expect(content).toContain("Tomorrow — 2026-05-27");
        expect(content).toContain("RF-9421: auth");
    });

    test("dry-run does not write files", async () => {
        const result = await routeBrief({
            workflow: "tomorrow",
            brief: fixtureBrief(),
            outputDir: tmp,
            dryRun: true,
        });
        expect(result.htmlPath).toContain(tmp);
        expect(result.emailed).toBe(false);
        expect(() => readFileSync(result.htmlPath, "utf-8")).toThrow();
    });

    test("sends email via transport when provided", async () => {
        const transport = new InMemoryTransport();
        const result = await routeBrief({
            workflow: "tomorrow",
            brief: fixtureBrief(),
            transport,
            outputDir: tmp,
        });
        expect(result.emailed).toBe(true);
        expect(transport.sent).toHaveLength(1);
        const msg = transport.sent[0]!;
        expect(msg.subject).toBe("tomorrow brief — 2026-05-27");
        expect(msg.html).toContain("RF-9421: auth");
    });

    test("output filename pattern is workflow-YYYY-MM-DD.html", async () => {
        const result = await routeBrief({
            workflow: "tomorrow",
            brief: fixtureBrief(),
            outputDir: tmp,
        });
        expect(result.htmlPath).toContain("tomorrow-2026-05-27.html");
    });
});
