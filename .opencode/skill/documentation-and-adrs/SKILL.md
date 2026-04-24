---
name: documentation-and-adrs
description: Architecture Decision Records, API docs, inline documentation standards. Use when making architectural decisions, changing APIs, or shipping features. Document the why, not the what.
---

# Documentation and ADRs

## Overview

Document architectural decisions, API contracts, and system behavior. Focus on the "why" rather than the "what" because code already tells you what happens. Documentation should explain why it was designed that way.

## When to Use

- Making architectural or design decisions
- Changing public APIs or interfaces
- Shipping features that affect other teams
- Recording tradeoffs and their rationale

## Documentation Types

### Architecture Decision Records (ADRs)

Record significant architectural decisions:
- **Title**: Short noun phrase describing the decision
- **Context**: What is the technical or business situation
- **Decision**: What was decided
- **Consequences**: What results from this decision (positive and negative)
- **Status**: Proposed / Accepted / Deprecated / Superseded

Save as: `docs/decisions/{YYYY-MM-DD}-{title}.md`

### API Documentation

Document public APIs with:
- Endpoint paths and methods
- Request and response schemas
- Error codes and recovery strategies
- Authentication requirements
- Rate limits and quotas
- Versioning information

### Inline Documentation

- Document "why", not "what"
- Explain non-obvious decisions and tradeoffs
- Note gotchas and edge cases
- Reference relevant ADRs, specs, or issues
- Avoid restating what the code already expresses

### README and Getting Started

Every project should have:
- What it does (one paragraph)
- How to install and run it
- How to run tests
- How to contribute
- Where to find more documentation

## Process

### Step 1: Identify What Needs Documentation

- New architectural decisions
- Changed public interfaces
- Non-obvious implementation choices
- Onboarding friction points

### Step 2: Choose the Right Format

- Architectural decision -> ADR
- API surface -> API documentation
- Non-obvious code -> Inline comment
- Project overview -> README

### Step 3: Write for the Reader

- Assume the reader knows the domain but not this specific system
- Be concrete with examples
- Keep it current or mark it as stale
- Prefer short, focused documents over long comprehensive ones

### Step 4: Review for Accuracy

- Verify code examples still work
- Check that referenced paths and commands are correct
- Ensure the documentation matches the current implementation

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The code is self-documenting" | Code tells you what. Documentation tells you why. Both are needed. |
| "Documentation goes stale immediately" | Stale docs are a signal to update, not to stop documenting. |
| "I will document later" | Later never comes. Document alongside the implementation. |

## Verification

- [ ] Architectural decisions have corresponding ADRs
- [ ] Public APIs are documented with examples
- [ ] Inline comments explain "why" not "what"
- [ ] README is current and actionable
