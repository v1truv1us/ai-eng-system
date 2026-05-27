/**
 * Anthropic Claude Agent SDK driver.
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { type Driver, type DriverConfig, DriverError } from "./types.js";

const DEFAULT_TIMEOUT_MS = 60_000;

export function createDriver(config?: DriverConfig): Driver {
    return {
        async runPrompt(prompt: string): Promise<string> {
            let result = "(no text response)";

            const ac = new AbortController();
            const timer = setTimeout(
                () =>
                    ac.abort(
                        new DriverError(
                            "Anthropic query timed out",
                            "ANTHROPIC_TIMEOUT",
                        ),
                    ),
                config?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
            );

            try {
                for await (const message of query({
                    prompt,
                    options: { allowedTools: [] },
                })) {
                    if (ac.signal.aborted) break;
                    if (
                        "result" in message &&
                        typeof message.result === "string"
                    ) {
                        result = message.result;
                    }
                }
            } catch (err) {
                throw new DriverError(
                    `Anthropic query failed: ${err instanceof Error ? err.message : String(err)}`,
                    "ANTHROPIC_ERROR",
                    err,
                );
            } finally {
                clearTimeout(timer);
            }

            return result;
        },
    };
}
