/**
 * Opt-in install telemetry for ai-eng-system CLI.
 * Writes anonymized JSONL to ~/.ai-eng/telemetry.jsonl.
 * No PII, no project paths, no file contents.
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const TELEMETRY_DIR = join(homedir(), ".ai-eng");
const TELEMETRY_FILE = join(TELEMETRY_DIR, "telemetry.jsonl");
const OPT_OUT_FLAG = join(TELEMETRY_DIR, "telemetry-opt-out");

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
    if (existsSync(OPT_OUT_FLAG)) return false;
    return true;
}

export function optOutTelemetry(): void {
    mkdirSync(TELEMETRY_DIR, { recursive: true });
    appendFileSync(OPT_OUT_FLAG, "", { encoding: "utf-8" });
}

export function appendTelemetryEvent(event: TelemetryEvent): void {
    if (!isTelemetryEnabled()) return;

    mkdirSync(TELEMETRY_DIR, { recursive: true });
    const line = `${JSON.stringify(event)}\n`;
    appendFileSync(TELEMETRY_FILE, line, { encoding: "utf-8" });
}

export function readTelemetry(): TelemetryEvent[] {
    if (!existsSync(TELEMETRY_FILE)) return [];
    const content = require("node:fs").readFileSync(TELEMETRY_FILE, "utf-8");
    return content
        .split("\n")
        .filter((l: string) => l.trim())
        .map((l: string) => JSON.parse(l));
}
