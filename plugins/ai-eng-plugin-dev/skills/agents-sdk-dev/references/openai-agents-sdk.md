# OpenAI Agents SDK Reference

## Installation

```bash
# TypeScript
npm install @openai/agents

# Python
pip install openai-agents
```

## Authentication

Set `OPENAI_API_KEY` or use OAuth tokens:

```bash
export OPENAI_API_KEY="sk-..."
```

For Codex CLI workflows, tokens live in `~/.pi/agent/auth.json` with automatic
refresh via `auth.openai.com/oauth/token`.

## Core API (TypeScript)

### Basic Agent

```ts
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "MyAgent",
  instructions: "You are a helpful assistant.",
  model: "gpt-5.4",
});

const result = await run(agent, "Explain this codebase");
console.log(result.finalOutput);
```

### With Tools

```ts
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const readTool = tool({
  name: "read_file",
  description: "Read a file from disk",
  parameters: z.object({ path: z.string() }),
  execute: async ({ path }) => {
    return fs.readFile(path, "utf-8");
  },
});

const agent = new Agent({
  name: "Coder",
  instructions: "You are a coding assistant.",
  model: "gpt-5.4",
  tools: [readTool],
});
```

### Streaming

```ts
const result = await run(agent, prompt, { stream: true });
for await (const event of result.toStream()) {
  // Process streaming events
}
```

### Handoffs (Multi-Agent)

```ts
import { Agent, run, handoff } from "@openai/agents";

const researcher = new Agent({
  name: "Researcher",
  instructions: "Research topics thoroughly.",
  model: "gpt-5.5",
});

const writer = new Agent({
  name: "Writer",
  instructions: "Write clear summaries.",
  model: "gpt-5.4",
  handoffs: [handoff(researcher, "Hand off to researcher for deep analysis")],
});
```

### Guardrails

```ts
import { Agent, guard } from "@openai/agents";

const agent = new Agent({
  name: "SafeAgent",
  instructions: "Help with coding tasks.",
  model: "gpt-5.4",
  inputGuards: [
    guard(async (ctx, input) => {
      if (input.includes("malicious")) throw new Error("Blocked");
    }),
  ],
});
```

### Tracing

```ts
import { trace } from "@openai/agents";

const t = trace("my-workflow");
const result = await run(agent, prompt, { trace: t });
```

### Abort / Timeout

```ts
const ac = new AbortController();
setTimeout(() => ac.abort(), 60_000);

const result = await run(agent, prompt, { signal: ac.signal });
```

## OAuth Token Management

For Codex CLI integration, the driver manages OAuth tokens:

```ts
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setDefaultOpenAIKey } from "@openai/agents";

const AUTH_PATH = join(homedir(), ".pi", "agent", "auth.json");
const TOKEN_REFRESH_URL = "https://auth.openai.com/oauth/token";

async function getToken(): Promise<string> {
  const raw = await fs.readFile(AUTH_PATH, "utf-8");
  const store = JSON.parse(raw);
  const entry = store["openai-codex"];

  // Refresh 60s before expiry
  if (Date.now() >= entry.expires - 60_000) {
    const res = await fetch(TOKEN_REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: entry.refresh,
        client_id: "app_EMoamEEZ73f0CkXaXp7hrann",
      }),
    });
    const refreshed = await res.json();
    entry.access = refreshed.access_token;
    entry.refresh = refreshed.refresh_token ?? entry.refresh;
    entry.expires = Date.now() + refreshed.expires_in * 1000;
    // Atomic write back
    await fs.writeFile(AUTH_PATH, JSON.stringify(store, null, 2));
  }

  return entry.access;
}

// Use token
const token = await getToken();
setDefaultOpenAIKey(token);
```

## Model IDs

| Model | Use Case |
|-------|----------|
| `gpt-5.4-mini` | Fast, lightweight tasks |
| `gpt-5.4` | General purpose |
| `gpt-5.5` | Heavy reasoning, planning |

## Error Handling

```ts
try {
  const result = await run(agent, prompt);
} catch (err) {
  // Auth: 401, invalid key
  // Rate limit: 429
  // Timeout: AbortController signal
  // Model: model not found
}
```

## Traps

- `run()` returns a result object — access `result.finalOutput` for the text.
- `setDefaultOpenAIKey()` sets the key globally. Call before any `run()`.
- OAuth tokens expire — always check and refresh before use.
- Tool `execute` functions run locally; they are not sent to the API.
- Handoff agents need `handoff()` wrapper — don't pass agents directly.
- Guard functions throw to block; they don't return boolean.

## Official Docs

https://openai.github.io/openai-agents-python/
