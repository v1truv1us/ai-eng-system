---
name: verification-loop
description: Continuous verification after each change, plus claim-based proof when evidence is required. Use when implementing, fixing bugs, or refactoring.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Verification Loop

## Overview

Verify after each small change—not only at the end. Two modes share the same discipline:

1. **Routine verification** — run the right checks for the change type.
2. **Claim-based verification** — prove or disprove a specific, measurable claim with baseline vs treatment evidence.

## When to Use

- After every code, dependency, or configuration change
- Before every commit or merge
- When the user asks to "verify this", "prove it works", or "show evidence"
- When tests pass but user-visible behavior still needs confirmation

Do not use claim-based mode for vague assertions like "the code is cleaner". Ask for a falsifiable claim first.

## The Loop

```
Change → Verify → If fail: Fix → Verify → If pass: Continue
```

### Step 1: Change

Make a small, atomic change (~100 lines max).

### Step 2: Verify

Pick the mode that fits:

| Situation | Mode | Action |
|-----------|------|--------|
| Normal development | Routine | Run checks from the table below |
| Specific claim to prove/disprove | Claim-based | Follow the claim workflow below |

**Routine checks by change type:**

| Change Type | Verification |
|------------|-------------|
| Code change | Tests for affected area |
| New feature | New tests + existing tests |
| Bug fix | Regression test + existing tests |
| Refactor | All tests (behavior must not change) |
| Dependency | Build + tests + security scan |
| Configuration | Build + smoke test |

**Claim-based workflow:**

1. Restate the claim: condition, metric, threshold.
2. Pick the smallest surface that can disprove it.
3. Capture baseline (merge base, parent commit, or broken repro).
4. Capture treatment with the same command, data, warmup, and environment.
5. Compare artifacts: numbers, screenshots, transcripts, HTTP responses, profiles, heap snapshots, test output.
6. Return exactly one verdict: `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE`.

**Surfaces for claims:** unit/integration tests, `control-cli` / `control-ui`, browser traces, local HTTP/RPC diffs, timings, heap snapshots.

**Verdict rules:**

- `VERIFIED` — predicted change met threshold, no obvious confound
- `NOT VERIFIED` — unchanged, wrong direction, or below threshold
- `INCONCLUSIVE` — invalid baseline, noisy signal, or environment mismatch

Claim output shape:

```text
VERIFIED | NOT VERIFIED | INCONCLUSIVE
Claim: <falsifiable claim>
Evidence: <metric>: baseline=..., treatment=..., delta=..., threshold=...
Reasoning: <one paragraph>
```

### Step 3: Fix (if failed)

Read error output, fix the specific issue, do not change unrelated code, return to Step 2.

### Step 4: Continue (if passed)

Commit, move to the next change, repeat.

## Verification Levels

| Level | Scope | When |
|-------|-------|------|
| Unit | Affected function/module | After every small change |
| Integration | Affected feature | After feature complete |
| Full | All tests | Before commit/PR |
| E2E | Critical user flows | Before release |

## Commands

```bash
# TypeScript/JavaScript
bun test && bun run build && bun run lint && bun run typecheck

# Python
pytest && ruff check . && mypy .

# Go
go test ./... && go vet ./... && golangci-lint run

# Rust
cargo test && cargo clippy && cargo build
```

## Anti-Rationalization

| Excuse | Counter |
|--------|---------|
| "I'll test everything at the end" | Errors compound. Verify early, verify often. |
| "The tests take too long" | Run affected tests first; full suite before commit. |
| "This change is too small to test" | Small changes can have large effects. |
| "It works on my machine" | Local verification is the minimum; CI validates the target environment. |
| "It probably works" | Without a falsifiable claim and comparison, you do not know. |
