/**
 * Opt-in install telemetry for ai-eng-system CLI.
 * Writes anonymized JSONL to ~/.ai-eng/telemetry.jsonl.
 * No PII, no project paths, no file contents.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function telemetryPaths(): {
    directory: string;
    file: string;
    optOutFlag: string;
} {
    const directory = join(process.env.HOME || homedir(), ".ai-eng");
    return {
        directory,
        file: join(directory, "telemetry.jsonl"),
        optOutFlag: join(directory, "telemetry-opt-out"),
    };
}

export interface InstallTelemetryEvent {
    event: "install";
    timestamp: string;
    version: string;
    platform: string;
    scope: string;
    command_count: number;
    agent_count: number;
    skill_count: number;
    tool_count: number;
}

export interface BuildTelemetryEvent {
    event: "build";
    timestamp: string;
    version: string;
    target: string;
    plugin_groups: string[];
}

export type TelemetryEvent = InstallTelemetryEvent | BuildTelemetryEvent;

export function isTelemetryEnabled(): boolean {
    if (process.env.AI_ENG_TELEMETRY === "false") return false;
    if (existsSync(telemetryPaths().optOutFlag)) return false;
    return true;
}

export function optOutTelemetry(): void {
    const paths = telemetryPaths();
    mkdirSync(paths.directory, { recursive: true });
    appendFileSync(paths.optOutFlag, "", { encoding: "utf-8" });
}

export function appendTelemetryEvent(event: TelemetryEvent): void {
    if (!isTelemetryEnabled()) return;

    try {
        const paths = telemetryPaths();
        mkdirSync(paths.directory, { recursive: true });
        const line = `${JSON.stringify(event)}\n`;
        appendFileSync(paths.file, line, { encoding: "utf-8" });
    } catch {
        // Telemetry must never block installation or builds.
    }
}

export function readTelemetry(): TelemetryEvent[] {
    const paths = telemetryPaths();
    if (!existsSync(paths.file)) return [];
    const content = readFileSync(paths.file, "utf-8");
    return content
        .split("\n")
        .filter((l: string) => l.trim())
        .map((l: string) => JSON.parse(l));
}
