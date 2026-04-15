---
name: browser-testing-with-devtools
description: Chrome DevTools for live runtime data - DOM inspection, console logs, network traces, performance profiling. Use when building or debugging anything that runs in a browser.
---

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
