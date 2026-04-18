#!/usr/bin/env bun

import { afterEach, describe, expect, it, mock } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AiEngSystem } from "../src/index.js";
import { buildLearningCandidates } from "../src/learning-automation/heuristics.js";
import { createLearningAutomationRuntime } from "../src/learning-automation/runtime.js";
import { loadLearningPolicy, withLearningStateLock } from "../src/learning-automation/state.js";
import {
    applySurfacedSuggestion,
    normalizeLearningState,
    selectSuggestion,
} from "../src/learning-automation/suggestions.js";
import type {
    LearningPolicy,
    LearningRecommendation,
    LearningState,
} from "../src/learning-automation/types.js";

const createdDirs: string[] = [];
const originalHome = process.env.HOME;

async function createTempProject(): Promise<string> {
    const projectDir = join(
        tmpdir(),
        `ai-eng-learning-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    createdDirs.push(projectDir);
    await mkdir(join(projectDir, ".opencode"), { recursive: true });
    await writeFile(
        join(projectDir, ".opencode", "opencode.jsonc"),
        JSON.stringify({ plugin: ["ai-eng-system"] }),
    );
    return projectDir;
}

async function createPlugin(projectDir: string, directory = projectDir, worktree = projectDir) {
    return AiEngSystem({
        project: {} as never,
        client: {
            tui: {
                showToast: mock(async () => ({ data: {} })),
                executeCommand: mock(async () => ({ data: {} })),
            },
        } as never,
        $: {} as never,
        directory,
        worktree,
        serverUrl: new URL("http://localhost"),
    });
}

function createRecommendation(
    commandId: LearningRecommendation["commandId"],
    confidence = 0.9,
): LearningRecommendation {
    return {
        id: `${commandId}-1`,
        commandId,
        commandName: `/ai-eng/${commandId}`,
        commandLine: `/ai-eng/${commandId} "example"`,
        suggestedArguments: '"example"',
        rationale: "example rationale",
        confidence,
        likelyTargetFiles: [
            commandId === "decision-journal" ? "docs/decisions/" : "docs/quality/",
        ],
        dedupeKey: `${commandId}|plan|example`,
        mode: "suggestion-only",
        sourceEvent: "command.executed",
        createdAt: 1,
    };
}

const POLICY: LearningPolicy = {
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

afterEach(async () => {
    await Promise.all(
        createdDirs.splice(0).map((directory) =>
            rm(directory, { recursive: true, force: true }),
        ),
    );
    process.env.HOME = originalHome;
    mock.restore();
});

describe("learning automation heuristics", () => {
    it("suggests decision-journal for durable planning decisions", async () => {
        const projectDir = await createTempProject();
        const candidates = buildLearningCandidates(
            {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/plan",
                    sessionID: "session-1",
                    arguments:
                        "API schema migration tradeoff for billing service src/api/schema.ts",
                    messageID: "message-1",
                },
            },
            projectDir,
            100,
        );

        expect(candidates[0]?.commandName).toBe("/ai-eng/decision-journal");
        expect(candidates[0]?.confidence).toBeGreaterThanOrEqual(0.72);
        expect(candidates[0]?.likelyTargetFiles).toContain("docs/decisions/");
        expect(candidates[0]?.likelyTargetFiles).toContain("src/api/schema.ts");
    });

    it("suggests quality-gate for reusable validation checks", async () => {
        const projectDir = await createTempProject();
        const candidates = buildLearningCandidates(
            {
                type: "command.executed",
                properties: {
                    name: "ai-eng/review",
                    sessionID: "session-1",
                    arguments:
                        "acceptance criteria regression checklist risk controls for auth flow",
                    messageID: "message-1",
                },
            },
            projectDir,
            100,
        );

        expect(candidates[0]?.commandName).toBe("/ai-eng/quality-gate");
        expect(candidates[0]?.confidence).toBeGreaterThanOrEqual(0.72);
        expect(candidates[0]?.likelyTargetFiles).toContain("docs/quality/");
    });
});

describe("learning automation suppression", () => {
    it("suppresses duplicate suggestions during cooldown and retention windows", () => {
        const recommendation = createRecommendation("decision-journal");
        const initialState: LearningState = {
            version: 2,
            commandLastSurfacedAt: {},
            dedupe: {},
            recommendationHistory: {},
        };

        const surfacedState = applySurfacedSuggestion(initialState, recommendation, 0);
        const expiredState = normalizeLearningState(
            surfacedState,
            POLICY,
            (24 * 60 + 31) * 60 * 1000,
        );

        expect(selectSuggestion([recommendation], surfacedState, POLICY, 5 * 60 * 1000)).toBeNull();
        expect(selectSuggestion([recommendation], surfacedState, POLICY, 119 * 60 * 1000)).toBeNull();
        expect(selectSuggestion([createRecommendation("decision-journal")], surfacedState, POLICY, 119 * 60 * 1000)).toBeNull();
        expect(selectSuggestion([recommendation], surfacedState, POLICY, 121 * 60 * 1000)).toBeNull();
        expect(
            selectSuggestion(
                [createRecommendation("quality-gate")],
                expiredState,
                POLICY,
                (24 * 60 + 31) * 60 * 1000,
            )?.commandName,
        ).toBe("/ai-eng/quality-gate");
    });

    it("does not replace a still-actionable active recommendation", () => {
        const recommendation = createRecommendation("decision-journal");
        const surfacedState = applySurfacedSuggestion(
            {
                version: 2,
                commandLastSurfacedAt: {},
                dedupe: {},
                recommendationHistory: {},
            },
            recommendation,
            0,
        );

        expect(
            selectSuggestion(
                [createRecommendation("quality-gate")],
                surfacedState,
                POLICY,
                31 * 60 * 1000,
            ),
        ).toBeNull();
    });
});

describe("learning automation runtime safety", () => {
    it("prefers worktree root over current directory for learning state paths", async () => {
        const projectDir = await createTempProject();
        const nestedDirectory = join(projectDir, "packages", "app");
        await mkdir(nestedDirectory, { recursive: true });

        const showToast = mock(async () => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand: mock(async () => ({ data: {} })),
                },
            } as never,
            $: {} as never,
            directory: nestedDirectory,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/work",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        expect(showToast).toHaveBeenCalledTimes(1);
        expect(existsSync(join(projectDir, ".ai-context", "learning", "state.json"))).toBe(true);
        expect(existsSync(join(nestedDirectory, ".ai-context", "learning", "state.json"))).toBe(false);
    });

    it("detects project-root opencode.json and installs into project .opencode", async () => {
        const projectDir = join(
            tmpdir(),
            `ai-eng-learning-legacy-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        );
        const fakeHome = join(projectDir, "home");
        createdDirs.push(projectDir);
        await mkdir(projectDir, { recursive: true });
        await mkdir(join(fakeHome, ".config", "opencode"), { recursive: true });
        process.env.HOME = fakeHome;
        await writeFile(
            join(projectDir, "opencode.json"),
            JSON.stringify({ plugin: ["ai-eng-system"] }),
        );

        await createPlugin(projectDir);

        expect(existsSync(join(projectDir, ".opencode", "command", "ai-eng"))).toBe(true);
    });

    it("detects project-root opencode.jsonc and installs into project .opencode", async () => {
        const projectDir = join(
            tmpdir(),
            `ai-eng-learning-jsonc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        );
        const fakeHome = join(projectDir, "home");
        createdDirs.push(projectDir);
        await mkdir(projectDir, { recursive: true });
        await mkdir(join(fakeHome, ".config", "opencode"), { recursive: true });
        process.env.HOME = fakeHome;
        await writeFile(
            join(projectDir, "opencode.jsonc"),
            JSON.stringify({ plugin: ["ai-eng-system"] }),
        );

        await createPlugin(projectDir);

        expect(existsSync(join(projectDir, ".opencode", "command", "ai-eng"))).toBe(true);
    });

    it("does not create learning state on session.created before any eligible command", async () => {
        const projectDir = await createTempProject();
        const plugin = await createPlugin(projectDir);

        await plugin.event?.({
            event: {
                type: "session.created",
                properties: {
                    info: {
                        id: "session-1",
                        projectID: "project-1",
                        directory: projectDir,
                        title: "Test",
                        version: "1",
                        time: {
                            created: 1,
                            updated: 1,
                        },
                    },
                },
            },
        });

        expect(existsSync(join(projectDir, ".ai-context", "learning"))).toBe(false);
    });

    it("shows a toast, persists local state, and never executes commands or writes docs before approval", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async (_input?: unknown) => ({ data: {} }));
        const executeCommand = mock(async (_input?: unknown) => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/work",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        expect(showToast).toHaveBeenCalledTimes(1);
        expect(executeCommand).not.toHaveBeenCalled();
        expect(existsSync(join(projectDir, ".ai-context", "learning", "state.json"))).toBe(true);
        expect(
            existsSync(
                join(
                    projectDir,
                    ".ai-context",
                    "learning",
                    "latest-recommendation.json",
                ),
            ),
        ).toBe(true);
        expect(existsSync(join(projectDir, "docs", "decisions"))).toBe(false);
        expect(existsSync(join(projectDir, "docs", "quality"))).toBe(false);

        const persistedRecommendation = JSON.parse(
            await readFile(
                join(
                    projectDir,
                    ".ai-context",
                    "learning",
                    "latest-recommendation.json",
                ),
                "utf-8",
            ),
        ) as LearningRecommendation;

        expect(persistedRecommendation.mode).toBe("suggestion-only");
    });

    it("approves and executes the stored learning command exactly once", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/work",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-approve",
                    sessionID: "session-1",
                    arguments: "",
                    messageID: "message-2",
                },
            },
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-approve",
                    sessionID: "session-1",
                    arguments: "",
                    messageID: "message-3",
                },
            },
        });

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith({
            body: {
                command: '/ai-eng/decision-journal "Document the durable decision and tradeoff decisions from this /ai-eng/work run for src/domain/model.ts"',
            },
            query: { directory: projectDir },
        });

        const state = JSON.parse(
            await readFile(join(projectDir, ".ai-context", "learning", "state.json"), "utf-8"),
        ) as LearningState;

        expect(state.activeRecommendation).toBeUndefined();
        expect(
            state.recommendationHistory[
                "decision-journal|work|decision,tradeoff,architecture|src/domain/model.ts"
            ]?.status,
        ).toBe("executed");
    });

    it("does not execute a tampered on-disk command line during approval", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/work",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        const recommendationPath = join(
            projectDir,
            ".ai-context",
            "learning",
            "latest-recommendation.json",
        );
        const tamperedRecommendation = JSON.parse(
            await readFile(recommendationPath, "utf-8"),
        ) as LearningRecommendation;
        tamperedRecommendation.commandLine = '/ai-eng/work "malicious"';
        await writeFile(recommendationPath, JSON.stringify(tamperedRecommendation, null, 2));

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-approve",
                    sessionID: "session-1",
                    arguments: "",
                    messageID: "message-2",
                },
            },
        });

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith({
            body: {
                command: '/ai-eng/decision-journal "Document the durable decision and tradeoff decisions from this /ai-eng/work run for src/domain/model.ts"',
            },
            query: { directory: projectDir },
        });
    });

    it("dismisses without executing and clears the active recommendation", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/work",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-dismiss",
                    sessionID: "session-1",
                    arguments: "",
                    messageID: "message-2",
                },
            },
        });

        expect(executeCommand).not.toHaveBeenCalled();

        const state = JSON.parse(
            await readFile(join(projectDir, ".ai-context", "learning", "state.json"), "utf-8"),
        ) as LearningState;

        expect(state.activeRecommendation).toBeUndefined();
        expect(
            state.recommendationHistory[
                "decision-journal|work|decision,tradeoff,architecture|src/domain/model.ts"
            ]?.status,
        ).toBe("dismissed");
    });

    it("snoozes a recommendation and suppresses resurfacing until expiry", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => ({ data: {} }));
        let now = 100;
        const plugin = createLearningAutomationRuntime({
            projectDir,
            notifySuggestion: async () => {
                await showToast();
            },
            notifyStatus: async () => {
                await showToast();
            },
            executeCommand: async () => {
                await executeCommand();
            },
            now: () => now,
        });

        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-1",
            },
        } as never);

        now += 1;
        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-snooze",
                sessionID: "session-1",
                arguments: "2h",
                messageID: "message-2",
            },
        } as never);

        now += 31 * 60 * 1000;
        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-3",
            },
        } as never);

        expect(showToast).toHaveBeenCalledTimes(2);

        now += 90 * 60 * 1000;
        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-4",
            },
        } as never);

        expect(showToast).toHaveBeenCalledTimes(3);
    });

    it("keeps approval actionable after surface cooldown within retention window", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async (_command?: string) => ({ data: {} }));
        let now = 100;
        const plugin = createLearningAutomationRuntime({
            projectDir,
            notifySuggestion: async () => {
                await showToast();
            },
            notifyStatus: async () => {
                await showToast();
            },
            executeCommand: async (command) => {
                await executeCommand(command);
            },
            now: () => now,
        });

        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-1",
            },
        } as never);

        now += 31 * 60 * 1000;

        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-approve",
                sessionID: "session-1",
                arguments: "",
                messageID: "message-2",
            },
        } as never);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(showToast).toHaveBeenCalledTimes(2);
    });

    it("expires approval when custom actionable retention elapses", async () => {
        const projectDir = await createTempProject();
        await mkdir(join(projectDir, ".ai-context", "learning"), { recursive: true });
        await writeFile(
            join(projectDir, ".ai-context", "learning", "policy.json"),
            JSON.stringify({ actionableRetentionMinutes: 5 }),
        );
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async (_command?: string) => ({ data: {} }));
        let now = 100;
        const plugin = createLearningAutomationRuntime({
            projectDir,
            notifySuggestion: async () => {
                await showToast();
            },
            notifyStatus: async () => {
                await showToast();
            },
            executeCommand: async (command) => {
                await executeCommand(command);
            },
            now: () => now,
        });

        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-1",
            },
        } as never);

        now += 6 * 60 * 1000;

        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-approve",
                sessionID: "session-1",
                arguments: "",
                messageID: "message-2",
            },
        } as never);

        expect(executeCommand).not.toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledTimes(2);
    });

    it("prevents duplicate approvals across overlapping runtimes", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        let releaseExecution: (() => void) | undefined;
        let markStarted: (() => void) | undefined;
        const started = new Promise<void>((resolve) => {
            markStarted = resolve;
        });
        const executeCommand = mock(
            () =>
                new Promise<void>((resolve) => {
                    markStarted?.();
                    releaseExecution = resolve;
                }),
        );
        const runtimeA = createLearningAutomationRuntime({
            projectDir,
            notifySuggestion: async () => {
                await showToast();
            },
            notifyStatus: async () => {
                await showToast();
            },
            executeCommand,
        });
        const runtimeB = createLearningAutomationRuntime({
            projectDir,
            notifySuggestion: async () => {
                await showToast();
            },
            notifyStatus: async () => {
                await showToast();
            },
            executeCommand,
        });

        await runtimeA.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-1",
            },
        } as never);

        const approveA = runtimeA.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-approve",
                sessionID: "session-1",
                arguments: "",
                messageID: "message-2",
            },
        } as never);
        const approveB = runtimeB.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-approve",
                sessionID: "session-1",
                arguments: "",
                messageID: "message-3",
            },
        } as never);

        await started;
        expect(executeCommand).toHaveBeenCalledTimes(1);
        releaseExecution?.();
        await Promise.all([approveA, approveB]);

        expect(executeCommand).toHaveBeenCalledTimes(1);
    });

    it("recovers a stale cross-process state lock", async () => {
        const projectDir = await createTempProject();
        const lockDir = join(projectDir, ".ai-context", "learning", "state.lock");
        await mkdir(lockDir, { recursive: true });
        await writeFile(
            join(lockDir, "metadata.json"),
            JSON.stringify({ acquiredAt: 0, pid: 12345 }),
        );

        let ran = false;
        await withLearningStateLock(projectDir, async () => {
            ran = true;
        });

        expect(ran).toBe(true);
    });

    it("uses policy default snooze for missing and invalid durations", async () => {
        const projectDir = await createTempProject();
        await mkdir(join(projectDir, ".ai-context", "learning"), { recursive: true });
        await writeFile(
            join(projectDir, ".ai-context", "learning", "policy.json"),
            JSON.stringify({
                defaultSnoozeMinutes: 15,
                surfaceCooldownMinutes: 0,
                commands: {
                    "decision-journal": {
                        cooldownMinutes: 0,
                    },
                },
            }),
        );
        let now = 100;
        const plugin = createLearningAutomationRuntime({
            projectDir,
            notifySuggestion: async () => undefined,
            notifyStatus: async () => undefined,
            executeCommand: async () => undefined,
            now: () => now,
        });

        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-1",
            },
        } as never);

        now += 1;
        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-snooze",
                sessionID: "session-1",
                arguments: "",
                messageID: "message-2",
            },
        } as never);

        let state = JSON.parse(
            await readFile(join(projectDir, ".ai-context", "learning", "state.json"), "utf-8"),
        ) as LearningState;

        expect(
            state.recommendationHistory[
                "decision-journal|work|decision,tradeoff,architecture|src/domain/model.ts"
            ]?.snoozedUntil,
        ).toBe(now + 15 * 60 * 1000);

        now += 16 * 60 * 1000;
        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/work",
                sessionID: "session-1",
                arguments:
                    "architecture migration decision and schema tradeoff for src/domain/model.ts",
                messageID: "message-3",
            },
        } as never);

        now += 1;
        await plugin.handleEvent({
            type: "command.executed",
            properties: {
                name: "/ai-eng/learning-snooze",
                sessionID: "session-1",
                arguments: "nonsense",
                messageID: "message-4",
            },
        } as never);

        state = JSON.parse(
            await readFile(join(projectDir, ".ai-context", "learning", "state.json"), "utf-8"),
        ) as LearningState;

        expect(
            state.recommendationHistory[
                "decision-journal|work|decision,tradeoff,architecture|src/domain/model.ts"
            ]?.snoozedUntil,
        ).toBe(now + 15 * 60 * 1000);
    });

    it("control commands never generate fresh suggestions", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-dismiss",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        expect(executeCommand).not.toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledTimes(1);
        expect(existsSync(join(projectDir, ".ai-context", "learning", "latest-recommendation.json"))).toBe(false);
    });

    it("approval with no active recommendation is a safe no-op", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => ({ data: {} }));
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-approve",
                    sessionID: "session-1",
                    arguments: "",
                    messageID: "message-1",
                },
            },
        });

        expect(executeCommand).not.toHaveBeenCalled();
        expect(showToast).toHaveBeenCalledTimes(1);
        expect(existsSync(join(projectDir, ".ai-context", "learning", "state.json"))).toBe(false);
    });

    it("failed approval preserves actionable state for retry", async () => {
        const projectDir = await createTempProject();
        const showToast = mock(async () => ({ data: {} }));
        const executeCommand = mock(async () => {
            throw new Error("boom");
        });
        const plugin = await AiEngSystem({
            project: {} as never,
            client: {
                tui: {
                    showToast,
                    executeCommand,
                },
            } as never,
            $: {} as never,
            directory: projectDir,
            worktree: projectDir,
            serverUrl: new URL("http://localhost"),
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/work",
                    sessionID: "session-1",
                    arguments:
                        "architecture migration decision and schema tradeoff for src/domain/model.ts",
                    messageID: "message-1",
                },
            },
        });

        await plugin.event?.({
            event: {
                type: "command.executed",
                properties: {
                    name: "/ai-eng/learning-approve",
                    sessionID: "session-1",
                    arguments: "",
                    messageID: "message-2",
                },
            },
        });

        const state = JSON.parse(
            await readFile(join(projectDir, ".ai-context", "learning", "state.json"), "utf-8"),
        ) as LearningState;

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(state.activeRecommendation?.status).toBe("execution-failed");
        expect(
            state.recommendationHistory[
                "decision-journal|work|decision,tradeoff,architecture|src/domain/model.ts"
            ]?.status,
        ).toBe("approved");
    });
});

describe("learning automation policy parsing", () => {
    it("honors explicit zero values in local policy", async () => {
        const projectDir = await createTempProject();
        await mkdir(join(projectDir, ".ai-context", "learning"), { recursive: true });
        await writeFile(
            join(projectDir, ".ai-context", "learning", "policy.json"),
            JSON.stringify({
                maxActiveSuggestions: 0,
                surfaceCooldownMinutes: 0,
                actionableRetentionMinutes: 0,
                defaultSnoozeMinutes: 0,
                commands: {
                    "decision-journal": {
                        cooldownMinutes: 0,
                        minimumConfidence: 0,
                    },
                    "quality-gate": {
                        cooldownMinutes: 0,
                        minimumConfidence: 0,
                    },
                },
            }),
        );

        const policy = loadLearningPolicy(projectDir);

        expect(policy.maxActiveSuggestions).toBe(0);
        expect(policy.surfaceCooldownMinutes).toBe(0);
        expect(policy.actionableRetentionMinutes).toBe(0);
        expect(policy.defaultSnoozeMinutes).toBe(0);
        expect(policy.commands["decision-journal"].cooldownMinutes).toBe(0);
        expect(policy.commands["decision-journal"].minimumConfidence).toBe(0);
        expect(policy.commands["quality-gate"].cooldownMinutes).toBe(0);
        expect(policy.commands["quality-gate"].minimumConfidence).toBe(0);
    });

    it("rejects invalid boolean enabled values and clamps confidence", async () => {
        const projectDir = await createTempProject();
        await mkdir(join(projectDir, ".ai-context", "learning"), { recursive: true });
        await writeFile(
            join(projectDir, ".ai-context", "learning", "policy.json"),
            JSON.stringify({
                commands: {
                    "decision-journal": {
                        enabled: "false",
                        minimumConfidence: 99,
                    },
                    "quality-gate": {
                        enabled: null,
                        minimumConfidence: -5,
                    },
                },
            }),
        );

        const policy = loadLearningPolicy(projectDir);

        expect(policy.commands["decision-journal"].enabled).toBe(true);
        expect(policy.commands["decision-journal"].minimumConfidence).toBe(1);
        expect(policy.commands["quality-gate"].enabled).toBe(true);
        expect(policy.commands["quality-gate"].minimumConfidence).toBe(0);
    });
});
