#!/usr/bin/env bun

/**
 * Generate evals/evals.json for every agent in content/agents/.
 * Reads the agent markdown, extracts frontmatter + body sections,
 * and produces context-aware eval cases.
 */

import { existsSync } from "fs";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { basename, join } from "path";

interface EvalCase {
    id: number;
    name: string;
    prompt: string;
    expected_output: string;
    assertions: string[];
}

interface EvalFile {
    agent_name: string;
    evals: EvalCase[];
}

function generateEvals(
    agentName: string,
    frontmatter: Record<string, any>,
    body: string,
): EvalFile {
    const mode = frontmatter.mode || "unknown";
    const hasTools = frontmatter.tools || body.includes("tools");
    const bodySections = body.match(/^##\s+.+$/gm) || [];
    const hasCapabilities =
        body.includes("Capabilities") || body.includes("capabilities");
    const hasPrompt = body.includes("Prompt") || body.includes("prompt");

    const evals: EvalCase[] = [];

    // Eval 1: Role clarity
    evals.push({
        id: 1,
        name: "role-clarity",
        prompt: `What is the ${agentName} agent's role and when should it be used?`,
        expected_output: `A clear description of the agent's purpose, when to invoke it, and what it produces.`,
        assertions: [
            `The output contains the agent's purpose or role`,
            `The output mentions when to use the agent`,
            `The output describes expected deliverables`,
        ],
    });

    // Eval 2: Mode validation
    evals.push({
        id: 2,
        name: "mode-validation",
        prompt: `What mode does the ${agentName} agent operate in?`,
        expected_output: `The agent's mode (subagent, ask, edit, etc.) and what that means for execution.`,
        assertions: [
            `The output mentions mode "${mode}"`,
            `The output explains what the mode means`,
        ],
    });

    // Eval 3: Tools and permissions
    if (hasTools || frontmatter.tools) {
        evals.push({
            id: 3,
            name: "tools-permissions",
            prompt: `What tools can the ${agentName} agent use?`,
            expected_output: `A list of available tools and any restrictions on their use.`,
            assertions: [
                `The output mentions at least one tool`,
                `The output describes tool usage boundaries`,
            ],
        });
    }

    // Eval 4: Prompt quality (for subagent mode)
    if (mode === "subagent" && hasPrompt) {
        evals.push({
            id: 4,
            name: "prompt-quality",
            prompt: `Evaluate the ${agentName} agent's prompt quality`,
            expected_output: `Assessment of whether the prompt is specific, actionable, and produces consistent results.`,
            assertions: [
                `The output mentions prompt specificity`,
                `The output mentions expected behavior consistency`,
            ],
        });
    }

    // Eval 5: Capabilities
    if (hasCapabilities) {
        evals.push({
            id: 5,
            name: "capabilities",
            prompt: `What can the ${agentName} agent do?`,
            expected_output: `A list of capabilities and how they map to tasks.`,
            assertions: [
                `The output lists specific capabilities`,
                `The output maps capabilities to use cases`,
            ],
        });
    }

    // Eval 6: Section completeness
    if (bodySections.length > 0) {
        evals.push({
            id: 6,
            name: "section-completeness",
            prompt: `Does the ${agentName} agent have all required sections?`,
            expected_output: `Verification that the agent markdown includes required sections.`,
            assertions: bodySections
                .slice(0, 3)
                .map(
                    (s) =>
                        `The output mentions section "${s.replace(/^##\s+/, "")}"`,
                ),
        });
    }

    return {
        agent_name: agentName,
        evals,
    };
}

async function main(): Promise<void> {
    const agentsDir = join(import.meta.dir, "..", "content", "agents");
    const entries = await readdir(agentsDir, { withFileTypes: true });
    const agentFiles = entries.filter(
        (e) => e.isFile() && e.name.endsWith(".md"),
    );

    let generated = 0;
    let skipped = 0;

    for (const file of agentFiles) {
        const agentName = basename(file.name, ".md");
        const agentPath = join(agentsDir, file.name);
        const content = await readFile(agentPath, "utf-8");

        // Parse frontmatter
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        const frontmatter: Record<string, any> = {};
        if (fmMatch) {
            const lines = fmMatch[1].split("\n");
            for (const line of lines) {
                const [key, ...rest] = line.split(":");
                if (key && rest.length > 0) {
                    frontmatter[key.trim()] = rest.join(":").trim();
                }
            }
        }

        const body = content.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

        const evalsDir = join(
            agentsDir,
            "..",
            "..",
            "evals",
            "agents",
            agentName,
        );
        const evalsPath = join(evalsDir, "evals.json");

        if (existsSync(evalsPath)) {
            skipped++;
            continue;
        }

        const evals = generateEvals(agentName, frontmatter, body);

        await mkdir(evalsDir, { recursive: true });
        await writeFile(evalsPath, JSON.stringify(evals, null, 2) + "\n");
        generated++;
    }

    console.log(`Agent evals: ${generated} generated, ${skipped} skipped`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
