#!/usr/bin/env bun
/**
 * Keep publishable workspace package versions aligned.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const OVERRIDE_VERSION = process.argv[2];

async function updateJsonFile(
    path: string,
    update: (value: Record<string, any>) => Record<string, any>,
) {
    const json = await readFile(path, "utf-8");
    const value = JSON.parse(json);
    const updatedValue = update(value);
    await writeFile(path, `${JSON.stringify(updatedValue, null, 2)}\n`);
}

async function updatePublishVersions() {
    const corePackagePath = resolve(
        process.cwd(),
        "packages/core/package.json",
    );
    const cliPackagePath = resolve(
        process.cwd(),
        "packages/cli/package.json",
    );
    const cliDevPath = resolve(
        process.cwd(),
        "packages/cli/package.json.dev",
    );
    const cliPublishPath = resolve(
        process.cwd(),
        "packages/cli/package.json.publish",
    );
    const toolkitPackagePath = resolve(
        process.cwd(),
        "packages/toolkit/package.json",
    );
    const versionedManifestPaths = [
        resolve(process.cwd(), ".claude-plugin/plugin.json"),
        resolve(process.cwd(), ".claude-plugin/marketplace.json"),
        resolve(process.cwd(), "dist/.claude-plugin/plugin.json"),
        resolve(process.cwd(), "dist/.claude-plugin/marketplace.json"),
        resolve(process.cwd(), "plugins/ai-eng-system/plugin.json"),
        resolve(process.cwd(), "packages/toolkit/.claude-plugin/plugin.json"),
        resolve(process.cwd(), "packages/toolkit/.claude-plugin/marketplace.json"),
        resolve(process.cwd(), "packages/toolkit/plugins/ai-eng-system/plugin.json"),
    ];

    try {
        const corePackageJson = await readFile(corePackagePath, "utf-8");
        const corePkg = JSON.parse(corePackageJson);
        const coreVersion = OVERRIDE_VERSION || corePkg.version;

        console.log(`📦 Target workspace version: ${coreVersion}`);

        if (OVERRIDE_VERSION && corePkg.version !== coreVersion) {
            corePkg.version = coreVersion;
            await writeFile(corePackagePath, `${JSON.stringify(corePkg, null, 2)}\n`);
            console.log(`🔄 Updated @ai-eng-system/core version to ${coreVersion}`);
        }

        const cliPackagePaths = [cliPackagePath, cliDevPath, cliPublishPath];

        for (const packagePath of cliPackagePaths) {
            const cliJson = await readFile(packagePath, "utf-8");
            const cliPkg = JSON.parse(cliJson);
            cliPkg.version = coreVersion;

            if (
                packagePath === cliPublishPath &&
                cliPkg.dependencies?.["@ai-eng-system/core"]
            ) {
                const oldVersion = cliPkg.dependencies["@ai-eng-system/core"];
                cliPkg.dependencies["@ai-eng-system/core"] = `^${coreVersion}`;
                console.log(
                    `🔄 Updated @ai-eng-system/core dependency from ${oldVersion} to ^${coreVersion}`,
                );
            }

            await writeFile(packagePath, `${JSON.stringify(cliPkg, null, 2)}\n`);
        }

        await updateJsonFile(toolkitPackagePath, (toolkitPkg) => {
            toolkitPkg.version = coreVersion;
            return toolkitPkg;
        });
        console.log(`🔄 Updated @ai-eng-system/toolkit version to ${coreVersion}`);

        for (const manifestPath of versionedManifestPaths) {
            try {
                await updateJsonFile(manifestPath, (manifest) => {
                    if (typeof manifest.version === "string") {
                        manifest.version = coreVersion;
                    }

                    if (manifest.metadata?.version) {
                        manifest.metadata.version = coreVersion;
                    }

                    if (Array.isArray(manifest.plugins)) {
                        manifest.plugins = manifest.plugins.map((plugin) => ({
                            ...plugin,
                            ...(plugin.version ? { version: coreVersion } : {}),
                        }));
                    }

                    return manifest;
                });
            } catch {
                // File may not exist yet; skip generated outputs that haven't been built.
            }
        }

        console.log("✅ Publish versions updated successfully");
    } catch (error) {
        console.error("❌ Failed to update publish versions:", error);
        process.exit(1);
    }
}

updatePublishVersions();
