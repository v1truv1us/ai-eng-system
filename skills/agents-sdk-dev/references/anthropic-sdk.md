# Anthropic Agent SDK Reference

## Installation

```bash
# TypeScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install claude-agent-sdk
```

## Authentication

Set the `ANTHROPIC_API_KEY` environment variable. Create one at
https://console.anthropic.com/settings/keys

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Core API (TypeScript)

### Basic Query

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Explain this codebase",
  options: { allowedTools: [] },
})) {
  if ("result" in message && typeof message.result === "string") {
    console.log(message.result);
  }
}
```

### With Tools

```ts
for await (const message of query({
  prompt: "Read the main config file",
  options: {
    allowedTools: ["read_file", "list_directory"],
  },
})) {
  // Handle streaming messages
}
```

### Abort / Timeout

```ts
const ac = new AbortController();
setTimeout(() => ac.abort(), 60_000);

for await (const message of query({
  prompt,
  options: { allowedTools: [] },
  signal: ac.signal,
})) {
  if (ac.signal.aborted) break;
}
```

## Core API (Python)

```python
import claude_agent_sdk

result = claude_agent_sdk.query(
    prompt="Explain this codebase",
    options={"allowed_tools": []},
)
for message in result:
    if hasattr(message, "result"):
        print(message.result)
```

## Error Handling

```ts
try {
  for await (const message of query({ prompt, options })) {
    // ...
  }
} catch (err) {
  if (err instanceof Error) {
    // Rate limit: 429
    // Auth: 401
    // Server: 5xx
    // Abort: aborted signal
  }
}
```

## Patterns

### Streaming Agent Loop

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

async function agentLoop(goal: string): Promise<string> {
  let result = "";
  for await (const msg of query({
    prompt: goal,
    options: { allowedTools: ["read_file", "write_file", "bash"] },
  })) {
    if ("result" in msg && typeof msg.result === "string") {
      result = msg.result;
    }
  }
  return result;
}
```

### Multi-Turn with State

```ts
// Maintain conversation state across turns
const state = { context: "", iteration: 0 };

async function iterate(goal: string): Promise<string> {
  state.iteration++;
  const prompt = `${goal}\n\nContext so far: ${state.context}`;
  const result = await agentLoop(prompt);
  state.context += `\n[Turn ${state.iteration}]: ${result}`;
  return result;
}
```

## Traps

- `query()` returns an `AsyncIterable`, not a Promise. Use `for await`.
- No `Agent.create()` — Anthropic uses `query()` as the entry point.
- Tool names must match exactly. Check SDK docs for available tools.
- API key must be in `ANTHROPIC_API_KEY` env var; no inline key option.

## Official Docs

https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk
