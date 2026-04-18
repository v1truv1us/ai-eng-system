import fs from "node:fs";
import path from "node:path";
import type { LearningPolicy, LearningRecommendation, LearningState } from "./types.js";

type PartialLearningPolicy = Partial<LearningPolicy> & {
    commands?: Partial<LearningPolicy["commands"]>;
};

const LEARNING_DIR = [".ai-context", "learning"];
const STATE_FILE = "state.json";
const POLICY_FILE = "policy.json";
const LATEST_RECOMMENDATION_FILE = "latest-recommendation.json";
const STATE_LOCK_DIR = "state.lock";
const LOCK_METADATA_FILE = "metadata.json";
const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 10_000;
const STALE_LOCK_TIMEOUT_MS = 30_000;

type LearningStateLockMetadata = {
    acquiredAt: number;
    pid?: number;
};

const DEFAULT_POLICY: LearningPolicy = {
    mode: "suggestion-only",
    maxActiveSuggestions: 1,
    surfaceCooldownMinutes: 30,
    actionableRetentionMinutes: 24 * 60,
    defaultSnoozeMinutes: 60,
    commands: {
        "decision-journal": {
            enabled: true,
            cooldownMinutes: 120,
            minimumConfidence: 0.72,
        },
        "quality-gate": {
            enabled: true,
            cooldownMinutes: 360,
            minimumConfidence: 0.72,
        },
    },
};

const DEFAULT_STATE: LearningState = {
    version: 2,
    commandLastSurfacedAt: {},
    dedupe: {},
    recommendationHistory: {},
};

function readJsonFile<T>(filePath: string): T | null {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    } catch {
        return null;
    }
}

function sanitizeNumber(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : fallback;
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function sanitizeConfidence(value: unknown, fallback: number): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(Math.max(value, 0), 1);
}

function mergePolicy(input: unknown): LearningPolicy {
    if (!input || typeof input !== "object") {
        return DEFAULT_POLICY;
    }

    const policy = input as PartialLearningPolicy;
    const commands = policy.commands;

    return {
        mode: "suggestion-only",
        maxActiveSuggestions: sanitizeNumber(
            policy.maxActiveSuggestions,
            DEFAULT_POLICY.maxActiveSuggestions,
        ),
        surfaceCooldownMinutes: sanitizeNumber(
            policy.surfaceCooldownMinutes,
            DEFAULT_POLICY.surfaceCooldownMinutes,
        ),
        actionableRetentionMinutes: sanitizeNumber(
            policy.actionableRetentionMinutes,
            DEFAULT_POLICY.actionableRetentionMinutes,
        ),
        defaultSnoozeMinutes: sanitizeNumber(
            policy.defaultSnoozeMinutes,
            DEFAULT_POLICY.defaultSnoozeMinutes,
        ),
        commands: {
            "decision-journal": {
                enabled: sanitizeBoolean(
                    commands?.["decision-journal"]?.enabled,
                    DEFAULT_POLICY.commands["decision-journal"].enabled,
                ),
                cooldownMinutes: sanitizeNumber(
                    commands?.["decision-journal"]?.cooldownMinutes,
                    DEFAULT_POLICY.commands["decision-journal"].cooldownMinutes,
                ),
                minimumConfidence: sanitizeConfidence(
                    commands?.["decision-journal"]?.minimumConfidence,
                    DEFAULT_POLICY.commands["decision-journal"].minimumConfidence,
                ),
            },
            "quality-gate": {
                enabled: sanitizeBoolean(
                    commands?.["quality-gate"]?.enabled,
                    DEFAULT_POLICY.commands["quality-gate"].enabled,
                ),
                cooldownMinutes: sanitizeNumber(
                    commands?.["quality-gate"]?.cooldownMinutes,
                    DEFAULT_POLICY.commands["quality-gate"].cooldownMinutes,
                ),
                minimumConfidence: sanitizeConfidence(
                    commands?.["quality-gate"]?.minimumConfidence,
                    DEFAULT_POLICY.commands["quality-gate"].minimumConfidence,
                ),
            },
        },
    };
}

export function getLearningDirectory(projectDir: string): string {
    return path.join(projectDir, ...LEARNING_DIR);
}

export function ensureLearningDirectory(projectDir: string): string {
    const learningDir = getLearningDirectory(projectDir);
    fs.mkdirSync(learningDir, { recursive: true });
    return learningDir;
}

export function loadLearningPolicy(projectDir: string): LearningPolicy {
    const learningDir = ensureLearningDirectory(projectDir);
    return mergePolicy(readJsonFile(path.join(learningDir, POLICY_FILE)));
}

export function loadLearningState(projectDir: string): LearningState {
    const learningDir = ensureLearningDirectory(projectDir);
    const state = readJsonFile<Record<string, unknown>>(path.join(learningDir, STATE_FILE));

    if (!state) {
        return { ...DEFAULT_STATE };
    }

    if (state.version === 1) {
        return {
            version: 2,
            commandLastSurfacedAt:
                (state.commandLastSurfacedAt as LearningState["commandLastSurfacedAt"]) ?? {},
            dedupe: (state.dedupe as LearningState["dedupe"]) ?? {},
            lastSurfacedAt: state.lastSurfacedAt as number | undefined,
            activeRecommendation: state.activeRecommendation as
                | LearningState["activeRecommendation"]
                | undefined,
            recommendationHistory: {},
        };
    }

    if (state.version !== 2) {
        return { ...DEFAULT_STATE };
    }

    return {
        version: 2,
        commandLastSurfacedAt:
            (state.commandLastSurfacedAt as LearningState["commandLastSurfacedAt"]) ?? {},
        dedupe: (state.dedupe as LearningState["dedupe"]) ?? {},
        lastSurfacedAt: state.lastSurfacedAt as number | undefined,
        activeRecommendation: state.activeRecommendation as
            | LearningState["activeRecommendation"]
            | undefined,
        recommendationHistory:
            (state.recommendationHistory as LearningState["recommendationHistory"]) ?? {},
    };
}

export function saveLearningState(projectDir: string, state: LearningState): void {
    const learningDir = ensureLearningDirectory(projectDir);
    fs.writeFileSync(
        path.join(learningDir, STATE_FILE),
        JSON.stringify(state, null, 2),
        "utf-8",
    );
}

export function saveLatestRecommendation(
    projectDir: string,
    recommendation: LearningRecommendation,
): void {
    const learningDir = ensureLearningDirectory(projectDir);
    fs.writeFileSync(
        path.join(learningDir, LATEST_RECOMMENDATION_FILE),
        JSON.stringify(recommendation, null, 2),
        "utf-8",
    );
}

export function clearLatestRecommendation(projectDir: string): void {
    const learningDir = ensureLearningDirectory(projectDir);
    fs.rmSync(path.join(learningDir, LATEST_RECOMMENDATION_FILE), {
        force: true,
    });
}

export function loadLatestRecommendation(
    projectDir: string,
): LearningRecommendation | null {
    const learningDir = ensureLearningDirectory(projectDir);
    return readJsonFile<LearningRecommendation>(
        path.join(learningDir, LATEST_RECOMMENDATION_FILE),
    );
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function readLockMetadata(lockPath: string): LearningStateLockMetadata | null {
    return readJsonFile<LearningStateLockMetadata>(
        path.join(lockPath, LOCK_METADATA_FILE),
    );
}

function writeLockMetadata(lockPath: string): void {
    fs.writeFileSync(
        path.join(lockPath, LOCK_METADATA_FILE),
        JSON.stringify(
            {
                acquiredAt: Date.now(),
                pid: typeof process.pid === "number" ? process.pid : undefined,
            } satisfies LearningStateLockMetadata,
            null,
            2,
        ),
        "utf-8",
    );
}

function maybeClearStaleLock(lockPath: string, now: number): boolean {
    const metadata = readLockMetadata(lockPath);
    const staleAt = metadata?.acquiredAt;

    if (typeof staleAt !== "number" || now - staleAt < STALE_LOCK_TIMEOUT_MS) {
        return false;
    }

    fs.rmSync(lockPath, { recursive: true, force: true });
    return true;
}

export async function withLearningStateLock<T>(
    projectDir: string,
    callback: () => Promise<T>,
): Promise<T> {
    const learningDir = ensureLearningDirectory(projectDir);
    const lockPath = path.join(learningDir, STATE_LOCK_DIR);
    const deadline = Date.now() + LOCK_TIMEOUT_MS;

    while (true) {
        try {
            fs.mkdirSync(lockPath);
            writeLockMetadata(lockPath);
            break;
        } catch (error) {
            if (
                !(
                    error instanceof Error &&
                    "code" in error &&
                    error.code === "EEXIST"
                )
            ) {
                throw error;
            }

            if (maybeClearStaleLock(lockPath, Date.now())) {
                continue;
            }

            if (Date.now() >= deadline) {
                throw new Error(
                    "Timed out waiting for learning automation state lock.",
                );
            }

            await sleep(LOCK_RETRY_MS);
        }
    }

    try {
        return await callback();
    } finally {
        fs.rmSync(lockPath, { recursive: true, force: true });
    }
}
