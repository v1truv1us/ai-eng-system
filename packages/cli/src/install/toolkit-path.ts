/**
 * Resolve @ai-eng-system/toolkit on disk (published npm or workspace).
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(fileURLToPath(import.meta.url));

export type ToolkitHarness = "cursor" | "gemini" | "pi";
export type InstallScope = "project" | "global";

const HARNESS_DIR: Record<ToolkitHarness, string> = {
    cursor: ".cursor-plugin",
    gemini: ".gemini",
    pi: ".pi",
};

export function getHomeDirectory(): string {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    if (!home) {
        throw new Error(
            "Could not resolve home directory (HOME or USERPROFILE unset).",
        );
    }
    return home;
}

export function resolveInstallBaseDir(
    scope: InstallScope,
    projectDir: string,
): string {
    return scope === "global" ? getHomeDirectory() : projectDir;
}

export function resolveToolkitRoot(): string {
    try {
        const pkgJson = require.resolve("@ai-eng-system/toolkit/package.json");
        return path.dirname(pkgJson);
    } catch {
        throw new Error(
            "Could not find @ai-eng-system/toolkit. Install it alongside the CLI:\n" +
                "  npm install @ai-eng-system/toolkit\n" +
                "  # or: npm install -g @ai-eng-system/cli @ai-eng-system/toolkit",
        );
    }
}

export function getToolkitHarnessSource(harness: ToolkitHarness): string {
    const root = resolveToolkitRoot();
    return path.join(root, HARNESS_DIR[harness]);
}

/** Shared Agent Skills path (Cursor + Pi): ~/.agents/skills or ./.agents/skills */
export function getAgentSkillsInstallDir(
    scope: InstallScope,
    projectDir: string,
): string {
    const base = resolveInstallBaseDir(scope, projectDir);
    return path.join(base, ".agents", "skills");
}

export function getHarnessSkillsSourceDir(harness: ToolkitHarness): string {
    return path.join(getToolkitHarnessSource(harness), "skills");
}

export function getInstallTargetDir(
    harness: ToolkitHarness,
    baseDir: string,
    scope: InstallScope = "project",
): string {
    switch (harness) {
        case "cursor":
            if (scope === "global") {
                return path.join(
                    baseDir,
                    ".cursor",
                    "plugins",
                    "local",
                    "ai-eng-system",
                );
            }
            return path.join(baseDir, ".cursor", "plugins", "ai-eng-system");
        case "gemini":
            return path.join(baseDir, ".gemini");
        case "pi":
            return path.join(baseDir, ".pi");
        default:
            return baseDir;
    }
}

/** Global Pi: skills-only via ~/.agents/skills. Cursor global gets full plugin bundle. */
export function usesSkillsOnlyInstall(
    harness: ToolkitHarness,
    scope: InstallScope,
): boolean {
    return scope === "global" && harness === "pi";
}
