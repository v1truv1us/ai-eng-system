/**
 * Sync toolkit skill trees into Agent Skills directories (.agents/skills).
 */

import fs from "node:fs";
import path from "node:path";
import type { CleanResult } from "./clean";

function copyRecursive(src: string, dest: string): void {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

/**
 * Top-level directory names in a harness skills source tree.
 */
export function listSkillTreeEntries(sourceSkillsDir: string): string[] {
    if (!fs.existsSync(sourceSkillsDir)) return [];
    return fs
        .readdirSync(sourceSkillsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

/**
 * Remove managed skill trees from an Agent Skills root without touching other skills.
 */
export function removeSkillTreeEntries(
    targetAgentsSkillsDir: string,
    entryNames: string[],
    dryRun: boolean,
    result: CleanResult,
    verbose = false,
): void {
    for (const entryName of entryNames) {
        const targetPath = path.join(targetAgentsSkillsDir, entryName);
        if (!fs.existsSync(targetPath)) continue;

        if (dryRun) {
            result.skipped.push(targetPath);
            if (verbose) {
                console.log(`  🔍 would remove ${targetPath}`);
            }
            continue;
        }

        fs.rmSync(targetPath, { recursive: true, force: true });
        result.removed.push(targetPath);
        if (verbose) {
            console.log(`  ✅ removed ${targetPath}`);
        }
    }
}

/**
 * Merge harness skills into an Agent Skills root (Cursor ~/.agents/skills, Pi, etc.).
 * Replaces only skill directories present in the source bundle.
 */
export function syncSkillsTree(
    sourceSkillsDir: string,
    targetAgentsSkillsDir: string,
): number {
    if (!fs.existsSync(sourceSkillsDir)) {
        return 0;
    }

    fs.mkdirSync(targetAgentsSkillsDir, { recursive: true });

    let synced = 0;
    for (const entry of fs.readdirSync(sourceSkillsDir, {
        withFileTypes: true,
    })) {
        const srcPath = path.join(sourceSkillsDir, entry.name);
        const destPath = path.join(targetAgentsSkillsDir, entry.name);

        if (entry.isDirectory()) {
            if (fs.existsSync(destPath)) {
                fs.rmSync(destPath, { recursive: true, force: true });
            }
            copyRecursive(srcPath, destPath);
            synced++;
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".md")) {
        }
    }

    return synced;
}

/**
 * Merge gemini skills/commands without wiping unrelated ~/.gemini content.
 * Replaces only paths present in the source bundle.
 */
export function mergeGeminiHarness(
    sourceGeminiDir: string,
    targetGeminiDir: string,
): void {
    for (const subdir of ["skills", "commands"] as const) {
        const srcSub = path.join(sourceGeminiDir, subdir);
        if (!fs.existsSync(srcSub)) continue;

        const destSub = path.join(targetGeminiDir, subdir);
        fs.mkdirSync(destSub, { recursive: true });

        for (const entry of fs.readdirSync(srcSub, { withFileTypes: true })) {
            const srcPath = path.join(srcSub, entry.name);
            const destPath = path.join(destSub, entry.name);

            if (entry.isDirectory()) {
                if (fs.existsSync(destPath)) {
                    fs.rmSync(destPath, { recursive: true, force: true });
                }
                copyRecursive(srcPath, destPath);
                continue;
            }

            if (entry.isFile()) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

export { copyRecursive };
