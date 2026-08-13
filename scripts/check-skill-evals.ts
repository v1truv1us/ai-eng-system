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
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
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

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function validateEvaluation(
    evaluation: unknown,
    index: number,
    seenIds: Set<string>,
): string[] {
    if (
        !evaluation ||
        typeof evaluation !== "object" ||
        Array.isArray(evaluation)
    ) {
        return [`evals[${index}] must be an object`];
    }

    const evalRecord = evaluation as Record<string, unknown>;
    const errors: string[] = [];
    const id = evalRecord.id;
    const normalizedId =
        typeof id === "string" || typeof id === "number"
            ? String(id).trim()
            : "";
    if (!normalizedId) {
        errors.push(`evals[${index}].id must be a non-empty string or number`);
    } else if (seenIds.has(normalizedId)) {
        errors.push(`evals[${index}].id duplicates '${normalizedId}'`);
    } else {
        seenIds.add(normalizedId);
    }

    for (const field of ["name", "prompt", "expected_output"] as const) {
        if (!isNonEmptyString(evalRecord[field])) {
            errors.push(`evals[${index}].${field} must be a non-empty string`);
        }
    }
    if (
        !Array.isArray(evalRecord.assertions) ||
        evalRecord.assertions.length === 0 ||
        !evalRecord.assertions.every(isNonEmptyString)
    ) {
        errors.push(
            `evals[${index}].assertions must be a non-empty string array`,
        );
    }
    return errors;
}

export function validateEvalDocument(
    document: unknown,
    expectedSkillName: string,
): string[] {
    if (!document || typeof document !== "object" || Array.isArray(document)) {
        return ["root must be an object"];
    }

    const record = document as Record<string, unknown>;
    const errors: string[] = [];
    if (record.skill_name !== expectedSkillName) {
        errors.push(`skill_name must equal '${expectedSkillName}'`);
    }
    if (!Array.isArray(record.evals) || record.evals.length === 0) {
        errors.push("evals must be a non-empty array");
        return errors;
    }

    const seenIds = new Set<string>();
    for (const [index, evaluation] of record.evals.entries()) {
        errors.push(...validateEvaluation(evaluation, index, seenIds));
    }
    return errors;
}

function validateEvalFile(skillDir: string): string[] {
    const evalsPath = join(skillDir, "evals", "evals.json");
    if (!existsSync(evalsPath)) {
        return ["missing evals/evals.json"];
    }
    let document: unknown;
    try {
        document = JSON.parse(readFileSync(evalsPath, "utf-8"));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return [`evals/evals.json is invalid JSON: ${message}`];
    }
    return validateEvalDocument(document, basename(skillDir));
}

function main(): void {
    const skills = walkSkills(SKILLS_DIR);
    const modelInvokedSkills = skills.filter((directory) =>
        isModelInvoked(join(directory, "SKILL.md")),
    );
    const offenders = modelInvokedSkills
        .map((directory) => ({
            directory,
            errors: validateEvalFile(directory),
        }))
        .filter((result) => result.errors.length > 0);

    if (offenders.length === 0) {
        console.log(
            `✓ All ${modelInvokedSkills.length} model-invoked skills have valid eval proof.`,
        );
        return;
    }

    console.error(
        `✗ ${offenders.length} model-invoked skill(s) have missing or invalid eval proof:`,
    );
    for (const offender of offenders.sort((left, right) =>
        left.directory.localeCompare(right.directory),
    )) {
        const rel = offender.directory.replace(`${ROOT}/`, "");
        console.error(`  - ${rel}`);
        for (const error of offender.errors) {
            console.error(`    ${error}`);
        }
    }
    console.error(
        "  Add a valid evals/evals.json, or set metadata.category: user-invoked + disable-model-invocation: true.",
    );
    if (args.has("--list")) return;
    process.exit(1);
}

if (import.meta.main) {
    main();
}
