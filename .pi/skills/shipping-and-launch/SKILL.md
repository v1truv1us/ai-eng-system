---
name: shipping-and-launch
description: Review changes, open PRs, run pre-launch checks, staged rollouts,
  and rollback. Use when preparing to ship to production or closing out a
  branch.
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
# Shipping and Launch

## Overview

Shipping is review → PR → checklist → staged rollout → monitor. Small, frequent releases beat large batches. Do not skip review because launch checklists exist, and do not ship because staging looked fine without production safeguards.

## When to Use

- Reviewing and opening/updating a PR before merge
- Preparing to deploy to production
- Launching a feature behind flags
- After code review and quality gates pass

## End-to-end workflow

### 1. Review the change

Gather context: diff against base branch, uncommitted changes, recent commits, changed files, and user intent from recent chats if useful.

```bash
git fetch origin main
git diff origin/main...HEAD
git status
gh pr checks --json name,bucket,state,workflow,link
```

Then:

1. Run targeted tests for changed behavior; add tests or document gaps.
2. Review for correctness, regressions, security, and intent fit. Use parallel subagents on large diffs.
3. Fix critical issues and re-run affected tests.
4. Commit focused changes with a concise message.
5. Push and open or update the PR.

Prioritize correctness, security, and regressions over style-only comments. Fix pre-commit failures; never bypass hooks. Use `gh pr checks` as the source of truth for PR readiness.

**Output:** findings (critical / warning / note), tests run, PR URL.

### 2. Complete pre-launch checklist

**Code quality:** tests pass, review approved, no critical/high issues, coverage meets threshold.

**Security:** no secrets in code/config, dependency audit clean, inputs validated, auth tested.

**Performance:** baseline established, no CWV/regression, no N+1, load tested if throughput-sensitive.

**Operational:** feature flag ready, monitoring configured, rollback tested, staging verified.

### 3. Deploy and roll out

1. Deploy to staging; run smoke tests; check dashboards.
2. Roll out in stages: internal → canary (1–5%) → expanded (25–50%) → GA.
3. Monitor at each stage; rollback if metrics degrade.
4. After GA, monitor 24–48 hours and schedule flag cleanup.

### 4. Rollback when needed

**Automatic triggers:** error rate, SLO breach, health check failures.

**Manual rollback:** identify bad deployment → revert to last good → verify → communicate → root-cause before redeploy.

## Feature flag lifecycle

Create (off) → develop behind flag → test internally → gradual rollout → GA → remove flag and dead code path.

## Anti-Rationalization

| Excuse | Counter |
|--------|---------|
| "It works on staging, ship it" | Staging does not replicate production traffic and data. |
| "We can monitor after launch" | Monitoring must exist before launch. |
| "Rollback is too slow, fix forward" | Fix-forward under pressure adds risk. |
| "Staged rollout is too slow" | Staged rollouts beat incident response. |
| "Flag cleanup can wait" | Flags become permanent debt. Schedule cleanup now. |

## Verification

- [ ] Review complete; critical issues resolved
- [ ] PR checks green
- [ ] Pre-launch checklist complete
- [ ] Feature flag and monitoring configured
- [ ] Rollback tested
- [ ] Stakeholders informed
