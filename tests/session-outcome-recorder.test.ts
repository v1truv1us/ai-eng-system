#!/usr/bin/env bun
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..");
const HOOK = join(REPO_ROOT, "hooks", "session-outcome-recorder.sh");

let workDir: string;

async function runHook(input: string): Promise<void> {
    const proc = Bun.spawn(["bash", HOOK], {
        cwd: workDir,
        env: {
            ...process.env,
            SKILL_LOG_TEST_INPUT: input,
            SKILL_LOG_LEDGER: join(workDir, "reports", "ledger.jsonl"),
            SKILLS_ROOT: join(workDir, "skills"),
            RUNS_DIR: join(workDir, ".ai-eng", "runs"),
        },
        stdout: "pipe",
        stderr: "pipe",
    });
    await proc.exited;
}

async function seedLedger(lines: string[]): Promise<void> {
    await mkdir(join(workDir, "reports"), { recursive: true });
    await writeFile(
        join(workDir, "reports", "ledger.jsonl"),
        `${lines.join("\n")}\n`,
    );
}

async function seedSkill(name: string): Promise<void> {
    await mkdir(join(workDir, "skills", name), { recursive: true });
}

async function seedFlow(status: string): Promise<void> {
    const dir = join(workDir, ".ai-eng", "runs", "r1");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, ".flow"), JSON.stringify({ status }));
}

describe("session-outcome-recorder hook", () => {
    beforeEach(async () => {
        workDir = join(
            tmpdir(),
            `outcome-hook-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        );
        await mkdir(workDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(workDir, { recursive: true, force: true });
    });

    it("records success from a completed flow state", async () => {
        await seedSkill("demo");
        await seedLedger([
            JSON.stringify({ ts: 1000, skill: "demo", session_id: "s1" }),
        ]);
        await seedFlow("completed");
        await runHook('{"session_id":"s1","stop_reason":"end_turn"}');
        const history = await readFile(
            join(workDir, "skills", "demo", "run-history.jsonl"),
            "utf-8",
        );
        const entry = JSON.parse(history.trim());
        expect(entry.outcome).toBe("success");
        expect(entry.signals.verify_passed).toBe(true);
        expect(entry.skill).toBe("demo");
    });

    it("records failure from a failed flow state", async () => {
        await seedSkill("demo");
        await seedLedger([
            JSON.stringify({ ts: 1000, skill: "demo", session_id: "s1" }),
        ]);
        await seedFlow("failed");
        await runHook('{"session_id":"s1","stop_reason":"end_turn"}');
        const history = await readFile(
            join(workDir, "skills", "demo", "run-history.jsonl"),
            "utf-8",
        );
        expect(JSON.parse(history.trim()).outcome).toBe("failure");
    });

    it("records unknown with no verifiable signal", async () => {
        await seedSkill("demo");
        await seedLedger([
            JSON.stringify({ ts: 1000, skill: "demo", session_id: "s1" }),
        ]);
        await runHook('{"session_id":"s1","stop_reason":"end_turn"}');
        const history = await readFile(
            join(workDir, "skills", "demo", "run-history.jsonl"),
            "utf-8",
        );
        expect(JSON.parse(history.trim()).outcome).toBe("unknown");
    });

    it("ignores sessions not in the ledger", async () => {
        await seedSkill("demo");
        await seedLedger([
            JSON.stringify({ ts: 1000, skill: "demo", session_id: "s1" }),
        ]);
        await runHook('{"session_id":"other"}');
        expect(
            existsSync(join(workDir, "skills", "demo", "run-history.jsonl")),
        ).toBe(false);
    });

    it("skips skills without a directory and path escapes", async () => {
        await seedSkill("demo");
        await seedLedger([
            JSON.stringify({ ts: 1000, skill: "ghost", session_id: "s1" }),
            JSON.stringify({ ts: 1000, skill: "../escape", session_id: "s1" }),
            JSON.stringify({ ts: 1000, skill: "demo", session_id: "s1" }),
        ]);
        await runHook('{"session_id":"s1","stop_reason":"end_turn"}');
        const history = await readFile(
            join(workDir, "skills", "demo", "run-history.jsonl"),
            "utf-8",
        );
        expect(history.trim().split("\n")).toHaveLength(1);
    });
});
