#!/usr/bin/env bun
/**
 * Verify ai-eng-system imported useful cursor/plugins content without duplicates.
 *
 * Compares scripts/import-cursor-plugins.ts PLUGINS list against the live
 * cursor/plugins marketplace and reports gaps (e.g. pstack) and coverage stats.
 *
 * Usage:
 *   bun scripts/verify-cursor-plugins-coverage.ts
 *   bun scripts/verify-cursor-plugins-coverage.ts --strict   # exit 1 on gaps
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SKILLS_DIR = join(ROOT, "skills");
const MARKETPLACE_URL =
    "https://raw.githubusercontent.com/cursor/plugins/main/.cursor-plugin/marketplace.json";

/** Plugins intentionally not merged into canonical skills (see docs/attribution). */
const EXCLUDED_PLUGINS = new Set<string>([]);

const IMPORTED_PLUGINS = [
    "cursor-team-kit",
    "continual-learning",
    "create-plugin",
    "agent-compatibility",
    "cli-for-agent",
    "pr-review-canvas",
    "docs-canvas",
    "cursor-sdk",
    "orchestrate",
    "ralph-loop",
    "teaching",
    "pstack",
];

async function fetchMarketplacePlugins(): Promise<string[]> {
    const response = await fetch(MARKETPLACE_URL, {
        signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch cursor/plugins marketplace: ${response.status}`,
        );
    }
    const data = (await response.json()) as {
        plugins?: Array<{ name: string }>;
    };
    return (data.plugins ?? []).map((entry) => entry.name).sort();
}

const AGENTS_DIR = join(ROOT, "content", "agents");

/** Expected cursor/plugins agents by plugin (from upstream marketplace). */
const EXPECTED_CURSOR_AGENTS: Record<string, string[]> = {
    "cursor-team-kit": ["ci-watcher", "thermo-nuclear-code-quality-review"],
    "continual-learning": ["agents-memory-updater"],
    "create-plugin": ["plugin-architect"],
    "agent-compatibility": [
        "compatibility-scan-review",
        "docs-reliability-review",
        "startup-review",
        "validation-review",
    ],
    pstack: ["poteto-agent"],
};

/** Agents merged into canonical targets instead of standalone files */
const MERGED_CURSOR_AGENTS: Record<string, string> = {
    "thermo-nuclear-code-quality-review": "code-reviewer",
    "plugin-architect": "plugin-validator",
};

/** Native integration markers in merged agent targets (no append-only imports). */
const MERGED_AGENT_NATIVE_MARKERS: Record<string, string> = {
    "thermo-nuclear-code-quality-review":
        "## Strict maintainability mode (subagent)",
    "plugin-architect": "Architecture planning (when designing or refactoring)",
};

function countCursorImportSkills(): number {
    let count = 0;

    function walk(dir: string): void {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                walk(full);
                continue;
            }
            if (entry !== "SKILL.md") continue;
            const content = readFileSync(full, "utf-8");
            if (
                content.includes("cursor-import") ||
                content.includes("cursor/plugins")
            ) {
                count++;
            }
        }
    }

    walk(SKILLS_DIR);
    return count;
}

function agentCoverage(): {
    imported: string[];
    merged: string[];
    missing: string[];
} {
    const imported: string[] = [];
    const merged: string[] = [];
    const missing: string[] = [];

    for (const [plugin, names] of Object.entries(EXPECTED_CURSOR_AGENTS)) {
        void plugin;
        for (const name of names) {
            const mergeTarget = MERGED_CURSOR_AGENTS[name];
            if (mergeTarget) {
                const targetPath = join(AGENTS_DIR, `${mergeTarget}.md`);
                if (!existsSync(targetPath)) {
                    missing.push(`${name} -> ${mergeTarget}`);
                    continue;
                }
                const content = readFileSync(targetPath, "utf-8");
                const nativeMarker = MERGED_AGENT_NATIVE_MARKERS[name];
                const integrated =
                    (nativeMarker && content.includes(nativeMarker)) ||
                    (content.includes(`Imported from`) &&
                        content.includes(name));
                if (integrated) {
                    merged.push(`${name} -> ${mergeTarget}`);
                } else {
                    missing.push(
                        `${name} -> ${mergeTarget} (not natively integrated)`,
                    );
                }
                continue;
            }

            const agentPath = join(AGENTS_DIR, `${name}.md`);
            if (existsSync(agentPath)) {
                imported.push(name);
            } else {
                missing.push(name);
            }
        }
    }

    return { imported, merged, missing };
}

async function main(): Promise<void> {
    const strict = process.argv.includes("--strict");
    const marketplacePlugins = await fetchMarketplacePlugins();

    const missing = marketplacePlugins.filter(
        (name) =>
            !IMPORTED_PLUGINS.includes(name) && !EXCLUDED_PLUGINS.has(name),
    );
    const extra = IMPORTED_PLUGINS.filter(
        (name) => !marketplacePlugins.includes(name),
    );
    const excludedPresent = [...EXCLUDED_PLUGINS].filter((name) =>
        marketplacePlugins.includes(name),
    );
    const importSkillCount = countCursorImportSkills();
    const agentStatus = agentCoverage();

    console.log("Cursor plugins coverage verification\n");
    console.log(
        `Marketplace plugins (cursor/plugins): ${marketplacePlugins.length}`,
    );
    console.log(
        `Imported via import-cursor-plugins.ts: ${IMPORTED_PLUGINS.length}`,
    );
    console.log(`Skills tagged/imported in skills/: ${importSkillCount}`);
    console.log(
        `Cursor agents: ${agentStatus.imported.length} imported, ${agentStatus.merged.length} merged`,
    );
    console.log(
        `Intentionally excluded: ${[...EXCLUDED_PLUGINS].join(", ") || "(none)"}`,
    );

    if (missing.length) {
        console.log("\n⚠️  Marketplace plugins not imported:");
        for (const name of missing) console.log(`  - ${name}`);
    } else {
        console.log(
            "\n✅ All marketplace plugins are imported or explicitly excluded",
        );
    }

    if (excludedPresent.length) {
        console.log("\nℹ️  Excluded from import (documented):");
        for (const name of excludedPresent) console.log(`  - ${name}`);
    }

    if (extra.length) {
        console.log(
            "\n⚠️  Import list references plugins no longer in marketplace:",
        );
        for (const name of extra) console.log(`  - ${name}`);
    }

    const attribution = readFileSync(
        join(ROOT, "docs/attribution/cursor-plugins.md"),
        "utf-8",
    );
    if (!attribution.includes("cursor/plugins")) {
        console.log(
            "\n⚠️  docs/attribution/cursor-plugins.md missing source reference",
        );
    }

    if (agentStatus.missing.length) {
        console.log("\n⚠️  Cursor agents missing or incomplete:");
        for (const name of agentStatus.missing) console.log(`  - ${name}`);
    } else {
        console.log("\n✅ All cursor/plugins agents are imported or merged");
    }

    if (
        strict &&
        (missing.length > 0 ||
            extra.length > 0 ||
            agentStatus.missing.length > 0)
    ) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
