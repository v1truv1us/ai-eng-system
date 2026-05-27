---
name: claude-agent-sdk
description: Build agent workflows with the Claude/Anthropic SDK. Use when creating Claude-powered workflow runners, multi-step research/review/fix loops, streaming, tool-use, retries, or mirroring agents/research-runner/anthropic.
metadata:
  version: 1.0.0
  tags: agent-sdk, claude, anthropic, workflow-runner
---

# Claude / Anthropic Agent SDK

Use this skill when implementing a Claude-backed workflow runner. Keep skills as policy/context; put durable workflow behavior in code: schemas, state files, retries, verification, and artifacts.

## Local examples

Start from the existing runner shape:

- `agents/research-runner/anthropic/runner.ts`
- `agents/research-runner/anthropic/runner.py`
- `agents/research-runner/shared/templates.ts`
- `agents/research-runner/shared/output.ts`

## Workflow adapter contract

Every Claude runner should expose the same harness-neutral contract as the other SDK variants:

```ts
type WorkflowInput = {
  goal: string;
  cwd?: string;
  templates?: string[];
  maxIterations?: number;
  statePath?: string;
};

type WorkflowResult = {
  status: "success" | "blocked" | "failed";
  summary: string;
  artifacts: string[];
  nextSteps?: string[];
};
```

## Implementation rules

1. **Use Claude for judgment, not control flow.** Deterministic code owns phase transitions, retries, file writes, and stop conditions.
2. **Make runs resumable.** Store run ID, phase, attempt count, model, input, artifacts, and last verified commit in a state file.
3. **Separate prompts from runner code.** Put reusable system/task prompts under `prompts/` or shared template modules.
4. **Use structured outputs where possible.** Ask Claude for JSON handoffs when the runner needs to parse decisions.
5. **Stream for UX, persist final artifacts.** Do not depend on streamed text as the only record of a run.
6. **Handle rate limits and transient errors.** Use bounded exponential backoff and fail loud with the exact phase that failed.
7. **Verify with real commands.** When the workflow changes code, run the configured gates and include command output paths in the result.

## Good fits

- Research synthesis
- Review synthesis
- Planning and decomposition
- Prompt/content transformation
- Policy-heavy workflows where code execution is local and deterministic

## Poor fits

- Direct unattended repo mutation without a separate verification loop
- Long-running PR branch work where Cursor cloud agents are a better fit
- Harness-specific plugin installation; keep that in the CLI installer
