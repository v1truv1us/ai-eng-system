import { describe, expect, test } from "bun:test";
import { formatPrompt, formatSinglePrompt } from "./prompt.js";

describe("formatPrompt", () => {
    test("builds full prompt with agent instruction", () => {
        const result = formatPrompt(
            "You are a researcher.",
            "Find X.",
            "What is X?",
            "Be thorough",
        );
        expect(result).toContain("You are a researcher.");
        expect(result).toContain("Agent instruction: Be thorough");
        expect(result).toContain("Find X.");
        expect(result).toContain("Query context: What is X?");
    });

    test("builds prompt without agent instruction", () => {
        const result = formatPrompt(
            "You are a researcher.",
            "Find X.",
            "What is X?",
        );
        expect(result).not.toContain("Agent instruction");
        expect(result).toContain("You are a researcher.");
        expect(result).toContain("Find X.");
        expect(result).toContain("Query context: What is X?");
    });
});

describe("formatSinglePrompt", () => {
    test("appends agent instruction when provided", () => {
        const result = formatSinglePrompt("Review this URL.", "technical-seo");
        expect(result).toContain("Review this URL.");
        expect(result).toContain("Agent instruction: technical-seo");
    });

    test("returns base prompt without agent", () => {
        const result = formatSinglePrompt("Review this URL.");
        expect(result).toBe("Review this URL.");
    });
});
