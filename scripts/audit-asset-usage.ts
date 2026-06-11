#!/usr/bin/env bun
/**
 * Audit command/agent/skill usage via git history and reference graph.
 * Produces a report showing:
 * - Last modification date per asset
 * - Reference count (how many other assets reference it)
 * - Orphan status (zero references = likely dead)
 * - Stale status (no changes in 6+ months)
 *
 * Usage: bun scripts/audit-asset-usage.ts [--since=2025-01-01] [--stale-days=180]
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

interface AssetReport {
    name: string;
    type: "command" | "agent" | "skill";
    path: string;
    last_modified: string;
    last_author: string;
    commit_count_12mo: number;
    referenced_by: string[];
    orphan: boolean;
    stale: boolean;
}

function parseArgs(): { since?: string; staleDays: number } {
    const args: Record<string, string> = {};
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.startsWith("--")) {
            const [key, val] = arg.slice(2).split("=");
            args[key] = val || "true";
        }
    }
    return {
        since: args.since,
        staleDays: parseInt(args["stale-days"] || "180", 10),
    };
}

function runGit(args: string[]): string {
    try {
        return execSync(`git ${args.join(" ")}`, {
            encoding: "utf-8",
            cwd: process.cwd(),
        }).trim();
    } catch {
        return "";
    }
}

function getLastModified(filePath: string): { date: string; author: string } {
    const log = runGit([
        "log",
        "-1",
        "--format=%H%x00%ai%x00%an",
        "--",
        filePath,
    ]);
    if (!log) return { date: "never", author: "unknown" };
    const parts = log.split("\0");
    const date = parts[1]?.split(" ")[0] || "unknown";
    const author = parts[2] || "unknown";
    return { date, author };
}

function getCommitCount(filePath: string, since?: string): number {
    const sinceArg = since ? [`--since=${since}`] : [];
    const log = runGit(["log", "--oneline", ...sinceArg, "--", filePath]);
    if (!log) return 0;
    return log.split("\n").filter((l) => l.trim()).length;
}

async function getAllAssets(): Promise<
    Array<{ name: string; type: "command" | "agent" | "skill"; path: string }>
> {
    const assets: Array<{
        name: string;
        type: "command" | "agent" | "skill";
        path: string;
    }> = [];

    const commandsDir = join(process.cwd(), "content", "commands");
    const agentsDir = join(process.cwd(), "content", "agents");
    const skillsDir = join(process.cwd(), "skills");

    if (existsSync(commandsDir)) {
        const files = await readdir(commandsDir);
        for (const f of files.filter((x) => x.endsWith(".md"))) {
            assets.push({
                name: basename(f, ".md"),
                type: "command",
                path: join(commandsDir, f),
            });
        }
    }

    if (existsSync(agentsDir)) {
        const files = await readdir(agentsDir);
        for (const f of files.filter((x) => x.endsWith(".md"))) {
            assets.push({
                name: basename(f, ".md"),
                type: "agent",
                path: join(agentsDir, f),
            });
        }
    }

    if (existsSync(skillsDir)) {
        const dirs = await readdir(skillsDir, { withFileTypes: true });
        for (const d of dirs.filter((x) => x.isDirectory())) {
            const skillPath = join(skillsDir, d.name, "SKILL.md");
            if (existsSync(skillPath)) {
                assets.push({ name: d.name, type: "skill", path: skillPath });
            }
        }
    }

    return assets;
}

function findReferences(
    targetName: string,
    allAssets: Array<{ path: string; name: string; type: string }>,
): string[] {
    const refs: string[] = [];

    // Check all markdown assets
    for (const asset of allAssets) {
        try {
            const content = readFileSync(asset.path, "utf-8");
            const patterns = [
                new RegExp(`agent:\\s*${targetName}\\b`, "i"),
                new RegExp(`skill:\\s*${targetName}\\b`, "i"),
                new RegExp(`["']${targetName}["']`, "i"),
                new RegExp(`\\b${targetName}\\b`, "i"),
            ];
            if (
                patterns.some((p) => p.test(content)) &&
                asset.name !== targetName
            ) {
                refs.push(`${asset.type}:${asset.name}`);
            }
        } catch {
            // skip
        }
    }

    // Check build.ts for plugin group references
    try {
        const buildTs = readFileSync(join(process.cwd(), "build.ts"), "utf-8");
        if (buildTs.includes(`"${targetName}"`)) {
            refs.push("config:build.ts");
        }
    } catch {
        // skip
    }

    // Check .claude/ and .pi/ generated files
    for (const dir of [".claude", ".pi"]) {
        try {
            const entries = readdirSync(join(process.cwd(), dir), {
                recursive: true,
                withFileTypes: true,
            });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith(".md")) {
                    const content = readFileSync(
                        join(entry.parentPath || entry.path, entry.name),
                        "utf-8",
                    );
                    if (content.includes(targetName)) {
                        refs.push(`${dir}:${entry.name}`);
                        break; // only count once per dir
                    }
                }
            }
        } catch {
            // skip
        }
    }

    return [...new Set(refs)];
}

async function main(): Promise<void> {
    const args = parseArgs();
    const since = args.since || `${new Date().getFullYear() - 1}-01-01`;
    const staleCutoff = new Date();
    staleCutoff.setDate(staleCutoff.getDate() - args.staleDays);

    console.log(
        `Auditing assets (since=${since}, stale-days=${args.staleDays})...\n`,
    );

    const assets = await getAllAssets();
    const reports: AssetReport[] = [];

    for (const asset of assets) {
        const { date, author } = getLastModified(asset.path);
        const commits = getCommitCount(asset.path, since);
        const refs = findReferences(asset.name, assets);
        const isStale = date === "never" || new Date(date) < staleCutoff;

        reports.push({
            name: asset.name,
            type: asset.type,
            path: asset.path.replace(process.cwd() + "/", ""),
            last_modified: date,
            last_author: author,
            commit_count_12mo: commits,
            referenced_by: refs,
            orphan: refs.length === 0,
            stale: isStale,
        });
    }

    // Sort by risk: orphans first, then stale, then by commit count
    reports.sort((a, b) => {
        const aRisk = (a.orphan ? 2 : 0) + (a.stale ? 1 : 0);
        const bRisk = (b.orphan ? 2 : 0) + (b.stale ? 1 : 0);
        if (bRisk !== aRisk) return bRisk - aRisk;
        return a.commit_count_12mo - b.commit_count_12mo;
    });

    // Summary
    const total = reports.length;
    const orphans = reports.filter((r) => r.orphan).length;
    const stale = reports.filter((r) => r.stale).length;
    const orphanAndStale = reports.filter((r) => r.orphan && r.stale).length;

    console.log(`=== SUMMARY ===`);
    console.log(`Total assets: ${total}`);
    console.log(`Orphans (0 references): ${orphans}`);
    console.log(`Stale (>${args.staleDays}d since last change): ${stale}`);
    console.log(`Orphan + Stale (delete candidates): ${orphanAndStale}`);
    console.log();

    // Detail table
    console.log(`=== DETAIL ===`);
    console.log(
        `${"Type".padEnd(10)} ${"Name".padEnd(30)} ${"Last Mod".padEnd(12)} ${"Commits".padEnd(8)} ${"Refs".padEnd(5)} ${"Status"}`,
    );
    console.log("-".repeat(90));

    for (const r of reports) {
        const status =
            [r.orphan ? "ORPHAN" : "", r.stale ? "STALE" : ""]
                .filter(Boolean)
                .join("+") || "OK";
        const refs = r.referenced_by.length;
        console.log(
            `${r.type.padEnd(10)} ${r.name.padEnd(30)} ${r.last_modified.padEnd(12)} ${String(r.commit_count_12mo).padEnd(8)} ${String(refs).padEnd(5)} ${status}`,
        );
    }

    // Candidates for deletion
    const candidates = reports.filter((r) => r.orphan && r.stale);
    if (candidates.length > 0) {
        console.log(`\n=== DELETE CANDIDATES (orphan + stale) ===`);
        for (const r of candidates) {
            console.log(
                `  ${r.type}/${r.name} — last modified ${r.last_modified}, ${r.commit_count_12mo} commits in 12mo`,
            );
        }
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
