---
name: ai-eng/decision-journal
description: Record decisions in a lightweight journal with context, tradeoffs, and follow-up signals
agent: build
version: 1.0.0
---

# Decision Journal

Record the decision behind: $ARGUMENTS

Use `templates/decisions/decision.md`.

## Goal

Create a durable decision record that explains why the choice was made, what was considered, and what to revisit later.

## Output

- Add a new file under `docs/decisions/`.
- Prefer `YYYY-MM-DD-short-title.md` naming.
- Optionally update `docs/decisions/README.md` or another index file if you keep one.

## Process

1. State the decision in one sentence.
2. Capture the context, constraints, and options considered.
3. Record the chosen option, tradeoffs, and rollback trigger.
4. Link related knowledge, rules, and quality gates.
5. Keep it short and factual.

## Minimum Sections

- Title
- Status
- Date
- Context
- Decision
- Options considered
- Consequences
- Review trigger
- Links

## Guardrails

- Prefer decisions that are stable enough to matter beyond one session.
- Do not rewrite history; supersede old entries with a new one.
- Mark unknowns explicitly instead of implying certainty.
