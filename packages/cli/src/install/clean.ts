/**
 * Remove ai-eng-managed install artifacts before reinstall or uninstall.
 */

import fs from "node:fs";
import path from "node:path";
import type { OpenCodeContent } from "@ai-eng-system/core";
import {
    findManifestEntry,
    type InstallManifestEntry,
    readInstallManifest,
    removeManifestEntry,
} from "./manifest";
import { listSkillTreeEntries, removeSkillTreeEntries } from "./sync-skills";
import {
    getAgentSkillsInstallDir,
    getHarnessSkillsSourceDir,
    getInstallTargetDir,
    type InstallScope,
    resolveInstallBaseDir,
    type ToolkitHarness,
    usesSkillsOnlyInstall,
} from "./toolkit-path";
import type { CleanFlags, InstallPlatform } from "./types";

const NAMESPACE_PREFIX = "ai-eng";

export interface CleanResult {
    removed: string[];
    skipped: string[];
}

function removePath(
    targetPath: string,
    flags: CleanFlags,
    result: CleanResult,
    label?: string,
): void {
    const display = label ?? targetPath;
    if (!fs.existsSync(targetPath)) return;

    if (flags.dryRun) {
        result.skipped.push(display);
        if (flags.verbose) {
            console.log(`  🔍 would remove ${display}`);
        }
        return;
    }

    fs.rmSync(targetPath, { recursive: true, force: true });
    result.removed.push(display);
    if (flags.verbose) {
        console.log(`  ✅ removed ${display}`);
    }
}

function removeFile(
    targetPath: string,
    flags: CleanFlags,
    result: CleanResult,
): void {
    if (!fs.existsSync(targetPath)) return;

    if (flags.dryRun) {
        result.skipped.push(targetPath);
        if (flags.verbose) {
            console.log(`  🔍 would remove ${targetPath}`);
        }
        return;
    }

    fs.rmSync(targetPath, { force: true });
    result.removed.push(targetPath);
    if (flags.verbose) {
        console.log(`  ✅ removed ${targetPath}`);
    }
}

export function extractOpenCodeSkillDirs(content: OpenCodeContent): string[] {
    const dirs = new Set<string>();
    for (const skill of content.skills) {
        const top = skill.path.split(/[/\\]/)[0];
        if (top) dirs.add(top);
    }
    return [...dirs].sort();
}

export function extractOpenCodeToolPaths(content: OpenCodeContent): string[] {
    return content.tools.map((tool) => tool.path).sort();
}

function cleanNamespacedDirectory(
    baseDir: string,
    subdir: "command" | "agent",
    flags: CleanFlags,
    result: CleanResult,
): void {
    const dir = path.join(baseDir, subdir, NAMESPACE_PREFIX);
    removePath(dir, flags, result, `${subdir}/${NAMESPACE_PREFIX}/`);
}

function cleanOpenCodeSkills(
    targetOpenCodeDir: string,
    skillDirs: string[],
    flags: CleanFlags,
    result: CleanResult,
): void {
    const skillsRoot = path.join(targetOpenCodeDir, "skill");
    for (const skillDir of skillDirs) {
        removePath(
            path.join(skillsRoot, skillDir),
            flags,
            result,
            `skill/${skillDir}/`,
        );
    }
}

function cleanOpenCodeTools(
    targetOpenCodeDir: string,
    toolPaths: string[],
    flags: CleanFlags,
    result: CleanResult,
): void {
    const toolsRoot = path.join(targetOpenCodeDir, "tool");
    for (const toolPath of toolPaths) {
        removePath(
            path.join(toolsRoot, toolPath),
            flags,
            result,
            `tool/${toolPath}`,
        );
    }
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

function cleanGeminiManagedFiles(
    sourceGeminiDir: string,
    targetGeminiDir: string,
    flags: CleanFlags,
    result: CleanResult,
    manifestEntry?: InstallManifestEntry,
): void {
    const commandFiles =
        manifestEntry?.geminiCommandFiles ??
        listGeminiCommandFiles(sourceGeminiDir);
    for (const file of commandFiles) {
        removeFile(path.join(targetGeminiDir, "commands", file), flags, result);
    }

    const skillEntries =
        manifestEntry?.geminiSkillEntries ??
        listSkillTreeEntries(path.join(sourceGeminiDir, "skills"));
    for (const entry of skillEntries) {
        removePath(
            path.join(targetGeminiDir, "skills", entry),
            flags,
            result,
            `.gemini/skills/${entry}/`,
        );
    }
}

function mergeUnique(...lists: string[][]): string[] {
    return [...new Set(lists.flat())].sort();
}

function cleanFromManifestEntry(
    entry: InstallManifestEntry,
    baseDir: string,
    projectDir: string,
    flags: CleanFlags,
    result: CleanResult,
    sourceGeminiDir?: string,
): void {
    const agentSkillsDir = getAgentSkillsInstallDir(entry.scope, projectDir);
    removeSkillTreeEntries(
        agentSkillsDir,
        entry.agentSkillEntries,
        flags.dryRun,
        result,
        flags.verbose,
    );

    if (entry.bundlePath) {
        const bundlePath = path.isAbsolute(entry.bundlePath)
            ? entry.bundlePath
            : path.join(baseDir, entry.bundlePath);
        removePath(bundlePath, flags, result, entry.bundlePath);
    }

    if (entry.platform === "opencode") {
        const openCodeDir =
            entry.scope === "global"
                ? path.join(baseDir, ".config", "opencode")
                : path.join(projectDir, ".opencode");

        cleanNamespacedDirectory(openCodeDir, "command", flags, result);
        cleanNamespacedDirectory(openCodeDir, "agent", flags, result);

        if (entry.openCodeSkillDirs?.length) {
            cleanOpenCodeSkills(
                openCodeDir,
                entry.openCodeSkillDirs,
                flags,
                result,
            );
        }
        if (entry.openCodeToolPaths?.length) {
            cleanOpenCodeTools(
                openCodeDir,
                entry.openCodeToolPaths,
                flags,
                result,
            );
        }
    }

    if (entry.platform === "gemini" && sourceGeminiDir) {
        const geminiTarget = path.join(baseDir, ".gemini");
        cleanGeminiManagedFiles(
            sourceGeminiDir,
            geminiTarget,
            flags,
            result,
            entry,
        );
    }
}

export function cleanOpenCodeInstall(
    targetOpenCodeDir: string,
    content: OpenCodeContent,
    flags: CleanFlags,
    manifestEntry?: InstallManifestEntry,
): CleanResult {
    const result: CleanResult = { removed: [], skipped: [] };

    cleanNamespacedDirectory(targetOpenCodeDir, "command", flags, result);
    cleanNamespacedDirectory(targetOpenCodeDir, "agent", flags, result);

    const skillDirs = mergeUnique(
        extractOpenCodeSkillDirs(content),
        manifestEntry?.openCodeSkillDirs ?? [],
    );
    cleanOpenCodeSkills(targetOpenCodeDir, skillDirs, flags, result);

    const toolPaths = mergeUnique(
        extractOpenCodeToolPaths(content),
        manifestEntry?.openCodeToolPaths ?? [],
    );
    cleanOpenCodeTools(targetOpenCodeDir, toolPaths, flags, result);

    return result;
}

export function cleanToolkitHarness(
    harness: ToolkitHarness,
    scope: InstallScope,
    projectDir: string,
    flags: CleanFlags,
    manifestEntry?: InstallManifestEntry,
): CleanResult {
    const result: CleanResult = { removed: [], skipped: [] };
    const baseDir = resolveInstallBaseDir(scope, projectDir);
    const skillsSourceDir = getHarnessSkillsSourceDir(harness);
    const agentSkillsDir = getAgentSkillsInstallDir(scope, projectDir);
    const skillsOnly = usesSkillsOnlyInstall(harness, scope);

    const skillEntries = mergeUnique(
        listSkillTreeEntries(skillsSourceDir),
        manifestEntry?.agentSkillEntries ?? [],
    );
    removeSkillTreeEntries(
        agentSkillsDir,
        skillEntries,
        flags.dryRun,
        result,
        flags.verbose,
    );

    if (harness === "gemini") {
        const geminiSource = path.dirname(skillsSourceDir);
        const geminiTarget = getInstallTargetDir("gemini", baseDir, scope);
        if (scope === "global") {
            cleanGeminiManagedFiles(
                geminiSource,
                geminiTarget,
                flags,
                result,
                manifestEntry,
            );
        } else {
            removePath(geminiTarget, flags, result, ".gemini/");
        }
    } else if (!skillsOnly) {
        const bundlePath = manifestEntry?.bundlePath
            ? path.isAbsolute(manifestEntry.bundlePath)
                ? manifestEntry.bundlePath
                : path.join(baseDir, manifestEntry.bundlePath)
            : getInstallTargetDir(harness, baseDir, scope);
        removePath(
            bundlePath,
            flags,
            result,
            path.relative(baseDir, bundlePath),
        );
    }

    return result;
}

export async function runCleaner(
    flags: CleanFlags,
    resolveScope: (projectDir: string) => InstallScope,
): Promise<void> {
    const projectDir = process.cwd();
    const scope = resolveScope(projectDir);
    const platform = flags.platform ?? "opencode";
    const platforms: InstallPlatform[] =
        platform === "all"
            ? ["opencode", "cursor", "gemini", "pi"]
            : [platform];

    if (flags.dryRun) {
        console.log("🔍 dry-run: Would clean ai-eng-managed artifacts:");
    } else {
        console.log("🧹 Cleaning ai-eng-managed artifacts...");
    }
    console.log(`   Platform(s): ${platforms.join(", ")}`);
    console.log(`   Scope: ${scope}`);

    const manifest = readInstallManifest(scope, projectDir);
    let totalRemoved = 0;

    for (const targetPlatform of platforms) {
        const manifestEntry = findManifestEntry(
            manifest,
            targetPlatform,
            scope,
        );

        if (targetPlatform === "opencode") {
            const { getDistOpenCodeContent } = await import(
                "@ai-eng-system/core"
            );
            const content = await getDistOpenCodeContent();
            const homeDir = process.env.HOME || process.env.USERPROFILE || "";
            const targetOpenCodeDir =
                scope === "global"
                    ? path.join(homeDir, ".config", "opencode")
                    : path.join(projectDir, ".opencode");

            const result = cleanOpenCodeInstall(
                targetOpenCodeDir,
                content,
                flags,
                manifestEntry,
            );
            totalRemoved += result.removed.length;
        } else {
            const result = cleanToolkitHarness(
                targetPlatform,
                scope,
                projectDir,
                flags,
                manifestEntry,
            );
            totalRemoved += result.removed.length;
        }

        if (!flags.dryRun) {
            removeManifestEntry(scope, projectDir, targetPlatform, scope);
        }
    }

    if (flags.dryRun) {
        console.log("\n🔍 dry-run complete (no files changed).");
    } else if (totalRemoved === 0) {
        console.log(
            "\n✅ Nothing to clean (already removed or never installed).",
        );
    } else {
        console.log(`\n✅ Clean complete (${totalRemoved} path(s) removed).`);
    }
}

export type { CleanFlags } from "./types";
