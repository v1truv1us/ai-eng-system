---
name: gemini-agent-sdk
description: Build Gemini-backed agent workflows and adapters. Use for Google Gemini API/ADK-style runners, Gemini CLI workflow parity, tool calling, structured outputs, or adding a Gemini variant beside Cursor/OpenCode/Claude runners.
metadata:
  version: 1.0.0
  tags: agent-sdk, gemini, google, workflow-runner
---

# Gemini Agent SDK / Gemini Workflow Adapter

Use this skill when implementing a Gemini-backed runner for a workflow that also exists for Cursor, OpenCode, Claude, or OpenAI. This repo currently packages Gemini CLI skills/commands, so a Gemini workflow adapter should be added deliberately and kept compatible with the shared workflow contract.

## Local references

- `docs/gemini-cli-setup.md` documents current Gemini CLI packaging.
- `agents/research-runner/` shows the multi-runtime runner pattern to mirror.
- `agents/research-runner/shared/` should hold reusable prompts, templates, and output code.

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
  safetyNotes?: string[];
};
```

## Implementation rules

1. **Use official Gemini docs for current SDK names and APIs.** Do not rely on memory for package names, auth, tool-calling, or streaming semantics.
2. **Mirror the existing runner layout.** Add `agents/<workflow>/gemini/runner.ts` or equivalent beside the other harness variants.
3. **Keep CLI packaging separate.** `.gemini/skills` and `.gemini/commands` are distribution assets; SDK workflow runners are executable code.
4. **Use structured responses for machine decisions.** Parse JSON for handoffs, verdicts, and next actions.
5. **Treat safety blocks as workflow states.** Return `blocked` with the exact model/safety reason instead of retrying blindly.
6. **Verify claims outside the model.** File checks, git checks, and test commands belong to deterministic runner code.
7. **Keep prompts shared.** Only put Gemini-specific prompt adaptations in the Gemini adapter.

## Good fits

- Research and synthesis variants
- Provider comparison workflows
- Workflows where Gemini is selected by model policy

## Poor fits

- Repo mutation without a local verification harness
- Assuming Gemini CLI skills are the same thing as a Gemini SDK runner
