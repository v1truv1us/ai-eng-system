#!/usr/bin/env tsx
/**
 * OpenAI Agents SDK SEO review runner (codex variant).
 *
 * Usage:
 *   npx tsx runner.ts "https://example.com"
 *   npx tsx runner.ts --agent technical-seo "https://example.com"
 *
 * Authentication: uses your OpenAI OAuth token from ~/.pi/agent/auth.json
 * (same credential as opencode / pi). OPENAI_API_KEY is accepted as a fallback.
 */

import "dotenv/config";
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { buildPrompt, parseArgs, writeReport } from "../shared/prompt.ts";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
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

async function getOpenAIToken(): Promise<string> {
  const raw = await fs.readFile(AUTH_PATH, "utf-8");
  const store = JSON.parse(raw) as AuthStore;
  const entry = store["openai-codex"];

  if (!entry?.access) {
    throw new Error(`No openai-codex entry found in ${AUTH_PATH}`);
  }

  if (Date.now() >= entry.expires - 60_000) {
    console.error("OAuth token expiring soon — refreshing…");
    const res = await fetch(TOKEN_REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: entry.refresh,
        client_id: CLIENT_ID,
      }),
    });

    if (!res.ok) {
      throw new Error(`Token refresh failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as RefreshResponse;
    entry.access = data.access_token;
    if (data.refresh_token) entry.refresh = data.refresh_token;
    if (data.expires_in) entry.expires = Date.now() + data.expires_in * 1000;

    store["openai-codex"] = entry;
    await fs.writeFile(AUTH_PATH, JSON.stringify(store, null, 2), "utf-8");
  }

  return entry.access;
}

async function main(): Promise<void> {
  let apiKey: string;
  try {
    apiKey = await getOpenAIToken();
    console.error("Using OpenAI OAuth token from ~/.pi/agent/auth.json");
  } catch (oauthErr) {
    const fallback = process.env.OPENAI_API_KEY?.trim();
    if (!fallback) {
      console.error(
        "Error: OAuth token unavailable and OPENAI_API_KEY is not set.\n" +
          `  OAuth error: ${oauthErr instanceof Error ? oauthErr.message : String(oauthErr)}`,
      );
      process.exit(1);
    }
    console.error("OAuth token unavailable — falling back to OPENAI_API_KEY.");
    apiKey = fallback;
  }

  setDefaultOpenAIKey(apiKey);

  const { url, agent: agentInstruction } = parseArgs();
  if (!url) {
    console.error('Usage: npx tsx runner.ts [--agent technical-seo] "https://example.com"');
    process.exit(1);
  }

  const prompt = buildPrompt(url, agentInstruction);
  console.error(`Running SEO review via OpenAI Agents SDK (${MODEL}) for ${url}…`);

  const seoAgent = new Agent({
    name: "SEOReviewer",
    instructions: "You are an expert SEO analyst. Provide thorough, actionable SEO reviews.",
    model: MODEL,
  });

  const result = await run(seoAgent, prompt);
  const report = (result.finalOutput as string | undefined) ?? "(no text response)";

  const reportPath = writeReport(url, report.trim() || "(no report)", "codex");
  console.error(`SEO review written to: ${reportPath}`);
  console.log(report);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
