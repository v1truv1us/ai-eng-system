/**
 * Pi CLI driver — spawns `pi -p prompt --mode json` and unwraps the result.
 */

import { spawn } from "node:child_process";
import { type Driver, type DriverConfig, DriverError } from "./types.js";

const DEFAULT_TIMEOUT_MS = 60_000;

function runPi(prompt: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";

        const child = spawn("pi", ["-p", prompt, "--mode", "json"], {
            stdio: ["ignore", "pipe", "pipe"],
            timeout: timeoutMs,
        });

        child.stdout.on("data", (chunk: Buffer) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        child.on("error", (err) => {
            reject(
                new DriverError(
                    `pi spawn failed: ${err.message}`,
                    "PI_SPAWN",
                    err,
                ),
            );
        });
        child.on("close", (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            } else {
                reject(
                    new DriverError(
                        `pi exited with code ${code}${stderr ? `\nstderr: ${stderr.trim()}` : ""}`,
                        "PI_EXIT",
                    ),
                );
            }
        });

        // Explicit timeout kill
        const timer = setTimeout(() => {
            child.kill("SIGTERM");
            reject(new DriverError("pi timed out", "PI_TIMEOUT"));
        }, timeoutMs + 5_000);

        child.on("close", () => clearTimeout(timer));
    });
}

function unwrapPiOutput(raw: string): string {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
            const record = parsed as Record<string, unknown>;
            return (
                (typeof record.content === "string"
                    ? record.content
                    : undefined) ??
                (typeof record.text === "string" ? record.text : undefined) ??
                raw
            );
        }
    } catch {
        // Not JSON; keep raw output.
    }
    return raw;
}

export function createDriver(config?: DriverConfig): Driver {
    const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    return {
        async runPrompt(prompt: string): Promise<string> {
            const raw = await runPi(prompt, timeoutMs);
            return unwrapPiOutput(raw).trim() || "(no report)";
        },
    };
}
