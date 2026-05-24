#!/usr/bin/env bun
/**
 * Import Cursor official plugins into canonical skills/ with dedup merges.
 * Source: tmp/cursor-import (clone of https://github.com/cursor/plugins)
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMPORT_ROOT = join(ROOT, "tmp", "cursor-import");
const SKILLS_DIR = join(ROOT, "skills");
const ATTRIBUTION_PATH = join(ROOT, "docs", "attribution", "cursor-plugins.md");
const CURSOR_PLUGINS_RAW =
    "https://raw.githubusercontent.com/cursor/plugins/main";

/** skill name -> canonical merge target (relative to skills/) */
const MERGE_INTO: Record<string, string> = {
    deslop: "text-cleanup",
    "verify-this": "verification-loop",
    "fix-ci": "ci-cd-and-automation",
    "loop-on-ci": "ci-cd-and-automation",
    "review-and-ship": "shipping-and-launch",
    "thermo-nuclear-code-quality-review": "code-review-and-quality",
    "ralph-loop": "workflow/ralph-wiggum",
    "ralph-loop-help": "workflow/ralph-wiggum",
    "cancel-ralph": "workflow/ralph-wiggum",
    "continual-learning": "continuous-learning-v2",
    "create-plugin-scaffold": "plugin-dev",
    "review-plugin-submission": "plugin-dev",
};

/** Skip duplicate plugin copies when already imported from team-kit */
const SKIP_IF_EXISTS = new Set(["pr-review-canvas"]);

/** Namespace imported skills under skills/<prefix>/ (avoids top-level collisions). */
const PLUGIN_SKILL_PREFIX: Record<string, string> = {
    pstack: "pstack",
};

const PLUGINS = [
    "cursor-team-kit",
    "continual-learning",
    "create-plugin",
    "agent-compatibility",
    "cli-for-agent",
    "pr-review-canvas",
    "docs-canvas",
    "cursor-sdk",
    "orchestrate",
    "ralph-loop",
    "teaching",
    "pstack",
];

type ParsedSkill = {
    name: string;
    description: string;
    meta: Record<string, unknown>;
    body: string;
};

function parseSkill(content: string, filePath: string): ParsedSkill {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
        throw new Error(`Missing frontmatter: ${filePath}`);
    }
    const [, raw, body] = match;
    let meta: Record<string, unknown> = {};
    try {
        meta = (YAML.parse(raw) ?? {}) as Record<string, unknown>;
    } catch {
        const nameMatch = raw.match(/^name:\s*(.+)$/m);
        const descMatch = raw.match(/^description:\s*(.+)$/m);
        if (!nameMatch || !descMatch) {
            throw new Error(`Invalid frontmatter: ${filePath}`);
        }
        meta = {
            name: nameMatch[1].trim().replace(/^["']|["']$/g, ""),
            description: descMatch[1].trim().replace(/^["']|["']$/g, ""),
        };
    }
    const name = String(meta.name ?? basename(dirname(filePath)));
    const description = String(meta.description ?? "").trim();
    if (!description) {
        throw new Error(`Missing description: ${filePath}`);
    }
    return { name, description, meta, body: body.trimStart() };
}

function serializeSkill(
    name: string,
    description: string,
    body: string,
    plugin: string,
): string {
    const safeDescription = description.replace(/\s+/g, " ").trim();
    const meta = {
        name,
        description: safeDescription,
        version: "1.0.0",
        tags: ["cursor-import", plugin],
    };
    return `---\n${YAML.stringify(meta).trimEnd()}\n---\n\n${body.trim()}\n`;
}

async function findSkillFiles(dir: string): Promise<string[]> {
    if (!existsSync(dir)) return [];
    const { readdir } = await import("node:fs/promises");
    const out: string[] = [];

    async function walk(current: string): Promise<void> {
        const entries = await readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            const full = join(current, entry.name);
            if (entry.isDirectory()) {
                await walk(full);
            } else if (entry.name === "SKILL.md") {
                out.push(full);
            }
        }
    }

    await walk(dir);
    return out;
}

async function mergeIntoTarget(
    targetRel: string,
    plugin: string,
    skillName: string,
    body: string,
): Promise<void> {
    const targetPath = join(SKILLS_DIR, targetRel, "SKILL.md");
    if (!existsSync(targetPath)) {
        throw new Error(`Merge target missing: ${targetPath}`);
    }
    const existing = await readFile(targetPath, "utf-8");
    const marker = `## Imported from ${plugin}/${skillName}`;
    if (existing.includes(marker)) {
        return;
    }
    const section = `\n\n${marker} (MIT, cursor/plugins)\n\n${body.trim()}\n`;
    await writeFile(targetPath, `${existing.trimEnd()}${section}\n`);
}

async function importSkillFile(
    srcPath: string,
    plugin: string,
): Promise<{ action: "imported" | "merged" | "skipped"; name: string }> {
    const content = await readFile(srcPath, "utf-8");
    const parsed = parseSkill(content, srcPath);
    const skillDirName = basename(dirname(srcPath));

    if (MERGE_INTO[parsed.name]) {
        await mergeIntoTarget(
            MERGE_INTO[parsed.name],
            plugin,
            parsed.name,
            parsed.body,
        );
        return { action: "merged", name: parsed.name };
    }

    if (SKIP_IF_EXISTS.has(parsed.name)) {
        const dest = join(SKILLS_DIR, parsed.name, "SKILL.md");
        if (existsSync(dest)) {
            return { action: "skipped", name: parsed.name };
        }
    }

    const prefix = PLUGIN_SKILL_PREFIX[plugin];
    const finalDir = prefix
        ? join(SKILLS_DIR, prefix, parsed.name)
        : join(SKILLS_DIR, parsed.name);
    const finalPath = join(finalDir, "SKILL.md");

    if (existsSync(finalPath)) {
        const existing = await readFile(finalPath, "utf-8");
        if (
            existing.includes("cursor-import") &&
            existing.includes(plugin)
        ) {
            return { action: "skipped", name: parsed.name };
        }
    }

    const safeDescription =
        parsed.description.length > 1024
            ? `${parsed.description.slice(0, 1021)}...`
            : parsed.description;

    await mkdir(finalDir, { recursive: true });
    await writeFile(
        finalPath,
        serializeSkill(parsed.name, safeDescription, parsed.body, plugin),
    );
    return { action: "imported", name: parsed.name };
}

async function ensureImportClone(): Promise<void> {
    if (existsSync(join(IMPORT_ROOT, ".git"))) return;

    await mkdir(dirname(IMPORT_ROOT), { recursive: true });
    if (existsSync(IMPORT_ROOT)) {
        await rm(IMPORT_ROOT, { recursive: true, force: true });
    }

    const result = spawnSync(
        "git",
        [
            "clone",
            "--depth",
            "1",
            "https://github.com/cursor/plugins.git",
            IMPORT_ROOT,
        ],
        { stdio: "inherit" },
    );
    if (result.status !== 0) {
        throw new Error(
            "Failed to clone cursor/plugins into tmp/cursor-import",
        );
    }
}

/**
 * Fetch SKILL.md files from GitHub when local clone is stale or missing a plugin (e.g. pstack).
 */
async function fetchPluginSkillFilesFromGitHub(
    plugin: string,
): Promise<string[]> {
    const apiUrl = `https://api.github.com/repos/cursor/plugins/contents/${plugin}/skills?ref=main`;
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) return [];

    const entries = (await response.json()) as Array<{
        name: string;
        type: string;
    }>;
    const skillFiles: string[] = [];

    for (const entry of entries) {
        if (entry.type !== "dir") continue;
        const skillUrl = `${CURSOR_PLUGINS_RAW}/${plugin}/skills/${entry.name}/SKILL.md`;
        const skillResponse = await fetch(skillUrl, {
            signal: AbortSignal.timeout(30_000),
        });
        if (!skillResponse.ok) continue;

        const content = await skillResponse.text();
        const cachePath = join(
            IMPORT_ROOT,
            plugin,
            "skills",
            entry.name,
            "SKILL.md",
        );
        await mkdir(dirname(cachePath), { recursive: true });
        await writeFile(cachePath, content);
        skillFiles.push(cachePath);
    }

    return skillFiles;
}

async function writeAttribution(
    results: Array<{ plugin: string; imported: string[]; merged: string[]; skipped: string[] }>,
): Promise<void> {
    await mkdir(dirname(ATTRIBUTION_PATH), { recursive: true });
    let sha = "unknown";
    try {
        sha = (
            await readFile(join(IMPORT_ROOT, ".git", "HEAD"), "utf-8")
        ).trim();
    } catch {
        // ignore
    }

    const lines = [
        "# Cursor Plugins Attribution",
        "",
        "Imported from [cursor/plugins](https://github.com/cursor/plugins) (MIT License).",
        "",
        `Import source clone: \`tmp/cursor-import\` (ref: ${sha})`,
        "",
        "## Import log",
        "",
    ];

    for (const r of results) {
        lines.push(`### ${r.plugin}`);
        lines.push("");
        if (r.imported.length) {
            lines.push(`- **Imported:** ${r.imported.join(", ")}`);
        }
        if (r.merged.length) {
            lines.push(`- **Merged into existing:** ${r.merged.join(", ")}`);
        }
        if (r.skipped.length) {
            lines.push(`- **Skipped (duplicate):** ${r.skipped.join(", ")}`);
        }
        lines.push("");
    }

    await writeFile(ATTRIBUTION_PATH, `${lines.join("\n")}\n`);
}

async function main(): Promise<void> {
    await ensureImportClone();

    const results: Array<{
        plugin: string;
        imported: string[];
        merged: string[];
        skipped: string[];
    }> = [];

    for (const plugin of PLUGINS) {
        const skillsRoot = join(IMPORT_ROOT, plugin, "skills");
        let skillFiles = await findSkillFiles(skillsRoot);
        if (skillFiles.length === 0) {
            skillFiles = await fetchPluginSkillFilesFromGitHub(plugin);
        }
        const imported: string[] = [];
        const merged: string[] = [];
        const skipped: string[] = [];

        for (const fp of skillFiles) {
            const result = await importSkillFile(fp, plugin);
            if (result.action === "imported") imported.push(result.name);
            else if (result.action === "merged") merged.push(result.name);
            else skipped.push(result.name);
        }

        results.push({ plugin, imported, merged, skipped });
        console.log(
            `${plugin}: +${imported.length} merged=${merged.length} skipped=${skipped.length}`,
        );
    }

    await writeAttribution(results);
    console.log(`\nAttribution written to ${relative(ROOT, ATTRIBUTION_PATH)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
