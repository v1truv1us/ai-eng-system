# Cursor SDK Reference

## Installation

```bash
npm install @cursor/sdk
```

Requires Node.js 18+. The SDK ships TypeScript types.

## Authentication

Set `CURSOR_API_KEY` in environment or `.env`:

```bash
export CURSOR_API_KEY="..."
```

Create a key from [Cursor Dashboard > Integrations](https://cursor.com/dashboard/integrations).
Must be a **personal/user key**, not an org key.

## Core API

### Create and Prompt an Agent

```ts
import "dotenv/config";
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY,
  model: { id: "composer-2.5" },
  local: { cwd: process.cwd() },
});

const run = await agent.send("Explain the auth module");
let text = "";
for await (const event of run.stream()) {
  const chunk = parseCursorEvent(event);
  if (chunk) text += chunk;
}
console.log(text);

await agent[Symbol.asyncDispose]();
```

### Event Parsing

The SDK emits heterogeneous stream events. Centralize parsing:

```ts
export function parseCursorEvent(event: unknown): string | undefined {
  if (!event || typeof event !== "object") return undefined;
  const e = event as Record<string, unknown>;

  if (typeof e["text"] === "string") return e["text"];
  if (e["type"] === "text" && typeof e["content"] === "string")
    return e["content"];
  if (e["type"] === "message" && typeof e["text"] === "string")
    return e["text"];
  if (typeof e["delta"] === "string") return e["delta"];

  return undefined;
}
```

### Cloud Agents (Multi-Repo)

```ts
const agent = await Agent.create({
  apiKey,
  model: { id: "composer-2.5" },
  cloud: {
    repos: ["owner/repo-a", "owner/repo-b"],
  },
});
```

### Timeout / Abort

```ts
const ac = new AbortController();
setTimeout(() => ac.abort(), 60_000);

const run = await agent.send(prompt);
for await (const event of run.stream()) {
  if (ac.signal.aborted) break;
  // ...
}
```

### Resume a Session

```ts
const agent = await Agent.resume(sessionId, { apiKey });
const continued = await agent.send("Now refactor the tests");
```

## Model IDs

| Model | Use Case |
|-------|----------|
| `composer-2.5` | Full-featured, reasoning tasks |
| `composer-mini` | Fast, lightweight tasks |

## Error Handling

```ts
try {
  const run = await agent.send(prompt);
  // ...
} catch (err) {
  // Auth errors: invalid/expired key
  // Rate limits: 429
  // Timeout: use AbortController
}
```

## Patterns

### Agent with Tools

```ts
const agent = await Agent.create({
  apiKey,
  model: { id: "composer-2.5" },
  local: { cwd: projectDir },
  tools: ["file_search", "code_edit"],
});
```

### Multi-Agent Handoff

```ts
// Planner agent
const planner = await Agent.create({
  apiKey,
  model: { id: "composer-2.5" },
  local: { cwd: process.cwd() },
});

const planResult = await agent.send("Create a plan for: " + goal);

// Worker agent
const worker = await Agent.create({
  apiKey,
  model: { id: "composer-2.5" },
  local: { cwd: process.cwd() },
});

const workResult = await worker.send(
  `Execute this plan:\n${planResult}`
);

await planner[Symbol.asyncDispose]();
await worker[Symbol.asyncDispose]();
```

## Traps

- `Agent.create()` is async — always `await` it.
- Agents are disposable — call `agent[Symbol.asyncDispose]()` when done.
- Stream events are **not** uniform. Use `parseCursorEvent` to extract text.
- Cloud agents require `repos` param; local agents require `cwd`.
- `CURSOR_API_KEY` must be a user key, not an org key.

## Official Docs

https://docs.cursor.com/tools/sdk
