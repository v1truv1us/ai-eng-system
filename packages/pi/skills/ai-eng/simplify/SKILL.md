---
name: simplify
description: Review recently changed files for code reuse, quality, and efficiency issues, then fix them. Alias for code-simplification skill with multi-agent review additions.
---

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
