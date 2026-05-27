---
name: pi-agent-sdk
description: Build Pi-backed agent workflow adapters. Use when driving Pi from scripts, creating runners that mirror agents/research-runner/pi, integrating Pi subagents, or adding Pi parity for workflow SDK runners.
metadata:
  version: 1.0.0
  tags: agent-sdk, pi, workflow-runner
---

# Pi Agent Workflow Adapter

This is **not** a real Pi SDK. Use this skill when implementing a workflow runner that executes through the Pi CLI. Pi can be driven as a CLI bridge and can also delegate through subagents when available. Keep the workflow's state machine in code; use Pi for model/tool execution.

## Local examples

- `agents/research-runner/pi/runner.ts`
- `agents/seo-review-runner/pi/runner.ts`
- `agents/research-runner/pi/README.md`
- `agents/research-runner/shared/templates.ts`
- `agents/research-runner/shared/output.ts`

## Workflow adapter contract

Shared types: `agents/research-runner/shared/workflow-contract.ts` (`WorkflowInput`, `WorkflowResult`, optional `piSession`).

The reference runners drive **`pi` CLI** (`pi -p … --mode json`), not a npm SDK. Pi **subagents** (MCP) are a separate integration path for in-session delegation; use them when you need isolated child context, not for CLI workflow runners.

## Implementation rules

1. **Treat Pi as a harness adapter.** Shared workflow logic belongs outside the Pi runner.
2. **Use explicit cwd and paths.** Never rely on the process starting in the intended repo unless the runner sets it.
3. **Capture stdout/stderr and exit codes.** Persist them as artifacts for debugging and resume.
4. **Avoid unbounded subprocesses.** Set timeouts and return `blocked` or `failed` with the exact command that hung.
5. **Respect resource pressure.** Pi workflows should default to conservative concurrency and avoid parallel fanout unless requested.
6. **Use subagents deliberately (in Pi sessions).** The research-runner does not call subagents; use MCP subagent tools when a workflow needs independent child context or verification.
7. **Verify outside self-report.** Check generated files, git state, and commands directly.

## Good fits

- Local research runner parity
- SEO review through `agents/seo-review-runner/pi/runner.ts` with the `seo-audit` skill/instructions installed
- Conservative workflow orchestration inside Pi
- Verification or review workflows that should reuse Pi's tools and skills

## Poor fits

- High-fanout runs on memory-constrained systems
- Workflows requiring hosted cloud PR execution; Cursor cloud agents are usually a better fit
