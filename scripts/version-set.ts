#!/usr/bin/env bun
/**
 * Version management utility for ai-eng-system
 *
 * Usage: bun scripts/version-set.ts <version>
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const VERSION = process.argv[2];

if (!VERSION) {
    console.error("Usage: bun scripts/version-set.ts <version>");
    process.exit(1);
}

// Validate version format (semver)
const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-[a-zA-Z0-9.-]+)?$/;
if (!semverRegex.test(VERSION)) {
    console.error(
        "Invalid version format. Expected: x.y.z or x.y.z-prerelease",
    );
    process.exit(1);
}

const packageJsonPath = resolve(process.cwd(), "package.json");

try {
    const packageJson = await readFile(packageJsonPath, "utf-8");
    const pkg = JSON.parse(packageJson);

    pkg.version = VERSION;

    await writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);

    if (pkg.name === "@ai-eng-system/core") {
        const coreIndexPath = resolve(process.cwd(), "src/index.ts");
        const coreIndex = await readFile(coreIndexPath, "utf-8");
        const updatedCoreIndex = coreIndex.replace(
            /export const version = "[^"]+";/,
            `export const version = "${VERSION}";`,
        );
        if (updatedCoreIndex !== coreIndex) {
            await writeFile(coreIndexPath, updatedCoreIndex);
        }
    }

    if (pkg.name === "@ai-eng-system/toolkit") {
        const toolkitIndexPath = resolve(process.cwd(), "index.js");
        const toolkitIndex = await readFile(toolkitIndexPath, "utf-8");
        const updatedToolkitIndex = toolkitIndex.replace(
            /export const version = "[^"]+";/,
            `export const version = "${VERSION}";`,
        );
        if (updatedToolkitIndex !== toolkitIndex) {
            await writeFile(toolkitIndexPath, updatedToolkitIndex);
        }
    }

    console.log(`Updated package.json version to ${VERSION}`);
} catch (error) {
    console.error("Failed to update package.json:", error);
    process.exit(1);
}
