#!/usr/bin/env bun
/**
 * Verify Cursor recommendation artifacts (manifests, hooks, commands, pstack plugin).
 *
 * Usage: bun scripts/verify-cursor-install-artifacts.ts
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const PLUGINS = [
    "ai-eng-core",
    "ai-eng-learning",
    "ai-eng-research",
    "ai-eng-devops",
    "ai-eng-quality",
    "ai-eng-content",
    "ai-eng-plugin-dev",
    "ai-eng-pstack",
];

const CURSOR_COMMANDS = [
    "research.md",
    "specify.md",
    "plan.md",
    "work.md",
    "review.md",
    "ralph-wiggum.md",
];

const errors: string[] = [];

function check(path: string, label = path): void {
    if (!existsSync(path)) {
        errors.push(`Missing: ${label}`);
    }
}

function countPstackSkills(): number {
    const pstackDir = join(ROOT, "skills", "pstack");
    if (!existsSync(pstackDir)) return 0;
    let count = 0;
    for (const entry of readdirSync(pstackDir)) {
        if (
            statSync(join(pstackDir, entry)).isDirectory() &&
            existsSync(join(pstackDir, entry, "SKILL.md"))
        ) {
            count++;
        }
    }
    return count;
}

for (const plugin of PLUGINS) {
    const cursorManifest = join(
        ROOT,
        "plugins",
        plugin,
        ".cursor-plugin",
        "plugin.json",
    );
    check(cursorManifest, `${plugin} .cursor-plugin/plugin.json`);

    if (existsSync(cursorManifest)) {
        const json = JSON.parse(readFileSync(cursorManifest, "utf-8")) as {
            skills?: string;
        };
        const hasSkillsDir = existsSync(
            join(ROOT, "plugins", plugin, "skills"),
        );
        if (hasSkillsDir && !json.skills) {
            errors.push(`${plugin}: cursor manifest missing skills path`);
        }
    }

    if (plugin === "ai-eng-core") {
        const hooksManifest = join(
            ROOT,
            "plugins",
            plugin,
            "hooks",
            "cursor-hooks.json",
        );
        check(hooksManifest, "ai-eng-core hooks/cursor-hooks.json");
        check(
            join(ROOT, "plugins", plugin, "hooks", "stop-hook.sh"),
            "ai-eng-core hooks/stop-hook.sh",
        );
        const coreJson = existsSync(cursorManifest)
            ? (JSON.parse(readFileSync(cursorManifest, "utf-8")) as {
                  hooks?: string;
              })
            : {};
        if (coreJson.hooks !== "./hooks/cursor-hooks.json") {
            errors.push("ai-eng-core: hooks path not ./hooks/cursor-hooks.json");
        }
    }
}

const bundleRoot = join(ROOT, "dist", ".cursor-plugin");
const nestedManifest = join(bundleRoot, ".cursor-plugin", "plugin.json");
check(nestedManifest, "dist/.cursor-plugin/.cursor-plugin/plugin.json");

if (existsSync(nestedManifest)) {
    const bundleJson = JSON.parse(readFileSync(nestedManifest, "utf-8")) as {
        commands?: string;
        hooks?: string;
    };
    if (!bundleJson.commands) {
        errors.push("Monolithic cursor bundle missing commands in manifest");
    }
    if (!bundleJson.hooks) {
        errors.push("Monolithic cursor bundle missing hooks in manifest");
    }
}

for (const command of CURSOR_COMMANDS) {
    check(
        join(bundleRoot, "commands", command),
        `dist/.cursor-plugin/commands/${command}`,
    );
}

check(
    join(bundleRoot, "hooks", "cursor-hooks.json"),
    "dist/.cursor-plugin/hooks/cursor-hooks.json",
);

const pstackCount = countPstackSkills();
if (pstackCount !== 29) {
    errors.push(`Expected 29 pstack skills, found ${pstackCount}`);
}

const pstackPluginSkills = join(
    ROOT,
    "plugins",
    "ai-eng-pstack",
    "skills",
    "pstack",
);
check(pstackPluginSkills, "plugins/ai-eng-pstack/skills/pstack/");

if (errors.length) {
    console.error("❌ Cursor install artifact verification failed:\n");
    for (const error of errors) {
        console.error(` - ${error}`);
    }
    process.exit(1);
}

console.log("✅ Cursor install artifacts verified");
console.log(`   Marketplace plugins: ${PLUGINS.length}`);
console.log(`   Pstack skills: ${pstackCount}`);
console.log(`   Bundle commands: ${CURSOR_COMMANDS.length}`);
