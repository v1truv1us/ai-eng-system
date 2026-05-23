---
name: verification-loop
description: Continuous verification methodology. Verify after every change, not just at the end. Run tests, check builds, validate behavior. Use when implementing features, fixing bugs, or refactoring.
---

# Verification Loop

## Overview

Continuous verification ensures every change is validated immediately. Instead of building everything then testing, verify after each small change. This catches errors early and prevents compounding mistakes.

## When to Use

- After every code change (edit, write, patch)
- After every dependency addition or update
- After configuration changes
- Before committing any change

## The Loop

```
Change → Verify → If fail: Fix → Verify → If pass: Continue
```

### Step 1: Change
Make a small, atomic change (~100 lines max).

### Step 2: Verify
Run the appropriate verification:

| Change Type | Verification |
|------------|-------------|
| Code change | Tests for affected area |
| New feature | New tests + existing tests |
| Bug fix | Regression test + existing tests |
| Refactor | All tests (behavior must not change) |
| Dependency | Build + tests + security scan |
| Configuration | Build + smoke test |

### Step 3: Fix (if failed)
- Read the error output carefully
- Fix the specific issue
- Do NOT change unrelated code
- Return to Step 2

### Step 4: Continue (if passed)
- Commit the change
- Move to next change
- Repeat the loop

## Verification Commands

```bash
# TypeScript/JavaScript
bun test          # Run tests
bun run build     # Build project
bun run lint      # Run linter
bun run typecheck # Type check

# Python
pytest            # Run tests
ruff check .      # Lint
mypy .            # Type check

# Go
go test ./...     # Run tests
go vet ./...      # Vet code
golangci-lint run # Lint

# Rust
cargo test        # Run tests
cargo clippy      # Lint
cargo build       # Build
```

## Verification Levels

| Level | Scope | When |
|-------|-------|------|
| Unit | Affected function/module | After every small change |
| Integration | Affected feature | After feature complete |
| Full | All tests | Before commit/PR |
| E2E | Critical user flows | Before release |

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll test everything at the end" | Errors compound. A bug in step 1 makes steps 2-10 wrong. Verify early, verify often. |
| "The tests take too long" | Run only affected tests for quick feedback. Full suite before commit. |
| "This change is too small to need testing" | Small changes can have large effects. Every change deserves verification. |
| "It works on my machine" | Local verification is the minimum. CI verifies in the target environment. |

## Imported from cursor-team-kit/verify-this (MIT, cursor/plugins)

# Verify This

Verification is not a recap. It proves or disproves a specific claim with repeatable evidence.

## When To Use

- The user asks "verify this", "prove it works", "did this fix it", or "show me the evidence".
- A bug fix needs a before/after repro.
- A UI, CLI, API, performance, or memory claim needs measurement.
- A test passes but the user-visible behavior still needs confirmation.

Do not use this for vague claims like "the code is cleaner". Ask for a measurable claim first.

## Workflow

1. Restate the claim in falsifiable form: condition, metric, and threshold.
2. Pick the smallest local surface that can disprove it.
3. Capture a baseline from the old state: merge base, parent commit, failing branch, or current broken repro.
4. Capture treatment from the changed state with the same command, data, warmup, and environment.
5. Compare raw artifacts: numbers, screenshots, terminal transcripts, HTTP responses, profiles, heap snapshots, or test output.
6. Return exactly one verdict: `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE`.

## Local Surfaces

- Code behavior: focused unit/integration tests or a minimal repro script.
- CLI/TUI behavior: `control-cli`, terminal transcript, or demo recording.
- UI behavior: `control-ui`, screenshots, accessibility snapshots, or browser traces.
- API behavior: local HTTP/RPC request and response diff.
- Performance: same-machine baseline/treatment timings or CPU profiles.
- Memory: heap snapshots before and after the suspected operation.

## Artifact Layout

When safe to write artifacts:

```text
/tmp/verify-this/<claim-slug>/
├── claim.md
├── timeline.md
├── baseline/
├── treatment/
├── diff/
└── verdict.md
```

If artifacts may contain sensitive code, prompts, screenshots, HTTP bodies, or heap data, keep only the minimal inline evidence unless the user agrees to disk storage.

## Verdict Rules

- `VERIFIED`: baseline and treatment differ in the predicted direction, by the claimed threshold, with no obvious confound.
- `NOT VERIFIED`: the behavior is unchanged, moves the wrong way, or misses the threshold.
- `INCONCLUSIVE`: no valid baseline, noisy signal, failed measurement, or an environment difference invalidates the comparison.

## Output

Use this shape:

```text
VERIFIED | NOT VERIFIED | INCONCLUSIVE
Claim: <falsifiable claim>

Evidence:
<metric/artifact>: baseline=<...>, treatment=<...>, delta=<...>, threshold=<...>

Reasoning:
<one tight paragraph naming the evidence and any confounds>
```

Do not soften a negative result. A clear `NOT VERIFIED` is useful.

