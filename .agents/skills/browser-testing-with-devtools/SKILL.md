---
name: browser-testing-with-devtools
description: Chrome DevTools for live runtime data - DOM inspection, console
  logs, network traces, performance profiling. Use when building or debugging
  anything that runs in a browser.
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
# Browser Testing with DevTools

## Overview

Use browser DevTools to verify runtime behavior, debug issues, and measure performance. DevTools provides ground truth that code review and unit tests cannot.

## When to Use

- Verifying that a UI component renders correctly
- Debugging layout, styling, or interaction issues
- Measuring page load performance
- Inspecting network requests and responses
- Profiling JavaScript execution

## DevTools Capabilities

### Elements Panel

- Inspect DOM structure
- Verify CSS properties and computed styles
- Check accessibility properties
- Debug layout issues (box model, flex, grid)

### Console Panel

- View runtime errors and warnings
- Execute debugging expressions
- Monitor custom log output
- Check network-related errors

### Network Panel

- Inspect HTTP requests and responses
- Verify request headers, payloads, and status codes
- Check timing and waterfall for performance
- Identify unnecessary or failed requests

### Performance Panel

- Record and analyze runtime performance
- Identify long tasks blocking the main thread
- Check rendering performance (layout thrash, paint storms)
- Profile memory usage and leaks

### Application Panel

- Inspect localStorage, sessionStorage, cookies
- Verify service worker status
- Check indexedDB contents
- Review cached resources

## Process

### Step 1: Open DevTools

- Chrome: F12 or Cmd+Option+I
- Navigate to the relevant panel for the task

### Step 2: Reproduce the Scenario

- Navigate to the affected page or component
- Trigger the user action that needs verification
- Observe the result in the relevant panel

### Step 3: Collect Evidence

- Screenshots of rendering issues
- Console output for errors and warnings
- Network requests for API-related issues
- Performance traces for speed issues

### Step 4: Analyze and Fix

- Identify the root cause from the evidence
- Make the fix
- Verify the fix in DevTools
- Document the issue and resolution

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It looks fine in the code" | Code can look correct and still render incorrectly due to CSS specificity, browser bugs, or dynamic state. |
| "Unit tests cover this" | Unit tests cannot catch rendering issues, layout bugs, or network timing problems. |
| "DevTools is too slow to use regularly" | A 30-second DevTools check catches issues that take hours to debug later. |

## Verification

- [ ] Component renders correctly in the browser
- [ ] No console errors or warnings
- [ ] Network requests succeed with correct payloads
- [ ] Performance meets acceptable thresholds
- [ ] Accessibility properties are correct in the DOM

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "It looks fine in the code" | Code can be correct and still render incorrectly due to CSS, browser bugs, or dynamic state. |
| "Unit tests cover this" | Unit tests cannot catch rendering issues, layout bugs, or network timing problems. |
| "DevTools is too slow to use regularly" | A 30-second DevTools check catches issues that take hours to debug later. |
| "I'll test it in production" | Production is not a testing environment. Catch issues before users do. |
| "The performance numbers look good on my machine" | Your machine is not your users' machine. Profile on realistic hardware and network conditions. |
