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
