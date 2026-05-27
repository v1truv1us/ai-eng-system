/**
 * Cursor SDK driver.
 */

import "dotenv/config";
import { Agent } from "@cursor/sdk";
import { DriverError, type Driver, type DriverConfig } from "./types.js";

const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Extract text from a Cursor stream event.
 * Centralises the ad-hoc event parsing so there's one place to update
 * when the SDK event shapes change.
 */
export function parseCursorEvent(event: unknown): string | undefined {
  if (!event || typeof event !== "object") return undefined;
  const e = event as Record<string, unknown>;

  if (typeof e["text"] === "string") return e["text"];
  if (e["type"] === "text" && typeof e["content"] === "string") return e["content"];
  if (e["type"] === "message" && typeof e["text"] === "string") return e["text"] as string;
  if (typeof e["delta"] === "string") return e["delta"];

  return undefined;
}

export function createDriver(config?: DriverConfig): Driver {
  const apiKey = config?.apiKey ?? process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new DriverError(
      "CURSOR_API_KEY is not set. Add it to your environment or .env file.",
      "CURSOR_AUTH",
    );
  }

  let agent: Agent | null = null;
  const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async runPrompt(prompt: string): Promise<string> {
      agent = await Agent.create({
        apiKey,
        model: { id: config?.model ?? "composer-2" },
        local: { cwd: process.cwd() },
      });

      try {
        const run = await agent.send(prompt);
        let text = "";

        const ac = new AbortController();
        const timer = setTimeout(
          () => ac.abort(new DriverError("Cursor stream timed out", "CURSOR_TIMEOUT")),
          timeoutMs,
        );

        for await (const event of run.stream()) {
          if (ac.signal.aborted) break;
          const chunk = parseCursorEvent(event);
          if (chunk) text += chunk;
        }

        clearTimeout(timer);
        return text.trim() || "(no text response)";
      } catch (err) {
        throw new DriverError(
          `Cursor query failed: ${err instanceof Error ? err.message : String(err)}`,
          "CURSOR_ERROR",
          err,
        );
      }
    },

    async close(): Promise<void> {
      if (agent) {
        await agent[Symbol.asyncDispose]();
        agent = null;
      }
    },
  };
}
