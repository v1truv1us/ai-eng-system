#!/usr/bin/env bun

import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDir, "..");
const toolkitRoot = resolve(repoRoot, "packages/toolkit");

const PLUGIN_NAMES = [
    "ai-eng-core",
    "ai-eng-learning",
    "ai-eng-research",
    "ai-eng-devops",
    "ai-eng-quality",
    "ai-eng-content",
    "ai-eng-plugin-dev",
];

const sources = [
    {
        source: resolve(repoRoot, "dist/.claude-plugin"),
        target: resolve(toolkitRoot, ".claude-plugin"),
    },
    {
        source: resolve(repoRoot, "dist/.opencode"),
        target: resolve(toolkitRoot, ".opencode"),
    },
    {
        source: resolve(repoRoot, "dist/.cursor-plugin"),
        target: resolve(toolkitRoot, ".cursor-plugin"),
    },
    {
        source: resolve(repoRoot, "dist/.gemini"),
        target: resolve(toolkitRoot, ".gemini"),
    },
    {
        source: resolve(repoRoot, "dist/.pi"),
        target: resolve(toolkitRoot, ".pi"),
    },
    ...PLUGIN_NAMES.map((name) => ({
        source: resolve(repoRoot, `plugins/${name}`),
        target: resolve(toolkitRoot, `plugins/${name}`),
    })),
];

const requiredMarkers = [
    resolve(toolkitRoot, ".claude-plugin/plugin.json"),
    resolve(toolkitRoot, ".opencode/opencode.jsonc"),
    resolve(toolkitRoot, ".cursor-plugin/.cursor-plugin/plugin.json"),
    resolve(toolkitRoot, ".cursor-plugin/commands"),
    resolve(toolkitRoot, ".cursor-plugin/hooks/cursor-hooks.json"),
    resolve(toolkitRoot, ".gemini/skills"),
    resolve(toolkitRoot, ".pi/skills"),
    resolve(toolkitRoot, ".pi/prompts"),
    ...PLUGIN_NAMES.map((name) =>
        resolve(toolkitRoot, `plugins/${name}/plugin.json`),
    ),
    ...PLUGIN_NAMES.map((name) =>
        resolve(toolkitRoot, `plugins/${name}/.cursor-plugin/plugin.json`),
    ),
];

async function assertExists(path: string) {
    try {
        await access(path);
    } catch {
        throw new Error(`Required artifact missing: ${path}`);
    }
}

async function buildToolkit() {
    for (const { source, target } of sources) {
        await assertExists(source);
        await rm(target, { recursive: true, force: true });
        await mkdir(dirname(target), { recursive: true });
        await cp(source, target, { recursive: true });
    }

    for (const marker of requiredMarkers) {
        await assertExists(marker);
    }

    console.log("✅ Toolkit assets copied from generated repository artifacts");
}

buildToolkit().catch((error) => {
    console.error(
        "❌ Failed to build toolkit package:",
        error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
});
