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
 * Clean a namespaced directory before reinstallation.
 * Only removes ai-eng namespace, preserving other user content.
 */
function cleanNamespacedDirectory(
    baseDir: string,
    subdir: string,
    namespace: string,
    silent = false,
): void {
    const dir = path.join(baseDir, subdir, namespace);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        if (!silent) {
            console.log(`  🧹 Cleaned existing ${subdir}/${namespace}/`);
        }
    }
}

/**
 * Clean ai-eng-system skills by reading skill names from dist.
 * Only removes skills that are part of ai-eng-system, preserving user skills.
 */
function cleanAiEngSkills(
    targetOpenCodeDir: string,
    distOpenCodeDir: string,
    silent = false,
): void {
    const targetSkillDir = path.join(targetOpenCodeDir, "skill");
    const distSkillDir = path.join(distOpenCodeDir, "skill");

    if (!fs.existsSync(distSkillDir)) return;

    // Get list of ai-eng-system skill names from dist
    const aiEngSkillNames = fs
        .readdirSync(distSkillDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    if (aiEngSkillNames.length === 0) return;

    let cleanedCount = 0;
    for (const skillName of aiEngSkillNames) {
        const skillPath = path.join(targetSkillDir, skillName);
        if (fs.existsSync(skillPath)) {
            fs.rmSync(skillPath, { recursive: true, force: true });
            cleanedCount++;
        }
    }

    if (!silent && cleanedCount > 0) {
        console.log(`  🧹 Cleaned ${cleanedCount} existing ai-eng skills`);
    }
}

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
    const targetOpenCodeDir = targetDir;

    // Verify dist directory exists
    if (!fs.existsSync(distOpenCodeDir)) {
        if (!silent) {
            console.error(
                '❌ Error: dist/.opencode not found. Run "bun run build" first.',
            );
        }
        process.exit(1);
    }

    // Clean existing ai-eng commands before copying
    cleanNamespacedDirectory(
        targetOpenCodeDir,
        "command",
        NAMESPACE_PREFIX,
        silent,
    );

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

    // Clean existing ai-eng agents before copying
    cleanNamespacedDirectory(
        targetOpenCodeDir,
        "agent",
        NAMESPACE_PREFIX,
        silent,
    );

    // Copy agents (namespaced under ai-eng/)
    const agentsSrc = path.join(distOpenCodeDir, "agent", NAMESPACE_PREFIX);
    if (fs.existsSync(agentsSrc)) {
        const agentsDest = path.join(
            targetOpenCodeDir,
            "agent",
            NAMESPACE_PREFIX,
        );
        copyRecursive(agentsSrc, agentsDest);

        let agentCount = 0;
        const agentEntries = fs.readdirSync(agentsSrc);
        for (const entry of agentEntries) {
            const fullPath = path.join(agentsSrc, entry);
            if (fs.statSync(fullPath).isDirectory()) {
                agentCount++;
            }
        }
        if (!silent)
            console.log(
                `  ✓ agent/${NAMESPACE_PREFIX}/ (${agentCount} agents)`,
            );
    }

    // Clean existing ai-eng skills before copying
    cleanAiEngSkills(targetOpenCodeDir, distDir, silent);

    // Copy skills (to skill/ - SINGULAR, matching OpenCode docs)
    const distSkillDir = path.join(distOpenCodeDir, "skill");
    if (fs.existsSync(distSkillDir)) {
        const skillDest = path.join(targetOpenCodeDir, "skill");
        copyRecursive(distSkillDir, skillDest);

        const skillDirs = fs.readdirSync(distSkillDir);
        const skillCount = skillDirs.length;
        if (!silent) console.log(`  ✓ skill/ (${skillCount} skills)`);
    }

    // Install Claude Code hooks (in parent directory of .opencode)
    const projectRootDir = path.dirname(targetDir);
    await installClaudeHooks(projectRootDir, silent);

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
        const configResult = findOpenCodeConfig(cwd);

        if (!configResult) {
            // Silent exit - no OpenCode config found
            return;
        }

        // Check if plugin is referenced
        if (!isPluginReferenced(configResult.path)) {
            // Silent exit - plugin not referenced
            return;
        }

        const targetDir = path.dirname(configResult.path);
        await install(targetDir, true); // Silent mode
    } else {
        // Manual invocation
        const cwd = process.cwd();
        const configResult = findOpenCodeConfig(cwd);

        if (!configResult) {
            console.error(
                "❌ Error: opencode.jsonc not found in .opencode/ or ~/.config/opencode/",
            );
            console.error(
                "   Create .opencode/opencode.jsonc in your project, or use ~/.config/opencode/opencode.jsonc for global installation",
            );
            process.exit(1);
        }

        // Check if plugin is referenced
        if (!isPluginReferenced(configResult.path)) {
            console.error(
                "❌ Error: ai-eng-system is not referenced in opencode.jsonc plugin list",
            );
            console.error(
                "   Add 'ai-eng-system' to the plugin array in opencode.jsonc",
            );
            process.exit(1);
        }

        const targetDir = path.dirname(configResult.path);
        await install(targetDir, false); // Verbose mode
    }
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Installation failed: ${message}`);
    process.exit(1);
});
