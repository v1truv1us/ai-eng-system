---
name: code-simplification
description: Simplifies code for clarity without changing behavior. Use when code works but is harder to read, maintain, or extend than it should be.
---

# Code Simplification

Adapted from `addyosmani/agent-skills` (MIT), commit `82ceff41ed4d3c644e3dcca8a0514390b2911223`.

## Overview

Simplify code by reducing complexity while preserving exact behavior. The goal is not fewer lines; it is faster comprehension, safer maintenance, and easier review.

## When to Use

- After a feature works but feels heavier than necessary
- During review when readability or duplication issues show up
- When code has deep nesting, unclear names, or scattered logic
- After a rushed implementation that now needs cleanup

## Core Rules

### Preserve Behavior Exactly

Do not change outputs, side effects, ordering, or error behavior. If you are not sure a simplification is behavior-preserving, stop and gather more context first.

### Follow Project Conventions

Simplification should make code more consistent with the repository, not more consistent with personal taste.

### Prefer Clarity Over Cleverness

Avoid dense ternaries, over-generalized abstractions, and compressed logic that requires a second reading.

### Scope to What Changed

Default to simplifying the code you are already touching. Avoid unrelated cleanup unless explicitly asked.

## Simplification Process

### Step 1: Understand Before Changing

Apply Chesterton's Fence.

- What is this code responsible for?
- Why might it have been written this way?
- What tests define its current behavior?

### Step 2: Identify the Simplification

Look for:

- deep nesting
- long functions with mixed responsibilities
- duplicate logic
- generic or misleading names
- wrappers or abstractions that add no value

### Step 3: Apply Small Changes

Make one simplification at a time and verify after each one.

- simplify the control flow
- extract a well-named helper
- inline an unnecessary wrapper
- remove dead code only when you understand it

### Step 4: Re-evaluate the Whole

After the refactor, ask whether a new teammate would understand the new version faster than the old one.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Fewer lines is always simpler" | A dense one-liner can be harder to understand than a clear five-line block. |
| "I will simplify this unrelated code while I am here" | Drive-by refactors create noisy diffs and hidden regression risk. |
| "This abstraction might be useful later" | Speculative abstractions are complexity without current value. |

## Red Flags

- Tests need to change just to preserve the simplification
- Error handling disappears because it looks noisy
- Renames follow personal taste instead of repo conventions
- The simplified version is harder to review than the original

## Verification

- [ ] Existing tests still pass without semantic changes
- [ ] Build succeeds
- [ ] No error handling was weakened
- [ ] Diff stays focused on the targeted simplification

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "Fewer lines is always simpler" | A dense one-liner can be harder to understand than a clear five-line block. |
| "I'll simplify this unrelated code while I'm here" | Drive-by refactors create noisy diffs and hidden regression risk. |
| "This abstraction might be useful later" | Speculative abstractions are complexity without current value. |
| "The code works, why touch it" | Working code that is hard to understand is a maintenance liability. |
| "I'll add tests after simplifying" | Simplification without tests risks silently changing behavior. Tests first. |
