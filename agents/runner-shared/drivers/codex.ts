/**
 * Codex / OpenAI Agents SDK driver with OAuth token refresh.
 */

import "dotenv/config";
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { DriverError, type Driver, type DriverConfig } from "./types.js";

const DEFAULT_TIMEOUT_MS = 60_000;
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

// ---------------------------------------------------------------------------
// OAuth token management
// ---------------------------------------------------------------------------

const AUTH_PATH = join(homedir(), ".pi", "agent", "auth.json");
const TOKEN_REFRESH_URL = "https://auth.openai.com/oauth/token";
const CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";

interface OAuthEntry {
  type: string;
  access: string;
  refresh: string;
  expires: number;
}

interface AuthStore {
  "openai-codex": OAuthEntry;
  [key: string]: unknown;
}

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * Atomically write a file: write to a temp file next to the target, then rename.
 */
async function atomicWriteFile(filePath: string, data: string): Promise<void> {
  const dir = dirname(filePath);
  const tmpPath = join(dir, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.writeFile(tmpPath, data, "utf-8");
  await fs.rename(tmpPath, filePath);
}

/**
 * Returns a valid OpenAI JWT access token from ~/.pi/agent/auth.json.
 * Transparently refreshes the token when within 60 seconds of expiry
 * and persists the new tokens back atomically.
 */
async function getOpenAIToken(): Promise<string> {
  const raw = await fs.readFile(AUTH_PATH, "utf-8");
  const store = JSON.parse(raw) as AuthStore;
  const entry = store["openai-codex"];

  if (!entry?.access) {
    throw new DriverError(`No openai-codex entry found in ${AUTH_PATH}`, "CODEX_AUTH");
  }

  // Refresh 1 minute early to avoid mid-request expiry
  if (Date.now() >= entry.expires - 60_000) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 30_000);

    const res = await fetch(TOKEN_REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: entry.refresh,
        client_id: CLIENT_ID,
      }),
      signal: ac.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new DriverError(
        `Token refresh failed (${res.status}): ${await res.text()}`,
        "CODEX_REFRESH",
      );
    }

    const refreshed = (await res.json()) as RefreshResponse;
    entry.access = refreshed.access_token;
    if (refreshed.refresh_token) entry.refresh = refreshed.refresh_token;
    if (refreshed.expires_in) {
      entry.expires = Date.now() + refreshed.expires_in * 1_000;
    }
    store["openai-codex"] = entry;
    await atomicWriteFile(AUTH_PATH, JSON.stringify(store, null, 2));
  }

  return entry.access;
}

export function createDriver(config?: DriverConfig): Driver {
  let apiKey: string | undefined;

  return {
    async runPrompt(prompt: string): Promise<string> {
      if (!apiKey) {
        try {
          apiKey = await getOpenAIToken();
        } catch (oauthErr) {
          const fallback = config?.apiKey ?? process.env.OPENAI_API_KEY?.trim();
          if (!fallback) {
            throw new DriverError(
              `OAuth token unavailable and OPENAI_API_KEY is not set. ` +
                `OAuth error: ${oauthErr instanceof Error ? oauthErr.message : String(oauthErr)}`,
              "CODEX_AUTH",
              oauthErr,
            );
          }
          apiKey = fallback;
        }
        setDefaultOpenAIKey(apiKey);
      }

      const agent = new Agent({
        name: "WorkflowRunner",
        instructions: "You are an expert workflow runner.",
        model: config?.model ?? MODEL,
      });

      const ac = new AbortController();
      const timer = setTimeout(
        () => ac.abort(new DriverError("Codex query timed out", "CODEX_TIMEOUT")),
        config?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );

      try {
        const result = await run(agent, prompt, { signal: ac.signal });
        clearTimeout(timer);
        return (result.finalOutput as string | undefined) ?? "(no text response)";
      } catch (err) {
        clearTimeout(timer);
        throw new DriverError(
          `Codex query failed: ${err instanceof Error ? err.message : String(err)}`,
          "CODEX_ERROR",
          err,
        );
      }
    },
  };
}
