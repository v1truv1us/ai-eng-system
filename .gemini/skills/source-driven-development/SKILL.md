---
name: source-driven-development
description: Ground every framework decision in official documentation. Use when you want authoritative, source-cited code for any framework or library.
---

# Source-Driven Development

## Overview

Verify every framework or library decision against official documentation before implementing. Flag any decision that lacks a source. This skill prevents the agent from relying on outdated patterns, hallucinated APIs, or assumptions about library behavior.

## When to Use

- Working with a framework or library you have not used recently
- When API surface area is large or frequently changing
- When the cost of a wrong assumption is high (auth, data, security)
- When documentation lookup tools are available

## Process

### Step 1: Identify Framework Decisions

Before writing code that depends on a library:
- List every API call, configuration option, or pattern you plan to use
- Note which ones you are confident about and which are assumptions

### Step 2: Verify Against Official Sources

For each decision:
- Look up the current documentation
- Confirm the API exists and behaves as expected
- Note the version the docs target
- If you cannot find a source, flag it explicitly

### Step 3: Cite Sources

In comments or design docs:
- Reference the official doc URL or section
- Note the library version
- Flag anything that could not be verified

### Step 4: Flag Unverified Decisions

Explicitly mark decisions that lack source confirmation:
- `// UNVERIFIED: assuming X based on Y pattern`
- These flags must be resolved before production use

## Source Quality Hierarchy

1. Official documentation (highest)
2. Official examples and repositories
3. Well-maintained community guides with dates
4. Stack Overflow with accepted answers and recent dates
5. AI-generated suggestions (lowest, must be verified)

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I know this library well enough" | Libraries change between versions. Confidence is not accuracy. |
| "Looking up docs slows me down" | Debugging a wrong assumption is slower than verifying upfront. |
| "The AI already knows the right API" | AI training data has a cutoff date. APIs change. |

## Verification

- [ ] Every framework API call is verified against current docs
- [ ] Unverified decisions are explicitly flagged
- [ ] Library versions are documented
- [ ] No code depends on hallucinated or outdated API behavior

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I know this library well enough" | Libraries change between versions. Confidence is not accuracy. |
| "Looking up docs slows me down" | Debugging a wrong assumption is slower than verifying upfront. |
| "The AI already knows the right API" | AI training data has a cutoff date. APIs change. Verify against current docs. |
| "I'll verify after the implementation works" | If the API does not exist, the implementation will not work. Verify first. |
| "Stack Overflow has the answer" | Stack Overflow answers may be outdated. Official docs are the source of truth. |
