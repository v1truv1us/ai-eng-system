#!/usr/bin/env bun
/**
 * Autoreview skill-health loop — the self-healing, self-learning auditor.
 *
 * Runs the skill-health detectors, self-heals what is safe (frontmatter format,
 * taxonomy invariants, eval scaffolding), and writes a dated health report.
 * Finds requiring human judgment (redundancy merges, stale model slugs, unused
 * skills) are reported, not auto-applied. Over time the invocation ledger and
 * eval-results ledger make each run smarter than the last.
 *
 * Usage:
 *   bun scripts/skill-health-loop.ts              # audit only (exit 1 on HIGH findings)
 *   bun scripts/skill-health-loop.ts --heal       # audit + auto-fix safe findings
 *   bun scripts/skill-health-loop.ts --heal --issue  # also open a GitHub issue
 *   bun scripts/skill-health-loop.ts --since-days 30 # invocation-ledger window
 */
import { execSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
    detectEvalGaps,
    detectFrontmatterDrift,
    detectOversize,
    detectRedundancy,
    detectStaleness,
    detectUnused,
    readInvocationLedger,
    scanSkills,
    type Finding,
} from "./lib/skill-health.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const REPORTS_DIR = join(ROOT, "reports");
const LEDGER_PATH = join(REPORTS_DIR, ".skill-invocations.jsonl");

const args = new Set(process.argv.slice(2));
const HEAL = args.has("--heal");
const OPEN_ISSUE = args.has("--issue");

function sh(cmd: string): string {
    try {
        return execSync(cmd, {
            cwd: ROOT,
            stdio: ["ignore", "pipe", "pipe"],
        })
            .toString()
            .trim();
    } catch (e) {
        return String(e);
    }
}

/** Self-heal: safe, mechanical fixes only. */
function heal(skills: ReturnType<typeof scanSkills>): string[] {
    const actions: string[] = [];

    // 1. Normalize frontmatter (idempotent formatter).
    const fmt = sh("bun scripts/format-skills.ts --fix 2>&1");
    if (!/0 need formatting/.test(fmt)) {
        actions.push("format-skills: normalized frontmatter");
    }

    // 2. Scaffold missing evals for model-invoked skills (empty template = lint-catchable proof stub).
    for (const s of skills) {
        if (s.category === "model-invoked" && !s.hasEvals) {
            const evalsDir = join(s.dir, "evals");
            mkdirSync(evalsDir, { recursive: true });
            const short = s.name.split("/").pop() ?? s.name;
            writeFileSync(
                join(evalsDir, "evals.json"),
                JSON.stringify(
                    {
                        skill_name: short,
                        evals: [
                            {
                                id: 1,
                                name: "basic-invocation",
                                prompt: `Apply the ${short} skill to a representative task and confirm its guidance is followed.`,
                                expected_output: `Output follows the ${short} skill's key sections and recommendations.`,
                                assertions: [
                                    `The output references or follows ${short} guidance`,
                                    "The output provides actionable, non-generic guidance",
                                ],
                            },
                        ],
                    },
                    null,
                    2,
                ) + "\n",
            );
            actions.push(`scaffolded evals for ${s.name}`);
        }
    }
    return actions;
}

function buildReport(
    findings: Finding[],
    actions: string[],
    counts: { total: number; modelInvoked: number; withEvals: number },
): string {
    const bySeverity = (sev: Finding["severity"]) =>
        findings.filter((f) => f.severity === sev);
    const section = (
        title: string,
        rows: Finding[],
    ): string =>
        rows.length === 0
            ? `\n### ${title}\n\n_None._\n`
            : `\n### ${title} (${rows.length})\n\n${rows
                  .map(
                      (f) =>
                          `- **${f.subject}** — ${f.detail} ${f.healable ? "_(auto-healable)_" : ""}`,
                  )
                  .join("\n")}\n`;

    const date = new Date().toISOString();
    let md = `# Skill Health — ${date.slice(0, 10)}\n\n`;
    md += `**Catalog:** ${counts.total} core skills · ${counts.modelInvoked} model-invoked · ${counts.withEvals} with evals.\n`;
    md += `**Findings:** ${findings.length} (${bySeverity("high").length} high, ${bySeverity("medium").length} medium, ${bySeverity("low").length} low)\n`;
    if (actions.length > 0) {
        md += `\n## Auto-healed (${actions.length})\n\n${actions.map((a) => `- ${a}`).join("\n")}\n`;
    }
    md += section("High", bySeverity("high"));
    md += section("Medium", bySeverity("medium"));
    md += section("Low", bySeverity("low"));
    md += `\n## What needs a human\n\n`;
    const human = findings.filter((f) => !f.healable);
    if (human.length === 0) {
        md += `_Nothing — all findings are auto-healable or informational._\n`;
    } else {
        for (const f of human) {
            md += `- **[${f.kind}]** ${f.subject} — ${f.detail}\n`;
        }
    }
    md += `\n_Re-run \`bun run skill:heal\` weekly (see .github/workflows/skill-health.yml). A skill that no longer beats its no-skill baseline is a retire candidate — see reports/skill-eval-results.md._\n`;
    return md;
}

async function main(): Promise<void> {
    mkdirSync(REPORTS_DIR, { recursive: true });
    const skills = scanSkills(SKILLS_DIR);

    const findings: Finding[] = [
        ...detectEvalGaps(skills),
        ...detectFrontmatterDrift(skills),
        ...detectRedundancy(skills),
        ...detectStaleness(skills),
        ...detectOversize(skills),
    ];

    // Unused-skill detection from the invocation ledger (the learning signal).
    const ledger = readInvocationLedger(LEDGER_PATH);
    if (ledger.size > 0) {
        findings.push(...detectUnused(skills, ledger));
    }

    const actions = HEAL ? heal(skills) : [];

    // Re-scan after heal so counts reflect the healed state.
    const healed = scanSkills(SKILLS_DIR);
    const counts = {
        total: healed.length,
        modelInvoked: healed.filter((s) => s.category === "model-invoked")
            .length,
        withEvals: healed.filter((s) => s.hasEvals).length,
    };

    const report = buildReport(findings, actions, counts);
    const date = new Date().toISOString().slice(0, 10);
    const reportPath = join(REPORTS_DIR, `skill-health-${date}.md`);
    writeFileSync(reportPath, report);
    appendFileSync(
        join(REPORTS_DIR, "skill-health-history.jsonl"),
        JSON.stringify({ date, findings: findings.length, ...counts }) + "\n",
    );

    console.log(report);
    console.log(`\n📝 Report → ${reportPath}`);

    if (OPEN_ISSUE && findings.some((f) => !f.healable)) {
        const high = findings.filter((f) => f.severity === "high").length;
        sh(
            `gh issue create --title "Skill health ${date}: ${findings.length} findings (${high} high)" --body-file "${reportPath}" 2>&1 || true`,
        );
    }

    const highCount = findings.filter((f) => f.severity === "high").length;
    if (highCount > 0 && !HEAL) {
        console.error(
            `\n✗ ${highCount} HIGH-severity finding(s). Run \`bun run skill:heal\` to auto-fix safe ones.`,
        );
        process.exit(1);
    }
}

main().catch((e) => {
    console.error("❌", e);
    process.exit(1);
});
