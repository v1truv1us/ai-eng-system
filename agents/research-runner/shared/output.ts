import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";

export interface TemplateResult {
    id: string;
    name: string;
    text: string;
}

function getVaultPath(): string {
    const envPath = process.env.VAULT_PATH?.trim();
    if (envPath) return envPath;
    throw new Error(
        "VAULT_PATH is not set. Set it to your Obsidian vault directory, " +
            "e.g. export VAULT_PATH=~/Documents/Obsidian",
    );
}

function callClaudeCli(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        const child = spawn(
            "claude",
            [
                "-p",
                "--output-format",
                "json",
                "--model",
                "claude-opus-4-7",
                "--no-session-persistence",
                "--tools",
                "",
            ],
            { stdio: ["pipe", "pipe", "pipe"] },
        );
        child.stdin.end(prompt);
        child.stdout.on("data", (c: Buffer) => {
            stdout += c.toString();
        });
        child.stderr.on("data", (c: Buffer) => {
            stderr += c.toString();
        });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                const data = JSON.parse(stdout) as Record<string, unknown>;
                resolve(typeof data.result === "string" ? data.result : "");
            } else {
                reject(new Error(`claude CLI error: ${stderr.trim()}`));
            }
        });
    });
}

export async function synthesize(
    query: string,
    results: TemplateResult[],
): Promise<string> {
    const prompt =
        `Research analyses on: "${query}"\n\n` +
        results.map((r) => `## ${r.id}\n${r.text}`).join("\n\n") +
        "\n\nWrite a 2–3 paragraph unified brief: surface the key insights, " +
        "note any gaps or contradictions, and highlight the most actionable findings.";

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (apiKey) {
        const client = new Anthropic({ apiKey });
        const resp = await client.messages.create({
            model: "claude-opus-4-7",
            max_tokens: 512,
            messages: [{ role: "user", content: prompt }],
        });
        return resp.content[0].type === "text" ? resp.content[0].text : "";
    }
    return callClaudeCli(prompt);
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

export function writeBrief(
    query: string,
    results: TemplateResult[],
    variant: string,
    synthesis?: string,
): string {
    const date = todayISO();
    const vaultPath = getVaultPath();
    const briefPath = join(vaultPath, "wiki/briefs", `${date}.md`);

    const sections = results
        .map((r) => `## ${r.id} — ${r.name}\n\n${r.text}`)
        .join("\n\n---\n\n");

    const synthesisSection =
        synthesis && synthesis.trim()
            ? `\n\n---\n\n## Key Takeaways\n\n${synthesis}`
            : "";

    const runBlock =
        `# Research Brief: ${query}\n` +
        `**Date:** ${date}  **Runner:** ${variant}\n\n` +
        `${sections}${synthesisSection}\n\n` +
        `---\n\n` +
        `## Limitations\n\n` +
        `- Templates run with raw query injection; brackets not pre-filled\n` +
        `- FACT/LIKELY tiers are AI-reported, not independently verified\n` +
        `- No cross-template verification pass performed\n`;

    if (existsSync(briefPath)) {
        const existing = readFileSync(briefPath, "utf-8");
        writeFileSync(briefPath, `${existing}\n\n---\n\n${runBlock}`, "utf-8");
    } else {
        writeFileSync(briefPath, runBlock, "utf-8");
    }

    return briefPath;
}
