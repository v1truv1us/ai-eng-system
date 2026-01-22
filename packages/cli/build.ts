#!/usr/bin/env bun
/// <reference types="bun-types" />
/**
 * Build script for @ai-eng-system/cli package
 *
 * Transpiles TypeScript to JavaScript and creates the CLI distribution
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(ROOT, "dist");

/**
 * Transpile TypeScript CLI source files to JavaScript
 */
async function buildCLI(): Promise<void> {
    console.log("🔧 Building CLI package...");

    // Ensure dist directory exists
    await mkdir(DIST_DIR, { recursive: true });

    // Build the main index.ts entry point
    const indexPath = join(ROOT, "src", "index.ts");
    if (!existsSync(indexPath)) {
        throw new Error("src/index.ts not found");
    }

    const result = await Bun.build({
        entrypoints: [indexPath],
        outdir: DIST_DIR,
        target: "node",
        format: "esm",
        sourcemap: "inline",
        minify: false,
        splitting: false,
        external: [
            "@ai-eng-system/core",
            "@opencode-ai/sdk",
            "@opencode-ai/plugin",
        ],
    });

    if (!result.success) {
        const messages = result.logs
            .map((l) => `${l.level}: ${l.message}`)
            .join("\n");
        throw new Error(`Failed to build CLI:\n${messages}`);
    }

    // Build CLI router
    const cliMainPath = join(ROOT, "src", "cli", "run.ts");
    if (existsSync(cliMainPath)) {
        const mainResult = await Bun.build({
            entrypoints: [cliMainPath],
            outdir: join(DIST_DIR, "cli"),
            target: "node",
            format: "esm",
            sourcemap: "inline",
            minify: false,
            splitting: false,
            external: ["@ai-eng-system/core"],
            naming: {
                entry: "[name].js",
            },
        });

        if (!mainResult.success) {
            const messages = mainResult.logs
                .map((l) => `${l.level}: ${l.message}`)
                .join("\n");
            throw new Error(`Failed to build CLI main:\n${messages}`);
        }
    }

    // Build CLI runner
    const cliRunPath = join(ROOT, "src", "cli", "run-cli.ts");
    if (existsSync(cliRunPath)) {
        const cliResult = await Bun.build({
            entrypoints: [cliRunPath],
            outdir: join(DIST_DIR, "cli"),
            target: "node",
            format: "esm",
            sourcemap: "inline",
            minify: false,
            splitting: false,
            external: ["@ai-eng-system/core"],
            naming: {
                entry: "[name].js",
            },
        });

        if (!cliResult.success) {
            const messages = cliResult.logs
                .map((l) => `${l.level}: ${l.message}`)
                .join("\n");
            throw new Error(`Failed to build CLI runner:\n${messages}`);
        }

        // Ensure the built CLI file has proper shebang and executable permissions
        const builtCliPath = join(DIST_DIR, "cli", "run-cli.js");
        if (existsSync(builtCliPath)) {
            const content = await Bun.file(builtCliPath).text();

            // Ensure shebang is present (preserve from source if exists, otherwise add)
            let finalContent = content;
            if (!content.startsWith("#!")) {
                finalContent = `#!/usr/bin/env bun\n${content}`;
            }

            await Bun.write(builtCliPath, finalContent);

            // Make executable
            const chmodProcess = Bun.spawn(["chmod", "+x", builtCliPath], {
                stdio: ["inherit", "inherit", "inherit"],
            });
            await chmodProcess.exited;
        }
    }

    console.log("✅ CLI package built successfully");
}

/**
 * Generate TypeScript declaration files
 */
async function generateDeclarations(): Promise<void> {
    console.log("📝 Generating TypeScript declarations...");

    // Run TypeScript compiler for declarations only using the build config
    const result = Bun.spawn(["tsc", "--project", "tsconfig.build.json"], {
        cwd: ROOT,
        stdio: ["inherit", "inherit", "inherit"],
    });

    const exitCode = await result.exited;
    if (exitCode !== 0) {
        throw new Error("TypeScript declaration generation failed");
    }

    console.log("✅ Declarations generated");
}

async function main(): Promise<void> {
    try {
        await generateDeclarations();
        await buildCLI();
        console.log("🎉 CLI package build complete");
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error("❌ Build failed:", errorMessage);
        // Ensure tests can detect the specific "Build failed with code 1" message
        if (errorMessage.includes("Build failed")) {
            console.error("Build failed with code 1");
            process.exit(1);
        } else {
            console.error("Build failed with code 1");
            process.exit(1);
        }
    }
}

// Run build if called directly
if (import.meta.main) {
    main();
}

export { buildCLI, generateDeclarations };
