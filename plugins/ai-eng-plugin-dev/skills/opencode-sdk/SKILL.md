---
name: opencode-sdk
description: Build local agent workflows with the OpenCode SDK. Use when creating OpenCode-backed runners, Ralph loops, local repo automation, prompt sessions, retries, or mirroring agents/research-runner/opencode.
metadata:
  version: 1.0.0
  tags: agent-sdk, opencode, workflow-runner
---

# OpenCode SDK

Use this skill when implementing a local OpenCode workflow runner. OpenCode is best for workflows that run against the user's current machine, files, tools, and installed credentials.

## Local examples

- `agents/research-runner/opencode/runner.ts`
- `packages/cli/src/backends/opencode/client.ts`
- `packages/cli/src/execution/ralph-loop.ts`

## Workflow adapter contract

Shared types: `agents/research-runner/shared/workflow-contract.ts` (`WorkflowInput`, `WorkflowResult`).

The reference **research-runner** uses CLI args today; `packages/cli/src/execution/ralph-loop.ts` is the richer loop runner. New OpenCode workflows should use the shared contract for status, artifacts, and resume.

## Implementation rules

1. **Prefer OpenCode for local loops.** Ralph, verify/fix cycles, local code review, and compatibility scans fit well.
2. **Runner owns the loop.** Do not ask the model to decide whether to continue without deterministic guards such as max iterations, stuck thresholds, and completion tokens.
3. **Capture all session IDs.** Persist session identifiers, prompt IDs, phase, model, and last output path.
4. **Use repo-native verification.** Run configured commands (`bun`, `pnpm`, `go`, `cargo`, etc.) outside the model and feed failures back as input.
5. **Make output parseable.** Request structured handoffs for machine decisions; keep prose for user reports.
6. **Treat SDK/server versions as compatibility-sensitive.** Check package versions and fail loudly on known mismatches.
7. **Avoid hidden global state.** Pass cwd, model, permissions, and env expectations explicitly.

## Good fits

- `ralph` loop runner
- `check-agent-compatibility`
- local `review`
- local `research`
- local `fix-ci` when pushing is allowed

## Poor fits

- Cloud branch/PR work where Cursor cloud agents should own isolated execution
- Workflows that require browser-hosted UI control unless paired with a separate control harness
