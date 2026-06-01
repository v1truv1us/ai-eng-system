# Pi CLI Bridge Reference

Pi does not ship a traditional SDK. It exposes a CLI (`pi`) that can be
driven programmatically via subprocess spawning, and in-session subagent tools
for orchestrating work within a running Pi session.

## There Is No SDK Package

Pi is driven via:

1. **CLI subprocess**: `pi -p "prompt"` — spawn as a child process
2. **In-session MCP tools**: `Agent`, `crew_agent` — use within a Pi session
3. **Subagent orchestration**: `subagent` tool — delegates to child Pi processes

## CLI Subprocess

### Basic Execution

```ts
import { spawn } from "node:child_process";

function runPi(prompt: string, timeoutMs = 60_000): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = spawn("pi", ["-p", prompt, "--mode", "json"], {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
    });

    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`pi exited ${code}: ${stderr.trim()}`));
    });

    // Explicit timeout kill
    setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("pi timed out"));
    }, timeoutMs + 5_000);
  });
}
```

### Output Parsing

Pi with `--mode json` returns structured JSON. Unwrap it:

```ts
function unwrapPiOutput(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed.content ?? parsed.text ?? raw;
    }
  } catch {
    // Not JSON; return raw output
  }
  return raw;
}
```

### CLI Flags

| Flag | Purpose |
|------|---------|
| `-p, --prompt` | Non-interactive prompt (no TUI) |
| `--mode json` | JSON-structured output |
| `--model` | Override model (e.g., `gpt-5.5`, `kimi-k2.6`) |
| `--cwd` | Working directory |
| `--skill` | Load a specific skill |
| `--no-skills` | Disable auto skill loading |

## In-Session Subagent Tools

When running inside a Pi session, you have access to subagent tools that
delegate work to child processes:

### Agent Tool

```ts
// Launch a focused subagent
const result = await Agent({
  prompt: "Review the auth module for security issues",
  description: "Security review",
  subagent_type: "security-reviewer",
  run_in_background: true,  // Parallel work
});

// Retrieve result
const output = await get_subagent_result({
  agent_id: result.agent_id,
  wait: true,
});
```

### Crew Agent Tool

```ts
const result = await crew_agent({
  prompt: "Analyze the codebase structure",
  description: "Codebase analysis",
  subagent_type: "explorer",
});
```

### Subagent Types

| Type | Purpose |
|------|---------|
| `explorer` | Fast codebase discovery |
| `planner` | Execution planning |
| `executor` | Code implementation |
| `reviewer` | Code review |
| `verifier` | Verification |
| `writer` | Documentation |
| `security-reviewer` | Security analysis |
| `test-engineer` | Test strategy |

### Steering

```ts
// Send guidance to a running subagent
await steer_subagent({
  agent_id: agentId,
  message: "Focus on the authentication module specifically",
});
```

## Team Orchestration

Pi supports team-based orchestration via the `team` tool:

```ts
// Run implementation team
await team({
  action: "run",
  team: "implementation",
  goal: "Add OAuth2 support to the auth module",
  async: true,
});

// Check status
await team({ action: "status", runId: "..." });

// Parallel research
await team({
  action: "parallel",
  tasks: [
    { agent: "explorer", task: "Map the auth module" },
    { agent: "analyst", task: "Analyze OAuth patterns" },
  ],
});
```

## Error Handling

```ts
try {
  const result = await runPi(prompt);
  return unwrapPiOutput(result);
} catch (err) {
  // Spawn errors: pi not found, permission denied
  // Exit code errors: non-zero exit
  // Timeout: SIGTERM kill
  // Parse errors: malformed JSON output
}
```

## Patterns

### Iterative Workflow

```ts
async function iterativePi(goal: string, maxIterations = 5): Promise<string> {
  let result = "";
  let context = "";

  for (let i = 0; i < maxIterations; i++) {
    const prompt = `${goal}\n\nPrevious context: ${context}`;
    result = await runPi(prompt);
    context += `\n[Iteration ${i + 1}]: ${result}`;

    // Check if done (parse result for completion signal)
    if (result.includes("DONE") || result.includes("COMPLETE")) break;
  }

  return result;
}
```

### Parallel Subagents

```ts
// Launch multiple agents in parallel
const agents = await Promise.all([
  Agent({
    prompt: "Review security",
    description: "Security review",
    subagent_type: "security-reviewer",
    run_in_background: true,
  }),
  Agent({
    prompt: "Review performance",
    description: "Perf review",
    subagent_type: "reviewer",
    run_in_background: true,
  }),
]);

// Collect results
const results = await Promise.all(
  agents.map((a) => get_subagent_result({ agent_id: a.agent_id, wait: true }))
);
```

## Traps

- **No npm package** — Pi is a CLI tool, not an importable SDK.
- **Subprocess only** — all communication via stdout/stderr.
- **`--mode json`** recommended — otherwise output is plain text with ANSI codes.
- **No streaming** — the CLI returns the full response when done.
- **Timeout is essential** — Pi can run for minutes on complex tasks.
- **In-session tools only work inside Pi** — can't call `Agent` from a standalone script.
- **Background agents need `run_in_background: true`** — otherwise they block.

## Local Examples

- Driver: `agents/runner-shared/drivers/pi.ts`
- Runner: `agents/research-runner/pi/runner.ts`
