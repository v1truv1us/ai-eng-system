#!/usr/bin/env bun
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
 * - .claude-plugin/        (marketplace manifest only)
 * - .opencode/             (local development runtime)
 * - plugins/<name>/        (7 marketplace plugin directories)
 */

import { existsSync, watch } from "node:fs";
import {
    copyFile,
    mkdir,
    readdir,
    readFile,
    rm,
    writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const IS_TEST_MODE = !!process.env.TEST_ROOT;
const ROOT = process.env.TEST_ROOT
    ? process.env.TEST_ROOT
    : dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(ROOT, "content");
const SKILLS_DIR = join(ROOT, "skills");
const PROMPT_OPT_DIR = join(ROOT, "src", "prompt-optimization");
const DIST_DIR = join(ROOT, "dist");

const CLAUDE_DIR = join(DIST_DIR, ".claude-plugin");
const DIST_OPENCODE_DIR = join(DIST_DIR, ".opencode");
const DIST_PI_DIR = join(DIST_DIR, ".pi");
const ROOT_OPENCODE_DIR = join(ROOT, ".opencode");
const ROOT_CLAUDE_DIR = join(ROOT, ".claude");
const ROOT_CLAUDE_PLUGIN_DIR = join(ROOT, ".claude-plugin");
const PLUGINS_DIR = join(ROOT, "plugins");

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
const NAMED_COLOR_TO_HEX: Record<string, string> = {
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
const SKILL_REFERENCE_REGEX = /skills\/([A-Za-z0-9/_-]+)\/SKILL\.md/g;

type FrontmatterParseResult = {
    meta: Record<string, any>;
    body: string;
    hasFrontmatter: boolean;
};

function sanitizePathSegment(segment: unknown): string {
    const s = String(segment ?? "").trim();
    if (!s) return "general";
    return s
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

async function ensureDirForFile(filePath: string): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true });
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    if (!existsSync(dir)) return files;

    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules to prevent infinite recursion
            if (entry.name === "node_modules" || entry.name === ".git") {
                continue;
            }
            files.push(...(await getMarkdownFiles(fullPath)));
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            files.push(fullPath);
        }
    }

    return files;
}

function parseFrontmatterStrict(
    markdown: string,
    filePathForErrors: string,
): FrontmatterParseResult {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: markdown, hasFrontmatter: false };

    const [, raw, body] = match;

    try {
        const meta = (YAML.parse(raw) ?? {}) as Record<string, any>;
        return { meta, body, hasFrontmatter: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(
            `Invalid YAML frontmatter in ${filePathForErrors}: ${message}`,
        );
    }
}

function serializeFrontmatter(meta: Record<string, any>): string {
    return YAML.stringify(meta).trimEnd();
}

/**
 * Validate skill name matches OpenCode requirements
 * https://opencode.ai/docs/skills#validate-names
 */
function validateSkillName(name: string, filePath: string): void {
    if (
        name.length < SKILL_NAME_MIN_LENGTH ||
        name.length > SKILL_NAME_MAX_LENGTH
    ) {
        throw new Error(
            `Skill name '${name}' must be ${SKILL_NAME_MIN_LENGTH}-${SKILL_NAME_MAX_LENGTH} characters: ${filePath}`,
        );
    }
    if (!SKILL_NAME_REGEX.test(name)) {
        throw new Error(
            `Skill name '${name}' must be lowercase alphanumeric with single hyphens (regex: ${SKILL_NAME_REGEX}): ${filePath}`,
        );
    }
}

function extractSkillReferences(markdown: string): string[] {
    const refs = new Set<string>();

    for (const match of markdown.matchAll(SKILL_REFERENCE_REGEX)) {
        refs.add(match[1]);
    }

    return [...refs];
}

async function validateCommandSkillReferences(
    commandFiles: string[],
): Promise<string[]> {
    const errors: string[] = [];

    for (const fp of commandFiles) {
        const content = await readFile(fp, "utf-8");
        const skillRefs = extractSkillReferences(content);

        for (const skillRef of skillRefs) {
            const skillFile = join(SKILLS_DIR, skillRef, "SKILL.md");
            if (!existsSync(skillFile)) {
                errors.push(
                    `${fp}: references missing skill 'skills/${skillRef}/SKILL.md'`,
                );
            }
        }
    }

    return errors;
}

interface SkillInfo {
    name: string;
    relativeDir: string;
    sourceDir: string; // Full path to skill directory
    skillFile: string; // Full path to SKILL.md
}

/**
 * Discover all skills in the skills directory recursively
 * Returns skill info including validated names and paths
 */
async function discoverSkills(skillsRoot: string): Promise<SkillInfo[]> {
    const skills: SkillInfo[] = [];

    async function findSkillFiles(dir: string): Promise<string[]> {
        const files: string[] = [];
        if (!existsSync(dir)) return files;

        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await findSkillFiles(fullPath)));
            } else if (entry.name === "SKILL.md") {
                files.push(fullPath);
            }
        }

        return files;
    }

    const skillFiles = await findSkillFiles(skillsRoot);

    for (const skillFile of skillFiles) {
        const sourceDir = dirname(skillFile);
        const dirName = basename(sourceDir);

        // Read frontmatter to get skill name
        const content = await readFile(skillFile, "utf-8");
        const parsed = parseFrontmatterStrict(content, skillFile);
        const name = (parsed.meta.name || dirName) as string;

        // Validate name matches directory
        if (parsed.meta.name && parsed.meta.name !== dirName) {
            throw new Error(
                `Skill frontmatter name '${parsed.meta.name}' must match directory name '${dirName}': ${skillFile}`,
            );
        }

        // Validate skill name format
        validateSkillName(name, skillFile);

        skills.push({
            name,
            relativeDir: relative(skillsRoot, sourceDir),
            sourceDir,
            skillFile,
        });
    }

    return skills;
}

/**
 * Copy skills while preserving relative directory structure.
 * This keeps namespaces like ai-eng/simplify intact in generated outputs.
 */
async function copySkillsPreservePath(
    skillsRoot: string,
    destDir: string,
): Promise<void> {
    const skills = await discoverSkills(skillsRoot);

    if (skills.length === 0) return;

    await mkdir(destDir, { recursive: true });

    // Copy each skill preserving relative namespace/category folders
    for (const skill of skills) {
        const destSkillDir = join(destDir, skill.relativeDir);
        await copyDirRecursive(skill.sourceDir, destSkillDir);
    }
}

function transformAgentMarkdownForOpenCode(
    markdown: string,
    filePathForErrors: string,
): { markdown: string; category: string } {
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
        const cleanedPermission: Record<string, any> = {};

        for (const key of VALID_OPENCODE_PERMISSION_KEYS) {
            if (meta.permission[key] !== undefined) {
                cleanedPermission[key] = meta.permission[key];
            }
        }

        // Only include permission if it has valid keys
        if (Object.keys(cleanedPermission).length > 0) {
            meta.permission = cleanedPermission;
        } else {
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

async function validateOpenCodeOutput(opencodeRoot: string): Promise<void> {
    const cmdRoot = join(opencodeRoot, "command", NAMESPACE_PREFIX);
    const agentRoot = join(opencodeRoot, "agent", NAMESPACE_PREFIX);
    const skillRoot = join(opencodeRoot, "skill"); // Note: singular

    const commandFiles = await getMarkdownFiles(cmdRoot);
    const agentFiles = await getMarkdownFiles(agentRoot);

    const errors: string[] = [];

    for (const fp of commandFiles) {
        const content = await readFile(fp, "utf-8");
        const { meta, body } = parseFrontmatterStrict(content, fp);

        if (!meta.description)
            errors.push(`OpenCode command missing description: ${fp}`);
        if (!body.trim()) errors.push(`OpenCode command has empty body: ${fp}`);
    }

    for (const fp of agentFiles) {
        const content = await readFile(fp, "utf-8");
        const { meta, body } = parseFrontmatterStrict(content, fp);

        if (meta.name)
            errors.push(
                `OpenCode agent frontmatter must not include name: ${fp}`,
            );
        if (!meta.description)
            errors.push(`OpenCode agent missing description: ${fp}`);
        if (!meta.mode) errors.push(`OpenCode agent missing mode: ${fp}`);
        if (!body.trim()) errors.push(`OpenCode agent has empty body: ${fp}`);

        // Validate color format (if present) - OpenCode requires hex format: ^#[0-9a-fA-F]{6}$
        if (meta.color && typeof meta.color === "string") {
            const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
            if (!hexColorPattern.test(meta.color)) {
                errors.push(
                    `OpenCode agent has invalid hex color format '${meta.color}': ${fp}`,
                );
            }
        }

        // Ensure nested directory structure exists: ai-eng/<category>/<agent>.md
        const rel = fp.slice(agentRoot.length + 1);
        const parts = rel.split("/");
        if (parts.length < 2)
            errors.push(
                `OpenCode agent must be nested under a category folder: ${fp}`,
            );
    }

    // Validate skills (if present), preserving nested namespace folders.
    if (existsSync(skillRoot)) {
        const skillFiles = await getMarkdownFiles(skillRoot);
        for (const skillMdPath of skillFiles.filter((fp) =>
            fp.endsWith("/SKILL.md"),
        )) {
            const skillDirName = basename(dirname(skillMdPath));

            try {
                validateSkillName(skillDirName, skillMdPath);

                const content = await readFile(skillMdPath, "utf-8");
                const { meta } = parseFrontmatterStrict(content, skillMdPath);
                if (meta.name && meta.name !== skillDirName) {
                    errors.push(
                        `Skill frontmatter name '${meta.name}' must match directory name '${skillDirName}': ${skillMdPath}`,
                    );
                }
            } catch (e) {
                errors.push(e instanceof Error ? e.message : String(e));
            }
        }
    }

    if (errors.length) {
        console.error("\n❌ OpenCode output validation failed:\n");
        for (const e of errors) console.error(` - ${e}`);
        throw new Error(
            `OpenCode validation failed with ${errors.length} error(s)`,
        );
    }
}

async function buildClaude(): Promise<void> {
    await mkdir(CLAUDE_DIR, { recursive: true });

    // Commands
    const claudeCommandsDir = join(CLAUDE_DIR, "commands");
    await mkdir(claudeCommandsDir, { recursive: true });
    const commandFiles = await getMarkdownFiles(join(CONTENT_DIR, "commands"));
    for (const src of commandFiles) {
        await copyFile(src, join(claudeCommandsDir, basename(src)));
    }

    // Agents
    const claudeAgentsDir = join(CLAUDE_DIR, "agents");
    await mkdir(claudeAgentsDir, { recursive: true });
    const agentFiles = await getMarkdownFiles(join(CONTENT_DIR, "agents"));
    for (const src of agentFiles) {
        await copyFile(src, join(claudeAgentsDir, basename(src)));
    }

    // Skills
    await copyDirRecursive(SKILLS_DIR, join(CLAUDE_DIR, "skills"));

    // plugin.json (for CI/tests; user installs happen from plugins/ai-eng-system)
    const packageJson = JSON.parse(
        await readFile(join(ROOT, "package.json"), "utf-8"),
    );
    const pluginJson = {
        name: "ai-eng-system",
        version: packageJson.version,
        description:
            "AI Engineering System with context engineering and research orchestration for Claude Code",
        author: {
            name: "v1truv1us",
        },
        license: "MIT",
        commands: commandFiles.map((f) => `./commands/${basename(f)}`),
    };

    await writeFile(
        join(CLAUDE_DIR, "plugin.json"),
        JSON.stringify(pluginJson, null, 2),
    );

    // Copy hooks from canonical source (.claude/hooks/) to dist/.claude-plugin/hooks/
    const canonicalHooksDir = join(ROOT_CLAUDE_DIR, "hooks");
    if (existsSync(canonicalHooksDir)) {
        await copyDirRecursive(canonicalHooksDir, join(CLAUDE_DIR, "hooks"));
    }

    // marketplace.json is generated by generateMarketplaceJson() in buildAll()
}

async function buildOpenCode(): Promise<void> {
    // Build to both dist/.opencode/ (for npm package) and .opencode/ (for local dev)
    // In test mode, only build to dist/.opencode/ since ROOT_OPENCODE_DIR is inside the test tmp dir
    const targetDirs = IS_TEST_MODE
        ? [DIST_OPENCODE_DIR]
        : [DIST_OPENCODE_DIR, ROOT_OPENCODE_DIR];
    for (const targetDir of targetDirs) {
        // Clean target directories before building to remove stale files
        const parentCommandsDir = join(targetDir, "command");
        const commandsDir = join(targetDir, "command", NAMESPACE_PREFIX);
        const agentsDir = join(targetDir, "agent", NAMESPACE_PREFIX);
        const skillsDir = join(targetDir, "skill"); // Note: singular, per OpenCode docs

        // Clean parent command directory completely to prevent duplicates
        if (existsSync(parentCommandsDir)) {
            await rm(parentCommandsDir, { recursive: true, force: true });
        }
        if (existsSync(agentsDir)) {
            await rm(agentsDir, { recursive: true, force: true });
        }
        if (existsSync(skillsDir)) {
            await rm(skillsDir, { recursive: true, force: true });
        }

        await mkdir(commandsDir, { recursive: true });
        await mkdir(agentsDir, { recursive: true });
        await mkdir(skillsDir, { recursive: true });

        // Copy prompt optimization tool
        const opencodeToolSrc = join(
            ROOT,
            "src",
            "opencode-tool-prompt-optimize.ts",
        );
        const opencodeToolDir = join(targetDir, "tool");
        if (existsSync(opencodeToolSrc)) {
            await mkdir(opencodeToolDir, { recursive: true });
            await copyFile(
                opencodeToolSrc,
                join(opencodeToolDir, "prompt-optimize.ts"),
            );
        }

        // Commands: MD-first, copy as-is.
        const commandFiles = await getMarkdownFiles(
            join(CONTENT_DIR, "commands"),
        );
        for (const src of commandFiles) {
            await copyFile(src, join(commandsDir, basename(src)));
        }

        // Agents: MD-first but strip `name` and nest by category.
        const agentFiles = await getMarkdownFiles(join(CONTENT_DIR, "agents"));
        for (const src of agentFiles) {
            const content = await readFile(src, "utf-8");
            const transformed = transformAgentMarkdownForOpenCode(content, src);

            const categoryDir = join(agentsDir, transformed.category);
            await mkdir(categoryDir, { recursive: true });
            await writeFile(
                join(categoryDir, basename(src)),
                transformed.markdown,
            );
        }

        // Skills: Copy to .opencode/skill/ (singular) while preserving namespaces.
        // This keeps paths like ai-eng/simplify intact in generated outputs.
        await copySkillsPreservePath(SKILLS_DIR, skillsDir);

        // Copy OpenCode config
        const opencodeConfigSrc = join(ROOT, ".opencode", "opencode.jsonc");
        if (existsSync(opencodeConfigSrc)) {
            await copyFile(
                opencodeConfigSrc,
                join(targetDir, "opencode.jsonc"),
            );
        }
    }

    await validateOpenCodeOutput(DIST_OPENCODE_DIR);
}

function transformCommandMarkdownForPi(
    markdown: string,
    filePathForErrors: string,
): { fileName: string; markdown: string } {
    const parsed = parseFrontmatterStrict(markdown, filePathForErrors);
    const meta = { ...parsed.meta };
    const rawName = String(
        meta.name || basename(filePathForErrors, ".md"),
    ).trim();
    const fileName = `${rawName.replaceAll("/", "-")}.md`;

    const piMeta: Record<string, unknown> = {};
    if (meta.description) {
        piMeta.description = meta.description;
    }

    const fm = Object.keys(piMeta).length
        ? `---\n${serializeFrontmatter(piMeta)}\n---\n`
        : "";

    return {
        fileName,
        markdown: `${fm}${parsed.body}`,
    };
}

async function buildPi(): Promise<void> {
    const promptsDir = join(DIST_PI_DIR, "prompts");
    const skillsDir = join(DIST_PI_DIR, "skills");

    await rm(DIST_PI_DIR, { recursive: true, force: true });
    await mkdir(promptsDir, { recursive: true });
    await mkdir(skillsDir, { recursive: true });

    const commandFiles = await getMarkdownFiles(join(CONTENT_DIR, "commands"));
    for (const src of commandFiles) {
        const content = await readFile(src, "utf-8");
        const transformed = transformCommandMarkdownForPi(content, src);
        await writeFile(
            join(promptsDir, transformed.fileName),
            transformed.markdown,
        );
    }

    await copySkillsPreservePath(SKILLS_DIR, skillsDir);
}

async function copyDirRecursive(
    srcDir: string,
    destDir: string,
): Promise<void> {
    if (!existsSync(srcDir)) return;

    const entries = await readdir(srcDir, { withFileTypes: true });
    await mkdir(destDir, { recursive: true });

    for (const entry of entries) {
        const srcPath = join(srcDir, entry.name);
        const destPath = join(destDir, entry.name);

        if (entry.isDirectory()) {
            await copyDirRecursive(srcPath, destPath);
        } else if (entry.isFile()) {
            await ensureDirForFile(destPath);
            await copyFile(srcPath, destPath);
        }
    }
}

async function copySkillsToDist(): Promise<void> {
    await copyDirRecursive(SKILLS_DIR, join(DIST_DIR, "skills"));
}

async function copyPromptOptimization(): Promise<void> {
    await copyDirRecursive(
        PROMPT_OPT_DIR,
        join(DIST_DIR, "prompt-optimization"),
    );
}

async function syncToPiPackage(): Promise<void> {
    const piPackageDir = join(ROOT, "packages", "pi");
    await rm(join(piPackageDir, "skills"), { recursive: true, force: true });
    await rm(join(piPackageDir, "prompts"), { recursive: true, force: true });
    await copyDirRecursive(
        join(DIST_PI_DIR, "skills"),
        join(piPackageDir, "skills"),
    );
    await copyDirRecursive(
        join(DIST_PI_DIR, "prompts"),
        join(piPackageDir, "prompts"),
    );
    console.log("  ✓ Synced Pi package assets");
}

/**
 * Transpile TypeScript CLI source files to JavaScript
 * - Uses Bun.build to compile .ts → .js for Node.js compatibility
 * - Maintains directory structure in dist/
 */
async function transpileCLI(): Promise<void> {
    console.log("🔧 Transpiling TypeScript to JavaScript...");

    const srcDir = join(ROOT, "src");
    const distDir = join(DIST_DIR);

    // List of all TypeScript entry points that need transpilation
    // Organized by dependency order (dependencies first)
    const entryPoints = [
        // Dependencies (lowest level)
        "types/common.ts",
        "util/log.ts",
        "util/discord-webhook.ts",
        "config/schema.ts",
        "config/loadConfig.ts",
        "config/modelResolver.ts",

        // Context system
        "context/types.ts",
        "context/vector.ts",
        "context/memory.ts",
        "context/session.ts",
        "context/progressive.ts",
        "context/retrieval.ts",
        "context/exporters/types.ts",
        "context/exporters/markdown.ts",
        "context/exporters/index.ts",
        "context/index.ts",

        // Agents
        "agents/types.ts",
        "agents/registry.ts",
        "agents/executor-bridge.ts",
        "agents/communication-hub.ts",
        "agents/coordinator.ts",
        "agents/code-review-executor.ts",
        "agents/improvement-tracker.ts",
        "agents/plan-generator.ts",

        // Backends
        "backends/opencode/client.ts",

        // Research
        "research/types.ts",
        "research/discovery.ts", // Skip for now - has Bun-specific imports
        "research/analysis.ts",
        "research/synthesis.ts",
        "research/orchestrator.ts",

        // Execution
        "execution/types.ts",
        "execution/flow-types.ts",
        "execution/flow-store.ts",
        "execution/quality-gates.ts",
        "execution/task-executor.ts",
        "execution/plan-parser.ts",
        "execution/ralph-loop.ts",

        // Prompt optimization
        "prompt-optimization/types.ts",
        "prompt-optimization/analyzer.ts",
        "prompt-optimization/techniques.ts",
        "prompt-optimization/optimizer.ts",
        "prompt-optimization/formatter.ts",
        "prompt-optimization/index.ts",

        // Install
        "install/install.ts",
        "install/init.ts",

        // CLI (highest level - must be last)
        "cli/flags.ts",
        "cli/ui.ts",
        "cli/run-cli.ts",
        "cli/tui/App.ts",
        "cli/run.ts",
    ];

    let successCount = 0;
    let skipCount = 0;

    // Transpile each entry point
    for (const entry of entryPoints) {
        const srcPath = join(srcDir, entry);
        if (!existsSync(srcPath)) {
            console.warn(`  ⚠️  Skipping ${entry} (not found)`);
            skipCount++;
            continue;
        }

        // Skip files with Bun-specific imports for now
        if (entry.includes("research/discovery.ts")) {
            console.log(
                `  ⚠️  Skipping ${entry} (Bun-specific imports need refactoring)`,
            );
            skipCount++;
            continue;
        }

        console.log(`  🔄 Transpiling ${entry}...`);

        const result = await Bun.build({
            entrypoints: [srcPath],
            outdir: distDir,
            target: "node",
            format: "esm",
            sourcemap: "inline", // For debugging
            minify: false, // Keep readable
            splitting: false, // Prevent CommonJS bundling
            external: [], // Don't bundle external modules
        });

        if (!result.success) {
            const messages = result.logs
                .map((l) => `${l.level}: ${l.message}`)
                .join("\n");
            console.error(`  ❌ Failed to transpile ${entry}:\n${messages}`);
            throw new Error(`Failed to transpile ${entry}:\n${messages}`);
        }

        successCount++;
        console.log(`  ✅ ${entry} transpiled`);
    }

    console.log(
        `  ✅ Transpilation complete: ${successCount} files, ${skipCount} skipped`,
    );
}

/**
 * Build CLI files to dist/
 * - Transpiles TypeScript to JavaScript for Node.js compatibility
 * - Copies required dependencies to dist/node_modules
 * - Creates a universal shim that works with both Node.js and Bun
 */
async function copyCLI(): Promise<void> {
    const nodeModulesSrc = join(ROOT, "node_modules");

    // Step 1: Transpile all TypeScript to JavaScript
    await transpileCLI();

    // Step 2: Copy required dependencies for CLI execution
    const depsToCopy = ["@opencode-ai/sdk", "@opencode-ai/plugin"];
    for (const dep of depsToCopy) {
        const srcPath = join(nodeModulesSrc, dep);
        const destPath = join(DIST_DIR, "node_modules", dep);
        if (existsSync(srcPath)) {
            await copyDirRecursive(srcPath, destPath);
        }
    }

    // Step 3: Create a universal shim (works with both Node.js and Bun)
    const shimPath = join(DIST_DIR, "cli", "run.js");

    // Ensure cli directory exists
    await mkdir(join(DIST_DIR, "cli"), { recursive: true });

    await writeFile(
        shimPath,
        `#!/usr/bin/env bun
/**
 * CLI entry point for ai-eng-system
 *
 * Works with both Node.js and Bun runtime
 * Imports pre-transpiled JavaScript files
 */

async function main() {
    // Import transpiled JavaScript (works in both Node.js and Bun)
    // Note: Bun.build flattens directory structure, so cli/run.ts -> dist/run.js
    const { runMain } = await import("../run.js");
    await runMain();
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
`,
    );
}

/**
 * Clean a directory by removing all contents and recreating it
 */
async function cleanDirectory(dir: string): Promise<void> {
    if (existsSync(dir)) {
        await rm(dir, { recursive: true, force: true });
    }
    await mkdir(dir, { recursive: true });
}

/**
 * Copy markdown files from source to destination directory
 */
async function copyMarkdownFiles(
    srcDir: string,
    destDir: string,
): Promise<void> {
    const files = await getMarkdownFiles(srcDir);
    for (const src of files) {
        await copyFile(src, join(destDir, basename(src)));
    }
}

/**
 * Sync commands and skills to .claude/ directory (local development + marketplace)
 * This is required for Claude Code's native skill tool to discover skills
 */
async function syncToLocalClaude(): Promise<void> {
    // Sync commands
    const claudeCommandsDir = join(ROOT_CLAUDE_DIR, "commands");
    await cleanDirectory(claudeCommandsDir);
    await copyMarkdownFiles(join(CONTENT_DIR, "commands"), claudeCommandsDir);

    // Sync skills while preserving namespace/category folders.
    const claudeSkillsDir = join(ROOT_CLAUDE_DIR, "skills");
    await cleanDirectory(claudeSkillsDir);
    await copySkillsPreservePath(SKILLS_DIR, claudeSkillsDir);

    // Sync hooks to .claude/hooks/ directory
    const claudeHooksDir = join(ROOT_CLAUDE_DIR, "hooks");
    const hookFiles = [
        ".claude/hooks/prompt-optimizer-hook.py",
        ".claude/hooks/hooks.json",
    ];
    for (const hookFile of hookFiles) {
        const src = join(ROOT, hookFile);
        if (existsSync(src)) {
            await mkdir(claudeHooksDir, { recursive: true });
            await copyFile(src, join(claudeHooksDir, basename(hookFile)));
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
        const src = join(ROOT, file);
        if (existsSync(src)) {
            const dest = join(DIST_DIR, "prompt-optimization", basename(file));
            await copyFile(src, dest);
        }
    }

    console.log("  ✓ Synced to .claude/");
}

// syncToClaudePlugin removed — .claude-plugin/ now only contains marketplace.json
// Plugin content lives in plugins/<plugin-name>/ directories

/**
 * Plugin mapping: defines which commands, agents, and skills belong to each plugin.
 * This is the authoritative source for the multi-plugin split.
 */
interface PluginConfig {
    commands: string[];
    agents: string[];
    skills: string[];
    assetDirs?: string[];
    description: string;
    category: string;
    keywords: string[];
    tags: string[];
    hasHooks?: boolean;
}

const PLUGIN_MAP: Record<string, PluginConfig> = {
    "ai-eng-core": {
        commands: [
            "plan",
            "work",
            "review",
            "specify",
            "research",
            "simplify",
            "context",
            "init",
        ],
        agents: [
            "architect-advisor",
            "full-stack-developer",
            "backend-architect",
            "frontend-reviewer",
            "subagent-orchestration",
            "java-pro",
        ],
        skills: [
            "comprehensive-research",
            "prompt-refinement",
            "incentive-prompting",
            "text-cleanup",
            "code-simplification",
            "incremental-implementation",
            "ai-eng",
            "workflow",
        ],
        description:
            "Core workflow: plan, work, review cycle with research and context engineering",
        category: "development",
        keywords: [
            "ai",
            "engineering",
            "workflow",
            "planning",
            "review",
            "context-engineering",
        ],
        tags: [
            "productivity",
            "workflow",
            "architecture",
            "context-engineering",
        ],
        hasHooks: true,
    },
    "ai-eng-learning": {
        commands: [
            "knowledge-architecture",
            "decision-journal",
            "quality-gate",
            "maintenance-review",
            "learning-approve",
            "learning-dismiss",
            "learning-snooze",
        ],
        agents: [],
        skills: ["knowledge-architecture"],
        assetDirs: [
            "docs/knowledge",
            "docs/decisions",
            "docs/quality",
            "docs/reviews/maintenance",
            "templates/knowledge",
            "templates/decisions",
            "templates/quality",
            "templates/review",
        ],
        description:
            "Learning workflows for knowledge mapping, decisions, quality gates, and maintenance reviews",
        category: "development",
        keywords: [
            "learning",
            "knowledge",
            "decisions",
            "quality",
            "maintenance",
        ],
        tags: [
            "learning-workflows",
            "knowledge-management",
            "quality-gates",
            "maintenance",
        ],
    },
    "ai-eng-research": {
        commands: [
            "deep-research",
            "research-companion",
            "context7-docs",
            "fact-check",
            "knowledge-capture",
        ],
        agents: [
            "ai-engineer",
            "docs-writer",
            "documentation-specialist",
            "ml-engineer",
        ],
        skills: ["knowledge-capture", "content-optimization"],
        description:
            "Deep research, knowledge capture, and documentation tools",
        category: "development",
        keywords: ["research", "documentation", "knowledge", "fact-checking"],
        tags: ["research-orchestration", "documentation", "knowledge-capture"],
    },
    "ai-eng-devops": {
        commands: [
            "deploy",
            "coolify",
            "docker",
            "k8s",
            "cloudflare",
            "monitoring",
            "sentry",
            "github",
            "git-workflow",
        ],
        agents: [
            "deployment-engineer",
            "infrastructure-builder",
            "aws-architect",
            "monitoring-expert",
            "cost-optimizer",
            "data-engineer",
        ],
        skills: ["coolify-deploy", "git-worktree"],
        description: "Infrastructure, deployment, and DevOps automation",
        category: "development",
        keywords: [
            "devops",
            "deployment",
            "infrastructure",
            "monitoring",
            "kubernetes",
        ],
        tags: ["devops", "deployment", "infrastructure", "monitoring"],
    },
    "ai-eng-quality": {
        commands: [
            "code-review",
            "security-scan",
            "socket-security",
            "api-test",
            "playwright",
            "chrome-debug",
            "ios-sim",
            "xcodebuild",
            "db-optimize",
        ],
        agents: [
            "code-reviewer",
            "security-scanner",
            "test-generator",
            "performance-engineer",
            "database-optimizer",
            "mobile-developer",
            "api-builder-enhanced",
        ],
        skills: ["code-review-and-quality", "debugging-and-error-recovery"],
        description:
            "Testing, security scanning, code review, and quality assurance",
        category: "development",
        keywords: [
            "testing",
            "security",
            "code-review",
            "quality",
            "performance",
        ],
        tags: ["quality-assurance", "security", "code-review", "testing"],
    },
    "ai-eng-content": {
        commands: [
            "content-optimize",
            "seo",
            "verbalize",
            "slack",
            "ralph-wiggum",
        ],
        agents: ["seo-specialist", "text-cleaner", "prompt-optimizer"],
        skills: [],
        description: "Content optimization, SEO, and communication tools",
        category: "development",
        keywords: ["content", "seo", "optimization", "communication"],
        tags: ["content-optimization", "seo", "communication"],
    },
    "ai-eng-plugin-dev": {
        commands: [
            "create-agent",
            "create-command",
            "create-skill",
            "create-tool",
            "create-plugin",
            "agent-analyzer",
        ],
        agents: [
            "agent-creator",
            "command-creator",
            "skill-creator",
            "tool-creator",
            "plugin-validator",
            "agent-developer",
        ],
        skills: ["plugin-dev", "monorepo-initialization"],
        description:
            "Meta-tooling for creating plugins, agents, commands, and skills",
        category: "development",
        keywords: ["plugin", "agent", "meta-tooling", "code-generation"],
        tags: ["plugin-development", "meta-tooling", "code-generation"],
    },
};

/**
 * Copy specific markdown files from a source directory to a destination,
 * filtering by a list of base names (without .md extension).
 */
async function copySelectedMarkdownFiles(
    srcDir: string,
    destDir: string,
    names: string[],
): Promise<string[]> {
    await mkdir(destDir, { recursive: true });
    const copied: string[] = [];
    for (const name of names) {
        const src = join(srcDir, `${name}.md`);
        if (existsSync(src)) {
            await copyFile(src, join(destDir, `${name}.md`));
            copied.push(`./commands/${name}.md`);
        } else {
            throw new Error(
                `Command not found during marketplace sync: ${src}`,
            );
        }
    }
    return copied;
}

/**
 * Copy specific agent files from a source directory to a destination.
 */
async function copySelectedAgentFiles(
    srcDir: string,
    destDir: string,
    names: string[],
): Promise<void> {
    await mkdir(destDir, { recursive: true });
    for (const name of names) {
        const src = join(srcDir, `${name}.md`);
        if (existsSync(src)) {
            await copyFile(src, join(destDir, `${name}.md`));
        } else {
            throw new Error(`Agent not found during marketplace sync: ${src}`);
        }
    }
}

/**
 * Copy specific skill directories from the skills source to a destination.
 */
async function copySelectedSkills(
    srcDir: string,
    destDir: string,
    skillNames: string[],
): Promise<void> {
    if (skillNames.length === 0) return;
    await mkdir(destDir, { recursive: true });
    for (const name of skillNames) {
        const src = join(srcDir, name);
        if (existsSync(src)) {
            await copyDirRecursive(src, join(destDir, name));
        } else {
            throw new Error(`Skill not found during marketplace sync: ${src}`);
        }
    }
}

/**
 * Sync commands, agents, and skills to plugins/<name>/ directories (marketplace source).
 * Generates one directory per plugin defined in PLUGIN_MAP.
 */
async function syncToMarketplacePlugins(): Promise<void> {
    const pluginsBaseDir = join(ROOT, "plugins");

    // Clean the entire plugins directory to remove stale content
    if (existsSync(pluginsBaseDir)) {
        await rm(pluginsBaseDir, { recursive: true, force: true });
    }

    const packageJson = JSON.parse(
        await readFile(join(ROOT, "package.json"), "utf-8"),
    );

    for (const [pluginName, config] of Object.entries(PLUGIN_MAP)) {
        const pluginDir = join(pluginsBaseDir, pluginName);
        await mkdir(pluginDir, { recursive: true });

        // Copy commands
        const commandPaths = await copySelectedMarkdownFiles(
            join(CONTENT_DIR, "commands"),
            join(pluginDir, "commands"),
            config.commands,
        );

        // Copy agents
        await copySelectedAgentFiles(
            join(CONTENT_DIR, "agents"),
            join(pluginDir, "agents"),
            config.agents,
        );

        // Copy skills
        await copySelectedSkills(
            SKILLS_DIR,
            join(pluginDir, "skills"),
            config.skills,
        );

        // Copy plugin-specific support assets such as templates and docs.
        for (const assetDir of config.assetDirs ?? []) {
            await copyDirRecursive(
                join(ROOT, assetDir),
                join(pluginDir, assetDir),
            );
        }

        // Generate plugin.json
        const pluginJson = {
            name: pluginName,
            version: packageJson.version,
            description: config.description,
            author: { name: "v1truv1us" },
            license: "MIT",
            commands: commandPaths,
        };
        await writeFile(
            join(pluginDir, "plugin.json"),
            JSON.stringify(pluginJson, null, 2),
        );

        // Copy hooks to core plugin only
        if (config.hasHooks) {
            const distHooksDir = join(CLAUDE_DIR, "hooks");
            if (existsSync(distHooksDir)) {
                await copyDirRecursive(distHooksDir, join(pluginDir, "hooks"));
            }
            // Generate hooks.json for session start notification
            const hooksJson = {
                hooks: [
                    {
                        matcher: {
                            event: "notification",
                            type: "session_start",
                        },
                        hooks: [
                            {
                                type: "command",
                                command:
                                    "echo '🔧 AI Engineering System loaded. Key commands: /plan, /work, /review, /research'",
                            },
                        ],
                    },
                ],
            };
            await writeFile(
                join(pluginDir, "hooks.json"),
                JSON.stringify(hooksJson, null, 2),
            );
        }

        console.log(
            `  ✓ Generated plugin: ${pluginName} (${config.commands.length} commands, ${config.agents.length} agents)`,
        );
    }

    console.log("  ✓ Synced all marketplace plugins");
}

/**
 * Auto-generate .claude-plugin/marketplace.json from PLUGIN_MAP.
 * Keeps the marketplace manifest in sync with actual plugin contents.
 */
async function generateMarketplaceJson(): Promise<void> {
    const packageJson = JSON.parse(
        await readFile(join(ROOT, "package.json"), "utf-8"),
    );

    const marketplace = {
        name: "ai-eng-system",
        owner: {
            name: "v1truv1us",
            email: "contact@v1truv1us.dev",
        },
        metadata: {
            description:
                "AI Engineering System - Modular development tools with context engineering, research orchestration, and specialized agents",
            version: packageJson.version,
        },
        plugins: Object.entries(PLUGIN_MAP).map(([name, config]) => ({
            name,
            source: `./plugins/${name}`,
            description: config.description,
            version: packageJson.version,
            author: {
                name: "v1truv1us",
                email: "contact@v1truv1us.dev",
            },
            homepage: "https://github.com/v1truv1us/ai-eng-system#readme",
            repository: "https://github.com/v1truv1us/ai-eng-system",
            license: "MIT",
            keywords: config.keywords,
            category: config.category,
            tags: config.tags,
        })),
    };

    const marketplaceDir = join(ROOT, ".claude-plugin");
    await mkdir(marketplaceDir, { recursive: true });
    await writeFile(
        join(marketplaceDir, "marketplace.json"),
        JSON.stringify(marketplace, null, 2) + "\n",
    );

    // Also copy to dist for validation convenience
    await writeFile(
        join(CLAUDE_DIR, "marketplace.json"),
        JSON.stringify(marketplace, null, 2) + "\n",
    );

    console.log("  ✓ Generated marketplace.json");
}

async function buildNpmEntrypoint(): Promise<void> {
    // Build npm-loadable OpenCode plugin entrypoint.
    // Skip if src/index.ts doesn't exist (e.g., in test environments)
    const srcIndexPath = join(ROOT, "src", "index.ts");
    if (!existsSync(srcIndexPath)) {
        console.log(
            "⚠️  Skipping npm entrypoint build (src/index.ts not found)",
        );
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
    const dtsPath = join(DIST_DIR, "index.d.ts");
    await writeFile(
        dtsPath,
        [
            'import type { Plugin } from "@opencode-ai/plugin";',
            "",
            "export declare const AiEngSystem: Plugin;",
            "",
        ].join("\n"),
    );

    // Compatibility: some loaders attempt to import the package directory itself.
    // Bun supports directory imports when an index.js exists at the directory root.
    // Build/export a tiny shim at dist/../index.js that re-exports from dist/index.js.
    const rootIndexJsPath = join(DIST_DIR, "..", "index.js");
    await writeFile(
        rootIndexJsPath,
        [
            "// Auto-generated compatibility shim for directory imports",
            'export * from "./dist/index.js";',
            'export { AiEngSystem as default } from "./dist/index.js";',
            "",
        ].join("\n"),
    );

    const rootIndexDtsPath = join(DIST_DIR, "..", "index.d.ts");
    await writeFile(
        rootIndexDtsPath,
        [
            'export * from "./dist/index";',
            'export { AiEngSystem as default } from "./dist/index";',
            "",
        ].join("\n"),
    );
}

async function validateContentOnly(): Promise<void> {
    if (!existsSync(CONTENT_DIR))
        throw new Error("content/ directory not found");

    const commandFiles = await getMarkdownFiles(join(CONTENT_DIR, "commands"));
    const agentFiles = await getMarkdownFiles(join(CONTENT_DIR, "agents"));

    const errors: string[] = [];

    for (const fp of commandFiles) {
        const content = await readFile(fp, "utf-8");
        const { meta } = parseFrontmatterStrict(content, fp);
        if (!meta.name) errors.push(`${fp}: missing 'name' in frontmatter`);
        if (!meta.description)
            errors.push(`${fp}: missing 'description' in frontmatter`);
    }

    errors.push(...(await validateCommandSkillReferences(commandFiles)));

    for (const fp of agentFiles) {
        const content = await readFile(fp, "utf-8");
        const { meta } = parseFrontmatterStrict(content, fp);
        if (!meta.name) errors.push(`${fp}: missing 'name' in frontmatter`);
        if (!meta.description)
            errors.push(`${fp}: missing 'description' in frontmatter`);
        if (!meta.mode) errors.push(`${fp}: missing 'mode' in frontmatter`);
    }

    if (errors.length) {
        console.error("\n❌ Validation failed:\n");
        for (const e of errors) console.error(` - ${e}`);
        throw new Error(`Validation failed with ${errors.length} error(s)`);
    }
}

/**
 * Validate all generated agent files for platform-specific requirements
 * - Claude Code: Should NOT have permission field
 * - OpenCode: Should only have valid permission keys (edit, bash, webfetch, doom_loop, external_directory)
 */
async function validateAgents(): Promise<void> {
    const errors: string[] = [];

    // Validate Claude Code agents (dist/.claude-plugin/agents/)
    const claudeAgentFiles = await getMarkdownFiles(CLAUDE_DIR);
    for (const fp of claudeAgentFiles) {
        const fileContent = await readFile(fp, "utf-8");
        const { meta } = parseFrontmatterStrict(fileContent, fp);

        if (meta.permission) {
            errors.push(
                `${fp}: Claude Code agents should not have permission field (use tools instead)`,
            );
        }
    }

    // Validate OpenCode agents (dist/.opencode/agent/ and .opencode/agent/)
    const openCodeDirs = IS_TEST_MODE
        ? [DIST_OPENCODE_DIR]
        : [DIST_OPENCODE_DIR, ROOT_OPENCODE_DIR];
    for (const opencodeRoot of openCodeDirs) {
        const agentDir = join(opencodeRoot, "agent", NAMESPACE_PREFIX);
        if (!existsSync(agentDir)) continue;

        const agentFiles = await getMarkdownFiles(agentDir);
        for (const fp of agentFiles) {
            const fileContent = await readFile(fp, "utf-8");
            const { meta } = parseFrontmatterStrict(fileContent, fp);

            if (meta.permission) {
                const validKeys = VALID_OPENCODE_PERMISSION_KEYS;
                for (const key of Object.keys(meta.permission)) {
                    if (!validKeys.includes(key)) {
                        errors.push(
                            `${fp}: Invalid permission key '${key}' (only edit/bash/webfetch/doom_loop/external_directory allowed)`,
                        );
                    }
                }
            }
        }
    }

    if (errors.length) {
        console.error("\n❌ Agent validation failed:\n");
        for (const e of errors) console.error(` - ${e}`);
        throw new Error(
            `Agent validation failed with ${errors.length} error(s)`,
        );
    }

    console.log("✅ All agents validated successfully");
}

async function buildAll(): Promise<void> {
    const start = Date.now();

    if (existsSync(DIST_DIR)) {
        await rm(DIST_DIR, { recursive: true, force: true });
    }
    await mkdir(DIST_DIR, { recursive: true });

    if (!existsSync(CONTENT_DIR)) {
        throw new Error("content/ directory not found");
    }

    await validateContentOnly();

    // Build to dist/
    await buildClaude();
    await buildOpenCode();
    await buildPi();
    await copySkillsToDist();

    // Skip steps that require the full project tree when running in test mode
    if (!IS_TEST_MODE) {
        await copyPromptOptimization();
        await copyCLI();
        await buildNpmEntrypoint();

        // Sync to committed directories (required for marketplace/packages)
        console.log("\n📦 Syncing generated assets...");
        await syncToLocalClaude();
        await syncToMarketplacePlugins();
        await generateMarketplaceJson();
        await syncToPiPackage();
    }

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
    } else if (args.includes("--watch")) {
        console.log("👀 Watching for changes...");
        await buildAll();

        watch(
            CONTENT_DIR,
            { recursive: true },
            async (_eventType, filename) => {
                if (!filename?.endsWith(".md")) return;
                console.log(`\n📝 Changed: ${filename}`);
                await buildAll();
            },
        );
    } else {
        await buildAll();
    }
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ ${message}`);
    process.exit(1);
}
