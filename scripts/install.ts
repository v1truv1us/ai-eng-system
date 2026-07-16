#!/usr/bin/env node

/**
 * AI Engineering System Post-Install Script
 *
 * Runs when package is installed via npm/bun.
 * Installs commands, agents, and skills to project's .opencode directory.
 * Installs hooks to project's .claude/hooks/ directory for Claude Code.
 *
 * Usage:
 * - Automatic: Runs during npm install
 * - Manual: bun run install
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.dirname(__dirname);

const NAMESPACE_PREFIX = "ai-eng";

/**
 * Check if ai-eng-system plugin is referenced in opencode.jsonc
 */
function isPluginReferenced(configPath: string): boolean {
    try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config: any = JSON.parse(configContent);

        // Check if plugin array contains ai-eng-system
        if (Array.isArray(config.plugin)) {
            return config.plugin.includes("ai-eng-system");
        }

        return false;
    } catch (error) {
        // Invalid JSON or read error - not referenced
        return false;
    }
}

/**
 * Find OpenCode config in supported locations
 * Priority: project .opencode/ → global ~/.config/opencode/
 */
function findOpenCodeConfig(
    startDir: string,
): { path: string; scope: "project" | "global" } | null {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";

    // 1. Check project-local: <project>/.opencode/opencode.jsonc
    const projectConfigPath = path.join(
        startDir,
        ".opencode",
        "opencode.jsonc",
    );
    if (fs.existsSync(projectConfigPath)) {
        return { path: projectConfigPath, scope: "project" };
    }

    // 2. Check global: ~/.config/opencode/opencode.jsonc
    const globalConfigPath = path.join(
        homeDir,
        ".config",
        "opencode",
        "opencode.jsonc",
    );
    if (fs.existsSync(globalConfigPath)) {
        return { path: globalConfigPath, scope: "global" };
    }

    return null;
}

/**
 * Check if target directory is a Claude Code project
 * (has .claude/ directory or CLAUDE_PROJECT_DIR environment variable)
 */
function isClaudeCodeProject(targetDir: string): boolean {
    // Check for .claude/ directory
    if (fs.existsSync(path.join(targetDir, ".claude"))) {
        return true;
    }

    // Check for CLAUDE_PROJECT_DIR environment variable pointing here
    const projectDir = process.env.CLAUDE_PROJECT_DIR;
    if (projectDir && path.resolve(projectDir) === path.resolve(targetDir)) {
        return true;
    }

    // Even if neither exists, we should install hooks in case user wants to use Claude Code
    // This ensures users get hooks regardless of whether they've used Claude Code yet
    return true;
}

/**
 * Copy a directory recursively (sync version for OpenCode)
 */
function copyRecursive(src: string, dest: string): void {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

/**
 * Copy a directory recursively (async version for Claude Code hooks)
 */
async function copyDirRecursive(src: string, dest: string): Promise<void> {
    const stat = await fs.promises.stat(src);

    if (stat.isDirectory()) {
        await fs.promises.mkdir(dest, { recursive: true });
        const entries = await fs.promises.readdir(src);
        for (const entry of entries) {
            await copyDirRecursive(
                path.join(src, entry),
                path.join(dest, entry),
            );
        }
    } else {
        await fs.promises.mkdir(path.dirname(dest), { recursive: true });
        await fs.promises.copyFile(src, dest);
    }
}

/**
 * Backup existing hooks directory with timestamp
 */
async function backupHooksDir(hooksDir: string): Promise<string | null> {
    if (!fs.existsSync(hooksDir)) {
        return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `${hooksDir}.backup-${timestamp}`;

    try {
        await copyDirRecursive(hooksDir, backupDir);
        return backupDir;
    } catch (error) {
        throw new Error(
            `Failed to backup existing hooks: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Install Claude Code hooks from the built/canonical hook source.
 */
async function installClaudeHooks(
    targetDir: string,
    silent = false,
): Promise<void> {
    // Resolve hook source. Prefer the built dist (shipped in the published
    // package and consistent with the OpenCode content source), then the
    // repo's .claude/hooks/, then the legacy marketplace path.
    const hookSourceCandidates = [
        path.join(packageRoot, "dist", ".claude-plugin", "hooks"),
        path.join(packageRoot, ".claude", "hooks"),
        path.join(packageRoot, "plugins", "ai-eng-system", "hooks"),
    ];
    const canonicalHooksDir =
        hookSourceCandidates.find((d) => fs.existsSync(d)) ?? null;
    const targetHooksDir = path.join(targetDir, ".claude", "hooks");

    // No hook source available
    if (!canonicalHooksDir) {
        if (!silent) {
            console.log(
                "  ℹ️  No hook sources found (run `bun run build`) (skip)",
            );
        }
        return;
    }

    // Check if target is a Claude Code project
    const isClaudeProject = isClaudeCodeProject(targetDir);
    if (!isClaudeProject && !silent) {
        console.log(
            "  ℹ️  Not a Claude Code project, installing hooks anyway...",
        );
    }

    // Backup existing hooks if they exist
    if (fs.existsSync(targetHooksDir)) {
        if (!silent) {
            console.log("  📦 Backing up existing hooks...");
        }
        const backupDir = await backupHooksDir(targetHooksDir);
        if (backupDir && !silent) {
            console.log(`    ✓ Backed up to: ${path.basename(backupDir)}`);
        }
    }

    // Create target hooks directory (including .claude/ if needed)
    await fs.promises.mkdir(targetHooksDir, { recursive: true });

    // Copy hooks from canonical source (skip test/doc files)
    const NON_HOOK_PATTERNS = [/^test_/i, /\.md$/i];
    const isHookFile = (name: string) =>
        !NON_HOOK_PATTERNS.some((re) => re.test(name));
    try {
        const entries = await fs.promises.readdir(canonicalHooksDir, {
            withFileTypes: true,
        });
        for (const entry of entries) {
            const src = path.join(canonicalHooksDir, entry.name);
            const dest = path.join(targetHooksDir, entry.name);
            if (entry.isDirectory()) {
                await copyDirRecursive(src, dest);
            } else if (entry.isFile() && isHookFile(entry.name)) {
                await fs.promises.copyFile(src, dest);
            }
        }
    } catch (error) {
        throw new Error(
            `Failed to copy hooks: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    // Count copied files
    const copiedFiles: string[] = [];
    async function countFiles(dir: string, baseDir: string = dir) {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await countFiles(fullPath, baseDir);
            } else if (entry.isFile()) {
                const relPath = path.relative(baseDir, fullPath);
                copiedFiles.push(relPath);
            }
        }
    }
    await countFiles(targetHooksDir);

    if (!silent) {
        console.log(
            `  ✓ Installed ${copiedFiles.length} hook file(s) to .claude/hooks/`,
        );
        console.log(
            "    📝 Hooks enable automatic prompt optimization (+45-115% quality)",
        );
        console.log(
            "    🚫 Use '!' prefix to skip optimization for specific prompts",
        );
    }
}

/**
 * Install AI Engineering System files.
 *
 * dist/.opencode is built with BOTH singular (agent/command/skill/tool, read
 * by opencode 1.18) and plural (agents/commands/skills/tools, read by >=1.19)
 * surfaces, all with flat agent names. We mirror both through to the target
 * and purge stale namespaced content from older installs first.
 */
function countFilesRecursive(dir: string): number {
    let n = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) n += countFilesRecursive(p);
        else if (entry.isFile()) n++;
    }
    return n;
}

async function install(
    targetDir: string,
    claudeRoot: string,
    silent = false,
): Promise<void> {
    if (!silent) {
        console.log(`🔧 Installing AI Engineering System to ${targetDir}`);
    }

    const distOpenCodeDir = path.join(packageRoot, "dist", ".opencode");

    if (!fs.existsSync(distOpenCodeDir)) {
        if (!silent) {
            console.error(
                '❌ Error: dist/.opencode not found. Run "bun run build" first.',
            );
        }
        process.exit(1);
    }

    // Purge stale namespaced content from older installs:
    //  - agents used to be nested under <surface>/ai-eng/<category>/
    //  - commands live under <surface>/ai-eng/ (rebuilt each install)
    for (const sub of ["agent", "agents", "command", "commands"]) {
        const stale = path.join(targetDir, sub, NAMESPACE_PREFIX);
        if (fs.existsSync(stale)) {
            fs.rmSync(stale, { recursive: true, force: true });
            if (!silent)
                console.log(`  🧹 Cleaned stale ${sub}/${NAMESPACE_PREFIX}/`);
        }
    }

    // Copy each surface (singular + plural) straight through from the build.
    // Only log the singular variant to avoid duplicate output.
    const surfaces: Array<{ dir: string; label: string; log: boolean }> = [
        { dir: "command", label: "commands", log: true },
        { dir: "commands", label: "commands", log: false },
        { dir: "agent", label: "agents", log: true },
        { dir: "agents", label: "agents", log: false },
        { dir: "skill", label: "skills", log: true },
        { dir: "skills", label: "skills", log: false },
        { dir: "tool", label: "tools", log: true },
        { dir: "tools", label: "tools", log: false },
    ];
    for (const { dir, label, log } of surfaces) {
        const src = path.join(distOpenCodeDir, dir);
        if (!fs.existsSync(src)) continue;
        copyRecursive(src, path.join(targetDir, dir));
        if (log && !silent) {
            const n = countFilesRecursive(src);
            console.log(`  ✓ ${dir}/ (${n} ${label})`);
        }
    }

    // Install Claude Code hooks (global ~/.claude/ or project root)
    await installClaudeHooks(claudeRoot, silent);

    if (!silent) {
        console.log("\n✅ Installation complete!");
        console.log(`   Namespace: ${NAMESPACE_PREFIX}`);
    }
}

/**
 * Entry point
 *
 * Default (and --global): install to ~/.config/opencode/ (global library)
 *   - OpenCode content -> ~/.config/opencode/{commands,agents,skills,tools}/
 *   - Claude hooks      -> ~/.claude/hooks/
 * --local: install to <cwd>/.opencode/ and <cwd>/.claude/hooks/
 *
 * Content is discovered natively by OpenCode (no plugin reference required).
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const isLocal = args.includes("--local") || args.includes("-l");
    const silent = process.env.npm_lifecycle_event === "postinstall";
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";

    let openCodeTarget: string;
    let claudeRoot: string;

    if (isLocal) {
        openCodeTarget = path.join(process.cwd(), ".opencode");
        claudeRoot = process.cwd();
    } else {
        // Global library (default)
        openCodeTarget = path.join(homeDir, ".config", "opencode");
        claudeRoot = homeDir; // ~/.claude/hooks/
    }

    if (!silent) {
        console.log(
            `🔧 Installing AI Engineering System (${isLocal ? "project-local" : "global"})`,
        );
        console.log(`   OpenCode -> ${openCodeTarget}`);
        console.log(
            `   Claude   -> ${path.join(claudeRoot, ".claude", "hooks")}`,
        );
    }

    await install(openCodeTarget, claudeRoot, silent);
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Installation failed: ${message}`);
    process.exit(1);
});
