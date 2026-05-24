---
name: check-agent-compatibility
description: "Run the full repository compatibility pass: scanner score, startup
  path, validation loop, and docs reliability."
metadata:
  version: 1.0.0
  tags: cursor-import, agent-compatibility
---

## Pi Context-Aware Execution

When this skill is invoked in Pi, treat the user's current request and any skill arguments as the task input. Do not treat this file as the task by itself.

Before applying the skill, establish only the context needed for the request:

1. Identify the current working directory and relevant project scope.
2. Read local guidance first when present: AGENTS.md, CLAUDE.md, TODO.md, or nearby task/spec files.
3. Inspect the current codebase with targeted searches (prefer rg) and read relevant files before making claims or proposing changes.
4. Ground findings and recommendations in project evidence: cite file paths, commands, tests, docs, or external sources as applicable.
5. Ask a concise clarification only when the arguments and codebase context are insufficient to proceed safely.

Operate conservatively: avoid broad scans, large reads, subagents, or parallel fanout unless the user's requested depth clearly requires them.
# Check agent compatibility

## Trigger

Use when the user wants the full compatibility pass for a repo.

## Workflow

1. Launch `compatibility-scan-review` to run the CLI and capture the raw repository score and main issues.
2. Launch `startup-review` to verify whether the repo can actually be booted by an agent.
3. Launch `validation-review` to check whether an agent can verify a small change without an unnecessarily heavy loop.
4. Launch `docs-reliability-review` to see whether the documented setup and run paths reliably match reality.
5. Use one subagent per task. Do not collapse these checks into one agent prompt.
6. Compute an internal workflow score as the rounded average of:
   - `Startup Compatibility Score`
   - `Validation Loop Score`
   - `Docs Reliability Score`
7. Compute an `Agent Compatibility Score` as:
   - `round((deterministic_score * 0.7) + (workflow_score * 0.3))`
8. Synthesize the results into one final response.

When scoring internally, use specific non-round workflow scores for the behavioral checks rather than coarse round buckets. If startup, validation, or docs mostly work, treat them as good-with-friction rather than defaulting to the mid-60s. Do not create a low workflow score just because logs are noisy or the error text is rough.

## Output

Respond in markdown, but keep it minimal. Do not use fenced code blocks.

Show only one score, as a level-two heading: `## Agent Compatibility Score: N/100`. Do not show how it was computed, including weights, formula, deterministic score, workflow score, per-check scores, or arithmetic, unless the user explicitly asks for a breakdown.

Then a flat, prioritized list labeled `Top fixes` with one issue per line, each line starting with `- `.

If the deterministic scanner cannot be run because of tool environment issues, say that separately and do not treat it as a repo defect or penalize the repo. Fold deterministic and behavioral findings into that one list instead of separate sections. Focus on the fixes that would most improve real agent workflows. Do not include a separate summary unless the user asks for more detail.

Example shape:

## Agent Compatibility Score: 72/100

Top fixes
- First issue
- Second issue
- Third issue
