#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const repoRoot = process.cwd();
const isValidateOnly = args.includes("--validate");

async function run(command: string) {
    const proc = Bun.spawn(["bash", "-lc", command], {
        cwd: repoRoot,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
    });

    const code = await proc.exited;
    if (code !== 0) {
        process.exit(code);
    }
}

async function copyIfExists(source: string, destination: string) {
    if (existsSync(source)) {
        await cp(source, destination, { force: true, recursive: false });
    }
}

async function main() {
    // Build core first so workspace imports resolve during root build
    await run("bun run build:core");

    await run(`bun run build.ts ${args.join(" ")}`.trim());

    if (isValidateOnly) {
        return;
    }

    await run("bun run build:cli");

    await copyIfExists(
        resolve(repoRoot, "packages/core/dist/index.js"),
        resolve(repoRoot, "dist/index.js"),
    );
    await copyIfExists(
        resolve(repoRoot, "packages/core/dist/index.d.ts"),
        resolve(repoRoot, "dist/index.d.ts"),
    );
    await copyIfExists(
        resolve(repoRoot, "packages/core/dist/content-loader.d.ts"),
        resolve(repoRoot, "dist/content-loader.d.ts"),
    );
    await copyIfExists(
        resolve(repoRoot, "packages/core/dist/paths.d.ts"),
        resolve(repoRoot, "dist/paths.d.ts"),
    );

    await run("bun run build:toolkit");
    await run("bun run sync:core-dist");

    // Build daily-brief-sdk (4th workspace package). Best-effort: skip if
    // the package directory or its node_modules deps are missing — keeps
    // the existing build path green for repos that haven't installed the
    // brief SDK deps yet.
    if (existsSync(resolve(repoRoot, "packages/daily-brief-sdk/package.json"))) {
        try {
            await run("bun run build:briefs");
        } catch (error) {
            console.warn(
                `daily-brief-sdk build skipped: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
