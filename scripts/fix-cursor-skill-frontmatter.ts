#!/usr/bin/env bun
/** Re-normalize frontmatter for all cursor-import skills */

import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");

async function findSkillFiles(dir: string): Promise<string[]> {
    const out: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...(await findSkillFiles(full)));
        } else if (entry.name === "SKILL.md") {
            out.push(full);
        }
    }
    return out;
}

function extractBody(content: string): string {
    const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    return match ? match[1].trimStart() : content;
}

async function main(): Promise<void> {
    const files = await findSkillFiles(SKILLS_DIR);
    let fixed = 0;

    for (const fp of files) {
        const content = await readFile(fp, "utf-8");
        if (!content.includes("cursor-import")) continue;

        let meta: Record<string, unknown> | null = null;
        try {
            const match = content.match(/^---\n([\s\S]*?)\n---\n/);
            if (match) meta = (YAML.parse(match[1]) ?? {}) as Record<string, unknown>;
        } catch {
            meta = null;
        }

        const name = String(meta?.name ?? basename(dirname(fp)));
        let description = String(meta?.description ?? "").replace(/\s+/g, " ").trim();
        if (!description) {
            const raw = content.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
            const descMatch = raw.match(/^description:\s*"?([\s\S]*?)"?\s*(?:\n[a-z_-]+:|$)/m);
            description = (descMatch?.[1] ?? "").replace(/\s+/g, " ").trim();
        }

        const pluginTag = Array.isArray(meta?.tags)
            ? (meta.tags as string[]).find((t) => t !== "cursor-import")
            : undefined;

        const body = extractBody(content);
        const next = `---\n${YAML.stringify({
            name,
            description,
            version: "1.0.0",
            tags: ["cursor-import", pluginTag ?? "unknown"],
        }).trimEnd()}\n---\n\n${body.trim()}\n`;

        if (next !== content) {
            await writeFile(fp, next);
            fixed++;
            console.log(`fixed ${fp}`);
        }
    }

    console.log(`Done. Fixed ${fixed} skills.`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
