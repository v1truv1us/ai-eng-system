#!/usr/bin/env bun
"use strict";
/// <reference types="bun-types" />
/**
 * Build script for ai-eng-system
 *
 * Canonical sources:
 * - content/commands/*.md
 * - content/agents/*.md
 * - skills/<skill-pack>/SKILL.md
 * - .claude/hooks/          (Claude Code prompt optimization hooks)
 * - .opencode/opencode.jsonc + .opencode/plugin/ai-eng-system.ts (optional)
 * - src/opencode-tool-prompt-optimize.ts (OpenCode prompt optimization tool)
 * - src/prompt-optimization/* (shared prompt optimization library)
 *
 * Derived outputs:
 * - dist/.claude-plugin/   (for CI validation + tests)
 * - dist/.opencode/        (for OpenCode installs)
 * - dist/prompt-optimization/ (shared library for npm package consumers)
 * - dist/skills/           (shared skill packs)
 * - .claude/               (local development runtime)
 * - .claude-plugin/        (local development runtime)
 * - .opencode/             (local development runtime)
 * - plugins/ai-eng-system/ (marketplace source)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const yaml_1 = require("yaml");
const ROOT = process.env.TEST_ROOT ?? (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
const CONTENT_DIR = (0, node_path_1.join)(ROOT, "content");
const SKILLS_DIR = (0, node_path_1.join)(ROOT, "skills");
const PROMPT_OPT_DIR = (0, node_path_1.join)(ROOT, "src", "prompt-optimization");
const DIST_DIR = (0, node_path_1.join)(ROOT, "dist");
const CLAUDE_DIR = (0, node_path_1.join)(DIST_DIR, ".claude-plugin");
const DIST_OPENCODE_DIR = (0, node_path_1.join)(DIST_DIR, ".opencode");
const ROOT_OPENCODE_DIR = (0, node_path_1.join)(ROOT, ".opencode");
const ROOT_CLAUDE_DIR = (0, node_path_1.join)(ROOT, ".claude");
const ROOT_CLAUDE_PLUGIN_DIR = (0, node_path_1.join)(ROOT, ".claude-plugin");
const MARKETPLACE_PLUGIN_DIR = (0, node_path_1.join)(ROOT, "plugins", "ai-eng-system");
const NAMESPACE_PREFIX = "ai-eng";
// Valid OpenCode permission keys
// Reference: https://opencode.ai/docs/permissions
const VALID_OPENCODE_PERMISSION_KEYS = [
    "edit",
    "bash",
    "webfetch",
    "doom_loop",
    "external_directory",
];
// Named color to hex color mapping for OpenCode compatibility
// OpenCode requires hex format: ^#[0-9a-fA-F]{6}$
const NAMED_COLOR_TO_HEX = {
    cyan: "#00FFFF",
    blue: "#0000FF",
    green: "#00FF00",
    yellow: "#FFFF00",
    magenta: "#FF00FF",
    red: "#FF0000",
    orange: "#FFA500",
    purple: "#800080",
    pink: "#FFC0CB",
    lime: "#00FF00",
    olive: "#808000",
    maroon: "#800000",
    navy: "#000080",
    teal: "#008080",
    aqua: "#00FFFF",
    silver: "#C0C0C0",
    gray: "#808080",
    black: "#000000",
    white: "#FFFFFF",
};
// Skill name validation (from OpenCode docs: https://opencode.ai/docs/skills)
const SKILL_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SKILL_NAME_MIN_LENGTH = 1;
const SKILL_NAME_MAX_LENGTH = 64;
function sanitizePathSegment(segment) {
    const s = String(segment ?? "").trim();
    if (!s)
        return "general";
    return s
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}
async function ensureDirForFile(filePath) {
    await (0, promises_1.mkdir)((0, node_path_1.dirname)(filePath), { recursive: true });
}
async function getMarkdownFiles(dir) {
    const files = [];
    if (!(0, node_fs_1.existsSync)(dir))
        return files;
    const entries = await (0, promises_1.readdir)(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = (0, node_path_1.join)(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules to prevent infinite recursion
            if (entry.name === "node_modules" || entry.name === ".git") {
                continue;
            }
            files.push(...(await getMarkdownFiles(fullPath)));
        }
        else if (entry.isFile() && entry.name.endsWith(".md")) {
            files.push(fullPath);
        }
    }
    return files;
}
function parseFrontmatterStrict(markdown, filePathForErrors) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match)
        return { meta: {}, body: markdown, hasFrontmatter: false };
    const [, raw, body] = match;
    try {
        const meta = (yaml_1.default.parse(raw) ?? {});
        return { meta, body, hasFrontmatter: true };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Invalid YAML frontmatter in ${filePathForErrors}: ${message}`);
    }
}
function serializeFrontmatter(meta) {
    return yaml_1.default.stringify(meta).trimEnd();
}
/**
 * Validate skill name matches OpenCode requirements
 * https://opencode.ai/docs/skills#validate-names
 */
function validateSkillName(name, filePath) {
    if (name.length < SKILL_NAME_MIN_LENGTH ||
        name.length > SKILL_NAME_MAX_LENGTH) {
        throw new Error(`Skill name '${name}' must be ${SKILL_NAME_MIN_LENGTH}-${SKILL_NAME_MAX_LENGTH} characters: ${filePath}`);
    }
    if (!SKILL_NAME_REGEX.test(name)) {
        throw new Error(`Skill name '${name}' must be lowercase alphanumeric with single hyphens (regex: ${SKILL_NAME_REGEX}): ${filePath}`);
    }
}
/**
 * Discover all skills in the skills directory recursively
 * Returns skill info including validated names and paths
 */
async function discoverSkills(skillsRoot) {
    const skills = [];
    async function findSkillFiles(dir) {
        const files = [];
        if (!(0, node_fs_1.existsSync)(dir))
            return files;
        const entries = await (0, promises_1.readdir)(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = (0, node_path_1.join)(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await findSkillFiles(fullPath)));
            }
            else if (entry.name === "SKILL.md") {
                files.push(fullPath);
            }
        }
        return files;
    }
    const skillFiles = await findSkillFiles(skillsRoot);
    for (const skillFile of skillFiles) {
        const sourceDir = (0, node_path_1.dirname)(skillFile);
        const dirName = (0, node_path_1.basename)(sourceDir);
        // Read frontmatter to get skill name
        const content = await (0, promises_1.readFile)(skillFile, "utf-8");
        const parsed = parseFrontmatterStrict(content, skillFile);
        const name = (parsed.meta.name || dirName);
        // Validate name matches directory
        if (parsed.meta.name && parsed.meta.name !== dirName) {
            throw new Error(`Skill frontmatter name '${parsed.meta.name}' must match directory name '${dirName}': ${skillFile}`);
        }
        // Validate skill name format
        validateSkillName(name, skillFile);
        skills.push({ name, sourceDir, skillFile });
    }
    return skills;
}
/**
 * Copy skills with flattened structure
 * Takes nested skills from source and copies them flat to destination
 */
async function copySkillsFlat(skillsRoot, destDir) {
    const skills = await discoverSkills(skillsRoot);
    if (skills.length === 0)
        return;
    await (0, promises_1.mkdir)(destDir, { recursive: true });
    // Check for duplicate skill names
    const seenNames = new Map();
    for (const skill of skills) {
        if (seenNames.has(skill.name)) {
            throw new Error(`Duplicate skill name '${skill.name}' found in:\n  - ${seenNames.get(skill.name)}\n  - ${skill.sourceDir}`);
        }
        seenNames.set(skill.name, skill.sourceDir);
    }
    // Copy each skill to flat destination
    for (const skill of skills) {
        const destSkillDir = (0, node_path_1.join)(destDir, skill.name);
        await copyDirRecursive(skill.sourceDir, destSkillDir);
    }
}
function transformAgentMarkdownForOpenCode(markdown, filePathForErrors) {
    const parsed = parseFrontmatterStrict(markdown, filePathForErrors);
    if (!parsed.hasFrontmatter) {
        return { markdown, category: "general" };
    }
    const meta = { ...parsed.meta };
    const category = sanitizePathSegment(meta.category);
    // OpenCode agent name should be path-derived; frontmatter `name` overrides it.
    meta.name = undefined;
    // category is only used for directory structure, not valid in OpenCode frontmatter
    meta.category = undefined;
    // Transform named colors to hex format for OpenCode compatibility
    // OpenCode requires hex format: ^#[0-9a-fA-F]{6}$
    if (meta.color && typeof meta.color === "string") {
        const colorLower = meta.color.toLowerCase();
        if (!meta.color.startsWith("#") && NAMED_COLOR_TO_HEX[colorLower]) {
            meta.color = NAMED_COLOR_TO_HEX[colorLower];
        }
    }
    // Validate and clean permission field for OpenCode
    // OpenCode only supports: edit, bash, webfetch, doom_loop, external_directory in permission field
    if (meta.permission) {
        const cleanedPermission = {};
        for (const key of VALID_OPENCODE_PERMISSION_KEYS) {
            if (meta.permission[key] !== undefined) {
                cleanedPermission[key] = meta.permission[key];
            }
        }
        // Only include permission if it has valid keys
        if (Object.keys(cleanedPermission).length > 0) {
            meta.permission = cleanedPermission;
        }
        else {
            // Remove empty permission object
            meta.permission = undefined;
        }
    }
    const fm = serializeFrontmatter(meta);
    return {
        category,
        markdown: `---\n${fm}\n---\n${parsed.body}`,
    };
}
async function validateOpenCodeOutput(opencodeRoot) {
    const cmdRoot = (0, node_path_1.join)(opencodeRoot, "command", NAMESPACE_PREFIX);
    const agentRoot = (0, node_path_1.join)(opencodeRoot, "agent", NAMESPACE_PREFIX);
    const skillRoot = (0, node_path_1.join)(opencodeRoot, "skill"); // Note: singular
    const commandFiles = await getMarkdownFiles(cmdRoot);
    const agentFiles = await getMarkdownFiles(agentRoot);
    const errors = [];
    for (const fp of commandFiles) {
        const content = await (0, promises_1.readFile)(fp, "utf-8");
        const { meta, body } = parseFrontmatterStrict(content, fp);
        if (!meta.description)
            errors.push(`OpenCode command missing description: ${fp}`);
        if (!body.trim())
            errors.push(`OpenCode command has empty body: ${fp}`);
    }
    for (const fp of agentFiles) {
        const content = await (0, promises_1.readFile)(fp, "utf-8");
        const { meta, body } = parseFrontmatterStrict(content, fp);
        if (meta.name)
            errors.push(`OpenCode agent frontmatter must not include name: ${fp}`);
        if (!meta.description)
            errors.push(`OpenCode agent missing description: ${fp}`);
        if (!meta.mode)
            errors.push(`OpenCode agent missing mode: ${fp}`);
        if (!body.trim())
            errors.push(`OpenCode agent has empty body: ${fp}`);
        // Validate color format (if present) - OpenCode requires hex format: ^#[0-9a-fA-F]{6}$
        if (meta.color && typeof meta.color === "string") {
            const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
            if (!hexColorPattern.test(meta.color)) {
                errors.push(`OpenCode agent has invalid hex color format '${meta.color}': ${fp}`);
            }
        }
        // Ensure nested directory structure exists: ai-eng/<category>/<agent>.md
        const rel = fp.slice(agentRoot.length + 1);
        const parts = rel.split("/");
        if (parts.length < 2)
            errors.push(`OpenCode agent must be nested under a category folder: ${fp}`);
    }
    // Validate skills (if present)
    if ((0, node_fs_1.existsSync)(skillRoot)) {
        const skillDirs = await (0, promises_1.readdir)(skillRoot, { withFileTypes: true });
        for (const entry of skillDirs) {
            if (!entry.isDirectory())
                continue;
            const skillMdPath = (0, node_path_1.join)(skillRoot, entry.name, "SKILL.md");
            if (!(0, node_fs_1.existsSync)(skillMdPath)) {
                errors.push(`Skill directory missing SKILL.md: ${entry.name}/`);
                continue;
            }
            // Validate skill name
            try {
                validateSkillName(entry.name, skillMdPath);
                // Validate frontmatter name matches directory
                const content = await (0, promises_1.readFile)(skillMdPath, "utf-8");
                const { meta } = parseFrontmatterStrict(content, skillMdPath);
                if (meta.name && meta.name !== entry.name) {
                    errors.push(`Skill frontmatter name '${meta.name}' must match directory name '${entry.name}': ${skillMdPath}`);
                }
            }
            catch (e) {
                errors.push(e instanceof Error ? e.message : String(e));
            }
        }
    }
    if (errors.length) {
        console.error("\n❌ OpenCode output validation failed:\n");
        for (const e of errors)
            console.error(` - ${e}`);
        throw new Error(`OpenCode validation failed with ${errors.length} error(s)`);
    }
}
async function buildClaude() {
    await (0, promises_1.mkdir)(CLAUDE_DIR, { recursive: true });
    // Commands
    const claudeCommandsDir = (0, node_path_1.join)(CLAUDE_DIR, "commands");
    await (0, promises_1.mkdir)(claudeCommandsDir, { recursive: true });
    const commandFiles = await getMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "commands"));
    for (const src of commandFiles) {
        await (0, promises_1.copyFile)(src, (0, node_path_1.join)(claudeCommandsDir, (0, node_path_1.basename)(src)));
    }
    // Agents
    const claudeAgentsDir = (0, node_path_1.join)(CLAUDE_DIR, "agents");
    await (0, promises_1.mkdir)(claudeAgentsDir, { recursive: true });
    const agentFiles = await getMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "agents"));
    for (const src of agentFiles) {
        await (0, promises_1.copyFile)(src, (0, node_path_1.join)(claudeAgentsDir, (0, node_path_1.basename)(src)));
    }
    // Skills
    await copyDirRecursive(SKILLS_DIR, (0, node_path_1.join)(CLAUDE_DIR, "skills"));
    // plugin.json (for CI/tests; user installs happen from plugins/ai-eng-system)
    const packageJson = JSON.parse(await (0, promises_1.readFile)((0, node_path_1.join)(ROOT, "package.json"), "utf-8"));
    const pluginJson = {
        name: "ai-eng-system",
        version: packageJson.version,
        description: "AI Engineering System with context engineering and research orchestration for Claude Code",
        author: {
            name: "v1truv1us",
        },
        license: "MIT",
        commands: commandFiles.map((f) => `./commands/${(0, node_path_1.basename)(f)}`),
    };
    await (0, promises_1.writeFile)((0, node_path_1.join)(CLAUDE_DIR, "plugin.json"), JSON.stringify(pluginJson, null, 2));
    // Copy hooks from canonical source (.claude/hooks/) to dist/.claude-plugin/hooks/
    const canonicalHooksDir = (0, node_path_1.join)(ROOT_CLAUDE_DIR, "hooks");
    if ((0, node_fs_1.existsSync)(canonicalHooksDir)) {
        await copyDirRecursive(canonicalHooksDir, (0, node_path_1.join)(CLAUDE_DIR, "hooks"));
    }
    // Optional: copy marketplace.json and hooks.json for dist validation convenience
    const marketplaceSrc = (0, node_path_1.join)(ROOT, ".claude-plugin", "marketplace.json");
    if ((0, node_fs_1.existsSync)(marketplaceSrc)) {
        await (0, promises_1.copyFile)(marketplaceSrc, (0, node_path_1.join)(CLAUDE_DIR, "marketplace.json"));
    }
    const hooksJsonSrc = (0, node_path_1.join)(ROOT, ".claude-plugin", "hooks.json");
    if ((0, node_fs_1.existsSync)(hooksJsonSrc)) {
        await (0, promises_1.copyFile)(hooksJsonSrc, (0, node_path_1.join)(CLAUDE_DIR, "hooks.json"));
    }
}
async function buildOpenCode() {
    // Build to both dist/.opencode/ (for npm package) and .opencode/ (for local dev)
    for (const targetDir of [DIST_OPENCODE_DIR, ROOT_OPENCODE_DIR]) {
        // Clean target directories before building to remove stale files
        const parentCommandsDir = (0, node_path_1.join)(targetDir, "command");
        const commandsDir = (0, node_path_1.join)(targetDir, "command", NAMESPACE_PREFIX);
        const agentsDir = (0, node_path_1.join)(targetDir, "agent", NAMESPACE_PREFIX);
        const skillsDir = (0, node_path_1.join)(targetDir, "skill"); // Note: singular, per OpenCode docs
        // Clean parent command directory completely to prevent duplicates
        if ((0, node_fs_1.existsSync)(parentCommandsDir)) {
            await (0, promises_1.rm)(parentCommandsDir, { recursive: true, force: true });
        }
        if ((0, node_fs_1.existsSync)(agentsDir)) {
            await (0, promises_1.rm)(agentsDir, { recursive: true, force: true });
        }
        if ((0, node_fs_1.existsSync)(skillsDir)) {
            await (0, promises_1.rm)(skillsDir, { recursive: true, force: true });
        }
        await (0, promises_1.mkdir)(commandsDir, { recursive: true });
        await (0, promises_1.mkdir)(agentsDir, { recursive: true });
        await (0, promises_1.mkdir)(skillsDir, { recursive: true });
        // Copy prompt optimization tool
        const opencodeToolSrc = (0, node_path_1.join)(ROOT, "src", "opencode-tool-prompt-optimize.ts");
        const opencodeToolDir = (0, node_path_1.join)(targetDir, "tool");
        if ((0, node_fs_1.existsSync)(opencodeToolSrc)) {
            await (0, promises_1.mkdir)(opencodeToolDir, { recursive: true });
            await (0, promises_1.copyFile)(opencodeToolSrc, (0, node_path_1.join)(opencodeToolDir, "prompt-optimize.ts"));
        }
        // Commands: MD-first, copy as-is.
        const commandFiles = await getMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "commands"));
        for (const src of commandFiles) {
            await (0, promises_1.copyFile)(src, (0, node_path_1.join)(commandsDir, (0, node_path_1.basename)(src)));
        }
        // Agents: MD-first but strip `name` and nest by category.
        const agentFiles = await getMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "agents"));
        for (const src of agentFiles) {
            const content = await (0, promises_1.readFile)(src, "utf-8");
            const transformed = transformAgentMarkdownForOpenCode(content, src);
            const categoryDir = (0, node_path_1.join)(agentsDir, transformed.category);
            await (0, promises_1.mkdir)(categoryDir, { recursive: true });
            await (0, promises_1.writeFile)((0, node_path_1.join)(categoryDir, (0, node_path_1.basename)(src)), transformed.markdown);
        }
        // Skills: Copy to .opencode/skill/ (singular, flat structure)
        // This is OpenCode's expected location: https://opencode.ai/docs/skills
        await copySkillsFlat(SKILLS_DIR, skillsDir);
        // Copy OpenCode config
        const opencodeConfigSrc = (0, node_path_1.join)(ROOT, ".opencode", "opencode.jsonc");
        if ((0, node_fs_1.existsSync)(opencodeConfigSrc)) {
            await (0, promises_1.copyFile)(opencodeConfigSrc, (0, node_path_1.join)(targetDir, "opencode.jsonc"));
        }
    }
    await validateOpenCodeOutput(DIST_OPENCODE_DIR);
}
async function copyDirRecursive(srcDir, destDir) {
    if (!(0, node_fs_1.existsSync)(srcDir))
        return;
    const entries = await (0, promises_1.readdir)(srcDir, { withFileTypes: true });
    await (0, promises_1.mkdir)(destDir, { recursive: true });
    for (const entry of entries) {
        const srcPath = (0, node_path_1.join)(srcDir, entry.name);
        const destPath = (0, node_path_1.join)(destDir, entry.name);
        if (entry.isDirectory()) {
            await copyDirRecursive(srcPath, destPath);
        }
        else if (entry.isFile()) {
            await ensureDirForFile(destPath);
            await (0, promises_1.copyFile)(srcPath, destPath);
        }
    }
}
async function copySkillsToDist() {
    await copyDirRecursive(SKILLS_DIR, (0, node_path_1.join)(DIST_DIR, "skills"));
}
async function copyPromptOptimization() {
    await copyDirRecursive(PROMPT_OPT_DIR, (0, node_path_1.join)(DIST_DIR, "prompt-optimization"));
}
/**
 * Clean a directory by removing all contents and recreating it
 */
async function cleanDirectory(dir) {
    if ((0, node_fs_1.existsSync)(dir)) {
        await (0, promises_1.rm)(dir, { recursive: true, force: true });
    }
    await (0, promises_1.mkdir)(dir, { recursive: true });
}
/**
 * Copy markdown files from source to destination directory
 */
async function copyMarkdownFiles(srcDir, destDir) {
    const files = await getMarkdownFiles(srcDir);
    for (const src of files) {
        await (0, promises_1.copyFile)(src, (0, node_path_1.join)(destDir, (0, node_path_1.basename)(src)));
    }
}
/**
 * Sync commands and skills to .claude/ directory (local development + marketplace)
 * This is required for Claude Code's native skill tool to discover skills
 */
async function syncToLocalClaude() {
    // Sync commands
    const claudeCommandsDir = (0, node_path_1.join)(ROOT_CLAUDE_DIR, "commands");
    await cleanDirectory(claudeCommandsDir);
    await copyMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "commands"), claudeCommandsDir);
    // Sync skills (flat structure for Claude Code)
    const claudeSkillsDir = (0, node_path_1.join)(ROOT_CLAUDE_DIR, "skills");
    await cleanDirectory(claudeSkillsDir);
    await copySkillsFlat(SKILLS_DIR, claudeSkillsDir);
    // Sync hooks to .claude/hooks/ directory
    const claudeHooksDir = (0, node_path_1.join)(ROOT_CLAUDE_DIR, "hooks");
    const hookFiles = [
        ".claude/hooks/prompt-optimizer-hook.py",
        ".claude/hooks/hooks.json",
    ];
    for (const hookFile of hookFiles) {
        const src = (0, node_path_1.join)(ROOT, hookFile);
        if ((0, node_fs_1.existsSync)(src)) {
            await (0, promises_1.mkdir)(claudeHooksDir, { recursive: true });
            await (0, promises_1.copyFile)(src, (0, node_path_1.join)(claudeHooksDir, (0, node_path_1.basename)(hookFile)));
        }
    }
    // Sync prompt optimization library to dist/ (for npm package consumers)
    const promptOptFiles = [
        "src/prompt-optimization/types.ts",
        "src/prompt-optimization/analyzer.ts",
        "src/prompt-optimization/techniques.ts",
        "src/prompt-optimization/optimizer.ts",
        "src/prompt-optimization/formatter.ts",
        "src/prompt-optimization/index.ts",
    ];
    for (const file of promptOptFiles) {
        const src = (0, node_path_1.join)(ROOT, file);
        if ((0, node_fs_1.existsSync)(src)) {
            const dest = (0, node_path_1.join)(DIST_DIR, "prompt-optimization", (0, node_path_1.basename)(file));
            await (0, promises_1.copyFile)(src, dest);
        }
    }
    console.log("  ✓ Synced to .claude/");
}
/**
 * Sync prompt optimization library to dist/.claude-plugin/
 * Note: Hooks are copied directly by buildClaude() from canonical source
 */
async function syncPromptOptimizationLibrary() {
    // Copy prompt optimization library files (but not hooks - those are handled by buildClaude)
    const promptOptFiles = [
        "src/prompt-optimization/types.ts",
        "src/prompt-optimization/analyzer.ts",
        "src/prompt-optimization/techniques.ts",
        "src/prompt-optimization/optimizer.ts",
        "src/prompt-optimization/formatter.ts",
        "src/prompt-optimization/index.ts",
    ];
    for (const file of promptOptFiles) {
        const src = (0, node_path_1.join)(ROOT, file);
        if ((0, node_fs_1.existsSync)(src)) {
            const dest = (0, node_path_1.join)(CLAUDE_DIR, (0, node_path_1.basename)(file));
            await (0, promises_1.copyFile)(src, dest);
        }
    }
    console.log("  ✓ Synced prompt optimization library");
}
async function syncToClaudePlugin() {
    // Sync prompt optimization library
    await syncPromptOptimizationLibrary();
    // Sync commands, agents, and skills from dist/.claude-plugin/ to .claude-plugin/
    const distCommandsDir = (0, node_path_1.join)(CLAUDE_DIR, "commands");
    const rootCommandsDir = (0, node_path_1.join)(ROOT_CLAUDE_PLUGIN_DIR, "commands");
    if ((0, node_fs_1.existsSync)(distCommandsDir)) {
        await cleanDirectory(rootCommandsDir);
        await copyDirRecursive(distCommandsDir, rootCommandsDir);
    }
    const distAgentsDir = (0, node_path_1.join)(CLAUDE_DIR, "agents");
    const rootAgentsDir = (0, node_path_1.join)(ROOT_CLAUDE_PLUGIN_DIR, "agents");
    if ((0, node_fs_1.existsSync)(distAgentsDir)) {
        await cleanDirectory(rootAgentsDir);
        await copyDirRecursive(distAgentsDir, rootAgentsDir);
    }
    const distSkillsDir = (0, node_path_1.join)(CLAUDE_DIR, "skills");
    const rootSkillsDir = (0, node_path_1.join)(ROOT_CLAUDE_PLUGIN_DIR, "skills");
    if ((0, node_fs_1.existsSync)(distSkillsDir)) {
        await cleanDirectory(rootSkillsDir);
        await copyDirRecursive(distSkillsDir, rootSkillsDir);
    }
    // Sync plugin.json and hooks directory from dist/.claude-plugin/
    const distPluginJson = (0, node_path_1.join)(CLAUDE_DIR, "plugin.json");
    if ((0, node_fs_1.existsSync)(distPluginJson)) {
        const destPluginJson = (0, node_path_1.join)(MARKETPLACE_PLUGIN_DIR, "plugin.json");
        await ensureDirForFile(destPluginJson);
        await (0, promises_1.copyFile)(distPluginJson, destPluginJson);
    }
    // Copy hooks directory from dist/.claude-plugin/hooks/ to .claude-plugin/hooks/
    const distHooksDir = (0, node_path_1.join)(CLAUDE_DIR, "hooks");
    const rootClaudePluginHooksDir = (0, node_path_1.join)(ROOT_CLAUDE_PLUGIN_DIR, "hooks");
    if ((0, node_fs_1.existsSync)(distHooksDir)) {
        await (0, promises_1.mkdir)(ROOT_CLAUDE_PLUGIN_DIR, { recursive: true });
        await copyDirRecursive(distHooksDir, rootClaudePluginHooksDir);
    }
    console.log("  ✓ Synced to .claude-plugin/");
}
/**
 * Sync commands, agents, and skills to plugins/ai-eng-system/ (marketplace source)
 */
async function syncToMarketplacePlugin() {
    // Sync commands
    const mpCommandsDir = (0, node_path_1.join)(MARKETPLACE_PLUGIN_DIR, "commands");
    await cleanDirectory(mpCommandsDir);
    await copyMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "commands"), mpCommandsDir);
    // Sync agents
    const mpAgentsDir = (0, node_path_1.join)(MARKETPLACE_PLUGIN_DIR, "agents");
    await cleanDirectory(mpAgentsDir);
    await copyMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "agents"), mpAgentsDir);
    // Sync skills
    const mpSkillsDir = (0, node_path_1.join)(MARKETPLACE_PLUGIN_DIR, "skills");
    await cleanDirectory(mpSkillsDir);
    await copySkillsFlat(SKILLS_DIR, mpSkillsDir);
    // Sync plugin.json and hooks directory from dist/.claude-plugin/
    const distPluginJson = (0, node_path_1.join)(CLAUDE_DIR, "plugin.json");
    if ((0, node_fs_1.existsSync)(distPluginJson)) {
        const destPluginJson = (0, node_path_1.join)(MARKETPLACE_PLUGIN_DIR, "plugin.json");
        await ensureDirForFile(destPluginJson);
        await (0, promises_1.copyFile)(distPluginJson, destPluginJson);
    }
    // Copy hooks directory from dist/.claude-plugin/hooks/ to plugins/ai-eng-system/hooks/
    const distHooksDir = (0, node_path_1.join)(CLAUDE_DIR, "hooks");
    const marketplaceHooksDir = (0, node_path_1.join)(MARKETPLACE_PLUGIN_DIR, "hooks");
    if ((0, node_fs_1.existsSync)(distHooksDir)) {
        await (0, promises_1.mkdir)(MARKETPLACE_PLUGIN_DIR, { recursive: true });
        await copyDirRecursive(distHooksDir, marketplaceHooksDir);
    }
    console.log("  ✓ Synced to plugins/ai-eng-system/");
}
async function buildNpmEntrypoint() {
    // Build npm-loadable OpenCode plugin entrypoint.
    // Skip if src/index.ts doesn't exist (e.g., in test environments)
    const srcIndexPath = (0, node_path_1.join)(ROOT, "src", "index.ts");
    if (!(0, node_fs_1.existsSync)(srcIndexPath)) {
        console.log("⚠️  Skipping npm entrypoint build (src/index.ts not found)");
        return;
    }
    const result = await Bun.build({
        entrypoints: [srcIndexPath],
        outdir: DIST_DIR,
        target: "node",
        format: "esm",
    });
    if (!result.success) {
        const messages = result.logs
            .map((l) => `${l.level}: ${l.message}`)
            .join("\n");
        throw new Error(`Failed to build npm entrypoint:\n${messages}`);
    }
    // Provide a minimal .d.ts so TS consumers resolve export.
    const dtsPath = (0, node_path_1.join)(DIST_DIR, "index.d.ts");
    await (0, promises_1.writeFile)(dtsPath, [
        'import type { Plugin } from "@opencode-ai/plugin";',
        "",
        "export declare const AiEngSystem: Plugin;",
        "",
    ].join("\n"));
    // Compatibility: some loaders attempt to import the package directory itself.
    // Bun supports directory imports when an index.js exists at the directory root.
    // Build/export a tiny shim at dist/../index.js that re-exports from dist/index.js.
    const rootIndexJsPath = (0, node_path_1.join)(DIST_DIR, "..", "index.js");
    await (0, promises_1.writeFile)(rootIndexJsPath, [
        "// Auto-generated compatibility shim for directory imports",
        'export * from "./dist/index.js";',
        'export { AiEngSystem as default } from "./dist/index.js";',
        "",
    ].join("\n"));
    const rootIndexDtsPath = (0, node_path_1.join)(DIST_DIR, "..", "index.d.ts");
    await (0, promises_1.writeFile)(rootIndexDtsPath, [
        'export * from "./dist/index";',
        'export { AiEngSystem as default } from "./dist/index";',
        "",
    ].join("\n"));
}
async function validateContentOnly() {
    if (!(0, node_fs_1.existsSync)(CONTENT_DIR))
        throw new Error("content/ directory not found");
    const commandFiles = await getMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "commands"));
    const agentFiles = await getMarkdownFiles((0, node_path_1.join)(CONTENT_DIR, "agents"));
    const errors = [];
    for (const fp of commandFiles) {
        const content = await (0, promises_1.readFile)(fp, "utf-8");
        const { meta } = parseFrontmatterStrict(content, fp);
        if (!meta.name)
            errors.push(`${fp}: missing 'name' in frontmatter`);
        if (!meta.description)
            errors.push(`${fp}: missing 'description' in frontmatter`);
    }
    for (const fp of agentFiles) {
        const content = await (0, promises_1.readFile)(fp, "utf-8");
        const { meta } = parseFrontmatterStrict(content, fp);
        if (!meta.name)
            errors.push(`${fp}: missing 'name' in frontmatter`);
        if (!meta.description)
            errors.push(`${fp}: missing 'description' in frontmatter`);
        if (!meta.mode)
            errors.push(`${fp}: missing 'mode' in frontmatter`);
    }
    if (errors.length) {
        console.error("\n❌ Validation failed:\n");
        for (const e of errors)
            console.error(` - ${e}`);
        throw new Error(`Validation failed with ${errors.length} error(s)`);
    }
}
/**
 * Validate all generated agent files for platform-specific requirements
 * - Claude Code: Should NOT have permission field
 * - OpenCode: Should only have valid permission keys (edit, bash, webfetch, doom_loop, external_directory)
 */
async function validateAgents() {
    const errors = [];
    // Validate Claude Code agents (dist/.claude-plugin/agents/)
    const claudeAgentFiles = await getMarkdownFiles(CLAUDE_DIR);
    for (const fp of claudeAgentFiles) {
        const fileContent = await (0, promises_1.readFile)(fp, "utf-8");
        const { meta } = parseFrontmatterStrict(fileContent, fp);
        if (meta.permission) {
            errors.push(`${fp}: Claude Code agents should not have permission field (use tools instead)`);
        }
    }
    // Validate OpenCode agents (dist/.opencode/agent/ and .opencode/agent/)
    const openCodeDirs = [DIST_OPENCODE_DIR, ROOT_OPENCODE_DIR];
    for (const opencodeRoot of openCodeDirs) {
        const agentDir = (0, node_path_1.join)(opencodeRoot, "agent", NAMESPACE_PREFIX);
        if (!(0, node_fs_1.existsSync)(agentDir))
            continue;
        const agentFiles = await getMarkdownFiles(agentDir);
        for (const fp of agentFiles) {
            const fileContent = await (0, promises_1.readFile)(fp, "utf-8");
            const { meta } = parseFrontmatterStrict(fileContent, fp);
            if (meta.permission) {
                const validKeys = VALID_OPENCODE_PERMISSION_KEYS;
                for (const key of Object.keys(meta.permission)) {
                    if (!validKeys.includes(key)) {
                        errors.push(`${fp}: Invalid permission key '${key}' (only edit/bash/webfetch/doom_loop/external_directory allowed)`);
                    }
                }
            }
        }
    }
    if (errors.length) {
        console.error("\n❌ Agent validation failed:\n");
        for (const e of errors)
            console.error(` - ${e}`);
        throw new Error(`Agent validation failed with ${errors.length} error(s)`);
    }
    console.log("✅ All agents validated successfully");
}
async function buildAll() {
    const start = Date.now();
    if ((0, node_fs_1.existsSync)(DIST_DIR)) {
        await (0, promises_1.rm)(DIST_DIR, { recursive: true, force: true });
    }
    await (0, promises_1.mkdir)(DIST_DIR, { recursive: true });
    if (!(0, node_fs_1.existsSync)(CONTENT_DIR)) {
        throw new Error("content/ directory not found");
    }
    // Build to dist/
    await buildClaude();
    await buildOpenCode();
    await copySkillsToDist();
    await copyPromptOptimization();
    await buildNpmEntrypoint();
    // Sync to committed directories (required for marketplace)
    console.log("\n📦 Syncing to marketplace directories...");
    await syncToLocalClaude();
    await syncToClaudePlugin();
    await syncToMarketplacePlugin();
    // Validate agents after build
    await validateAgents();
    const elapsed = Date.now() - start;
    console.log(`\n✅ Build complete in ${elapsed}ms -> ${DIST_DIR}`);
}
const args = process.argv.slice(2);
try {
    if (args.includes("--validate")) {
        await validateContentOnly();
        console.log("✅ Content validated");
    }
    else if (args.includes("--watch")) {
        console.log("👀 Watching for changes...");
        await buildAll();
        (0, node_fs_1.watch)(CONTENT_DIR, { recursive: true }, async (_eventType, filename) => {
            if (!filename?.endsWith(".md"))
                return;
            console.log(`\n📝 Changed: ${filename}`);
            await buildAll();
        });
    }
    else {
        await buildAll();
    }
}
catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ ${message}`);
    process.exit(1);
}
