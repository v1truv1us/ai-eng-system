# Testing

Test suite for quality assurance.

---

## Test Categories

Unit tests: `bun test` or `bun test:unit`

Integration tests: `bun test:integration`

Performance tests: `bun test:performance`

---

## Running Tests

All tests: `bun test`

Specific file: `bun test agents/code-review-executor.test.ts`

Watch mode: `bun test:watch`

Coverage: `bun test:coverage`

---

## Test Structure

tests/agents/ - Agent-specific tests

tests/cli/ - CLI and command tests

tests/integration/ - End-to-end workflows

tests/research/ - Research and analysis tests


---

## Test Scripts

test-hooks-install.js - Hook installation tests

integration-test.js - Complete flow tests

Run verify: `node scripts/integration-test.js`
