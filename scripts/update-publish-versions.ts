#!/usr/bin/env bun
/**
 * Update package.json.publish files with latest core version
 */

import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function updatePublishVersions() {
    const corePackagePath = resolve(
        process.cwd(),
        "packages/core/package.json",
    );
    const cliPublishPath = resolve(
        process.cwd(),
        "packages/cli/package.json.publish",
    );

    try {
        // Read core package version
        const corePackageJson = await readFile(corePackagePath, "utf-8");
        const corePkg = JSON.parse(corePackageJson);
        const coreVersion = corePkg.version;

        console.log(`📦 Core version: ${coreVersion}`);

        // Read CLI publish package
        const cliPublishJson = await readFile(cliPublishPath, "utf-8");
        const cliPkg = JSON.parse(cliPublishJson);

        // Update core dependency to actual version
        if (cliPkg.dependencies?.["@ai-eng-system/core"]) {
            const oldVersion = cliPkg.dependencies["@ai-eng-system/core"];
            cliPkg.dependencies["@ai-eng-system/core"] = `^${coreVersion}`;
            console.log(
                `🔄 Updated @ai-eng-system/core from ${oldVersion} to ^${coreVersion}`,
            );
        }

        // Update CLI version to match (optional - remove if you want separate versioning)
        cliPkg.version = corePkg.version;
        console.log(`🔄 Updated CLI version to ${corePkg.version}`);

        // Write updated CLI publish package.json
        await writeFile(cliPublishPath, `${JSON.stringify(cliPkg, null, 2)}\n`);

        console.log("✅ Publish versions updated successfully");
    } catch (error) {
        console.error("❌ Failed to update publish versions:", error);
        process.exit(1);
    }
}

updatePublishVersions();
