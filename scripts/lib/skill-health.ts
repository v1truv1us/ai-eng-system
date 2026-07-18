/**
 * Skill-health scanners for the autoreview loop.
 * Detects redundancy, staleness, eval gaps, unused skills, and frontmatter drift
 * across the core skills/ catalog (the vendored skills-gtm/ set is exempt).
 */
import {
    existsSync,
    readFileSync,
    readdirSync,
    statSync,
} from "node:fs";
import { join } from "node:path";

export interface SkillInfo {
    name: string; // namespaced path relative to skills/, e.g. "pstack/poteto-mode"
    dir: string; // absolute dir
    description: string;
    category: "model-invoked" | "user-invoked" | "uncategorized";
    hasEvals: boolean;
    content: string; // full SKILL.md text
    bytes: number;
}

export type Severity = "high" | "medium" | "low";

export interface Finding {
    severity: Severity;
    kind:
        | "redundancy"
        | "staleness"
        | "eval-gap"
        | "unused"
        | "frontmatter-drift"
        | "oversize";
    subject: string;
    detail: string;
    healable: boolean; // true if the loop can fix it automatically
}

const STOPWORDS = new Set(
    "the a an and or of to in for on with by is are be this that when use from as it its their your our you we they into over under across than then so such will can may should must do does not no yes out up down off at via per each any all some".split(
        " ",
    ),
);

export function scanSkills(skillsDir: string): SkillInfo[] {
    const out: SkillInfo[] = [];
    const walk = (dir: string, rel: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            if (entry.name === "gtm") continue; // vendored, exempt
            if (entry.name.startsWith("_")) continue;
            const child = join(dir, entry.name);
            const childRel = rel ? `${rel}/${entry.name}` : entry.name;
            const skillMd = join(child, "SKILL.md");
            if (existsSync(skillMd) && statSync(skillMd).isFile()) {
                const content = readFileSync(skillMd, "utf-8");
                const fm = content.match(/^---\n([\s\S]*?)\n---/);
                const fmText = fm ? fm[1] : "";
                const descMatch = fmText.match(/description:\s*(.+)/);
                const description = descMatch
                    ? descMatch[1].replace(/^["']|["']$/g, "").trim()
                    : "";
                let category: SkillInfo["category"] = "uncategorized";
                if (/category:\s*model-invoked\b/.test(fmText)) {
                    category = "model-invoked";
                } else if (/category:\s*user-invoked\b/.test(fmText)) {
                    category = "user-invoked";
                }
                const hasEvals =
                    existsSync(join(child, "evals", "evals.json")) ||
                    existsSync(join(child, "evals", "evaluations.json"));
                out.push({
                    name: childRel,
                    dir: child,
                    description,
                    category,
                    hasEvals,
                    content,
                    bytes: Buffer.byteLength(content, "utf-8"),
                });
            } else {
                walk(child, childRel);
            }
        }
    };
    walk(skillsDir, "");
    return out;
}

function tokens(text: string): Set<string> {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, " ")
            .split(/[\s-]+/)
            .filter((t) => t.length > 2 && !STOPWORDS.has(t)),
    );
}

function jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter++;
    return inter / (a.size + b.size - inter);
}

/** Flag pairs of skills whose descriptions are near-duplicates. */
export function detectRedundancy(
    skills: SkillInfo[],
    threshold = 0.55,
): Finding[] {
    const findings: Finding[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
            const a = skills[i];
            const b = skills[j];
            const key = `${a.name}::${b.name}`;
            if (seen.has(key)) continue;
            const sim = jaccard(tokens(a.description), tokens(b.description));
            if (sim >= threshold) {
                seen.add(key);
                findings.push({
                    severity: sim >= 0.75 ? "high" : "medium",
                    kind: "redundancy",
                    subject: `${a.name} ~ ${b.name}`,
                    detail: `Descriptions are ${(sim * 100).toFixed(0)}% similar. Possible duplicate — consider a single survivor.`,
                    healable: false,
                });
            }
        }
    }
    return findings;
}

const MODEL_SLUG_RE =
    /\b(?:claude-(?:opus|sonnet|haiku)-[0-9-]+|claude-[0-9.]+-[a-z]+-[0-9]+|gpt-[0-9.]+[a-z0-9-]*|composer-[0-9.]+[a-z0-9-]*|gemini-[0-9.]+[a-z0-9-]*|o[0-9]+-(?:mini|pro|preview))\b/gi;

/** Flag skills carrying hard-coded model slugs or version pins that drift. */
export function detectStaleness(skills: SkillInfo[]): Finding[] {
    const findings: Finding[] = [];
    for (const s of skills) {
        const slugs = new Set<string>();
        let m: RegExpExecArray | null;
        const re = new RegExp(MODEL_SLUG_RE);
        while ((m = re.exec(s.content)) !== null) slugs.add(m[1]);
        if (slugs.size > 0) {
            findings.push({
                severity: "medium",
                kind: "staleness",
                subject: s.name,
                detail: `Hard-coded model slug(s) that will drift: ${[...slugs].slice(0, 4).join(", ")}${slugs.size > 4 ? "…" : ""}. Refresh against provider docs or use capability checks.`,
                healable: false,
            });
        }
    }
    return findings;
}

/** Flag model-invoked skills without evals (they auto-load, so they need proof). */
export function detectEvalGaps(skills: SkillInfo[]): Finding[] {
    return skills
        .filter((s) => s.category === "model-invoked" && !s.hasEvals)
        .map((s) => ({
            severity: "high" as Severity,
            kind: "eval-gap" as const,
            subject: s.name,
            detail:
                "model-invoked skill (auto-loads) without evals/ proof. Add evals/evals.json or set metadata.category: user-invoked.",
            healable: true,
        }));
}

/** Flag skills never invoked in the ledger window. */
export function detectUnused(
    skills: SkillInfo[],
    invocationCounts: Map<string, number>,
    minInvocations = 1,
): Finding[] {
    const findings: Finding[] = [];
    for (const s of skills) {
        const count = invocationCounts.get(s.name) ?? 0;
        if (count < minInvocations) {
            findings.push({
                severity: "low",
                kind: "unused",
                subject: s.name,
                detail: `0 skill-tool invocations recorded. Possibly dead weight — re-audit or demote to user-invoked.`,
                healable: false,
            });
        }
    }
    return findings;
}

/** Flag frontmatter invariant violations (sync-skill-taxonomy rules). */
export function detectFrontmatterDrift(skills: SkillInfo[]): Finding[] {
    const findings: Finding[] = [];
    for (const s of skills) {
        const fm = s.content.match(/^---\n([\s\S]*?)\n---/);
        const fmText = fm ? fm[1] : "";
        const dmi = /disable-model-invocation:\s*true\b/.test(fmText);
        if (s.category === "uncategorized") {
            findings.push({
                severity: "medium",
                kind: "frontmatter-drift",
                subject: s.name,
                detail: "Missing metadata.category (must be model-invoked or user-invoked).",
                healable: true,
            });
        }
        if (s.category === "user-invoked" && !dmi) {
            findings.push({
                severity: "medium",
                kind: "frontmatter-drift",
                subject: s.name,
                detail: "user-invoked skill missing disable-model-invocation: true (still auto-loads).",
                healable: true,
            });
        }
    }
    return findings;
}

/** Flag oversized skills (high token cost per auto-load). */
export function detectOversize(skills: SkillInfo[], maxBytes = 12000): Finding[] {
    return skills
        .filter((s) => s.category === "model-invoked" && s.bytes > maxBytes)
        .map((s) => ({
            severity: "low" as Severity,
            kind: "oversize" as const,
            subject: s.name,
            detail: `${(s.bytes / 1024).toFixed(1)}KB auto-loads at startup. Trim to essentials or move detail to a references/ file loaded on demand.`,
            healable: false,
        }));
}

/** Parse the skill-invocation ledger (JSONL) into per-skill counts. */
export function readInvocationLedger(ledgerPath: string): Map<string, number> {
    const counts = new Map<string, number>();
    if (!existsSync(ledgerPath)) return counts;
    const lines = readFileSync(ledgerPath, "utf-8").split("\n");
    for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        try {
            const rec = JSON.parse(t) as { skill?: string };
            if (rec.skill) {
                counts.set(rec.skill, (counts.get(rec.skill) ?? 0) + 1);
            }
        } catch {
            // ignore malformed lines
        }
    }
    return counts;
}
