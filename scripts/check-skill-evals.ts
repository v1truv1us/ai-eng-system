#!/usr/bin/env bun
/**
 * Lint: every model-invoked skill must ship an evals/ directory with proof.
 *
 * model-invoked skills auto-load at startup (routing-token cost + contamination
 * risk), so they must earn their place with evals that prove they beat the
 * no-skill baseline. user-invoked skills are opt-in and exempt.
 *
 * Usage:
 *   bun scripts/check-skill-evals.ts            # check (exit 1 on violations)
 *   bun scripts/check-skill-evals.ts --list     # list offending skills only
 *
 * Wire into CI after `bun run format:skills`.
 */
import { dirname, join } from "node:path";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const args = new Set(process.argv.slice(2));

function walkSkills(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (entry.name === "gtm") continue; // vendored, exempt
        const child = join(dir, entry.name);
        const skillMd = join(child, "SKILL.md");
        if (existsSync(skillMd) && statSync(skillMd).isFile()) {
            out.push(child);
        } else {
            walkSkills(child, out); // namespaced (e.g. pstack/)
        }
    }
    return out;
}

function isModelInvoked(skillMd: string): boolean {
    if (!existsSync(skillMd)) return false;
    const content = readFileSync(skillMd, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return false;
    const fm = fmMatch[1];
    if (/disable-model-invocation:\s*true\b/.test(fm)) return false;
    return /category:\s*model-invoked\b/.test(fm);
}

function hasEvals(skillDir: string): boolean {
    return (
        existsSync(join(skillDir, "evals", "evals.json")) ||
        existsSync(join(skillDir, "evals", "evaluations.json"))
    );
}

function main(): void {
    const skills = walkSkills(SKILLS_DIR);
    const offenders = skills.filter(
        (d) => isModelInvoked(join(d, "SKILL.md")) && !hasEvals(d),
    );

    if (offenders.length === 0) {
        const modelCount = skills.filter((d) =>
            isModelInvoked(join(d, "SKILL.md")),
        ).length;
        console.log(
            `✓ All ${modelCount} model-invoked skills have evals/ (proof required for auto-load).`,
        );
        return;
    }

    console.error(
        `✗ ${offenders.length} model-invoked skill(s) missing evals/ (required for auto-load):`,
    );
    for (const d of offenders.sort()) {
        const rel = d.replace(`${ROOT}/`, "");
        console.error(`  - ${rel}`);
    }
    console.error(
        "  Add evals/evals.json (prompt + expected_output + assertions), or set metadata.category: user-invoked + disable-model-invocation: true to opt out of auto-load.",
    );
    if (args.has("--list")) return;
    process.exit(1);
}

main();
