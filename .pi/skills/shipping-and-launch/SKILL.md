---
name: shipping-and-launch
description: Pre-launch checklists, feature flag lifecycle, staged rollouts,
  rollback procedures, monitoring setup. Use when preparing to deploy to
  production.
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

Ship to production with confidence using pre-launch checklists, staged rollouts, and verified rollback procedures. Faster is safer: small, frequent releases are less risky than large, infrequent ones.

## When to Use

- Preparing to deploy any change to production
- Launching a new feature or significant change
- After completing code review and quality gates

## Pre-Launch Checklist

### Code Quality

- [ ] All tests pass (unit, integration, e2e)
- [ ] Code review approved
- [ ] No critical or high-severity issues open
- [ ] Coverage meets 80% threshold

### Security

- [ ] No secrets in code or configuration
- [ ] Dependency audit shows no critical vulnerabilities
- [ ] Input validation at all trust boundaries
- [ ] Authentication and authorization tested

### Performance

- [ ] Performance baseline established
- [ ] No regressions in Core Web Vitals or response times
- [ ] Database queries analyzed for N+1 patterns
- [ ] Load tested if the change affects throughput

### Operational

- [ ] Feature flag created for new behavior
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure documented and tested
- [ ] Staging deployment verified

## Feature Flag Lifecycle

1. **Create**: Add flag in default-off state
2. **Develop**: Implement behind the flag
3. **Test**: Enable for internal users and automated tests
4. **Roll Out**: Enable for percentage of users
5. **General Availability**: Enable for all users
6. **Cleanup**: Remove flag and old code path

## Staged Rollout

### Stage 1: Internal

- Deploy to staging
- Enable for internal team
- Verify functionality and monitoring

### Stage 2: Canary

- Enable for 1-5% of users
- Monitor error rates and performance
- Compare against baseline metrics

### Stage 3: Expanded

- Enable for 25-50% of users
- Continue monitoring
- Verify no edge case regressions

### Stage 4: General Availability

- Enable for all users
- Monitor for 24-48 hours
- Remove feature flag in next release

## Rollback Procedure

### Automatic Rollback

Triggered by:
- Error rate exceeds threshold
- Response time exceeds SLO
- Health check failures

### Manual Rollback

1. Identify the failing deployment
2. Revert to the last known good deployment
3. Verify the rollback resolved the issue
4. Communicate the rollback to stakeholders
5. Investigate root cause before re-deploying

## Process

### Step 1: Complete Pre-Launch Checklist

Work through every item. Any unchecked item is a blocker.

### Step 2: Deploy to Staging

- Verify the deployment succeeds
- Run smoke tests against staging
- Check monitoring dashboards

### Step 3: Execute Staged Rollout

- Follow the rollout stages above
- Monitor at each stage
- Rollback if metrics degrade

### Step 4: General Availability

- Enable for all users
- Monitor for 24-48 hours
- Schedule feature flag cleanup

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It works on staging, ship it" | Staging does not perfectly replicate production traffic and data. |
| "We can monitor after launch" | Monitoring should be configured before launch, not after. |
| "Rollback is too slow, just fix forward" | Fixing forward under pressure introduces more risk than a clean rollback. |

## Verification

- [ ] Pre-launch checklist is complete
- [ ] Feature flag is configured for staged rollout
- [ ] Monitoring and alerting are in place
- [ ] Rollback procedure is tested
- [ ] Stakeholders are informed of the launch timeline

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "It works on staging, ship it" | Staging does not perfectly replicate production traffic and data. |
| "We can monitor after launch" | Monitoring should be configured before launch, not after. |
| "Rollback is too slow, just fix forward" | Fixing forward under pressure introduces more risk than a clean rollback. |
| "Staged rollout is too slow, just enable for everyone" | Staged rollouts catch issues before they affect all users. They are faster than incident response. |
| "The feature flag cleanup can wait" | Uncleaned feature flags become permanent technical debt. Schedule cleanup immediately. |

## Imported from cursor-team-kit/review-and-ship (MIT, cursor/plugins)

# Review and ship

## Trigger

Reviewing changes before shipping. Close key issues, verify behavior, and open or update a PR.

## Workflow

1. Gather context: diff against base branch, uncommitted changes, recent commits, changed files, and user intent from recent relevant chats if useful.
2. Run targeted tests for changed behavior. If no focused tests exist, decide whether to add them or document the gap.
3. Review for correctness, regressions, security, and intent fit. Use parallel subagents for larger diffs.
4. Fix critical issues before finalizing and re-run affected tests.
5. Commit selective files with a concise message.
6. Push branch and open or update a PR.

## Suggested Checks

```bash
git fetch origin main
git diff origin/main...HEAD
git status
gh pr checks --json name,bucket,state,workflow,link
```

## Guardrails

- Prioritize correctness, security, and regressions over style-only comments.
- Keep commits focused and avoid unrelated file changes.
- If pre-commit checks fail, fix the issues rather than bypassing hooks.
- Use `gh pr checks` instead of GitHub Actions-only commands when judging PR readiness.

## Output

- Findings summary (critical, warning, note)
- Tests run and outcomes
- PR URL
