---
name: simplify
description: Review recently changed files for code reuse, quality, and
  efficiency issues, then fix them. Alias for code-simplification skill with
  multi-agent review additions.
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
# Simplify

This is an expanded profile of `code-simplification` that adds multi-agent parallel review. For the canonical simplification workflow, see `skills/code-simplification/SKILL.md`.

## Workflow

1. Identify recently changed files via `git diff --stat`
2. Spawn three parallel review agents:

| Agent | Focus | Finds |
|-------|-------|-------|
| Code Reuse | Duplication | Repeated logic, extractable functions, copy-paste patterns |
| Quality | Complexity | Dead code, poor naming, deep nesting, missing error handling |
| Efficiency | Performance | Redundant allocations, unnecessary iterations, missing caches |

3. Aggregate findings: deduplicate, sort by impact (bugs > performance > readability > style)
4. Apply fixes one at a time, verifying after each
5. Report confidence (0.0-1.0)

## Focus Areas

Pass a focus argument to weight the matching agent higher:
- `memory efficiency`
- `readability`
- `reducing duplication`
- `performance`
- `error handling`

## What NOT to Simplify

- Intentional complexity
- Performance-critical paths without benchmarking
- Public APIs without a migration plan
- Test code (clarity over brevity)
- Generated code

## See Also

- `code-simplification` — Canonical simplification skill
- `code-review-and-quality` — Multi-axis code review
- `text-cleanup` — AI verbosity removal (different from code simplification)

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "The multi-agent review is overkill for small changes" | Small changes can hide duplication and inefficiency. Parallel review catches what single review misses. |
| "I'll skip the efficiency agent, readability is enough" | Performance regressions creep in silently. The efficiency agent catches them before they compound. |
| "Aggregating findings takes too long" | Unaggregated findings lead to conflicting fixes. Deduplicate and prioritize before applying. |
| "I'll simplify test code too" | Test code prioritizes clarity over brevity. Do not simplify tests for the sake of fewer lines. |
| "The confidence score is just a number" | Confidence scores flag areas that need human review. Low confidence means "look closer." |
