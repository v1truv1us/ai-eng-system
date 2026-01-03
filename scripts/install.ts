#!/usr/bin/env node

/**
 * AI Engineering System Post-Install Script
 *
 * Runs when package is installed via npm/bun.
 * Installs commands, agents, and skills to the project's .opencode directory.
 * Installs hooks to the project's .claude/hooks/ directory for Claude Code.
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
 * Find the nearest opencode.jsonc by traversing up from current directory
 */
function findOpenCodeConfig(startDir: string): string | null {
    let currentDir = startDir;
    const root = path.parse(startDir).root;

    while (currentDir !== root) {
        const configPath = path.join(currentDir, "opencode.jsonc");
        if (fs.existsSync(configPath)) {
            return configPath;
        }
        currentDir = path.dirname(currentDir);
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
    // This ensures users get the hooks regardless of whether they've used Claude Code yet
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
 * Install Claude Code hooks from canonical marketplace source
 */
async function installClaudeHooks(
    targetDir: string,
    silent = false,
): Promise<void> {
    const canonicalHooksDir = path.join(
        packageRoot,
        "plugins",
        "ai-eng-system",
        "hooks",
    );
    const targetHooksDir = path.join(targetDir, ".claude", "hooks");

    // Verify canonical hooks directory exists
    if (!fs.existsSync(canonicalHooksDir)) {
        if (!silent) {
            console.log(
                "  ℹ️  No hooks found in plugins/ai-eng-system/hooks/ (skip)",
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

    // Copy hooks from canonical source
    try {
        await copyDirRecursive(canonicalHooksDir, targetHooksDir);
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
        if (copiedFiles.length > 0 && !silent) {
            // Only show file details in verbose mode
            for (const file of copiedFiles) {
                console.log(`    - ${file}`);
            }
        }
        console.log(
            "    📝 Hooks enable automatic prompt optimization (+45-115% quality)",
        );
        console.log(
            "    🚫 Use '!' prefix to skip optimization for specific prompts",
        );
    }
}

/**
 * Install AI Engineering System files
 */
async function install(targetDir: string, silent = false): Promise<void> {
    if (!silent) {
        console.log(`🔧 Installing AI Engineering System to ${targetDir}`);
    }

    const distDir = path.join(packageRoot, "dist");
    const distOpenCodeDir = path.join(distDir, ".opencode");
    const distSkillsDir = path.join(distDir, "skills");

    // Target directories
    const targetOpenCodeDir = path.join(targetDir, ".opencode");

    // Verify dist directory exists
    if (!fs.existsSync(distOpenCodeDir)) {
        if (!silent) {
            console.error(
                '❌ Error: dist/.opencode not found. Run "bun run build" first.',
            );
        }
        process.exit(1);
    }

    // Copy opencode.jsonc config if it exists (only if not already present)
    const configSrc = path.join(distOpenCodeDir, "opencode.jsonc");
    const configDest = path.join(targetDir, "opencode.jsonc");
    if (fs.existsSync(configSrc) && !fs.existsSync(configDest)) {
        fs.copyFileSync(configSrc, configDest);
        if (!silent) console.log("  ✓ opencode.jsonc");
    }

    // Copy commands (namespaced under ai-eng/)
    const commandsSrc = path.join(distOpenCodeDir, "command", NAMESPACE_PREFIX);
    if (fs.existsSync(commandsSrc)) {
        const commandsDest = path.join(
            targetOpenCodeDir,
            "command",
            NAMESPACE_PREFIX,
        );
        copyRecursive(commandsSrc, commandsDest);

        const commandCount = fs
            .readdirSync(commandsSrc)
            .filter((f) => f.endsWith(".md")).length;
        if (!silent)
            console.log(
                `  ✓ command/${NAMESPACE_PREFIX}/ (${commandCount} commands)`,
            );
    }

    // Copy agents (namespaced under ai-eng/)
    const agentsSrc = path.join(distOpenCodeDir, "agent", NAMESPACE_PREFIX);
    if (fs.existsSync(agentsSrc)) {
        const agentsDest = path.join(
            targetOpenCodeDir,
            "agent",
            NAMESPACE_PREFIX,
        );
        copyRecursive(agentsSrc, agentsDest);

        function countMarkdownFiles(dir: string): number {
            let count = 0;
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    count += countMarkdownFiles(fullPath);
                } else if (entry.endsWith(".md")) {
                    count++;
                }
            }
            return count;
        }
        const agentCount = countMarkdownFiles(agentsSrc);
        if (!silent)
            console.log(
                `  ✓ agent/${NAMESPACE_PREFIX}/ (${agentCount} agents)`,
            );
    }

    // Copy skills (to .opencode/skill/)
    // OpenCode expects skills at .opencode/skill/ (singular, per https://opencode.ai/docs/skills)
    const distSkillDir = path.join(distDir, ".opencode", "skill");
    if (fs.existsSync(distSkillDir)) {
        const skillDest = path.join(targetOpenCodeDir, "skill");
        copyRecursive(distSkillDir, skillDest);

        // Count skills
        const skillDirs = fs.readdirSync(distSkillDir);
        const skillCount = skillDirs.length;
        if (!silent) console.log(`  ✓ skill/ (${skillCount} skills)`);
    }

    // Install Claude Code hooks (async operation)
    try {
        await installClaudeHooks(targetDir, silent);
    } catch (error) {
        // Log error but don't fail the entire installation
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ⚠️  Failed to install Claude Code hooks: ${message}`);
    }

    if (!silent) {
        console.log("\n✅ Installation complete!");
        console.log(`   Namespace: ${NAMESPACE_PREFIX}`);
    }
}

/**
 * Entry point
 */
async function main(): Promise<void> {
    const isPostInstall = process.env.npm_lifecycle_event === "postinstall";

    if (isPostInstall) {
        // During npm install, find opencode.jsonc and install there
        const cwd = process.cwd();
        const configPath = findOpenCodeConfig(cwd);

        if (!configPath) {
            // Silent exit - no OpenCode project found
            return;
        }

        const targetDir = path.dirname(configPath);
        await install(targetDir, true); // Silent mode
    } else {
        // Manual invocation
        const cwd = process.cwd();
        const configPath = findOpenCodeConfig(cwd);

        if (!configPath) {
            console.error(
                "❌ Error: opencode.jsonc not found in current directory or parent directories",
            );
            console.error(
                "   Please run this script from a project containing opencode.jsonc",
            );
            process.exit(1);
        }

        const targetDir = path.dirname(configPath);
        await install(targetDir, false); // Verbose mode
    }
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Installation failed: ${message}`);
    process.exit(1);
});
