import { describe, expect, test } from "bun:test";
import {
    BriefItemSchema,
    TomorrowBriefSchema,
} from "../src/shared/brief-schema.js";

describe("brief-schema", () => {
    test("accepts a hand-crafted minimal valid brief", () => {
        const valid = {
            workflow: "tomorrow" as const,
            generatedAt: "2026-05-26T17:00:00.000Z",
            forDate: "2026-05-27",
            startFreshOn: [
                {
                    title: "RF-9421: investigate auth flow",
                    sourceToolCallId: "toolu_01abc",
                    metrics: [],
                },
            ],
            carryovers: [],
            skipOrNoise: [],
            calendar: [],
            risks: [],
            sources: { "atlassian-mcp": { status: "ok" as const } },
        };
        const result = TomorrowBriefSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    test("rejects a brief item missing sourceToolCallId", () => {
        const item = {
            title: "no source id",
            metrics: [],
        };
        const result = BriefItemSchema.safeParse(item);
        expect(result.success).toBe(false);
        if (!result.success) {
            const message = result.error.issues
                .map((i) => i.path.join(".") + ":" + i.message)
                .join("|");
            expect(message).toContain("sourceToolCallId");
        }
    });

    test("rejects a brief item with empty sourceToolCallId", () => {
        const item = {
            title: "empty",
            sourceToolCallId: "",
            metrics: [],
        };
        const result = BriefItemSchema.safeParse(item);
        expect(result.success).toBe(false);
    });

    test("rejects a metric without sourceToolCallId", () => {
        const item = {
            title: "x",
            sourceToolCallId: "toolu_x",
            metrics: [
                { value: 42 } as unknown as {
                    value: number;
                    sourceToolCallId: string;
                },
            ],
        };
        const result = BriefItemSchema.safeParse(item);
        expect(result.success).toBe(false);
    });

    test("rejects forDate that isn't YYYY-MM-DD", () => {
        const brief = {
            workflow: "tomorrow" as const,
            generatedAt: "2026-05-26T17:00:00.000Z",
            forDate: "tomorrow",
            startFreshOn: [],
            carryovers: [],
            skipOrNoise: [],
            calendar: [],
            risks: [],
            sources: {},
        };
        const result = TomorrowBriefSchema.safeParse(brief);
        expect(result.success).toBe(false);
    });

    test("rejects more than 3 items in startFreshOn", () => {
        const item = {
            title: "x",
            sourceToolCallId: "t",
            metrics: [],
        };
        const brief = {
            workflow: "tomorrow" as const,
            generatedAt: "2026-05-26T17:00:00.000Z",
            forDate: "2026-05-27",
            startFreshOn: [item, item, item, item],
            carryovers: [],
            skipOrNoise: [],
            calendar: [],
            risks: [],
            sources: {},
        };
        const result = TomorrowBriefSchema.safeParse(brief);
        expect(result.success).toBe(false);
    });
});
