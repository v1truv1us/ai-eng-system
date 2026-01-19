#!/usr/bin/env bun
/**
 * Simple version bump script for ai-eng-system
 * Usage: bun run bump [patch|minor|major]
 */

import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function bumpVersion(type: "patch" | "minor" | "major" = "patch") {
    const workspacePackagePath = resolve(process.cwd(), "package.json");
    const corePackagePath = resolve(
        process.cwd(),
        "packages/core/package.json",
    );
    const cliPackagePath = resolve(process.cwd(), "packages/cli/package.json");

    try {
        // Read current versions
        const workspacePkg = JSON.parse(
            await readFile(workspacePackagePath, "utf-8"),
        );
        const corePkg = JSON.parse(await readFile(corePackagePath, "utf-8"));
        const cliPkg = JSON.parse(await readFile(cliPackagePath, "utf-8"));

        const currentWorkspace = workspacePkg.version;
        const currentCore = corePkg.version;
        const currentCli = cliPkg.version;

        console.log(`📦 Current versions:`);
        console.log(`  Workspace: ${currentWorkspace}`);
        console.log(`  Core: ${currentCore}`);
        console.log(`  CLI: ${currentCli}`);

        // Use semver-inc to bump versions
        const bumpCommand = `npm --no-git-tag-version version ${type}`;
        const result = execSync(bumpCommand, { encoding: "utf-8" });

        if (result.error) {
            console.error("❌ Failed to bump version:", result.error);
            process.exit(1);
        }

        const newVersion = result.stdout.trim();
        console.log(`🚀 Bumping to: ${newVersion}`);

        // Update all package.json files
        workspacePkg.version = newVersion;
        corePkg.version = newVersion;
        cliPkg.version = newVersion;

        // Write back to files
        await writeFile(
            workspacePackagePath,
            `${JSON.stringify(workspacePkg, null, 2)}\n`,
        );
        await writeFile(
            corePackagePath,
            `${JSON.stringify(corePkg, null, 2)}\n`,
        );
        await writeFile(cliPackagePath, `${JSON.stringify(cliPkg, null, 2)}\n`);

        console.log(`✅ Updated all versions to ${newVersion}`);
        console.log(`💡 Run 'bun run publish' to publish both packages`);
    } catch (error) {
        console.error("❌ Failed to bump version:", error);
        process.exit(1);
    }
}

// Get bump type from command line args
const bumpType = (process.argv[2] as "patch" | "minor" | "major") || "patch";

bumpVersion(bumpType);
