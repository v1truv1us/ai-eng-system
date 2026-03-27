#!/usr/bin/env bun

import { access, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDir, "..");
const toolkitRoot = resolve(repoRoot, "packages/toolkit");

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
    source: resolve(repoRoot, "plugins/ai-eng-system"),
    target: resolve(toolkitRoot, "plugins/ai-eng-system"),
  },
];

const requiredMarkers = [
  resolve(toolkitRoot, ".claude-plugin/plugin.json"),
  resolve(toolkitRoot, ".opencode/opencode.jsonc"),
  resolve(toolkitRoot, "plugins/ai-eng-system/plugin.json"),
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
