import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface QueryTemplate {
    id: string;
    name: string;
    text: string;
}

export interface ResearchData {
    systemPrompt: string;
    templates: QueryTemplate[];
}

const VAULT_PATH =
    process.env.VAULT_PATH ??
    join(
        homedir(),
        "Library/CloudStorage/ProtonDrive-john.ferguson@unfergettabledesigns.com-folder/Obsidian",
    );

const RUNNER_MD = join(VAULT_PATH, "wiki/research-runner.md");

export function loadTemplates(): ResearchData {
    let content: string;
    try {
        content = readFileSync(RUNNER_MD, "utf-8");
    } catch {
        throw new Error(
            `Cannot read research-runner.md at ${RUNNER_MD}. Set VAULT_PATH env var if your vault is elsewhere.`,
        );
    }

    const systemPromptMatch = content.match(
        /## SYSTEM PROMPT[^\n]*\n+```\n([\s\S]+?)\n```/,
    );
    if (!systemPromptMatch) {
        throw new Error(
            "Could not parse system prompt from research-runner.md",
        );
    }
    const systemPrompt = systemPromptMatch[1].trim();

    // Each template: ### A1 — Name\n\n```\n...template text...\n```
    const templatePattern = /### ([A-Z]\d) — ([^\n]+)\n\n```\n([\s\S]+?)\n```/g;
    const templates: QueryTemplate[] = Array.from(
        content.matchAll(templatePattern),
        (m) => ({ id: m[1], name: m[2].trim(), text: m[3].trim() }),
    );

    if (templates.length === 0) {
        throw new Error(
            "No templates found in research-runner.md — check the file format.",
        );
    }

    return { systemPrompt, templates };
}
