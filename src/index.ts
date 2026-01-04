import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "@opencode-ai/plugin";

/**
 * Check if a config file references the ai-eng-system plugin.
 * Uses simple string search - no JSONC parsing needed.
 */
function fileContainsPlugin(configPath: string): boolean {
    try {
        const content = fs.readFileSync(configPath, "utf-8");
        return content.includes('"ai-eng-system"');
    } catch {
        return false;
    }
}

/**
 * Find where to install plugin files based on which config references us.
 * Priority: Global config first (~/.config/opencode/) > project config (.opencode/)
 *
 * @param projectDir - The project directory passed by OpenCode
 * @returns The target directory for installation, or null if not referenced anywhere
 */
function findInstallationTarget(projectDir: string): string | null {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";

    // Priority 1: Check global config - if we're referenced there, install globally
    const globalConfigPath = path.join(
        homeDir,
        ".config",
        "opencode",
        "opencode.jsonc",
    );
    if (
        fs.existsSync(globalConfigPath) &&
        fileContainsPlugin(globalConfigPath)
    ) {
        return path.join(homeDir, ".config", "opencode");
    }

    // Priority 2: Check project config - if we're referenced there, install locally
    const projectConfigPath = path.join(
        projectDir,
        ".opencode",
        "opencode.jsonc",
    );
    if (
        fs.existsSync(projectConfigPath) &&
        fileContainsPlugin(projectConfigPath)
    ) {
        return path.join(projectDir, ".opencode");
    }

    // Not referenced anywhere (edge case - shouldn't happen if plugin is loaded)
    return null;
}

/**
 * Copy a directory recursively
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
 * Install AI Engineering System files to the target directory.
 *
 * @param pluginDir - The plugin's dist directory (source of files)
 * @param targetDir - The target .opencode directory (e.g., ~/.config/opencode/ or .opencode/)
 */
function installToProject(pluginDir: string, targetDir: string): void {
    // When running from dist/index.js, pluginDir is already the dist directory
    // When running from package root during development, pluginDir is the package root
    const isDistDir = fs.existsSync(path.join(pluginDir, ".opencode"));

    const distDir = isDistDir ? pluginDir : path.join(pluginDir, "dist");
    const distOpenCodeDir = path.join(distDir, ".opencode");
    const distSkillsDir = path.join(distDir, "skills");
    const NAMESPACE_PREFIX = "ai-eng";

    // Target directory is now passed directly (no longer appending .opencode)
    const targetOpenCodeDir = targetDir;

    // Copy commands (namespaced under ai-eng/)
    const commandsSrc = path.join(distOpenCodeDir, "command", NAMESPACE_PREFIX);
    if (fs.existsSync(commandsSrc)) {
        const commandsDest = path.join(
            targetOpenCodeDir,
            "command",
            NAMESPACE_PREFIX,
        );
        copyRecursive(commandsSrc, commandsDest);
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
    }

    // Copy skills (to .opencode/skill/)
    // OpenCode expects skills at .opencode/skill/ (singular, per https://opencode.ai/docs/skills)
    const distSkillDir = path.join(distDir, ".opencode", "skill");
    if (fs.existsSync(distSkillDir)) {
        const skillDest = path.join(targetOpenCodeDir, "skill");
        copyRecursive(distSkillDir, skillDest);
    }
}

/**
 * AI Engineering System OpenCode Plugin
 *
 * When loaded, this plugin automatically detects installation location and installs:
 * - Commands to ~/.config/opencode/command/ai-eng/ (global) or .opencode/command/ai-eng/ (project)
 * - Agents to ~/.config/opencode/agent/ai-eng/ (global) or .opencode/agent/ai-eng/ (project)
 * - Skills to ~/.config/opencode/skill/ (global) or .opencode/skill/ (project)
 *
 * Installation location is determined by checking which opencode.jsonc references "ai-eng-system":
 * - Global config (~/.config/opencode/opencode.jsonc) takes precedence
 * - Project config ({project}/.opencode/opencode.jsonc) is fallback
 *
 * All files are copied from the plugin's dist/ directory to the target directory.
 *
 * Plugin format follows OpenCode docs: https://opencode.ai/docs/plugins
 */
export const AiEngSystem: Plugin = async ({
    project,
    client,
    $,
    directory,
    worktree,
}) => {
    // Get the plugin directory (where this package is installed)
    const pluginDir = path.dirname(new URL(import.meta.url).pathname);

    // Find installation target based on which config references us
    const targetDir = findInstallationTarget(directory);

    if (!targetDir) {
        // Plugin not referenced in any config - skip installation silently
        return {
            config: async (input: Record<string, unknown>) => {
                // No-op config hook
            },
        };
    }

    // Check if this is first installation (for logging)
    const isFirstRun = !fs.existsSync(
        path.join(targetDir, "command", "ai-eng"),
    );

    // Install files to the target directory
    try {
        installToProject(pluginDir, targetDir);

        if (isFirstRun) {
            console.info(`[ai-eng-system] Installed to: ${targetDir}`);
        }
    } catch (error) {
        // Silent fail - if installation fails, it's not critical
        console.error(
            `[ai-eng-system] Installation warning: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    // Return hooks object with config function - OpenCode calls hook.config during init
    return {
        config: async (input: Record<string, unknown>) => {
            // No-op config hook
        },
    };
};

// Default export for plugin loaders that expect `export default`
export default AiEngSystem;
