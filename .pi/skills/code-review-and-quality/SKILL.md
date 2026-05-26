---
name: code-review-and-quality
description: Multi-axis code review with optional strict maintainability mode.
  Use before merging any change—human, agent, or automation output.
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
# Code Review and Quality

Adapted from `addyosmani/agent-skills` (MIT), commit `82ceff41ed4d3c644e3dcca8a0514390b2911223`.

## Overview

Review changes across five axes: correctness, readability, architecture, security, and performance. **Standard mode** asks whether the change improves the codebase without avoidable risk. **Strict maintainability mode** adds structural ambition: hunt for simplifications that delete complexity, not just rearrange it.

## When to Use

- Before merging any change
- After a feature, bug fix, or refactor
- When validating whether tests and verification are sufficient
- When the user or parent agent requests a deep maintainability audit (strict mode)

## Review modes

| Mode | Goal | When |
|------|------|------|
| Standard | Correct, safe, readable change | Default for most PRs |
| Strict maintainability | Ambitious structural quality; block spaghetti and unjustified sprawl | Large refactors, messy diffs, subagent thermo-style review |

Strict mode baseline: *Rethink structure without changing behavior. Improve abstractions, modularity, and legibility. If a code-judo move could delete whole branches or layers, push for it.*

## The Five-Axis Review

### 1. Correctness

- Does the change meet the task or spec?
- Happy paths, edge cases, and errors handled?
- Tests cover the real behavior change?

### 2. Readability and Simplicity

- Clear names consistent with the codebase?
- Control flow easy to follow?
- Clever shortcuts that should be straightforward code?

In **strict mode**, also ask: Is the implementation direct, or special-case spaghetti? Any thin wrappers or pass-through helpers that add indirection without clarity?

### 3. Architecture

- Follows existing patterns?
- Module boundaries still clean?
- Abstraction level appropriate?

In **strict mode**, also ask:

- Logic in the canonical layer? Reusing existing helpers vs bespoke one-offs?
- Feature logic leaking into shared paths?
- File crossing **1000 lines** without strong justification—prefer extract/split first.
- New ad-hoc conditionals bolted onto busy flows—prefer dedicated abstraction or module.
- Sequential orchestration or non-atomic updates when parallel/atomic structure is obvious?

### 4. Security

- Untrusted input validated at boundaries?
- Secrets out of code and logs?
- Auth, permissions, and external data handled safely?

### 5. Performance

- N+1, repeated expensive work, unbounded operations?
- Pagination, batching, caching, async boundaries where needed?

## Review Process

### Step 1: Understand intent

What changed, why, and what proof should exist.

### Step 2: Review tests first

- Regression tests for bug fixes?
- Behavior verified, not private implementation?
- Would tests fail if the bug returned?

### Step 3: Review implementation (five axes)

Prefer concrete findings over style. In **strict mode**, prioritize:

1. Structural regressions and missed dramatic simplifications
2. Spaghetti / branching growth
3. Boundary, abstraction, and type-contract problems
4. File-size and decomposition
5. Modularity and legibility

**Strict questions (when applicable):**

- Code-judo move that removes concepts/branches/layers?
- Refactor that moves complexity without deleting it?
- Casts, `any`, `unknown`, or optionality hiding the real invariant?
- Duplicate of a canonical helper or wrong package/layer?

### Step 4: Label findings

- `Critical:` security, broken behavior, data loss
- `Required:` must fix before merge
- `Optional:` worthwhile, not blocking
- `Nit:` cosmetic
- `FYI:` context only

Strict mode: do not soften structural issues into nits. Be direct; skip cosmetic floods when structural problems exist.

### Step 5: Verify the verification story

Targeted tests, relevant suite, build/typecheck, manual checks for UI/ops.

## Findings priority (strict mode)

1. Structural regressions
2. Missed simplification / code-judo opportunities
3. Spaghetti and special-case branching
4. Boundary and type-contract problems
5. File size and decomposition
6. Modularity and legibility

## Approval bar

**Standard:** no critical/required issues unresolved; relevant tests and build pass.

**Strict:** behavior correct is not enough. Presumptive blockers unless clearly justified:

- Plausible simplification path ignored; complexity preserved
- File pushed from under to over 1000 lines
- Ad-hoc branching tangling shared flows
- Feature checks scattered across general modules
- Unnecessary wrapper, cast-heavy contract, or wrong-layer logic
- Duplicate of existing canonical helper

## Output template

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

## Red flags

- No regression test for a bug fix
- Large change without verification summary
- Unlabeled severity in feedback
- Security-sensitive changes reviewed only for style
- Diffs that should have been split
- (Strict) File-size jump, scattered conditionals, or refactor that only relocates complexity

## Anti-Rationalization

| Excuse | Counter |
|--------|---------|
| "Tests pass, so it is fine" | Tests are necessary, not sufficient for architecture, security, or maintainability. |
| "Too small for full review" | Small changes can have large effects. |
| "I know this code" | Familiarity hides blind spots. |
| "AI-generated code is probably okay" | AI output needs more scrutiny—it is often plausible and wrong. |
| "We can clean up later" | Deferred cleanup rarely happens. |
| (Strict) "It works, ship it" | Working code that worsens structure is a maintainability regression. |

## Verification checklist

- [ ] Critical and required issues resolved or explicitly deferred with justification
- [ ] Relevant tests pass; build succeeds
- [ ] Review summary documents what was checked
- [ ] (Strict) No presumptive blockers above without justification

## Subagent orchestration (strict mode)

When invoked as a **Task subagent**, the parent supplies `### Git / diff output` and `### Changed file contents`. Apply this skill to that input only; trace cross-file impact at module boundaries. Do not spawn nested subagents unless asked.

Typical parent flow: parallel shell + explore tasks for diff and file contents, then invoke `code-reviewer` in strict mode with labeled sections.
