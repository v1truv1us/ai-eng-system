#!/usr/bin/env bun

/**
 * Import Cursor official plugins into canonical skills/ and content/agents/
 * with dedup merges. Source: tmp/cursor-import (clone of cursor/plugins).
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMPORT_ROOT = join(ROOT, "tmp", "cursor-import");
const SKILLS_DIR = join(ROOT, "skills");
const AGENTS_DIR = join(ROOT, "content", "agents");
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
    "continual-learning": "continuous-learning",
    "create-plugin-scaffold": "plugin-dev",
    "review-plugin-submission": "plugin-dev",
};

/** agent name -> canonical merge target (basename without .md under content/agents/) */
const AGENT_MERGE_INTO: Record<string, string> = {
    "thermo-nuclear-code-quality-review": "code-reviewer",
    "plugin-architect": "plugin-validator",
};

/** Replace upstream references when merging agent bodies into ai-eng targets */
const AGENT_BODY_REPLACEMENTS: Record<string, Array<[string, string]>> = {
    "thermo-nuclear-code-quality-review": [
        [
            "Load the `thermo-nuclear-code-quality-review` skill (shipped in the cursor-team-kit plugin)",
            "Load the `code-review-and-quality` skill (thermo-nuclear rubric is in the imported section)",
        ],
        [
            "If that skill is not available, fall back to a harsh maintainability audit aligned with that skill's intent",
            "If that skill is not available, fall back to a harsh maintainability audit aligned with the thermo-nuclear imported section",
        ],
    ],
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

type ParsedMarkdown = {
    name: string;
    description: string;
    meta: Record<string, unknown>;
    body: string;
};

function parseFrontmatterDoc(
    content: string,
    filePath: string,
): ParsedMarkdown {
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

const parseSkill = parseFrontmatterDoc;
const parseAgent = parseFrontmatterDoc;

function inferAgentCategory(name: string, plugin: string): string {
    if (name === "ci-watcher" || name === "agents-memory-updater") {
        return "operations";
    }
    if (
        name.endsWith("-review") ||
        name.includes("compatibility") ||
        name === "thermo-nuclear-code-quality-review"
    ) {
        return "quality-testing";
    }
    if (plugin === "create-plugin" || name === "plugin-architect") {
        return "meta";
    }
    if (plugin === "pstack" || name === "poteto-agent") {
        return "development";
    }
    return "general";
}

function defaultAgentTools(
    meta: Record<string, unknown>,
    name: string,
): Record<string, boolean> {
    const readonly = meta.readonly === true;
    const needsShell =
        name === "ci-watcher" ||
        name.endsWith("-review") ||
        name.includes("compatibility");

    if (readonly && !needsShell) {
        return {
            read: true,
            grep: true,
            glob: true,
            list: true,
            bash: false,
            write: false,
            edit: false,
        };
    }

    return {
        read: true,
        grep: true,
        glob: true,
        list: true,
        bash: needsShell,
        write: false,
        edit: false,
    };
}

function adaptAgentBody(name: string, body: string): string {
    let adapted = body;
    if (name === "poteto-agent") {
        adapted = adapted.replaceAll(
            "`poteto-mode` skill's `SKILL.md`",
            "`pstack/poteto-mode` skill's `SKILL.md`",
        );
    }
    for (const [from, to] of AGENT_BODY_REPLACEMENTS[name] ?? []) {
        adapted = adapted.replaceAll(from, to);
    }
    return adapted;
}

function serializeAgent(
    name: string,
    description: string,
    body: string,
    plugin: string,
    sourceMeta: Record<string, unknown>,
): string {
    const safeDescription = description.replace(/\s+/g, " ").trim();
    const meta: Record<string, unknown> = {
        name,
        description: safeDescription,
        mode: "subagent",
        category: inferAgentCategory(name, plugin),
        tags: ["cursor-import", plugin],
        tools: defaultAgentTools(sourceMeta, name),
    };
    if (sourceMeta.model) meta.model = sourceMeta.model;
    if (sourceMeta.is_background === true) meta.is_background = true;
    if (sourceMeta.readonly === true) meta.readonly = true;

    return `---\n${YAML.stringify(meta).trimEnd()}\n---\n\n${adaptAgentBody(name, body).trim()}\n`;
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

/** Markers in canonical files indicating native integration (used to detect legacy append imports). */
const MERGE_NATIVE_SECTION: Record<string, string> = {
    deslop: "### Branch diff cleanup (code slop)",
    "verify-this": "### Step 2: Verify",
    "fix-ci": "## CI failure iteration",
    "loop-on-ci": "## CI failure iteration",
    "review-and-ship": "### 1. Review the change",
    "thermo-nuclear-code-quality-review": "## Review modes",
    "continual-learning": "## Workspace memory (AGENTS.md)",
    "ralph-loop-help": "remove `.cursor/ralph/scratchpad.md`",
    "cancel-ralph": "remove `.cursor/ralph/scratchpad.md`",
    "review-plugin-submission": "## Lifecycle workflows",
    "create-plugin-scaffold": "## Lifecycle workflows",
    "plugin-architect": "## Lifecycle workflows",
    "thermo-nuclear-code-quality-review-agent":
        "## Strict maintainability mode (subagent)",
};

async function mergeSkillIntoTarget(
    targetRel: string,
    _plugin: string,
    skillName: string,
    _body: string,
): Promise<void> {
    const targetPath = join(SKILLS_DIR, targetRel, "SKILL.md");
    if (!existsSync(targetPath)) {
        throw new Error(`Merge target missing: ${targetPath}`);
    }
    // MERGE_INTO skills are woven into canonical targets by hand — never append on re-import.
    console.log(
        `  merge ${skillName} → skills/${targetRel} (native integration; no append)`,
    );
}

async function importSkillFile(
    srcPath: string,
    plugin: string,
): Promise<{ action: "imported" | "merged" | "skipped"; name: string }> {
    const content = await readFile(srcPath, "utf-8");
    const parsed = parseSkill(content, srcPath);
    const skillDirName = basename(dirname(srcPath));

    if (MERGE_INTO[parsed.name]) {
        await mergeSkillIntoTarget(
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
        if (existing.includes("cursor-import") && existing.includes(plugin)) {
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

async function findAgentFiles(dir: string): Promise<string[]> {
    if (!existsSync(dir)) return [];
    const { readdir } = await import("node:fs/promises");
    const out: string[] = [];

    for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
        out.push(join(dir, entry.name));
    }

    return out;
}

async function mergeAgentIntoTarget(
    targetName: string,
    _plugin: string,
    agentName: string,
    _body: string,
): Promise<void> {
    const targetPath = join(AGENTS_DIR, `${targetName}.md`);
    if (!existsSync(targetPath)) {
        throw new Error(`Agent merge target missing: ${targetPath}`);
    }
    console.log(
        `  merge ${agentName} → content/agents/${targetName}.md (native integration; no append)`,
    );
}

async function importAgentFile(
    srcPath: string,
    plugin: string,
): Promise<{ action: "imported" | "merged" | "skipped"; name: string }> {
    const content = await readFile(srcPath, "utf-8");
    const parsed = parseAgent(content, srcPath);
    const fileBaseName = basename(srcPath, ".md");

    if (AGENT_MERGE_INTO[parsed.name]) {
        await mergeAgentIntoTarget(
            AGENT_MERGE_INTO[parsed.name],
            plugin,
            parsed.name,
            parsed.body,
        );
        return { action: "merged", name: parsed.name };
    }

    const destPath = join(AGENTS_DIR, `${parsed.name}.md`);
    if (existsSync(destPath)) {
        const existing = await readFile(destPath, "utf-8");
        if (
            existing.includes("cursor-import") &&
            existing.includes(plugin) &&
            existing.includes(`name: ${parsed.name}`)
        ) {
            return { action: "skipped", name: parsed.name };
        }
    }

    await mkdir(AGENTS_DIR, { recursive: true });
    await writeFile(
        destPath,
        serializeAgent(
            parsed.name,
            parsed.description,
            parsed.body,
            plugin,
            parsed.meta,
        ),
    );
    void fileBaseName;
    return { action: "imported", name: parsed.name };
}

async function fetchPluginAgentFilesFromGitHub(
    plugin: string,
): Promise<string[]> {
    const apiUrl = `https://api.github.com/repos/cursor/plugins/contents/${plugin}/agents?ref=main`;
    const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return [];

    const entries = (await response.json()) as Array<{
        name: string;
        type: string;
    }>;
    const agentFiles: string[] = [];

    for (const entry of entries) {
        if (entry.type !== "file" || !entry.name.endsWith(".md")) continue;
        const agentUrl = `${CURSOR_PLUGINS_RAW}/${plugin}/agents/${entry.name}`;
        const agentResponse = await fetch(agentUrl, {
            signal: AbortSignal.timeout(30_000),
        });
        if (!agentResponse.ok) continue;

        const content = await agentResponse.text();
        const cachePath = join(IMPORT_ROOT, plugin, "agents", entry.name);
        await mkdir(dirname(cachePath), { recursive: true });
        await writeFile(cachePath, content);
        agentFiles.push(cachePath);
    }

    return agentFiles;
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
    const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(30_000),
    });
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

type ImportResult = {
    plugin: string;
    skills: { imported: string[]; merged: string[]; skipped: string[] };
    agents: { imported: string[]; merged: string[]; skipped: string[] };
};

async function writeAttribution(results: ImportResult[]): Promise<void> {
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
        lines.push("**Skills**");
        if (r.skills.imported.length) {
            lines.push(`- **Imported:** ${r.skills.imported.join(", ")}`);
        }
        if (r.skills.merged.length) {
            lines.push(
                `- **Merged into existing:** ${r.skills.merged.join(", ")}`,
            );
        }
        if (r.skills.skipped.length) {
            lines.push(
                `- **Skipped (duplicate):** ${r.skills.skipped.join(", ")}`,
            );
        }
        if (
            !r.skills.imported.length &&
            !r.skills.merged.length &&
            !r.skills.skipped.length
        ) {
            lines.push("- (none)");
        }
        lines.push("");
        lines.push("**Agents**");
        if (r.agents.imported.length) {
            lines.push(`- **Imported:** ${r.agents.imported.join(", ")}`);
        }
        if (r.agents.merged.length) {
            lines.push(
                `- **Merged into existing:** ${r.agents.merged.join(", ")}`,
            );
        }
        if (r.agents.skipped.length) {
            lines.push(
                `- **Skipped (duplicate):** ${r.agents.skipped.join(", ")}`,
            );
        }
        if (
            !r.agents.imported.length &&
            !r.agents.merged.length &&
            !r.agents.skipped.length
        ) {
            lines.push("- (none)");
        }
        lines.push("");
    }

    await writeFile(ATTRIBUTION_PATH, `${lines.join("\n")}\n`);
}

async function main(): Promise<void> {
    await ensureImportClone();

    const results: ImportResult[] = [];

    for (const plugin of PLUGINS) {
        const skillsRoot = join(IMPORT_ROOT, plugin, "skills");
        let skillFiles = await findSkillFiles(skillsRoot);
        if (skillFiles.length === 0) {
            skillFiles = await fetchPluginSkillFilesFromGitHub(plugin);
        }
        const skillImported: string[] = [];
        const skillMerged: string[] = [];
        const skillSkipped: string[] = [];

        for (const fp of skillFiles) {
            const result = await importSkillFile(fp, plugin);
            if (result.action === "imported") skillImported.push(result.name);
            else if (result.action === "merged") skillMerged.push(result.name);
            else skillSkipped.push(result.name);
        }

        const agentsRoot = join(IMPORT_ROOT, plugin, "agents");
        let agentFiles = await findAgentFiles(agentsRoot);
        if (agentFiles.length === 0) {
            agentFiles = await fetchPluginAgentFilesFromGitHub(plugin);
        }
        const agentImported: string[] = [];
        const agentMerged: string[] = [];
        const agentSkipped: string[] = [];

        for (const fp of agentFiles) {
            const result = await importAgentFile(fp, plugin);
            if (result.action === "imported") agentImported.push(result.name);
            else if (result.action === "merged") agentMerged.push(result.name);
            else agentSkipped.push(result.name);
        }

        results.push({
            plugin,
            skills: {
                imported: skillImported,
                merged: skillMerged,
                skipped: skillSkipped,
            },
            agents: {
                imported: agentImported,
                merged: agentMerged,
                skipped: agentSkipped,
            },
        });
        console.log(
            `${plugin}: skills +${skillImported.length} merged=${skillMerged.length} skipped=${skillSkipped.length}; agents +${agentImported.length} merged=${agentMerged.length} skipped=${agentSkipped.length}`,
        );
    }

    await writeAttribution(results);
    console.log(`\nAttribution written to ${relative(ROOT, ATTRIBUTION_PATH)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
