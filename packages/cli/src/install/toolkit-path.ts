/**
 * Resolve @ai-eng-system/toolkit on disk (published npm or workspace).
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(fileURLToPath(import.meta.url));

export type ToolkitHarness = "cursor" | "gemini" | "pi";

const HARNESS_DIR: Record<ToolkitHarness, string> = {
    cursor: ".cursor-plugin",
    gemini: ".gemini",
    pi: ".pi",
};

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

export function getInstallTargetDir(
    harness: ToolkitHarness,
    projectDir: string,
): string {
    switch (harness) {
        case "cursor":
            return path.join(projectDir, ".cursor", "plugins", "ai-eng-system");
        case "gemini":
            return path.join(projectDir, ".gemini");
        case "pi":
            return path.join(projectDir, ".pi");
        default:
            return projectDir;
    }
}
