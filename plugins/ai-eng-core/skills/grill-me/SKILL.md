---
name: grill-me
description: "Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when the user wants to stress-test a plan, get grilled on their design, or mentions \"grill me\"."
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Grill Me

## Overview

Stress-test a plan, design, or decision through a relentless, one-question-at-a-time interview. The goal is not to win an argument; it is to walk every branch of the design tree until the user and the agent share the same mental model and the next step is obvious.

## When to Use

- The user says "grill me", "grill this", or "stress-test my plan"
- A design feels half-baked and needs forced clarification
- Dependencies between decisions are unclear
- The team keeps revisiting the same questions
- A spec or proposal needs validation before implementation

## Trigger Phrases

- "Grill me on this plan"
- "Grill this design"
- "Stress-test my approach"
- "Interview me about the architecture"
- "Poke holes in this proposal"

## Execution Rules

1. **One question at a time.** Do not dump a checklist. Ask a single focused question and wait for an answer.
2. **Provide a recommended answer.** After asking, offer what you would recommend given the codebase and context. Frame it as "If I were making this call, I would..." so the user can accept, reject, or refine it.
3. **Walk the tree depth-first.** Resolve the current branch before opening a new one. Track dependencies explicitly: "Before we pick the database, we need to decide the consistency model."
4. **Explore the codebase when applicable.** If a question can be answered by reading code, tests, docs, or configuration, inspect the repo instead of asking. Cite file paths and evidence.
5. **Surface assumptions.** Name what you are assuming before you ask the next question.
6. **Summarize before moving on.** After resolving a branch, state the agreed decision and how it constrains remaining branches.

## Suggested Branches

Use these as a default decision tree, adapted to the user's domain:

- **Goal and success criteria** — What outcome must be true for this to be done?
- **Scope boundaries** — What is in, out, and deferred?
- **Constraints** — Time, budget, compliance, team, tech, and maintainability limits.
- **Dependencies** — What must be decided first? What blocks what?
- **Trade-offs** — What are we optimizing for? What are we willing to give up?
- **Risks and mitigations** — What could invalidate the plan? How would we know?
- **Ownership and next step** — Who decides, who implements, and what is the first action?

## Example Invocation Flow

User: "Grill me on my plan to migrate the auth service to OAuth2."

Agent: "Before we talk about OAuth2 providers, what outcome must be true for this migration to be considered done? My recommendation: define a single acceptance test where a user can log in, revoke the session, and the old token format is rejected."

User: "Done means no more legacy sessions and all clients use the new flow."

Agent: "Got it. That means we need to decide how to handle active legacy sessions. I explored `src/auth/session.ts` and see we currently issue 30-day refresh tokens. I recommend a forced re-authentication at the OAuth2 cutover rather than backporting revocation. Do you accept that?"

User: "Accept."

Agent: "Next branch: which OAuth2 flow per client type? ..."

## Verification

- [ ] Every branch of the design tree has been resolved or explicitly parked
- [ ] Each decision is recorded with the assumption it depends on
- [ ] The user and agent can state the plan in the same words
- [ ] The next action is concrete and owned

## Anti-Rationalization Table

| Excuse | Counter |
|---|---|
| "I already thought this through" | Thinking privately is not the same as shared understanding. One forced question usually exposes a gap. |
| "This is too detailed" | The detail is where plans fail. Better to surface it now than at 2 a.m. in production. |
| "Can you just give me the answer?" | Answers without shared context get rejected or misapplied. The interview builds the context that makes the answer stick. |
| "We can decide that later" | Later decisions often invalidate earlier ones. Park only when the dependency direction is clear. |
