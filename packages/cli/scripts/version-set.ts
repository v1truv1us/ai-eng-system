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

    console.log(`Updated package.json version to ${VERSION}`);
} catch (error) {
    console.error("Failed to update package.json:", error);
    process.exit(1);
}
