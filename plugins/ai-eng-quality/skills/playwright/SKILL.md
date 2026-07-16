---
name: playwright
description: Write, run, and maintain reliable end-to-end tests with Playwright. Use for test generation, CI integration, trace debugging, and cross-browser validation.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Playwright Test Engineering

## Current Versions (Verify Before Use)

```bash
npx playwright --version
```

Check [Playwright releases](https://github.com/microsoft/playwright/releases) for the latest version.

## Core Principles

1. **Tests should be deterministic.** No random data, no time-based assertions, no shared state.
2. **Prefer user-visible selectors.** Use `getByRole`, `getByText`, `getByLabel` over CSS selectors.
3. **One assertion per test.** Test one thing. If it fails, you know exactly what broke.
4. **Traces are for debugging, not primary detection.** A failing test should explain itself; traces help when it doesn't.
5. **Parallel by default.** Use fully-parallel mode. Tests must be isolated.

## Test Writing Checklist

- [ ] Uses semantic locators (`getByRole`, `getByLabel`, `getByText`)
- [ ] Avoids `waitForTimeout` — uses explicit waits (`waitForSelector`, `waitForResponse`)
- [ ] Each test has `test.describe` grouping
- [ ] Test data is isolated (no shared accounts, no hardcoded IDs)
- [ ] API calls are mocked or use test-specific data
- [ ] Screenshots/traces are captured on failure

## Codegen Workflow

```bash
# Generate test from user interactions
npx playwright codegen http://localhost:3000

# Run with UI mode for debugging
npx playwright test --ui

# Run with trace viewer
npx playwright test --trace on
npx playwright show-trace test-results/trace.zip
```

## CI Integration

```yaml
# .github/workflows/playwright.yml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: npm ci
- run: npx playwright install --with-deps
- run: npx playwright test
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| `page.click('.btn-primary')` | Brittle, no semantic meaning | `page.getByRole('button', { name: 'Submit' }).click()` |
| `page.waitForTimeout(1000)` | Flaky, slow | `page.waitForResponse('**/api/data')` |
| Shared test account | State leaks between tests | Isolate data per test |
| No retries in CI | Network flakes cause failures | `retries: 2` in CI |
| Screenshots on every run | Wastes storage | `screenshot: 'only-on-failure'` |
| Hardcoded URLs | Environment-specific breakage | Use `baseURL` config |
| No visual regression | UI changes break layout | Add `expect(page).toHaveScreenshot()` |

## Validation Checklist

- [ ] `playwright.config.ts` has `fullyParallel: true`
- [ ] `retries` configured for CI (2 for CI, 0 for local)
- [ ] `projects` cover required browsers (Chromium minimum, +WebKit for Safari)
- [ ] Trace configured: `trace: 'on-first-retry'`
- [ ] `globalSetup` handles test data seeding if needed
- [ ] `testResultsDir` is in `.gitignore`

## Official Resources

- [Playwright docs](https://playwright.dev/)
- [Best practices](https://playwright.dev/docs/best-practices)
- [API reference](https://playwright.dev/docs/api/class-page)
- [Trace viewer](https://playwright.dev/docs/trace-viewer)
- [CI configuration](https://playwright.dev/docs/ci)
