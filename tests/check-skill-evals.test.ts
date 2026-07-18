import { describe, expect, it } from "bun:test";
import { validateEvalDocument } from "../scripts/check-skill-evals.ts";

function validDocument(): Record<string, unknown> {
    return {
        skill_name: "example-skill",
        evals: [
            {
                id: 1,
                name: "representative-task",
                prompt: "Apply the skill to a representative task.",
                expected_output: "A result that follows the skill workflow.",
                assertions: [
                    "The result follows the documented workflow",
                    "The result includes actionable evidence",
                ],
            },
        ],
    };
}

describe("skill eval proof validation", () => {
    it("accepts a complete eval document", () => {
        expect(validateEvalDocument(validDocument(), "example-skill")).toEqual(
            [],
        );
    });

    it("rejects an empty proof stub", () => {
        expect(validateEvalDocument({}, "example-skill")).toEqual([
            "skill_name must equal 'example-skill'",
            "evals must be a non-empty array",
        ]);
    });

    it("rejects proof attributed to another skill", () => {
        const document = validDocument();
        document.skill_name = "other-skill";

        expect(validateEvalDocument(document, "example-skill")).toContain(
            "skill_name must equal 'example-skill'",
        );
    });

    it("rejects incomplete evaluation records", () => {
        const document = validDocument();
        document.evals = [
            {
                id: 1,
                name: "",
                prompt: "A prompt",
                assertions: [],
            },
        ];

        const errors = validateEvalDocument(document, "example-skill");

        expect(errors).toContain("evals[0].name must be a non-empty string");
        expect(errors).toContain(
            "evals[0].expected_output must be a non-empty string",
        );
        expect(errors).toContain(
            "evals[0].assertions must be a non-empty string array",
        );
    });

    it("rejects duplicate evaluation IDs", () => {
        const document = validDocument();
        const evaluation = (
            document.evals as Array<Record<string, unknown>>
        )[0];
        document.evals = [evaluation, { ...evaluation }];

        expect(validateEvalDocument(document, "example-skill")).toContain(
            "evals[1].id duplicates '1'",
        );
    });
});
