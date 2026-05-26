---
name: openai-agents-sdk
description: Build agent workflows with the OpenAI Agents SDK or Codex-style runner. Use for OpenAI-backed workflow adapters, handoffs, tool calling, research runners, or mirroring agents/research-runner/codex.
metadata:
  version: 1.0.0
  tags: agent-sdk, openai, codex, workflow-runner
---

# OpenAI Agents SDK / Codex Runner

Use this skill when implementing an OpenAI-backed workflow adapter. Keep the runner provider-specific, but keep workflow schemas and artifact contracts shared with the other harnesses.

## Local examples

- `agents/research-runner/codex/runner.ts`
- `agents/research-runner/codex/runner.py`
- `agents/research-runner/codex/README.md`
- `agents/research-runner/shared/templates.ts`

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
  handoffs?: unknown[];
};
```

## Implementation rules

1. **Keep provider code thin.** Shared workflow logic belongs in `shared/`; OpenAI-specific code belongs in the OpenAI/Codex runner.
2. **Use explicit tool boundaries.** Register only the tools the workflow needs. Prefer deterministic local code for git, files, commands, polling, and parsing.
3. **Persist handoffs.** Agent handoffs should be JSON files or structured records, not only chat text.
4. **Model selection is configuration.** Read model/env settings from flags or workflow config; do not hardcode except for documented fallbacks.
5. **Fail loud on auth.** Detect missing/expired credentials before starting the workflow loop.
6. **Bound autonomy.** Use max turns, max retries, and explicit blocked states.
7. **Cross-check artifacts.** If the model claims it wrote a file or fixed a bug, verify with filesystem reads or commands.

## Good fits

- Research runner variants
- Synthesis and classification steps
- Provider comparison/evaluation workflows
- Tool-calling demos that should not depend on a coding-agent harness

## Poor fits

- First-choice repo editing when Cursor/OpenCode can run against the repo with richer coding-agent context
- Unbounded autonomous loops without a deterministic state machine
