#!/usr/bin/env bun
/**
 * Prepare CLI package for publishing by copying publish-ready package.json
 */

import { copyFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function prepareCliForPublish() {
    const cliPackagePath = resolve(process.cwd(), "packages/cli/package.json");
    const cliPublishPath = resolve(
        process.cwd(),
        "packages/cli/package.json.publish",
    );

    try {
        // Verify publish file exists
        await readFile(cliPublishPath, "utf-8");

        // Copy publish-ready package.json over the development one
        await copyFile(cliPublishPath, cliPackagePath);

        console.log(
            "✅ CLI package prepared for publishing (using package.json.publish)",
        );
    } catch (error) {
        console.error("❌ Failed to prepare CLI for publishing:", error);
        process.exit(1);
    }
}

prepareCliForPublish();
