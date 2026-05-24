---
name: performance-optimization
description: Measure-first approach for Core Web Vitals targets, profiling
  workflows, bundle analysis, and anti-pattern detection. Use when performance
  requirements exist or you suspect regressions.
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
# Performance Optimization

## Overview

Optimize performance with a measure-first approach. Never optimize without data. Establish baselines, identify bottlenecks, apply targeted fixes, and verify improvements.

## When to Use

- Performance requirements are stated or implied
- You suspect a regression after recent changes
- Page load or interaction speed is noticeably slow
- Bundle size has grown beyond acceptable thresholds
- Database queries are slow under load

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |

## Process

### Step 1: Establish Baseline

Measure current performance before making any changes:
- Run Lighthouse audit
- Record Core Web Vitals
- Profile the specific operation in question
- Document the baseline numbers

### Step 2: Identify Bottlenecks

Analyze measurements to find the actual bottleneck:
- Is it network (slow API calls, large assets)?
- Is it rendering (layout thrash, excessive repaints)?
- Is it JavaScript (long tasks, excessive computation)?
- Is it data (N+1 queries, missing indexes, large payloads)?

### Step 3: Apply Targeted Fix

Fix the identified bottleneck:
- One change at a time
- Prefer the simplest fix that addresses the root cause
- Document what was changed and why

### Step 4: Verify Improvement

Measure again after the fix:
- Compare against baseline
- Confirm the bottleneck is resolved
- Check for regressions in other areas

## Common Anti-Patterns

### Frontend

- Unnecessary re-renders in component frameworks
- Large unoptimized images or assets
- Render-blocking JavaScript or CSS
- Missing lazy loading for below-fold content
- Excessive DOM manipulation

### Backend

- N+1 database queries
- Missing database indexes for common query patterns
- Synchronous processing of independent operations
- Unbounded result sets without pagination
- Missing caching for frequently accessed data

### Bundle

- Importing entire libraries when only parts are needed
- Duplicate dependencies in the bundle
- Missing code splitting for route-based chunks
- Unminified or uncompressed assets in production

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Premature optimization is the root of all evil" | That quote is about guessing, not about measuring and fixing known bottlenecks. |
| "It is fast enough on my machine" | Your machine is not your users' machines. |
| "We can optimize later" | Performance debt compounds like technical debt. |

## Verification

- [ ] Baseline measurements recorded before changes
- [ ] Bottleneck identified with evidence
- [ ] Targeted fix applied
- [ ] Post-fix measurements show improvement
- [ ] No regressions in other performance metrics

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "Premature optimization is the root of all evil" | That quote is about guessing, not about measuring and fixing known bottlenecks. |
| "It's fast enough on my machine" | Your machine is not your users' machines. |
| "We can optimize later" | Performance debt compounds like technical debt. |
| "The Lighthouse score is good enough" | Lighthouse is a lab metric. Real user metrics tell the actual story. |
| "One optimization should fix everything" | Performance issues are often multi-factor. Measure after each fix to find remaining bottlenecks. |
