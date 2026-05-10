---
name: code-review-and-quality
description: Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human.
---

# Code Review and Quality

Adapted from `addyosmani/agent-skills` (MIT), commit `82ceff41ed4d3c644e3dcca8a0514390b2911223`.

## Overview

Review changes across five axes: correctness, readability, architecture, security, and performance. The standard is not perfection; it is whether the change clearly improves the codebase without introducing avoidable risk.

## When to Use

- Before merging any change
- After completing a feature, bug fix, or refactor
- When reviewing code produced by another agent or automation
- When validating whether tests and verification are actually sufficient

## The Five-Axis Review

### 1. Correctness

- Does the change do what the task or spec requires?
- Are happy paths, edge cases, and error paths handled?
- Do tests cover the real behavior change?

### 2. Readability and Simplicity

- Are names clear and consistent with the codebase?
- Is control flow easy to follow?
- Are there any clever shortcuts that should become straightforward code?

### 3. Architecture

- Does the change follow existing patterns?
- Are boundaries between modules still clean?
- Is the abstraction level appropriate for the current need?

### 4. Security

- Is untrusted input validated at boundaries?
- Are secrets kept out of code and logs?
- Are auth, permissions, and external data flows handled safely?

### 5. Performance

- Any N+1 access patterns, repeated expensive work, or unbounded operations?
- Any missing pagination, batching, caching, or async boundaries?

## Review Process

### Step 1: Understand Intent

Before commenting on the code, identify:

- What changed
- Why it changed
- What proof should exist that it works

### Step 2: Review Tests First

Tests reveal intent faster than implementation details.

- Are there regression tests for bug fixes?
- Do tests verify behavior rather than private implementation?
- Would the tests fail if the bug returned?

### Step 3: Review the Implementation

Inspect each changed file with the five axes in mind. Prefer concrete findings over style preferences.

### Step 4: Label Findings Clearly

Use explicit severity so the author knows what blocks merge.

- `Critical:` security issue, broken behavior, or data loss risk
- Required: must change before merge
- `Optional:` worthwhile but not blocking
- `Nit:` cosmetic or style-only
- `FYI:` context only

### Step 5: Verify the Verification Story

Check what was actually run:

- targeted tests
- full relevant suite
- build and typecheck
- manual verification for UI or operational changes

## Review Output Template

```markdown
## Findings

- Critical: ...
- Required: ...
- Optional: ...

## Verification

- Tests: ...
- Build: ...
- Manual: ...
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The tests pass, so it is fine" | Tests are necessary, not sufficient. They do not prove architecture, readability, or security are sound. |
| "AI-generated code is probably okay" | AI code needs more scrutiny, not less. It is often plausible and confidently wrong. |
| "We can clean it up later" | Deferred cleanup usually does not happen. |

## Red Flags

- No regression test for a bug fix
- Large change with no explanation or verification summary
- Review feedback that never labels severity
- Security-sensitive changes reviewed only for style
- Large diffs that should have been split

## Verification

- [ ] Critical issues resolved
- [ ] Required issues resolved or explicitly deferred with justification
- [ ] Relevant tests pass
- [ ] Build succeeds
- [ ] Review summary documents what was checked

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll review this quickly, it looks fine" | Quick reviews miss subtle bugs. Systematic five-axis review catches what glancing misses. |
| "This change is too small for a full review" | Small changes can have large effects. Every change deserves systematic review. |
| "I know this code, no need to review" | Familiarity breeds blind spots. Fresh eyes catch what the author misses. |
| "The tests pass, the code is good" | Tests prove correctness, not quality. Review catches design issues tests can't see. |
| "AI-generated code is probably okay" | AI code needs more scrutiny, not less. It is often plausible and confidently wrong. |
