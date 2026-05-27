import { describe, expect, test } from "bun:test";
import {
    ProvenanceError,
    ProvenanceValidator,
} from "../src/shared/provenance-validator.js";

describe("ProvenanceValidator", () => {
    test("captures tool_use ids from a typical SDK message stream", () => {
        const validator = new ProvenanceValidator();
        const stream = [
            {
                type: "assistant",
                content: [{ type: "tool_use", id: "toolu_01" }],
            },
            {
                type: "assistant",
                content: [
                    { type: "text", text: "thinking..." },
                    { type: "tool_use", id: "toolu_02", name: "search" },
                ],
            },
            {
                type: "user",
                content: [{ type: "tool_result", tool_use_id: "toolu_01" }],
            },
        ];
        for (const msg of stream) validator.observe(msg);
        expect(validator.observedCount).toBe(2);
        expect(validator.observedIds.has("toolu_01")).toBe(true);
        expect(validator.observedIds.has("toolu_02")).toBe(true);
    });

    test("accepts a brief whose every sourceToolCallId is in the captured set", () => {
        const validator = new ProvenanceValidator();
        validator.observe({
            type: "assistant",
            content: [{ type: "tool_use", id: "toolu_a" }],
        });
        validator.observe({
            type: "assistant",
            content: [{ type: "tool_use", id: "toolu_b" }],
        });
        const brief = {
            startFreshOn: [{ title: "x", sourceToolCallId: "toolu_a" }],
            carryovers: [{ title: "y", sourceToolCallId: "toolu_b" }],
        };
        expect(() => validator.assertProvenance(brief)).not.toThrow();
    });

    test("throws ProvenanceError when brief cites an unknown tool_use id", () => {
        const validator = new ProvenanceValidator();
        validator.observe({
            type: "assistant",
            content: [
                { type: "tool_use", id: "toolu_01" },
                { type: "tool_use", id: "toolu_02" },
            ],
        });
        const brief = {
            startFreshOn: [
                { title: "valid", sourceToolCallId: "toolu_01" },
                { title: "invented", sourceToolCallId: "toolu_99" },
            ],
        };
        let caught: unknown;
        try {
            validator.assertProvenance(brief);
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(ProvenanceError);
        if (caught instanceof ProvenanceError) {
            expect(caught.missingId).toBe("toolu_99");
            expect(caught.capturedIds.has("toolu_01")).toBe(true);
            expect(caught.capturedIds.has("toolu_02")).toBe(true);
        }
    });

    test("walks nested metric objects too", () => {
        const validator = new ProvenanceValidator();
        validator.observe({
            type: "assistant",
            content: [{ type: "tool_use", id: "toolu_metric" }],
        });
        const brief = {
            startFreshOn: [
                {
                    title: "x",
                    sourceToolCallId: "toolu_metric",
                    metrics: [
                        { value: 42, sourceToolCallId: "toolu_metric" },
                        { value: 7, sourceToolCallId: "toolu_invented" },
                    ],
                },
            ],
        };
        let caught: unknown;
        try {
            validator.assertProvenance(brief);
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(ProvenanceError);
        if (caught instanceof ProvenanceError) {
            expect(caught.missingId).toBe("toolu_invented");
        }
    });

    test("ignores tool_result entries (only tool_use is captured)", () => {
        const validator = new ProvenanceValidator();
        validator.observe({
            type: "user",
            content: [
                { type: "tool_result", tool_use_id: "toolu_result_only" },
            ],
        });
        expect(validator.observedCount).toBe(0);
    });

    test("handles empty streams gracefully", () => {
        const validator = new ProvenanceValidator();
        const brief = {
            startFreshOn: [{ title: "x", sourceToolCallId: "toolu_unseen" }],
        };
        expect(() => validator.assertProvenance(brief)).toThrow(
            ProvenanceError,
        );
    });

    test("accepts a brief with no sourceToolCallId fields at all", () => {
        const validator = new ProvenanceValidator();
        const brief = { sources: { foo: { status: "ok" } } };
        expect(() => validator.assertProvenance(brief)).not.toThrow();
    });
});
