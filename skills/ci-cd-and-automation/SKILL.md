---
name: ci-cd-and-automation
description: Design CI/CD pipelines, quality gates, and iterate on failing PR checks until green. Use when setting up pipelines or fixing CI on a branch.
metadata:
  category: model-invoked
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# CI/CD and Automation

## Overview

Pipelines enforce quality automatically: catch issues early (shift left), ship in small batches, and use feature flags for safe release. When CI fails on a branch, iterate with `gh pr checks` as the source of truth—not GitHub Actions list alone.

## When to Use

- Designing or changing build/deploy pipelines
- Adding quality gates or automated checks
- Watching or fixing CI on the current branch or PR

## Core principles

**Shift left:** lint/format pre-commit, typecheck before push, unit tests on push, integration tests on PR, security scans on main.

**Faster is safer:** automate deploys, make rollbacks trivial, auto-deploy staging on merge.

**Feature flags:** incomplete features, gradual rollout, kill switches, environment-specific behavior.

**Quality gate order (fastest-failing first):** lint → typecheck → unit tests → build → integration → security → staging deploy → smoke → production.

## Pipeline design process

1. List required checks and order fastest-failing-first with clear pass/fail criteria.
2. Keep lint/typecheck under ~30s and unit tests under ~2 minutes where possible.
3. Automate staging on merge; production with approval or policy.
4. Track success rate and mean time to recovery; alert on blocked merges.

## CI failure iteration

Use when checks are pending, failing, or you need to drive a branch to green.

```bash
gh pr view --json number,url,headRefName
gh pr checks --json name,bucket,state,workflow,link
gh pr checks --watch --fail-fast          # when pending
gh run view <run-id> --log-failed        # when GHA job failed
```

**Workflow:**

1. Resolve the active PR and inspect the full check set.
2. If already failed, diagnose the first actionable error (logs or check link).
3. If pending, watch with fail-fast.
4. Apply the smallest safe fix for one failure at a time.
5. Push, re-run `gh pr checks`, repeat until green.

**Guardrails:**

- One failure cause per fix when possible; no `--no-verify`.
- If failure is unrelated and fixed on main, merge main instead of bloating the PR.
- Retry flaky checks once and record flake evidence.
- Re-check after every push—the check set can change.

**Output:** current status, root error, fixes applied in order, PR URL when green.

## Anti-Rationalization

| Excuse | Counter |
|--------|---------|
| "The pipeline can be fixed later" | Broken pipelines get bypassed. |
| "Full automation is too much work" | Manual deploy is slower and error-prone. |
| "Feature flags add complexity" | They prevent uncontrolled release risk. |
| "We don't need staging" | Staging catches environment-specific failures. |
| "The pipeline is fast enough" | Slow feedback discourages small commits. |

## Verification

- [ ] Pipeline runs on every push and PR
- [ ] Fastest checks run first
- [ ] Deploy and rollback paths are automated and tested
- [ ] CI iteration uses `gh pr checks` as authority
