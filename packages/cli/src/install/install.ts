/**
 * ai-eng install command
 *
 * Installs OpenCode/Claude assets to project or global location.
 * Cleans previously installed ai-eng artifacts before writing.
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import {
    getDistOpenCodeContent,
    type OpenCodeContent,
} from "@ai-eng-system/core";
import {
    cleanOpenCodeInstall,
    cleanToolkitHarness,
    extractOpenCodeSkillDirs,
    extractOpenCodeToolPaths,
} from "./clean";
import { type InstallManifestEntry, upsertManifestEntry } from "./manifest";
import {
    listSkillTreeEntries,
    syncGeminiCommands,
    syncSkillsTree,
} from "./sync-skills";
import {
    getAgentSkillsInstallDir,
    getHarnessSkillsSourceDir,
    getInstallTargetDir,
    getToolkitHarnessSource,
    type InstallScope,
    resolveInstallBaseDir,
    type ToolkitHarness,
    usesSkillsOnlyInstall,
} from "./toolkit-path";
import type { CleanFlags, InstallFlags, InstallPlatform } from "./types";
import { appendTelemetryEvent, isTelemetryEnabled } from "./telemetry";

const NAMESPACE_PREFIX = "ai-eng";
const PACKAGE_VERSION = "1.6.8"; // TODO: read from package.json at build time

async function copyRecursive(src: string, dest: string): Promise<void> {
    const stat = await fsp.stat(src);
    if (stat.isDirectory()) {
        await fsp.mkdir(dest, { recursive: true });
        for (const entry of await fsp.readdir(src)) {
            await copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        await fsp.mkdir(path.dirname(dest), { recursive: true });
        await fsp.copyFile(src, dest);
    }
}

function isPluginReferenced(configPath: string): boolean {
    try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configContent);
        if (Array.isArray(config.plugin)) {
            return config.plugin.includes("ai-eng-system");
        }
        return false;
    } catch {
        return false;
    }
}

function findOpenCodeConfig(
    projectDir: string,
): { path: string; isGlobal: boolean } | null {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";

    const projectConfig = path.join(projectDir, ".opencode", "opencode.jsonc");
    if (fs.existsSync(projectConfig)) {
        return { path: projectConfig, isGlobal: false };
    }

    const globalConfig = path.join(
        homeDir,
        ".config",
        "opencode",
        "opencode.jsonc",
    );
    if (fs.existsSync(globalConfig)) {
        return { path: globalConfig, isGlobal: true };
    }

    return null;
}

export function detectInstallationScope(
    projectDir: string,
): "project" | "global" | null {
    const config = findOpenCodeConfig(projectDir);
    if (config) return config.isGlobal ? "global" : "project";

    if (fs.existsSync(path.join(projectDir, "package.json"))) {
        return "project";
    }

    return "global";
}

export function resolveInstallScope(
    flags: InstallFlags,
    projectDir: string,
): InstallScope {
    const raw = flags.scope ?? "auto";
    if (raw === "auto") {
        const detected = detectInstallationScope(projectDir);
        return detected ?? "project";
    }
    return raw;
}

function toCleanFlags(flags: InstallFlags): CleanFlags {
    return {
        scope: flags.scope,
        platform: flags.platform,
        dryRun: flags.dryRun,
        verbose: flags.verbose,
    };
}

function listGeminiCommandFiles(sourceGeminiDir: string): string[] {
    const commandsDir = path.join(sourceGeminiDir, "commands");
    if (!fs.existsSync(commandsDir)) return [];
    return fs
        .readdirSync(commandsDir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort();
}

function buildToolkitManifestEntry(
    harness: ToolkitHarness,
    scope: InstallScope,
    baseDir: string,
    skillsSourceDir: string,
): InstallManifestEntry {
    const skillsOnly = usesSkillsOnlyInstall(harness, scope);
    const agentSkillEntries = listSkillTreeEntries(skillsSourceDir);
    let bundlePath: string | undefined;

    if (harness === "gemini" && scope === "project") {
        bundlePath = ".gemini";
    } else if (!skillsOnly) {
        bundlePath = path.relative(
            baseDir,
            getInstallTargetDir(harness, baseDir, scope),
        );
    }

    const geminiSource = path.dirname(skillsSourceDir);

    return {
        platform: harness,
        scope,
        installedAt: new Date().toISOString(),
        agentSkillEntries,
        bundlePath,
        geminiCommandFiles:
            harness === "gemini"
                ? listGeminiCommandFiles(geminiSource)
                : undefined,
        geminiSkillEntries:
            harness === "gemini"
                ? listSkillTreeEntries(path.join(geminiSource, "skills"))
                : undefined,
    };
}

function buildOpenCodeManifestEntry(
    scope: InstallScope,
    content: OpenCodeContent,
): InstallManifestEntry {
    return {
        platform: "opencode",
        scope,
        installedAt: new Date().toISOString(),
        agentSkillEntries: extractOpenCodeSkillDirs(content),
        openCodeToolPaths: extractOpenCodeToolPaths(content),
    };
}

async function installToolkitHarness(
    harness: ToolkitHarness,
    flags: InstallFlags,
): Promise<void> {
    const projectDir = process.cwd();
    const scope = resolveInstallScope(flags, projectDir);
    const baseDir = resolveInstallBaseDir(scope, projectDir);
    const sourceDir = getToolkitHarnessSource(harness);
    const skillsSourceDir = getHarnessSkillsSourceDir(harness);
    const agentSkillsDir = getAgentSkillsInstallDir(scope, projectDir);
    const skillsOnly = usesSkillsOnlyInstall(harness, scope);
    const shouldClean = flags.skipClean !== true && flags.fresh !== false;

    if (!fs.existsSync(sourceDir)) {
        console.log(`❌ Harness bundle missing in toolkit: ${sourceDir}`);
        console.log(
            "   Run a release build or reinstall @ai-eng-system/toolkit.",
        );
        process.exit(1);
    }

    if (flags.verbose) {
        console.log(`Platform: ${harness}`);
        console.log(`Scope: ${scope}`);
        console.log(`Source: ${sourceDir}`);
        console.log(`Agent skills: ${agentSkillsDir}`);
        if (!skillsOnly) {
            console.log(
                `Bundle target: ${getInstallTargetDir(harness, baseDir, scope)}`,
            );
        }
    }

    if (flags.dryRun) {
        console.log("🔍 dry-run: Would install:");
        if (shouldClean) {
            console.log("   (after cleaning previous ai-eng install)");
        }
        console.log(`   Skills -> ${agentSkillsDir}`);
        if (harness === "gemini") {
            console.log(
                `   Gemini commands -> ${path.join(baseDir, ".gemini")}/commands/`,
            );
        } else if (!skillsOnly) {
            console.log(
                `   Bundle -> ${getInstallTargetDir(harness, baseDir, scope)}`,
            );
        }
        return;
    }

    if (shouldClean) {
        console.log("🧹 Removing previous ai-eng install...");
        cleanToolkitHarness(harness, scope, projectDir, toCleanFlags(flags));
    }

    const skillCount = syncSkillsTree(skillsSourceDir, agentSkillsDir);
    if (skillCount > 0) {
        console.log(
            `  ✅ Synced ${skillCount} skill tree(s) to ${agentSkillsDir}`,
        );
    }

    if (harness === "gemini") {
        const geminiTarget = getInstallTargetDir("gemini", baseDir, scope);
        await fsp.mkdir(path.dirname(geminiTarget), { recursive: true });
        syncGeminiCommands(sourceDir, geminiTarget);
        console.log(
            `  ✅ Installed Gemini commands to ${path.join(geminiTarget, "commands")}`,
        );
    } else if (!skillsOnly) {
        const targetDir = getInstallTargetDir(harness, baseDir, scope);
        await fsp.mkdir(path.dirname(targetDir), { recursive: true });
        await copyRecursive(sourceDir, targetDir);
        console.log(`  ✅ Installed harness bundle to ${targetDir}`);
    }

    upsertManifestEntry(
        scope,
        projectDir,
        buildToolkitManifestEntry(harness, scope, baseDir, skillsSourceDir),
    );

    // Telemetry
    if (!flags.dryRun && isTelemetryEnabled()) {
        appendTelemetryEvent({
            event: "install",
            timestamp: new Date().toISOString(),
            version: PACKAGE_VERSION,
            platform: harness,
            scope,
            command_count: 0,
            agent_count: 0,
            skill_count: skillCount,
            tool_count: 0,
        });
    }

    console.log("\n✅ Installation complete!");
    printToolkitPostInstall(harness, scope, skillsOnly);
}

function printToolkitPostInstall(
    harness: ToolkitHarness,
    scope: InstallScope,
    skillsOnly: boolean,
): void {
    if (harness === "cursor") {
        if (scope === "global") {
            console.log(
                "   Global plugin: ~/.cursor/plugins/local/ai-eng-system/",
            );
            console.log(
                "   Global skills: ~/.agents/skills/ — enable the plugin in Cursor if needed.",
            );
        } else {
            console.log(
                "   Enable the ai-eng-system plugin in Cursor if needed.",
            );
            console.log("   Skills also available under .agents/skills/");
        }
    } else if (harness === "gemini") {
        console.log(
            "   Gemini commands installed. Skills loaded from ~/.agents/skills/",
        );
    } else if (harness === "pi") {
        if (skillsOnly) {
            console.log(
                "   Global skills loaded from ~/.agents/skills (Pi docs).",
            );
            console.log(
                "   For prompts globally: pi install npm:@ai-eng-system/toolkit",
            );
        } else {
            console.log("   Skills also under .agents/skills/ and .pi/");
            console.log(
                "   Pi can also use: pi install npm:@ai-eng-system/toolkit",
            );
        }
    }
}

async function runInstaller(flags: InstallFlags): Promise<void> {
    const platform: InstallPlatform = flags.platform ?? "opencode";

    if (platform === "cursor" || platform === "gemini" || platform === "pi") {
        await installToolkitHarness(platform, flags);
        return;
    }

    const projectDir = process.cwd();
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const openCodeContent = await getDistOpenCodeContent();
    const scope = resolveInstallScope(flags, projectDir);
    const shouldClean = flags.skipClean !== true && flags.fresh !== false;

    const targetOpenCodeDir =
        scope === "global"
            ? path.join(homeDir, ".config", "opencode")
            : path.join(projectDir, ".opencode");

    if (flags.verbose) {
        console.log(`Installing to: ${targetOpenCodeDir}`);
        console.log(`Scope: ${scope}`);
    }

    if (scope === "project") {
        const opencodeDir = path.join(projectDir, ".opencode");
        if (!fs.existsSync(opencodeDir)) {
            console.log("❌ No .opencode/ directory found in project");
            console.log("   Run 'opencode init' first or use --scope global");
            process.exit(1);
        }
    }

    const config = findOpenCodeConfig(projectDir);
    if (config && !isPluginReferenced(config.path)) {
        console.log(
            "⚠️  opencode.jsonc does not reference ai-eng-system plugin",
        );
        console.log(
            "   Add 'ai-eng-system' to the plugin array in opencode.jsonc",
        );
    }

    const agentSkillsDir = getAgentSkillsInstallDir(scope, projectDir);

    if (flags.dryRun) {
        console.log("🔍 dry-run: Would install the following files:");
        if (shouldClean) {
            console.log("   (after cleaning previous ai-eng install)");
        }
        console.log(
            `   Commands -> ${targetOpenCodeDir}/command/${NAMESPACE_PREFIX}/`,
        );
        console.log(
            `   Agents   -> ${targetOpenCodeDir}/agent/${NAMESPACE_PREFIX}/`,
        );
        console.log(`   Skills   -> ${agentSkillsDir}/`);
        console.log(`   Tools    -> ${targetOpenCodeDir}/tool/`);
        return;
    }

    if (shouldClean) {
        console.log("🧹 Removing previous ai-eng install...");
        cleanOpenCodeInstall(
            targetOpenCodeDir,
            openCodeContent,
            toCleanFlags(flags),
            undefined,
            agentSkillsDir,
        );
    }

    await installContentFromCore(openCodeContent, targetOpenCodeDir, agentSkillsDir);

    upsertManifestEntry(
        scope,
        projectDir,
        buildOpenCodeManifestEntry(scope, openCodeContent),
    );

    // Telemetry
    if (!flags.dryRun && isTelemetryEnabled()) {
        appendTelemetryEvent({
            event: "install",
            timestamp: new Date().toISOString(),
            version: PACKAGE_VERSION,
            platform: "opencode",
            scope,
            command_count: openCodeContent.commands.length,
            agent_count: openCodeContent.agents.length,
            skill_count: openCodeContent.skills.length,
            tool_count: openCodeContent.tools.length,
        });
    }

    console.log("\n✅ Installation complete!");
    console.log(
        "   Restart OpenCode or Claude Code to use new commands and agents.",
    );
}

/**
 * Install content from core package to target directory
 */
async function installContentFromCore(
    content: OpenCodeContent,
    targetOpenCodeDir: string,
    agentSkillsDir: string,
): Promise<void> {
    if (content.commands.length > 0) {
        const commandsDir = path.join(
            targetOpenCodeDir,
            "command",
            NAMESPACE_PREFIX,
        );
        await fsp.mkdir(commandsDir, { recursive: true });

        for (const command of content.commands) {
            const relativePath = command.path.startsWith(NAMESPACE_PREFIX + "/")
                ? command.path.slice(NAMESPACE_PREFIX.length + 1)
                : command.path;
            const targetPath = path.join(commandsDir, relativePath);
            await fsp.mkdir(path.dirname(targetPath), { recursive: true });

            if (command.content) {
                await fsp.writeFile(targetPath, command.content, "utf-8");
            }
        }

        console.log(
            `  ✅ Installed ${content.commands.length} commands to ${commandsDir}`,
        );
    }

    if (content.agents.length > 0) {
        const agentsDir = path.join(
            targetOpenCodeDir,
            "agent",
            NAMESPACE_PREFIX,
        );
        await fsp.mkdir(agentsDir, { recursive: true });

        for (const agent of content.agents) {
            const relativePath = agent.path.startsWith(NAMESPACE_PREFIX + "/")
                ? agent.path.slice(NAMESPACE_PREFIX.length + 1)
                : agent.path;
            const targetPath = path.join(agentsDir, relativePath);
            await fsp.mkdir(path.dirname(targetPath), { recursive: true });

            if (agent.content) {
                await fsp.writeFile(targetPath, agent.content, "utf-8");
            }
        }

        console.log(
            `  ✅ Installed ${content.agents.length} agents to ${agentsDir}`,
        );
    }

    if (content.skills.length > 0) {
        await fsp.mkdir(agentSkillsDir, { recursive: true });

        for (const skill of content.skills) {
            const targetPath = path.join(agentSkillsDir, skill.path);
            await fsp.mkdir(path.dirname(targetPath), { recursive: true });

            if (skill.content) {
                await fsp.writeFile(targetPath, skill.content, "utf-8");
            }
        }

        console.log(
            `  ✅ Installed ${content.skills.length} skills to ${agentSkillsDir}`,
        );
    }

    if (content.tools.length > 0) {
        const toolsDir = path.join(targetOpenCodeDir, "tool");
        await fsp.mkdir(toolsDir, { recursive: true });

        for (const tool of content.tools) {
            const targetPath = path.join(toolsDir, tool.path);
            await fsp.mkdir(path.dirname(targetPath), { recursive: true });

            if (tool.content) {
                await fsp.writeFile(targetPath, tool.content, "utf-8");
            }
        }

        console.log(
            `  ✅ Installed ${content.tools.length} tools to ${toolsDir}`,
        );
    }
}

export type { InstallFlags, InstallPlatform } from "./types";
export { runInstaller };
