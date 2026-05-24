---
name: api-and-interface-design
description: Contract-first design, Hyrum's Law, One-Version Rule, error
  semantics, boundary validation. Use when designing APIs, module boundaries, or
  public interfaces.
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
# API and Interface Design

## Overview

Design APIs and module boundaries with contract-first thinking. Apply Hyrum's Law (all observable behaviors will be depended on), the One-Version Rule (prefer one way to do something), and clear error semantics. Public interfaces deserve more care than internal ones.

## When to Use

- Designing REST or GraphQL API endpoints
- Creating module boundaries within an application
- Building SDKs, libraries, or shared packages
- Defining function signatures that cross module boundaries

## Core Principles

### Contract-First Design

Define the contract before implementation:
- Input shapes with validation rules
- Output shapes with all possible variants
- Error responses with clear semantics
- Versioning strategy

### Hyrum's Law

Every observable behavior of your API will eventually be depended on by someone. Design accordingly:
- Be explicit about what is guaranteed vs what is implementation detail
- Document only what you commit to maintaining
- Hide internal details behind stable interfaces

### One-Version Rule

Prefer one way to accomplish a given task:
- Avoid multiple endpoints that do the same thing with different syntax
- Avoid multiple function signatures for the same operation
- If you must provide convenience methods, make one canonical path clear

### Error Semantics

Errors should be:
- Specific enough to be actionable
- Consistent across the API surface
- Accompanied by enough context to debug
- Categorized: client errors (4xx) vs server errors (5xx)

### Boundary Validation

Validate all input at system boundaries:
- External API endpoints
- Module boundaries
- Database queries
- File parsing

## Process

### Step 1: Define the Contract

Write the API contract before any implementation:
- Endpoint paths and HTTP methods
- Request and response schemas
- Error response formats
- Pagination patterns if applicable

### Step 2: Validate the Contract

Review for:
- Consistency with existing API patterns
- Naming clarity and predictability
- Completeness of error cases
- Backward compatibility implications

### Step 3: Implement Against the Contract

- Implementation should match the contract exactly
- If the contract needs to change, update the contract first
- Add contract tests that verify implementation matches

### Step 4: Document the Public Surface

- Document only guaranteed behavior, not implementation details
- Include examples for common use cases
- Document error cases and recovery strategies

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can refine the API after it works" | Breaking changes after adoption are expensive and disruptive. |
| "This is an internal API, it does not matter" | Internal APIs become external APIs the moment another team depends on them. |
| "Adding more parameters is backward compatible" | Adding parameters increases the surface area that consumers may depend on. |

## Verification

- [ ] Contract is defined before implementation
- [ ] All error cases have defined responses
- [ ] Boundary validation covers all external inputs
- [ ] Public surface is documented with examples
- [ ] Contract tests verify implementation matches specification

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll define the contract as I implement" | Without a contract, implementation drifts. Define it first to catch design flaws early. |
| "This is an internal API, Hyrum's Law doesn't apply" | Internal APIs become external the moment another team depends on them. Design accordingly. |
| "Adding one more endpoint is quick" | Every new endpoint increases the surface area consumers depend on. One-version rule prevents confusion. |
| "Error handling can be added later" | Inconsistent error semantics are hard to retrofit. Define error responses upfront. |
| "The contract tests are too much overhead" | Contract tests catch drift between spec and implementation. They prevent silent breaking changes. |
