---
name: performance-optimization
description: Measure-first approach for Core Web Vitals targets, profiling workflows, bundle analysis, and anti-pattern detection. Use when performance requirements exist or you suspect regressions.
---

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
