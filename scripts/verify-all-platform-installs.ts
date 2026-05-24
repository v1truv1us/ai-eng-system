#!/usr/bin/env bun
/**
 * Install all harness platforms into an isolated project dir and verify artifacts.
 *
 * Usage: bun scripts/verify-all-platform-installs.ts
 */

import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInstaller } from "../packages/cli/src/install/install.ts";

const PLATFORMS = ["opencode", "cursor", "gemini", "pi"] as const;

const errors: string[] = [];

function check(condition: boolean, message: string): void {
    if (!condition) errors.push(message);
}

function assertPath(path: string, label = path): void {
    check(existsSync(path), `Missing: ${label}`);
}

async function main(): Promise<void> {
    const previousCwd = process.cwd();
    const projectDir = mkdtempSync(join(tmpdir(), "ai-eng-all-platforms-"));

    try {
        mkdirSync(join(projectDir, ".opencode"), { recursive: true });
        writeFileSync(
            join(projectDir, ".opencode", "opencode.jsonc"),
            JSON.stringify({ plugin: ["ai-eng-system"] }, null, 2),
        );

        process.chdir(projectDir);
        console.log(`Installing all platforms into ${projectDir}\n`);

        for (const platform of PLATFORMS) {
            console.log(`→ ${platform}`);
            await runInstaller({
                platform,
                scope: "project",
                fresh: true,
                yes: true,
            });
        }

        console.log("\nVerifying artifacts...\n");

        assertPath(
            join(projectDir, ".opencode", "command", "ai-eng"),
            "OpenCode commands",
        );
        assertPath(
            join(projectDir, ".opencode", "agent", "ai-eng"),
            "OpenCode agents",
        );
        assertPath(
            join(projectDir, ".opencode", "skill"),
            "OpenCode skills",
        );

        const cursorBundle = join(
            projectDir,
            ".cursor",
            "plugins",
            "ai-eng-system",
        );
        assertPath(
            join(cursorBundle, ".cursor-plugin", "plugin.json"),
            "Cursor plugin manifest",
        );
        assertPath(join(cursorBundle, "commands", "plan.md"), "Cursor plan command");
        assertPath(
            join(cursorBundle, "hooks", "cursor-hooks.json"),
            "Cursor Ralph hooks",
        );
        assertPath(
            join(projectDir, ".agents", "skills", "pstack"),
            "Agent skills (pstack)",
        );

        assertPath(join(projectDir, ".gemini", "skills"), "Gemini skills");
        assertPath(join(projectDir, ".gemini", "commands"), "Gemini commands");

        assertPath(join(projectDir, ".pi", "skills"), "Pi skills");
        assertPath(join(projectDir, ".pi", "prompts"), "Pi prompts");

        const manifest = readFileSync(
            join(projectDir, ".ai-eng", "install-manifest.json"),
            "utf-8",
        );
        const parsed = JSON.parse(manifest) as {
            entries: Array<{ platform: string; scope: string }>;
        };
        for (const platform of PLATFORMS) {
            check(
                parsed.entries.some(
                    (entry) =>
                        entry.platform === platform && entry.scope === "project",
                ),
                `Manifest missing entry for ${platform}`,
            );
        }

        if (errors.length) {
            console.error("❌ All-platform install verification failed:\n");
            for (const error of errors) {
                console.error(` - ${error}`);
            }
            process.exit(1);
        }

        console.log("✅ All-platform install verified");
        console.log(`   Platforms: ${PLATFORMS.join(", ")}`);
        console.log(`   Temp project: ${projectDir}`);
    } finally {
        process.chdir(previousCwd);
        rmSync(projectDir, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
