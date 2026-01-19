#!/usr/bin/env bun
/**
 * Restore CLI package after publishing by copying back development package.json
 */

import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

async function restoreCliAfterPublish() {
    const cliPackagePath = resolve(process.cwd(), "packages/cli/package.json");
    const cliDevPath = resolve(process.cwd(), "packages/cli/package.json.dev");

    try {
        // Copy back development version
        await copyFile(cliDevPath, cliPackagePath);

        console.log(
            "✅ CLI package restored to development configuration (using package.json.dev)",
        );
    } catch (error) {
        console.error("❌ Failed to restore CLI after publishing:", error);
        process.exit(1);
    }
}

restoreCliAfterPublish();
