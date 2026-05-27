import { describe, expect, test } from "bun:test";
import type { Driver } from "./drivers/types.js";
import { parseArgs } from "./parse.js";
import { mapLimit } from "./pool.js";
import { formatPrompt } from "./prompt.js";

describe("runner integration patterns", () => {
    test("research runner pattern: mapLimit enforces concurrency <= 3", async () => {
        let maxConcurrent = 0;
        let current = 0;

        const fakeDriver: Driver = {
            async runPrompt(prompt: string) {
                current++;
                if (current > maxConcurrent) maxConcurrent = current;
                await new Promise((r) => setTimeout(r, 10));
                current--;
                return `result for ${prompt.slice(0, 20)}`;
            },
        };

        const templates = Array.from({ length: 9 }, (_, i) => ({
            id: `T${i}`,
            name: `Template ${i}`,
            text: `query ${i}`,
        }));

        await mapLimit(templates, 3, async (t) => {
            const prompt = formatPrompt("system", t.text, "query");
            return { id: t.id, text: await fakeDriver.runPrompt(prompt) };
        });

        expect(maxConcurrent).toBeLessThanOrEqual(3);
    });

    test("seo runner pattern: single prompt, no templates", async () => {
        const fakeDriver: Driver = {
            async runPrompt(prompt: string) {
                return `# SEO Review\n\nAnalyzed: ${prompt.includes("https://example.com") ? "yes" : "no"}`;
            },
        };

        const url = "https://example.com";
        const prompt = `Review ${url} for SEO issues.`;
        const report = await fakeDriver.runPrompt(prompt);

        expect(report).toContain("SEO Review");
        expect(report).toContain("yes");
    });

    test("parseArgs + formatPrompt integration", () => {
        const argv = [
            "--templates",
            "A1,M2",
            "--agent",
            "reviewer",
            "my query",
        ];
        const { positionals, flags } = parseArgs(argv, [
            "--templates",
            "--agent",
        ]);

        const query = positionals.join(" ").trim();
        const agent = flags["--agent"] as string | undefined;
        const templateFilter = ((flags["--templates"] as string) ?? "")
            .split(",")
            .filter(Boolean);

        expect(query).toBe("my query");
        expect(agent).toBe("reviewer");
        expect(templateFilter).toEqual(["A1", "M2"]);

        const prompt = formatPrompt(
            "You are a researcher.",
            "Find X.",
            query,
            agent,
        );
        expect(prompt).toContain("my query");
        expect(prompt).toContain("reviewer");
    });
});
