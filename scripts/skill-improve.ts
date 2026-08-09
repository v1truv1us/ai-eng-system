#!/usr/bin/env bun
/**
 * Self-improving skills loop — diagnose stage (deterministic, no LLM).
 *
 * Reads per-skill run-history.jsonl (+ optional grading-results.json from
 * grade-skill-evals.ts), clusters failure signatures, and:
 *   - emits learning proposals to reports/skill-proposals/<skill>/
 *   - auto-appends qualifying entries to skills/<name>/learnings.md
 *   - expires stale learnings (90d)
 *
 * A cluster qualifies at >= 3 occurrences OR 1 high-severity incident.
 *
 * Usage: bun scripts/skill-improve.ts [--skill=name] [--benchmark=path]
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
    formatLearningEntry,
    LEARNING_EVIDENCE_THRESHOLD,
    LEARNING_EXPIRY_DAYS,
    type LearningEntry,
    nextLearningId,
    parseLearningId,
    parseRunHistoryLine,
    type RunHistoryEntry,
    SKILL_LOOP_SCHEMA_VERSION,
    type SkillProposal,
} from "./lib/skill-loop-schemas";

const REPO_ROOT = join(import.meta.dir, "..");

interface Cluster {
    signature: string;
    runs: RunHistoryEntry[];
    highSeverity: boolean;
}

function parseArgs(): { skill?: string; benchmark?: string } {
    const args: Record<string, string> = {};
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.startsWith("--")) {
            const [key, val] = arg.slice(2).split("=");
            args[key] = val || "true";
        }
    }
    return { skill: args.skill, benchmark: args.benchmark };
}

export function clusterFailures(runs: RunHistoryEntry[]): Cluster[] {
    const clusters = new Map<string, Cluster>();
    for (const run of runs) {
        if (run.outcome !== "failure") continue;
        const signature = run.failure_signature ?? "run-failure";
        const existing = clusters.get(signature) ?? {
            signature,
            runs: [],
            highSeverity: false,
        };
        existing.runs.push(run);
        if (run.severity === "high") existing.highSeverity = true;
        clusters.set(signature, existing);
    }
    return [...clusters.values()];
}

export function clusterQualifies(cluster: Cluster): boolean {
    return (
        cluster.runs.length >= LEARNING_EVIDENCE_THRESHOLD ||
        cluster.highSeverity
    );
}

async function readRunHistory(skillDir: string): Promise<RunHistoryEntry[]> {
    const path = join(skillDir, "run-history.jsonl");
    if (!existsSync(path)) return [];
    const text = await readFile(path, "utf-8");
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(parseRunHistoryLine)
        .filter((entry): entry is RunHistoryEntry => entry !== null);
}

function isoDate(daysFromNow = 0): string {
    const date = new Date(Date.now() + daysFromNow * 86_400_000);
    return date.toISOString().slice(0, 10);
}

async function updateLearnings(
    skillDir: string,
    cluster: Cluster,
): Promise<LearningEntry | null> {
    const path = join(skillDir, "learnings.md");
    const existing = existsSync(path) ? await readFile(path, "utf-8") : "";

    // Re-observation: an active learning with the same text just gets a fresh
    // expiry; no duplicate entry.
    if (
        existing.includes(`- status: active`) &&
        existing.includes(cluster.signature)
    ) {
        const renewed = existing.replace(
            /- expires: \d{4}-\d{2}-\d{2}/g,
            `- expires: ${isoDate(LEARNING_EXPIRY_DAYS)}`,
        );
        if (renewed !== existing) await writeFile(path, renewed);
        return null;
    }

    const existingIds = existing
        .split("\n")
        .map(parseLearningId)
        .filter((id): id is string => id !== null);

    const entry: LearningEntry = {
        id: nextLearningId(existingIds, new Date()),
        status: "active",
        evidence: `${cluster.runs.length} runs (${cluster.runs
            .map((run) => run.run_id ?? `s:${run.session_id || "?"}`)
            .slice(0, 5)
            .join(",")})`,
        evidenceCount: cluster.runs.length,
        expires: isoDate(LEARNING_EXPIRY_DAYS),
        text: cluster.signature,
        promotedTo: null,
    };

    const header = existing.startsWith("# Learnings") ? "" : "# Learnings\n\n";
    await writeFile(path, header + formatLearningEntry(entry) + existing);
    return entry;
}

export function expireStaleLearnings(content: string, today: string): string {
    const blocks = content.split(/(?=^## L-)/m);
    const todayDate = new Date(`${today}T00:00:00Z`);
    const updated = blocks.map((block) => {
        if (!block.startsWith("## L-")) return block;
        if (!block.includes("- status: active")) return block;
        const match = block.match(/- expires: (\d{4}-\d{2}-\d{2})/);
        if (!match) return block;
        if (new Date(`${match[1]}T00:00:00Z`) >= todayDate) return block;
        return block.replace("- status: active", "- status: expired");
    });
    return updated.join("");
}

async function existingProposalSignatures(
    proposalsDir: string,
): Promise<Set<string>> {
    const signatures = new Set<string>();
    if (!existsSync(proposalsDir)) return signatures;
    for (const file of await readdir(proposalsDir)) {
        if (!file.endsWith(".json")) continue;
        try {
            const proposal = JSON.parse(
                await readFile(join(proposalsDir, file), "utf-8"),
            ) as SkillProposal;
            if (
                proposal.decision === "pending" ||
                proposal.decision === "approved"
            ) {
                signatures.add(proposal.failure_signature);
            }
        } catch {
            // skip malformed proposals
        }
    }
    return signatures;
}

async function writeProposal(
    proposalsDir: string,
    skill: string,
    cluster: Cluster,
): Promise<string> {
    await mkdir(proposalsDir, { recursive: true });
    const date = isoDate().replace(/-/g, "");
    const existing = existsSync(proposalsDir)
        ? await readdir(proposalsDir)
        : [];
    const seq = existing.filter((file) => file.startsWith(date)).length + 1;
    const id = `${date}-${String(seq).padStart(3, "0")}`;
    const proposal: SkillProposal = {
        schema: SKILL_LOOP_SCHEMA_VERSION,
        id,
        skill,
        kind: "learning",
        created: isoDate(),
        evidence_run_ids: cluster.runs.map(
            (run) => run.run_id ?? `s:${run.session_id || "?"}`,
        ),
        failure_signature: cluster.signature,
        patch: null,
        safety_check: null,
        shadow_eval: null,
        decision: "pending",
        decided_by: null,
    };
    await writeFile(
        join(proposalsDir, `${id}.json`),
        `${JSON.stringify(proposal, null, 2)}\n`,
    );
    return id;
}

async function findSkillDirs(root: string): Promise<string[]> {
    const dirs: string[] = [];
    const walk = async (dir: string) => {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            if (entry.name === "gtm") continue; // vendored, exempt
            if (entry.name.startsWith("_")) continue;
            const child = join(dir, entry.name);
            if (existsSync(join(child, "run-history.jsonl"))) dirs.push(child);
            await walk(child);
        }
    };
    await walk(root);
    return dirs;
}

async function main(): Promise<void> {
    const args = parseArgs();
    const skillsRoot = join(REPO_ROOT, "skills");
    const skillDirs = args.skill
        ? [join(skillsRoot, args.skill)]
        : await findSkillDirs(skillsRoot);

    let proposed = 0;
    let learned = 0;

    for (const skillDir of skillDirs) {
        const skill = skillDir.slice(skillsRoot.length + 1);
        const runs = await readRunHistory(skillDir);
        const clusters = clusterFailures(runs).filter(clusterQualifies);
        if (clusters.length === 0) continue;

        const proposalsDir = join(
            REPO_ROOT,
            "reports",
            "skill-proposals",
            skill,
        );
        const knownSignatures = await existingProposalSignatures(proposalsDir);

        for (const cluster of clusters) {
            const entry = await updateLearnings(skillDir, cluster);
            if (entry) learned++;
            if (knownSignatures.has(cluster.signature)) continue;
            await writeProposal(proposalsDir, skill, cluster);
            proposed++;
        }
    }

    // Expire stale learnings across all skills that have a learnings.md.
    const allDirs = args.skill ? skillDirs : await findSkillDirs(skillsRoot);
    for (const skillDir of allDirs) {
        const path = join(skillDir, "learnings.md");
        if (!existsSync(path)) continue;
        const content = await readFile(path, "utf-8");
        const expired = expireStaleLearnings(content, isoDate());
        if (expired !== content) await writeFile(path, expired);
    }

    console.log(
        `skill:improve — ${proposed} proposal(s), ${learned} new learning(s)`,
    );
}

const isMain = import.meta.path === Bun.main;
if (isMain) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
