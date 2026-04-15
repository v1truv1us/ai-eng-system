#!/usr/bin/env bun
/**
 * CLI entry point for ai-eng-system for Bun runtime
 *
 * Works with Bun runtime and handles flattened directory structure
 * Uses dynamic import to work with transpiled CommonJS
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
    // Get the directory of this script to resolve paths correctly
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Path to the transpiled CLI module
    const cliModulePath = join(__dirname, "dist", "cli", "run.js");

    // Validate that the CLI module exists before importing
    if (!existsSync(cliModulePath)) {
        console.error("❌ CLI module not found:", cliModulePath);
        console.error("");
        console.error(
            "This usually means the ai-eng-system package hasn't been built properly.",
        );
        console.error(
            "Please run 'bun run build' to generate the necessary CLI files.",
        );
        console.error("");
        console.error("If you've already built, please check:");
        console.error("  1. The build completed without errors");
        console.error("  2. The dist/cli/run.js file was generated");
        console.error("  3. You're running this from the correct directory");
        process.exit(1);
    }

    try {
        // Import transpiled JavaScript using dynamic import (works in Bun)
        // Note: Bun.build flattens directory structure, so cli/run.ts -> dist/cli/run.js
        const module = await import(cliModulePath);
        const { runMain } = module;
        await runMain();
    } catch (error) {
        console.error("❌ Failed to import or run CLI module:");
        console.error(error instanceof Error ? error.message : String(error));
        console.error("");
        console.error("Please ensure:");
        console.error("  1. The CLI module was built correctly");
        console.error("  2. All dependencies are installed");
        console.error("  3. You have the necessary permissions");
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(
        "❌ Unexpected CLI error:",
        error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
});
