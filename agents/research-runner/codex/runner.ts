/**
 * OpenAI Agents SDK research runner (codex variant).
 *
 * Runs all query templates in parallel against a single research question,
 * then writes a brief to the vault's wiki/briefs/ directory.
 *
 * Usage:
 *   npx tsx runner.ts "your research question"
 *   npx tsx runner.ts --templates A1,M1 "targeted question"
 *
 * Authentication: uses your OpenAI OAuth token from ~/.pi/agent/auth.json
 * (same credential as opencode / pi). OPENAI_API_KEY is accepted as a fallback.
 */

import "dotenv/config";
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { loadTemplates, type QueryTemplate } from "../shared/templates.ts";
import {
  synthesize,
  writeBrief,
  type TemplateResult,
} from "../shared/output.ts";

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
  expires: number; // milliseconds timestamp
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
 * Returns a valid OpenAI JWT access token from ~/.pi/agent/auth.json.
 * Transparently refreshes the token when it is within 60 seconds of expiry
 * and persists the new tokens back to the auth file.
 */
async function getOpenAIToken(): Promise<string> {
  const raw = await fs.readFile(AUTH_PATH, "utf-8");
  const store = JSON.parse(raw) as AuthStore;
  const entry = store["openai-codex"];

  if (!entry?.access) {
    throw new Error(`No openai-codex entry found in ${AUTH_PATH}`);
  }

  // Refresh 1 minute early to avoid mid-request expiry
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
      throw new Error(
        `Token refresh failed (${res.status}): ${await res.text()}`,
      );
    }

    const refreshed = (await res.json()) as RefreshResponse;
    entry.access = refreshed.access_token;
    if (refreshed.refresh_token) entry.refresh = refreshed.refresh_token;
    if (refreshed.expires_in) {
      entry.expires = Date.now() + refreshed.expires_in * 1_000;
    }
    store["openai-codex"] = entry;
    await fs.writeFile(AUTH_PATH, JSON.stringify(store, null, 2), "utf-8");
    console.error("Token refreshed and saved.");
  }

  return entry.access;
}

async function runTemplate(
  systemPrompt: string,
  template: QueryTemplate,
  query: string,
  agentInstruction: string | undefined,
): Promise<TemplateResult> {
  const agentPrompt = agentInstruction ? `\n\nAgent instruction: ${agentInstruction}` : "";
  const agent = new Agent({
    name: `ResearchRunner-${template.id}`,
    instructions: `${systemPrompt}${agentPrompt}`,
    model: MODEL,
  });

  const prompt = `${template.text}\n\nQuery context: ${query}`;
  const result = await run(agent, prompt);
  const text = (result.finalOutput as string | undefined) ?? "(no text response)";

  return { id: template.id, name: template.name, text };
}

function parseArgs(): { query: string; templateFilter: string[]; agent?: string } {
  const args = process.argv.slice(2);
  let templateFilter: string[] = [];
  let agent = process.env.AI_ENG_AGENT?.trim() || undefined;
  const rest: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--templates") {
      templateFilter = (args[++i] ?? "").split(",").filter(Boolean);
    } else if (args[i] === "--agent") {
      agent = args[++i]?.trim() || agent;
    } else {
      rest.push(args[i]);
    }
  }

  const query = rest.join(" ").trim();
  return { query, templateFilter, agent };
}

async function main(): Promise<void> {
  // Prefer the OAuth JWT from ~/.pi/agent/auth.json; fall back to OPENAI_API_KEY.
  let apiKey: string;
  try {
    apiKey = await getOpenAIToken();
    console.error("Using OpenAI OAuth token from ~/.pi/agent/auth.json");
  } catch (oauthErr) {
    const fallback = process.env.OPENAI_API_KEY?.trim();
    if (!fallback) {
      console.error(
        "Error: OAuth token unavailable and OPENAI_API_KEY is not set.\n" +
          `  OAuth error: ${oauthErr instanceof Error ? oauthErr.message : String(oauthErr)}\n` +
          "  Set OPENAI_API_KEY in agents/research-runner/codex/.env as a fallback.",
      );
      process.exit(1);
    }
    console.error("OAuth token unavailable — falling back to OPENAI_API_KEY.");
    apiKey = fallback;
  }

  setDefaultOpenAIKey(apiKey);

  const { query, templateFilter, agent } = parseArgs();
  if (!query) {
    console.error(
      'Usage: npx tsx runner.ts [--templates A1,M2] "research question"',
    );
    process.exit(1);
  }

  const data = loadTemplates();
  const templates =
    templateFilter.length > 0
      ? data.templates.filter((t) => templateFilter.includes(t.id))
      : data.templates;

  if (templates.length === 0) {
    console.error(`No templates matched: ${templateFilter.join(",")}`);
    process.exit(1);
  }

  console.error(
    `Running ${templates.length} template(s) in parallel via OpenAI Agents SDK (${MODEL})…`,
  );

  const results = await Promise.all(
    templates.map((t) => runTemplate(data.systemPrompt, t, query, agent)),
  );

  const synthesis = await synthesize(query, results);
  const briefPath = writeBrief(query, results, "codex", synthesis);
  console.error(`Brief written to: ${briefPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
