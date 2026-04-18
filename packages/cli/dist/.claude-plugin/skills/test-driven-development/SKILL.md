---
name: test-driven-development
description: Red-Green-Refactor workflow. Write tests before implementation, maintain 80%+ coverage. Use when implementing logic, fixing bugs, or changing behavior.
---

# Test-Driven Development

## Overview

Write a failing test first, then implement the minimum code to pass, then refactor. Tests are proof that the system behaves as intended. This is the canonical Build-phase testing skill.

## When to Use

- Implementing new logic or features
- Fixing bugs (write a failing test that reproduces the bug)
- Refactoring existing behavior
- Changing any code that has correctness requirements

## Test Pyramid

- 80% Unit tests: fast, isolated, test individual functions and components
- 15% Integration tests: test interactions between modules
- 5% End-to-end tests: test critical user flows through the full stack

## TDD Cycle

### Red: Write a Failing Test

1. Define the expected behavior in a test
2. Run the test and confirm it fails for the right reason
3. The test should describe what you want, not how to implement it

### Green: Make It Pass

1. Write the minimum implementation to pass the test
2. Do not add functionality beyond what the test requires
3. It is acceptable for the implementation to be ugly at this stage

### Refactor: Improve Without Changing Behavior

1. Clean up the implementation
2. Extract helpers, improve names, remove duplication
3. Run all tests after each refactor step

## Test Quality Rules

### DAMP Over DRY in Tests

Tests should be Descriptive And Meaningful Phrases. Prefer readability over test-code abstraction. Duplication in test setup is acceptable when it makes the test self-contained.

### The Beyonce Rule

If you liked it, you should have put a test on it. If behavior matters, a test should verify it.

### Test Naming

- Describe the scenario and expected outcome
- `it('should return 404 when user does not exist')`
- Not `it('works')`

### Test Isolation

- Each test should set up its own state
- No shared mutable state between tests
- Tests should be runnable in any order

## Process

### Step 1: Define Interfaces First

Before writing tests, define the public interface:
- Function signatures
- Type definitions
- Error types

### Step 2: Write the First Test

- Test the simplest happy path
- Run it and watch it fail

### Step 3: Implement and Iterate

- Make the test pass
- Write the next test for the next behavior
- Repeat until all acceptance criteria are covered

### Step 4: Verify Coverage

- Run coverage report
- Ensure 80%+ line coverage
- Ensure 100% coverage on critical paths
- Identify untested edge cases and add tests

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I will add tests later" | Later never comes. Untested code is unverifiable code. |
| "TDD slows me down" | TDD slows down typing but speeds up delivery by reducing debugging time. |
| "This is too simple to test" | Simple code can have simple bugs. Simple tests are cheap to write. |
| "I need to implement first to know what to test" | Defining expected behavior first is exactly the point. |

## Verification

- [ ] Tests were written before implementation
- [ ] All acceptance criteria have corresponding tests
- [ ] Coverage meets 80% threshold
- [ ] Critical paths have 100% coverage
- [ ] Tests are isolated and order-independent
