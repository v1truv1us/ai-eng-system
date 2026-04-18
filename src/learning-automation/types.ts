export type LearningCommandId = "decision-journal" | "quality-gate";

export type LearningControlCommandId =
    | "learning-approve"
    | "learning-dismiss"
    | "learning-snooze";

export type LearningRecommendation = {
    id: string;
    commandId: LearningCommandId;
    commandName: `/ai-eng/${LearningCommandId}`;
    commandLine: string;
    suggestedArguments: string;
    rationale: string;
    confidence: number;
    likelyTargetFiles: string[];
    dedupeKey: string;
    mode: "suggestion-only";
    sourceEvent: "command.executed";
    createdAt: number;
};

export type LearningCommandPolicy = {
    enabled: boolean;
    cooldownMinutes: number;
    minimumConfidence: number;
};

export type LearningPolicy = {
    mode: "suggestion-only";
    maxActiveSuggestions: number;
    surfaceCooldownMinutes: number;
    actionableRetentionMinutes: number;
    defaultSnoozeMinutes: number;
    commands: Record<LearningCommandId, LearningCommandPolicy>;
};

export type SurfacedRecommendationState = {
    id: string;
    commandId: LearningCommandId;
    dedupeKey: string;
    surfacedAt: number;
    status: "surfaced" | "approving" | "execution-failed";
    lastError?: string;
};

export type LearningRecommendationHistoryEntry = {
    id: string;
    commandId: LearningCommandId;
    status:
        | "surfaced"
        | "approving"
        | "approved"
        | "executed"
        | "dismissed"
        | "snoozed";
    surfacedAt?: number;
    approvedAt?: number;
    executedAt?: number;
    dismissedAt?: number;
    snoozedUntil?: number;
    updatedAt: number;
    commandLine?: string;
    lastError?: string;
};

export type LearningState = {
    version: 2;
    lastSurfacedAt?: number;
    commandLastSurfacedAt: Partial<Record<LearningCommandId, number>>;
    dedupe: Record<string, number>;
    activeRecommendation?: SurfacedRecommendationState;
    recommendationHistory: Record<string, LearningRecommendationHistoryEntry>;
};

export type LearningRuntimeDeps = {
    projectDir: string;
    notifySuggestion: (recommendation: LearningRecommendation) => Promise<void>;
    notifyStatus: (
        message: string,
        variant: "info" | "success" | "warning" | "error",
    ) => Promise<void>;
    executeCommand: (command: string) => Promise<void>;
    now?: () => number;
};
