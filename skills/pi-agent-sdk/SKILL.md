---
name: pi-agent-sdk
description: Build Pi-backed agent workflow adapters. Use when driving Pi from scripts, creating runners that mirror agents/research-runner/pi, integrating Pi subagents, or adding Pi parity for workflow SDK runners.
metadata:
  version: 1.0.0
  tags: agent-sdk, pi, workflow-runner
---

# Pi Agent Workflow Adapter

Use this skill when implementing a workflow runner that executes through Pi. Pi can be driven as a CLI bridge and can also delegate through subagents when available. Keep the workflow's state machine in code; use Pi for model/tool execution.

## Local examples

- `agents/research-runner/pi/runner.ts`
- `agents/research-runner/pi/README.md`
- `agents/research-runner/shared/templates.ts`
- `agents/research-runner/shared/output.ts`

## Workflow adapter contract

```ts
type WorkflowInput = {
  goal: string;
  cwd?: string;
  model?: string;
  maxTurns?: number;
  statePath?: string;
};

type WorkflowResult = {
  status: "success" | "blocked" | "failed";
  summary: string;
  artifacts: string[];
  piSession?: string;
};
```

## Implementation rules

1. **Treat Pi as a harness adapter.** Shared workflow logic belongs outside the Pi runner.
2. **Use explicit cwd and paths.** Never rely on the process starting in the intended repo unless the runner sets it.
3. **Capture stdout/stderr and exit codes.** Persist them as artifacts for debugging and resume.
4. **Avoid unbounded subprocesses.** Set timeouts and return `blocked` or `failed` with the exact command that hung.
5. **Respect resource pressure.** Pi workflows should default to conservative concurrency and avoid parallel fanout unless requested.
6. **Use subagents deliberately.** Delegate only when the workflow benefits from independent context or verification.
7. **Verify outside self-report.** Check generated files, git state, and commands directly.

## Good fits

- Local research runner parity
- Conservative workflow orchestration inside Pi
- Verification or review workflows that should reuse Pi's tools and skills

## Poor fits

- High-fanout runs on memory-constrained systems
- Workflows requiring hosted cloud PR execution; Cursor cloud agents are usually a better fit
