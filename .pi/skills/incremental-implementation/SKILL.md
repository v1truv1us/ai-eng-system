---
name: incremental-implementation
description: Delivers changes in thin vertical slices. Use when implementing any
  feature or refactor that touches more than one file or feels too large to land
  safely in one pass.
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
# Incremental Implementation

Adapted from `addyosmani/agent-skills` (MIT), commit `82ceff41ed4d3c644e3dcca8a0514390b2911223`.

## Overview

Implement changes in small, complete slices. Each slice should leave the system buildable, testable, and easier to reason about than one large unverified batch of edits.

## When to Use

- Any multi-file feature or refactor
- Work that crosses API, UI, and data boundaries
- Any task where you are tempted to write a large amount of code before verifying

## Increment Cycle

1. Implement the smallest complete slice.
2. Run the most relevant tests.
3. Verify the slice behaves as expected.
4. Checkpoint the progress in a reviewable state.
5. Move to the next slice.

## Rules

### Simplicity First

Start with the smallest obviously correct solution. Do not introduce abstractions before the problem actually needs them.

### Scope Discipline

Touch only what the current slice requires. Note unrelated cleanup separately instead of mixing it into the implementation.

### Keep It Working

Do not leave the codebase knowingly broken between slices. If incomplete work must exist, hide it behind safe defaults or a feature flag.

### Prefer Vertical Slices

When possible, deliver one thin end-to-end path through the stack instead of building every layer in parallel without verification.

## Slicing Strategies

### Vertical Slice

- database change
- API path
- basic UI integration
- verification

### Contract First

When multiple layers depend on the same interface, define the contract first and build both sides against it.

### Risk First

If one part of the task is uncertain or expensive, prove that part first before investing in the rest.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It is faster to do it all at once" | It only feels faster until you have to debug a large unverified diff. |
| "These changes are too small to verify individually" | Small slices are exactly what make debugging and review cheaper. |
| "I will add the flag or guard later" | Incomplete work should not leak into user-visible behavior. |

## Verification

- [ ] The slice does one coherent thing
- [ ] Relevant tests pass after the slice
- [ ] Build succeeds
- [ ] The next slice can start from a clean, working state

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "It's faster to do it all at once" | It only feels faster until you have to debug a large unverified diff. |
| "These changes are too small to verify individually" | Small slices are exactly what make debugging and review cheaper. |
| "I'll add the flag or guard later" | Incomplete work should not leak into user-visible behavior. |
| "The slice doesn't do much on its own" | A slice does not need to be user-visible. It needs to be buildable and testable. |
| "I can skip verification for this slice" | Unverified slices accumulate risk. Verify each one before moving to the next. |
