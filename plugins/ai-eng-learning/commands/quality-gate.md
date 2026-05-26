---
name: ai-eng/quality-gate
description: Define or update a file-backed quality gate with checks, owners, and escalation rules
agent: build
version: 1.0.0
---

# Quality Gate

Define or refine the gate for: $ARGUMENTS

Use `templates/quality/gate.md`.

## Goal

Write a repeatable quality gate that can be reviewed by humans before work ships.

## Output

- Add or update a gate file under `docs/quality/`.
- Optionally update `docs/quality/README.md` or another gate index if you keep one.

## Process

1. Name the gate and the scope it covers.
2. List exact checks, evidence, and pass/fail criteria.
3. Note owner, escalation path, and exceptions.
4. Link the gate to related decisions, rules, and reviews.
5. Keep the checks concrete and observable.

## Good Gate Traits

- Few checks, high signal.
- Clear evidence source.
- Clear stop/go outcome.
- Explicit exception handling.

## Guardrails

- Do not create vague checks such as “looks good”.
- Do not mix unrelated concerns into one gate.
- If a check cannot be verified, mark it as a gap.
