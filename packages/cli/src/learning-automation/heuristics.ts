import fs from "node:fs";
import path from "node:path";
import type { EventCommandExecuted } from "@opencode-ai/sdk";
import type { LearningCommandId, LearningRecommendation } from "./types.js";

const DECISION_TERMS = [
    "decision",
    "tradeoff",
    "trade-off",
    "architecture",
    "architectural",
    "migration",
    "schema",
    "api",
    "contract",
    "database",
    "data model",
    "interface",
];

const QUALITY_TERMS = [
    "acceptance criteria",
    "acceptance",
    "validation",
    "validate",
    "verify",
    "checklist",
    "regression",
    "reusable",
    "repeatable",
    "risk",
    "control",
    "guardrail",
    "quality gate",
];

const FILE_TOKEN_PATTERN =
    /(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.[A-Za-z0-9]+/g;

function clampConfidence(value: number): number {
    return Math.max(0, Math.min(0.99, Number(value.toFixed(2))));
}

function normalizeCommandName(name: string): "plan" | "work" | "review" | null {
    const normalized = name.trim().replace(/^\/+/, "");
    const segments = normalized.split("/");
    const command = segments[segments.length - 1]?.toLowerCase();
    return command === "plan" || command === "work" || command === "review"
        ? command
        : null;
}

function collectMatches(input: string, terms: string[]): string[] {
    return terms.filter((term) => input.includes(term));
}

function hasMissingDocs(projectDir: string, docsPath: string): boolean {
    const absolutePath = path.join(projectDir, docsPath);
    if (!fs.existsSync(absolutePath)) {
        return true;
    }

    try {
        return fs.readdirSync(absolutePath).length === 0;
    } catch {
        return true;
    }
}

function extractLikelyFiles(argumentsText: string): string[] {
    const matches = argumentsText.match(FILE_TOKEN_PATTERN) ?? [];
    return Array.from(new Set(matches)).slice(0, 3);
}

interface PendingSkillProposal {
    skill: string;
    id: string;
    failureSignature: string;
}

function findPendingSkillProposal(
    projectDir: string,
): PendingSkillProposal | null {
    const proposalsRoot = path.join(projectDir, "reports", "skill-proposals");
    if (!fs.existsSync(proposalsRoot)) {
        return null;
    }

    try {
        for (const skillDir of fs.readdirSync(proposalsRoot)) {
            const dirPath = path.join(proposalsRoot, skillDir);
            if (!fs.statSync(dirPath).isDirectory()) continue;
            for (const file of fs.readdirSync(dirPath)) {
                if (!file.endsWith(".json")) continue;
                try {
                    const proposal = JSON.parse(
                        fs.readFileSync(path.join(dirPath, file), "utf-8"),
                    ) as {
                        id?: string;
                        skill?: string;
                        kind?: string;
                        decision?: string;
                        failure_signature?: string;
                    };
                    if (
                        proposal.kind === "skill_edit" &&
                        proposal.decision === "pending" &&
                        proposal.skill &&
                        proposal.id
                    ) {
                        return {
                            skill: proposal.skill,
                            id: proposal.id,
                            failureSignature:
                                proposal.failure_signature ?? "unknown",
                        };
                    }
                } catch {
                    // skip malformed proposal
                }
            }
        }
    } catch {
        return null;
    }

    return null;
}

function buildSkillProposalRecommendation(
    proposal: PendingSkillProposal,
    sourceCommand: "plan" | "work" | "review",
    createdAt: number,
): LearningRecommendation {
    const commandId = "skill-learning-approve" as const;
    const suggestedArguments = `"${proposal.skill}:${proposal.id}"`;

    return {
        id: `${commandId}-${proposal.skill}-${proposal.id}`,
        commandId,
        commandName: `/ai-eng/${commandId}`,
        commandLine: `/ai-eng/${commandId} ${suggestedArguments}`,
        suggestedArguments,
        rationale: `A pending skill_edit proposal for ${proposal.skill} (failure: ${proposal.failureSignature}) is ready for shadow evaluation.`,
        confidence: 0.7,
        likelyTargetFiles: [
            `skills/${proposal.skill}/SKILL.md`,
            `reports/skill-proposals/${proposal.skill}/`,
        ],
        dedupeKey: [commandId, proposal.skill, proposal.id].join("|"),
        mode: "suggestion-only",
        sourceEvent: "command.executed",
        createdAt,
    };
}

function buildSuggestedArguments(
    commandId: LearningCommandId,
    sourceCommand: "plan" | "work" | "review",
    matchedTerms: string[],
    files: string[],
): string {
    const focus = matchedTerms.slice(0, 2).join(" and ") || "the key outcomes";
    const fileScope = files.length > 0 ? ` for ${files.join(", ")}` : "";

    if (commandId === "decision-journal") {
        return `"Document the durable ${focus} decisions from this /ai-eng/${sourceCommand} run${fileScope}"`;
    }

    return `"Capture reusable validation and risk checks from this /ai-eng/${sourceCommand} run${fileScope}"`;
}

function buildTargetFiles(
    commandId: LearningCommandId,
    files: string[],
): string[] {
    const docTarget =
        commandId === "decision-journal" ? "docs/decisions/" : "docs/quality/";
    return Array.from(new Set([docTarget, ...files]));
}

function buildRecommendation(
    commandId: LearningCommandId,
    sourceCommand: "plan" | "work" | "review",
    matchedTerms: string[],
    projectDir: string,
    argumentsText: string,
    createdAt: number,
): LearningRecommendation {
    const files = extractLikelyFiles(argumentsText);
    const missingDocs = hasMissingDocs(
        projectDir,
        commandId === "decision-journal" ? "docs/decisions" : "docs/quality",
    );
    const baseScore = commandId === "decision-journal" ? 0.58 : 0.56;
    const confidence = clampConfidence(
        baseScore + matchedTerms.length * 0.08 + (missingDocs ? 0.08 : 0),
    );
    const rationaleTail = missingDocs
        ? ` ${commandId === "decision-journal" ? "docs/decisions/" : "docs/quality/"} is missing or empty.`
        : "";
    const dedupeKey = [
        commandId,
        sourceCommand,
        matchedTerms.slice(0, 3).join(","),
        files.join(","),
    ].join("|");
    const suggestedArguments = buildSuggestedArguments(
        commandId,
        sourceCommand,
        matchedTerms,
        files,
    );

    return {
        id: `${commandId}-${createdAt}`,
        commandId,
        commandName: `/ai-eng/${commandId}`,
        commandLine: `/ai-eng/${commandId} ${suggestedArguments}`,
        suggestedArguments,
        rationale: `This /ai-eng/${sourceCommand} run references ${matchedTerms.slice(0, 3).join(", ")} and looks like a reusable ${commandId === "decision-journal" ? "decision" : "validation"} opportunity.${rationaleTail}`,
        confidence,
        likelyTargetFiles: buildTargetFiles(commandId, files),
        dedupeKey,
        mode: "suggestion-only",
        sourceEvent: "command.executed",
        createdAt,
    };
}

export function buildLearningCandidates(
    event: EventCommandExecuted,
    projectDir: string,
    now = Date.now(),
): LearningRecommendation[] {
    const commandName = normalizeCommandName(event.properties.name);
    if (!commandName) {
        return [];
    }

    const candidates: LearningRecommendation[] = [];

    const pendingProposal = findPendingSkillProposal(projectDir);
    if (pendingProposal) {
        candidates.push(
            buildSkillProposalRecommendation(pendingProposal, commandName, now),
        );
    }

    const argumentsText = event.properties.arguments.trim().toLowerCase();
    if (!argumentsText) {
        return candidates.sort(
            (left, right) => right.confidence - left.confidence,
        );
    }

    if (commandName === "plan" || commandName === "work") {
        const decisionMatches = collectMatches(argumentsText, DECISION_TERMS);
        if (decisionMatches.length >= 2) {
            candidates.push(
                buildRecommendation(
                    "decision-journal",
                    commandName,
                    decisionMatches,
                    projectDir,
                    event.properties.arguments,
                    now,
                ),
            );
        }
    }

    if (
        commandName === "plan" ||
        commandName === "work" ||
        commandName === "review"
    ) {
        const qualityMatches = collectMatches(argumentsText, QUALITY_TERMS);
        if (qualityMatches.length >= 2) {
            candidates.push(
                buildRecommendation(
                    "quality-gate",
                    commandName,
                    qualityMatches,
                    projectDir,
                    event.properties.arguments,
                    now,
                ),
            );
        }
    }

    return candidates.sort((left, right) => right.confidence - left.confidence);
}
