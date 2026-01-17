#!/usr/bin/env bun
/**
 * CLI entry point for ai-eng-system for Bun runtime
 *
 * Works with Bun runtime and handles flattened directory structure
 * Uses dynamic import to work with transpiled CommonJS
 */

async function main() {
    // Import transpiled JavaScript using dynamic import (works in Bun)
    // Note: Bun.build flattens directory structure, so cli/run-cli.ts -> dist/cli/run-cli.js
    const module = await import("./dist/cli/run-cli.js");
    const { runMain } = module.default || module;
    await runMain();
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
