import type { Event } from "@opencode-ai/sdk";
import { buildLearningCandidates } from "./heuristics.js";
import {
    clearLatestRecommendation,
    loadLatestRecommendation,
    loadLearningPolicy,
    loadLearningState,
    saveLatestRecommendation,
    saveLearningState,
    withLearningStateLock,
} from "./state.js";
import {
    applyApprovedSuggestion,
    applyDismissedSuggestion,
    applyExecutedSuggestion,
    applySurfacedSuggestion,
    applySnoozedSuggestion,
    normalizeLearningState,
    selectSuggestion,
} from "./suggestions.js";
import type {
    LearningControlCommandId,
    LearningRecommendation,
    LearningRuntimeDeps,
} from "./types.js";

const MINUTE_MS = 60 * 1000;
const MAX_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const ALLOWED_APPROVAL_COMMANDS = new Set<LearningRecommendation["commandId"]>([
    "decision-journal",
    "quality-gate",
]);

function normalizeControlCommandName(name: string): LearningControlCommandId | null {
    const normalized = name.trim().replace(/^\/+/, "");
    const segments = normalized.split("/");
    const command = segments[segments.length - 1]?.toLowerCase();

    return command === "learning-approve" ||
        command === "learning-dismiss" ||
        command === "learning-snooze"
        ? command
        : null;
}

function parseSnoozeDurationMs(
    argumentsText: string,
    defaultSnoozeMinutes: number,
): number {
    const match = argumentsText.trim().toLowerCase().match(/^(\d+)\s*([mhd])?$/);
    if (!match) {
        return defaultSnoozeMinutes * MINUTE_MS;
    }

    const value = Number.parseInt(match[1] ?? "", 10);
    if (!Number.isFinite(value) || value <= 0) {
        return defaultSnoozeMinutes * MINUTE_MS;
    }

    const unit = match[2] ?? "m";
    const multiplier = unit === "d" ? 24 * 60 * 60 * 1000 : unit === "h" ? 60 * 60 * 1000 : 60 * 1000;

    return Math.min(value * multiplier, MAX_SNOOZE_MS);
}

function loadActionableRecommendation(
    projectDir: string,
    policy: ReturnType<typeof loadLearningPolicy>,
    now: number,
): { recommendation: LearningRecommendation; state: ReturnType<typeof normalizeLearningState> } | null {
    const state = normalizeLearningState(loadLearningState(projectDir), policy, now);
    const latestRecommendation = loadLatestRecommendation(projectDir);
    const activeRecommendation = state.activeRecommendation;

    if (!latestRecommendation || !activeRecommendation) {
        return null;
    }

    if (
        latestRecommendation.id !== activeRecommendation.id ||
        latestRecommendation.dedupeKey !== activeRecommendation.dedupeKey ||
        latestRecommendation.commandId !== activeRecommendation.commandId
    ) {
        return null;
    }

    return {
        recommendation: latestRecommendation,
        state,
    };
}

function buildExecutableLearningCommand(
    recommendation: LearningRecommendation,
): string | null {
    if (!ALLOWED_APPROVAL_COMMANDS.has(recommendation.commandId)) {
        return null;
    }

    const expectedCommandName = `/ai-eng/${recommendation.commandId}`;
    if (
        recommendation.commandName !== expectedCommandName ||
        recommendation.mode !== "suggestion-only" ||
        recommendation.sourceEvent !== "command.executed"
    ) {
        return null;
    }

    const trimmedArguments = recommendation.suggestedArguments.trim();
    if (
        !trimmedArguments ||
        /[\r\n\0]/.test(trimmedArguments) ||
        !trimmedArguments.startsWith('"') ||
        !trimmedArguments.endsWith('"')
    ) {
        return null;
    }

    return `${expectedCommandName} ${trimmedArguments}`;
}

function matchesRecommendation(
    recommendation: LearningRecommendation,
    activeRecommendation: ReturnType<typeof normalizeLearningState>["activeRecommendation"],
): boolean {
    return (
        activeRecommendation?.id === recommendation.id &&
        activeRecommendation.commandId === recommendation.commandId &&
        activeRecommendation.dedupeKey === recommendation.dedupeKey
    );
}

export function createLearningAutomationRuntime({
    projectDir,
    notifySuggestion,
    notifyStatus,
    executeCommand,
    now = () => Date.now(),
}: LearningRuntimeDeps) {
    let eventQueue = Promise.resolve();

    async function handleControlCommand(
        commandId: LearningControlCommandId,
        argumentsText: string,
    ): Promise<void> {
        let statusMessage = "No active learning recommendation to act on.";
        let statusVariant: "info" | "success" | "warning" | "error" = "warning";
        let pendingApproval:
            | {
                  recommendation: LearningRecommendation;
                  executableCommand: string;
                  approvedAt: number;
              }
            | undefined;

        await withLearningStateLock(projectDir, async () => {
            const policy = loadLearningPolicy(projectDir);
            const currentTime = now();
            const loaded = loadActionableRecommendation(projectDir, policy, currentTime);

            if (!loaded) {
                return;
            }

            const { recommendation, state } = loaded;
            if (state.activeRecommendation?.status === "approving") {
                statusMessage = "Learning suggestion approval already in progress.";
                return;
            }

            const executableCommand = buildExecutableLearningCommand(recommendation);

            if (!executableCommand) {
                statusMessage = "Learning recommendation is invalid or no longer actionable.";
                return;
            }

            if (commandId === "learning-dismiss") {
                saveLearningState(
                    projectDir,
                    applyDismissedSuggestion(state, recommendation, currentTime),
                );
                statusMessage = "Learning suggestion dismissed.";
                statusVariant = "info";
                return;
            }

            if (commandId === "learning-snooze") {
                const snoozedUntil =
                    currentTime +
                    parseSnoozeDurationMs(
                        argumentsText,
                        policy.defaultSnoozeMinutes,
                    );
                saveLearningState(
                    projectDir,
                    applySnoozedSuggestion(
                        state,
                        recommendation,
                        snoozedUntil,
                        currentTime,
                    ),
                );
                statusMessage = "Learning suggestion snoozed.";
                statusVariant = "info";
                return;
            }

            saveLearningState(
                projectDir,
                applyApprovedSuggestion(state, recommendation, currentTime),
            );
            pendingApproval = {
                recommendation,
                executableCommand,
                approvedAt: currentTime,
            };
        });

        if (pendingApproval) {
            const approval = pendingApproval;
            try {
                await executeCommand(approval.executableCommand);
                await withLearningStateLock(projectDir, async () => {
                    const currentState = loadLearningState(projectDir);
                    if (
                        !matchesRecommendation(
                            approval.recommendation,
                            currentState.activeRecommendation,
                        ) ||
                        currentState.activeRecommendation?.status !== "approving"
                    ) {
                        return;
                    }

                    saveLearningState(
                        projectDir,
                        applyExecutedSuggestion(
                            currentState,
                            approval.recommendation,
                            now(),
                        ),
                    );
                });
                statusMessage = `Executed ${approval.executableCommand}.`;
                statusVariant = "success";
            } catch (error) {
                await withLearningStateLock(projectDir, async () => {
                    const currentState = loadLearningState(projectDir);
                    if (
                        !matchesRecommendation(
                            approval.recommendation,
                            currentState.activeRecommendation,
                        ) ||
                        currentState.activeRecommendation?.status !== "approving"
                    ) {
                        return;
                    }

                    saveLearningState(
                        projectDir,
                        applyApprovedSuggestion(
                            currentState,
                            approval.recommendation,
                            approval.approvedAt,
                            error instanceof Error ? error.message : String(error),
                        ),
                    );
                });
                statusMessage =
                    "Learning command failed. Retry with /ai-eng/learning-approve.";
                statusVariant = "error";
            }
        }

        await notifyStatus(statusMessage, statusVariant);
    }

    async function processEvent(event: Event): Promise<void> {
        if (event.type === "session.created" || event.type === "session.idle") {
            return;
        }

        if (event.type !== "command.executed") {
            return;
        }

        const controlCommand = normalizeControlCommandName(event.properties.name);
        if (controlCommand) {
            await handleControlCommand(
                controlCommand,
                event.properties.arguments ?? "",
            );
            return;
        }

        const currentTime = now();
        const candidates = buildLearningCandidates(event, projectDir, currentTime);
        let notification:
            | {
                  recommendation: LearningRecommendation;
                  previousState: ReturnType<typeof loadLearningState>;
                  previousLatestRecommendation: LearningRecommendation | null;
              }
            | undefined;

        await withLearningStateLock(projectDir, async () => {
            const policy = loadLearningPolicy(projectDir);
            const state = normalizeLearningState(
                loadLearningState(projectDir),
                policy,
                currentTime,
            );
            const recommendation = selectSuggestion(
                candidates,
                state,
                policy,
                currentTime,
            );

            if (!recommendation) {
                return;
            }

            const previousLatestRecommendation = loadLatestRecommendation(projectDir);
            const nextState = applySurfacedSuggestion(
                state,
                recommendation,
                currentTime,
            );

            saveLatestRecommendation(projectDir, recommendation);
            saveLearningState(projectDir, nextState);
            notification = {
                recommendation,
                previousState: state,
                previousLatestRecommendation,
            };
        });

        if (!notification) {
            return;
        }

        const surfacedNotification = notification;

        try {
            await notifySuggestion(surfacedNotification.recommendation);
        } catch {
            await withLearningStateLock(projectDir, async () => {
                const currentState = loadLearningState(projectDir);
                const currentLatestRecommendation = loadLatestRecommendation(projectDir);

                if (
                    !matchesRecommendation(
                        surfacedNotification.recommendation,
                        currentState.activeRecommendation,
                    ) ||
                    currentState.activeRecommendation?.status !== "surfaced" ||
                    currentLatestRecommendation?.id !== surfacedNotification.recommendation.id ||
                    currentLatestRecommendation?.dedupeKey !==
                        surfacedNotification.recommendation.dedupeKey ||
                    currentLatestRecommendation?.commandId !==
                        surfacedNotification.recommendation.commandId
                ) {
                    return;
                }

                saveLearningState(projectDir, surfacedNotification.previousState);
                if (surfacedNotification.previousLatestRecommendation) {
                    saveLatestRecommendation(
                        projectDir,
                        surfacedNotification.previousLatestRecommendation,
                    );
                } else {
                    clearLatestRecommendation(projectDir);
                }
            });
        }
    }

    return {
        async handleEvent(event: Event): Promise<void> {
            const run = eventQueue.then(() => processEvent(event));
            eventQueue = run.catch(() => undefined);
            await run;
        },
    };
}
