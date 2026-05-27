/**
 * Tracks ai-eng-managed install artifacts for precise clean/uninstall.
 */

import fs from "node:fs";
import path from "node:path";
import type { InstallScope } from "./toolkit-path";
import type { InstallPlatform } from "./types";

export const MANIFEST_VERSION = 1;

export interface InstallManifestEntry {
    platform: InstallPlatform;
    scope: InstallScope;
    installedAt: string;
    /** Top-level entries under .agents/skills/ (or harness skills source). */
    agentSkillEntries: string[];
    /** Harness bundle directory removed on clean (cursor plugin, .pi/, project .gemini/). */
    bundlePath?: string;
    /** OpenCode skill directory names under skill/. */
    openCodeSkillDirs?: string[];
    /** OpenCode tool paths relative to tool/. */
    openCodeToolPaths?: string[];
    /** Gemini command filenames under commands/. */
    geminiCommandFiles?: string[];
    /** Gemini skill tree entries under skills/ (top-level dir names). */
    geminiSkillEntries?: string[];
}

export interface InstallManifestFile {
    version: number;
    entries: InstallManifestEntry[];
}

function getManifestDir(scope: InstallScope, projectDir: string): string {
    if (scope === "project") {
        return path.join(projectDir, ".ai-eng");
    }
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return path.join(home, ".config", "ai-eng");
}

export function getManifestPath(
    scope: InstallScope,
    projectDir: string,
): string {
    return path.join(
        getManifestDir(scope, projectDir),
        "install-manifest.json",
    );
}

export function readInstallManifest(
    scope: InstallScope,
    projectDir: string,
): InstallManifestFile {
    const manifestPath = getManifestPath(scope, projectDir);
    if (!fs.existsSync(manifestPath)) {
        return { version: MANIFEST_VERSION, entries: [] };
    }
    try {
        const parsed = JSON.parse(
            fs.readFileSync(manifestPath, "utf-8"),
        ) as InstallManifestFile;
        if (!Array.isArray(parsed.entries)) {
            return { version: MANIFEST_VERSION, entries: [] };
        }
        return parsed;
    } catch {
        return { version: MANIFEST_VERSION, entries: [] };
    }
}

export function writeInstallManifest(
    scope: InstallScope,
    projectDir: string,
    manifest: InstallManifestFile,
): void {
    const manifestPath = getManifestPath(scope, projectDir);
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(
        manifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf-8",
    );
}

export function findManifestEntry(
    manifest: InstallManifestFile,
    platform: InstallPlatform,
    scope: InstallScope,
): InstallManifestEntry | undefined {
    return manifest.entries.find(
        (entry) => entry.platform === platform && entry.scope === scope,
    );
}

export function upsertManifestEntry(
    scope: InstallScope,
    projectDir: string,
    entry: InstallManifestEntry,
): void {
    const manifest = readInstallManifest(scope, projectDir);
    const next = manifest.entries.filter(
        (existing) =>
            !(
                existing.platform === entry.platform &&
                existing.scope === entry.scope
            ),
    );
    next.push(entry);
    writeInstallManifest(scope, projectDir, {
        version: MANIFEST_VERSION,
        entries: next,
    });
}

export function removeManifestEntry(
    scope: InstallScope,
    projectDir: string,
    platform: InstallPlatform,
    targetScope: InstallScope,
): void {
    const manifest = readInstallManifest(scope, projectDir);
    const next = manifest.entries.filter(
        (entry) =>
            !(entry.platform === platform && entry.scope === targetScope),
    );
    writeInstallManifest(scope, projectDir, {
        version: MANIFEST_VERSION,
        entries: next,
    });
}
