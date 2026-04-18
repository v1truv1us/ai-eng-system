import type {
    LearningPolicy,
    LearningRecommendation,
    LearningState,
} from "./types.js";

const MINUTE = 60 * 1000;
const DEDUPE_RETENTION_MS = 24 * 60 * MINUTE;

function minutesToMs(minutes: number): number {
    return minutes * MINUTE;
}

export function normalizeLearningState(
    state: LearningState,
    policy: LearningPolicy,
    now = Date.now(),
): LearningState {
    const nextDedupe = Object.fromEntries(
        Object.entries(state.dedupe).filter(
            ([, timestamp]) => now - timestamp < DEDUPE_RETENTION_MS,
        ),
    );
    const activeRecommendation =
        state.activeRecommendation &&
        (state.activeRecommendation.status === "execution-failed" ||
            state.activeRecommendation.status === "approving" ||
            now - state.activeRecommendation.surfacedAt <
                minutesToMs(policy.actionableRetentionMinutes))
            ? state.activeRecommendation
            : undefined;

    return {
        ...state,
        dedupe: nextDedupe,
        activeRecommendation,
    };
}

export function selectSuggestion(
    candidates: LearningRecommendation[],
    state: LearningState,
    policy: LearningPolicy,
    now = Date.now(),
): LearningRecommendation | null {
    if (policy.maxActiveSuggestions <= 0 || state.activeRecommendation) {
        return null;
    }

    if (
        state.lastSurfacedAt !== undefined &&
        now - state.lastSurfacedAt < minutesToMs(policy.surfaceCooldownMinutes)
    ) {
        return null;
    }

    const eligible = candidates.filter((candidate) => {
        const commandPolicy = policy.commands[candidate.commandId];
        if (!commandPolicy.enabled) {
            return false;
        }

        if (candidate.confidence < commandPolicy.minimumConfidence) {
            return false;
        }

        const lastCommandSurface = state.commandLastSurfacedAt[candidate.commandId];
        if (
            lastCommandSurface !== undefined &&
            now - lastCommandSurface < minutesToMs(commandPolicy.cooldownMinutes)
        ) {
            return false;
        }

        const lastDuplicateSurface = state.dedupe[candidate.dedupeKey];
        if (
            lastDuplicateSurface !== undefined &&
            now - lastDuplicateSurface < minutesToMs(commandPolicy.cooldownMinutes)
        ) {
            return false;
        }

        const historyEntry = state.recommendationHistory[candidate.dedupeKey];
        if (
            historyEntry?.status === "snoozed" &&
            historyEntry.snoozedUntil !== undefined &&
            historyEntry.snoozedUntil > now
        ) {
            return false;
        }

        return true;
    });

    return eligible.sort((left, right) => right.confidence - left.confidence)[0] ?? null;
}

export function applySurfacedSuggestion(
    state: LearningState,
    recommendation: LearningRecommendation,
    now = Date.now(),
): LearningState {
    return {
        ...state,
        lastSurfacedAt: now,
        commandLastSurfacedAt: {
            ...state.commandLastSurfacedAt,
            [recommendation.commandId]: now,
        },
        dedupe: {
            ...state.dedupe,
            [recommendation.dedupeKey]: now,
        },
        activeRecommendation: {
            id: recommendation.id,
            commandId: recommendation.commandId,
            dedupeKey: recommendation.dedupeKey,
            surfacedAt: now,
            status: "surfaced",
        },
        recommendationHistory: {
            ...state.recommendationHistory,
            [recommendation.dedupeKey]: {
                id: recommendation.id,
                commandId: recommendation.commandId,
                status: "surfaced",
                surfacedAt: now,
                updatedAt: now,
                commandLine: recommendation.commandLine,
            },
        },
    };
}

export function applyDismissedSuggestion(
    state: LearningState,
    recommendation: LearningRecommendation,
    now = Date.now(),
): LearningState {
    const previousEntry = state.recommendationHistory[recommendation.dedupeKey];

    return {
        ...state,
        activeRecommendation: undefined,
        recommendationHistory: {
            ...state.recommendationHistory,
            [recommendation.dedupeKey]: {
                id: recommendation.id,
                commandId: recommendation.commandId,
                status: "dismissed",
                surfacedAt: previousEntry?.surfacedAt,
                dismissedAt: now,
                updatedAt: now,
                commandLine: recommendation.commandLine,
            },
        },
    };
}

export function applySnoozedSuggestion(
    state: LearningState,
    recommendation: LearningRecommendation,
    snoozedUntil: number,
    now = Date.now(),
): LearningState {
    const previousEntry = state.recommendationHistory[recommendation.dedupeKey];

    return {
        ...state,
        activeRecommendation: undefined,
        recommendationHistory: {
            ...state.recommendationHistory,
            [recommendation.dedupeKey]: {
                id: recommendation.id,
                commandId: recommendation.commandId,
                status: "snoozed",
                surfacedAt: previousEntry?.surfacedAt,
                snoozedUntil,
                updatedAt: now,
                commandLine: recommendation.commandLine,
            },
        },
    };
}

export function applyApprovedSuggestion(
    state: LearningState,
    recommendation: LearningRecommendation,
    now = Date.now(),
    lastError?: string,
): LearningState {
    const previousEntry = state.recommendationHistory[recommendation.dedupeKey];

    return {
        ...state,
        activeRecommendation: {
            id: recommendation.id,
            commandId: recommendation.commandId,
            dedupeKey: recommendation.dedupeKey,
            surfacedAt: state.activeRecommendation?.surfacedAt ?? now,
            status: lastError ? "execution-failed" : "approving",
            lastError,
        },
        recommendationHistory: {
            ...state.recommendationHistory,
            [recommendation.dedupeKey]: {
                id: recommendation.id,
                commandId: recommendation.commandId,
                status: lastError ? "approved" : "approving",
                surfacedAt: previousEntry?.surfacedAt,
                approvedAt: now,
                updatedAt: now,
                commandLine: recommendation.commandLine,
                lastError,
            },
        },
    };
}

export function applyExecutedSuggestion(
    state: LearningState,
    recommendation: LearningRecommendation,
    now = Date.now(),
): LearningState {
    const previousEntry = state.recommendationHistory[recommendation.dedupeKey];

    return {
        ...state,
        activeRecommendation: undefined,
        recommendationHistory: {
            ...state.recommendationHistory,
            [recommendation.dedupeKey]: {
                id: recommendation.id,
                commandId: recommendation.commandId,
                status: "executed",
                surfacedAt: previousEntry?.surfacedAt,
                approvedAt: previousEntry?.approvedAt ?? now,
                executedAt: now,
                updatedAt: now,
                commandLine: recommendation.commandLine,
            },
        },
    };
}
