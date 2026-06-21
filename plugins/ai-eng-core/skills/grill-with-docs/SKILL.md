---
name: grill-with-docs
description: Extend grill-me by producing or updating a CONTEXT.md or ADR-style decision record while stress-testing a plan. Use when the user wants to be grilled and wants the shared understanding persisted as a living document.
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Grill With Docs

## Overview

Run the same relentless, one-question-at-a-time interview as `grill-me`, but write down what you learn as you go. The output is a living `CONTEXT.md` or Architecture Decision Record (ADR) that captures the problem, the explored branches, the resolved decisions, and the remaining open questions.

## When to Use

- The user wants to be grilled and wants a document to hand off
- A design review needs a durable record
- A decision affects multiple teams or future maintainers
- The team needs a single source of truth for why a path was chosen
- The user explicitly says "grill me and write it up" or "grill with docs"

## Trigger Phrases

- "Grill me and document it"
- "Grill this and produce a CONTEXT.md"
- "Grill with docs"
- "Stress-test this and write an ADR"
- "Interview me and capture the decisions"

## Execution Rules

1. **Run `grill-me` first.** Ask one question at a time, provide recommended answers, explore the codebase when applicable, and resolve each branch before moving on.
2. **Write incrementally.** After resolving each branch, append the decision to the running document. Do not wait until the end.
3. **Use the agreed format.** Default to `CONTEXT.md` in the project root or beside the relevant code. Use the project's ADR template if one exists in `docs/decisions/` or `adr/`.
4. **Capture decisions, not chat.** The document should stand alone: state the question, the options considered, the chosen answer, the reasoning, and the constraints it imposes.
5. **Update, do not duplicate.** If a `CONTEXT.md` or ADR already exists for this topic, update it. Do not create a parallel file unless the user asks for one.
6. **Close with open questions.** List any parked branches or unresolved risks with an owner and a trigger for revisiting them.

## Document Structure

Default `CONTEXT.md` outline:

- **Problem** — What are we deciding and why does it matter?
- **Goals and Non-Goals** — What is in scope and what is explicitly out?
- **Explored Branches** — For each branch: question, options, recommendation, decision.
- **Dependencies** — Which decisions block which others?
- **Risks and Mitigations** — What could invalidate this plan?
- **Decided Approach** — The agreed path in one paragraph.
- **Open Questions** — Parked items with owners and revisit triggers.
- **References** — Files, docs, tickets, or conversations cited during the grill.

## Example Invocation Flow

User: "Grill with docs on the new caching layer."

Agent: "I'll interview you about the caching layer and write the shared understanding to `CONTEXT.md` as we go. First question: what user-visible problem must the caching layer solve? My recommendation: state it as a latency or cost metric with a threshold."

User: "Reduce p95 API latency from 800ms to under 200ms."

Agent: "Noted. I'll append that as the goal. Next question: which data is cacheable? I explored `src/data/` and see mixed read/write patterns. I recommend starting with the read-heavy catalog endpoints. Accept?"

User: "Accept."

Agent: "Appended. Next branch: cache invalidation strategy..."

[After all branches are resolved]

Agent: "Interview complete. I wrote the decisions to `docs/decisions/2026-06-17-caching-layer.md`. The open questions are listed at the bottom with owners. Please review and edit the reasoning if I misrepresented anything."

## Verification

- [ ] The document reflects every resolved branch
- [ ] Each decision includes the reasoning and a cited constraint
- [ ] Open questions have an owner and a revisit trigger
- [ ] The document location is discoverable from the relevant code or README
- [ ] The user has reviewed and accepted the final write-up

## Anti-Rationalization Table

| Excuse | Counter |
|---|---|
| "I'll write it up later" | Later rarely comes. Writing incrementally captures reasoning while it is fresh. |
| "The chat log is enough" | Chat logs are not searchable or maintainable. A decision record outlives the session. |
| "This doc will go stale" | A document with open questions and revisit triggers stays alive. A missing document is already stale. |
| "We do not have an ADR template" | Use the default `CONTEXT.md` outline here. Consistency beats perfection. |
