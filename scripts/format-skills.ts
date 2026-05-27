#!/usr/bin/env bun
/**
 * Format and validate canonical skills/ against the Agent Skills open standard.
 *
 * Usage:
 *   bun scripts/format-skills.ts           # check only (CI-friendly)
 *   bun scripts/format-skills.ts --fix     # rewrite SKILL.md files in place
 *   bun scripts/format-skills.ts --fix -v  # verbose
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatSkillsDirectory, hasFormatErrors } from "./lib/agent-skills.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");

const args = new Set(process.argv.slice(2));
const fix = args.has("--fix");
const verbose = args.has("-v") || args.has("--verbose");

async function main(): Promise<void> {
    const summary = await formatSkillsDirectory({
        skillsRoot: SKILLS_DIR,
        fix,
        verbose,
    });

    console.log(
        `${fix ? "Formatted" : "Checked"} ${summary.scanned} skill(s): ` +
            `${summary.changed} ${fix ? "updated" : "need formatting"}, ` +
            `${summary.errors} error(s), ${summary.warnings} warning(s)`,
    );

    if (!fix && summary.changed > 0) {
        console.log("\nRun `bun run format:skills:fix` to apply formatting.");
    }

    if (verbose || hasFormatErrors(summary)) {
        for (const result of summary.results) {
            const notable = result.issues.filter(
                (issue) => issue.level === "error" || verbose,
            );
            if (!notable.length && !result.changed) continue;

            console.log(`\n${result.skillFile}`);
            if (result.changed) {
                console.log(
                    `  ${fix ? "updated" : "would update"} frontmatter/body framing`,
                );
            }
            for (const issue of notable) {
                console.log(
                    `  [${issue.level}] ${issue.code}: ${issue.message}`,
                );
            }
        }
    }

    if (hasFormatErrors(summary) || (!fix && summary.changed > 0)) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
