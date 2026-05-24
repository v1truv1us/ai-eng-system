#!/usr/bin/env bun
/**
 * Verify generated toolkit bundles exist for all non-Claude harnesses.
 * Used in release CI after `bun run build` (before npm publish).
 */

import { access } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const toolkitRoot = resolve(repoRoot, "packages/toolkit");

const requiredMarkers = [
    resolve(toolkitRoot, ".claude-plugin/plugin.json"),
    resolve(toolkitRoot, ".opencode/opencode.jsonc"),
    resolve(toolkitRoot, ".cursor-plugin/.cursor-plugin/plugin.json"),
    resolve(toolkitRoot, ".cursor-plugin/skills"),
    resolve(toolkitRoot, ".cursor-plugin/agents"),
    resolve(toolkitRoot, ".cursor-plugin/commands"),
    resolve(toolkitRoot, ".cursor-plugin/hooks/cursor-hooks.json"),
    resolve(toolkitRoot, ".gemini/skills"),
    resolve(toolkitRoot, ".gemini/commands"),
    resolve(toolkitRoot, ".pi/skills"),
    resolve(toolkitRoot, ".pi/prompts"),
];

async function assertExists(path: string): Promise<void> {
    try {
        await access(path);
    } catch {
        throw new Error(`Missing required harness artifact: ${path}`);
    }
}

async function main(): Promise<void> {
    for (const marker of requiredMarkers) {
        await assertExists(marker);
    }
    console.log("✅ Toolkit harness bundles verified (OpenCode, Cursor, Gemini, Pi, Claude plugin)");
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
