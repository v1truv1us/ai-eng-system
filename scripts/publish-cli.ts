#!/usr/bin/env bun
/**
 * Publish the CLI package safely.
 *
 * - Updates package.json.publish with the target version
 * - Swaps in the publish manifest
 * - Runs npm publish or npm pack --dry-run
 * - Restores the development manifest even if publish fails
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const explicitVersion = args.find((arg) => !arg.startsWith("--"));

async function run(cmd: string[], cwd: string): Promise<void> {
    const proc = Bun.spawn(cmd, {
        cwd,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
        env: process.env,
    });

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
        throw new Error(`${cmd.join(" ")} failed with exit code ${exitCode}`);
    }
}

async function publishCli(): Promise<void> {
    const repoRoot = process.cwd();
    const cliDir = resolve(repoRoot, "packages/cli");
    const cliPackagePath = resolve(cliDir, "package.json");
    const cliPublishPath = resolve(cliDir, "package.json.publish");

    const originalPackageJson = await readFile(cliPackagePath, "utf-8");

    try {
        if (explicitVersion) {
            await run(
                ["bun", "scripts/update-publish-versions.ts", explicitVersion],
                repoRoot,
            );
        } else {
            await run(["bun", "scripts/update-publish-versions.ts"], repoRoot);
        }

        const publishJson = await readFile(cliPublishPath, "utf-8");
        await writeFile(cliPackagePath, publishJson);

        const command = [
            "bun",
            "publish",
            "--access",
            "public",
            "--provenance",
        ];
        if (isDryRun) {
            command.push("--dry-run");
        }

        await run(command, cliDir);
    } finally {
        await writeFile(cliPackagePath, originalPackageJson);
    }
}

publishCli().catch((error) => {
    console.error(
        "❌ Failed to publish CLI:",
        error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
});
