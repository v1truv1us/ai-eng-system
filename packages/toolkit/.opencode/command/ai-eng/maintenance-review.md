---
name: ai-eng/maintenance-review
description: Run a recurring maintenance review and capture drift, risks, and cleanup priorities
agent: review
version: 1.0.0
---

# Maintenance Review

Review the current state of: $ARGUMENTS

Use `templates/review/maintenance-review.md`.

## Goal

Create a lightweight review record that surfaces drift, stale knowledge, and next maintenance actions.

## Output

- Add a review note under `docs/reviews/maintenance/`.
- Prefer `YYYY-MM-DD-scope.md` naming.
- Optionally update `docs/reviews/maintenance/README.md` or another review index if you keep one.

## Process

1. Define the review scope and date.
2. Check docs, decisions, rules, and quality gates for drift.
3. Capture what is healthy, stale, missing, or contradictory.
4. Record concrete follow-up actions with owners or suggested owners.
5. Link related decisions and knowledge files.

## Review Focus

- Stale documents
- Conflicting rules
- Expired hypotheses
- Missing quality gates
- Repeated maintenance debt

## Guardrails

- Prefer evidence over opinion.
- Separate facts, risks, and actions.
- If a finding is uncertain, mark it for validation.
