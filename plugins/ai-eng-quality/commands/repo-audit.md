---
name: repo-audit
description: Principal-engineer repository audit with evidence-based findings and a prioritized improvement plan. Analysis only — no code changes.
agent: repo-audit-review
version: 1.0.0
inputs:
  - name: target
    type: string
    required: false
    description: Repository path to audit (defaults to current workspace)
  - name: focus
    type: string
    required: false
    description: Optional scope hint (e.g., CI, security, architecture)
outputs:
  - name: audit_report
    type: file
    format: Markdown
    description: Full audit saved to reports/YYYY-MM-DD-repo-audit.md
---

# Repo Audit Command

Run a four-phase principal-engineer audit on: $ARGUMENTS

Load `skills/repo-audit/SKILL.md` and follow it exactly — all four phases in order, analysis only.

```bash
/ai-eng/repo-audit
/ai-eng/repo-audit ../my-other-project
/ai-eng/repo-audit . --focus=CI
```

## What It Does

1. **Discovery** — map stack, architecture, entry points, and conventions before judging
2. **Audit** — severity-rated findings with `file:line` citations across eight dimensions
3. **Strategy** — 3–5 themes, trade-offs, and measurable "done" signals
4. **Task plan** — milestones, effort estimates, quick wins, and implementation sketches for the top 3 tasks

## Process

1. Confirm the audit target (default: current repo root).
2. Run the repo's own verification commands when they exist (`typecheck`, `lint`, `test`, `build`) and treat failures as findings.
3. Work phases 1–4 sequentially — do not skip ahead.
4. Write the full report to `reports/YYYY-MM-DD-repo-audit.md` (create `reports/` if absent).
5. Reply with the executive summary, quick wins, and the report path.

## Output Shape

The report must include:

- Executive Summary (grade A–F, top 3 risks, top 3 opportunities)
- Repo Map
- Audit Report (with Strengths)
- Improvement Strategy
- Task Plan (milestones + quick wins)
- Open Questions

## When to Use

- Re-baselining an important repo after a model or tooling upgrade
- Before a large refactor — know what actually needs fixing
- Onboarding to a codebase you will own
- Periodic health checks on production services or published libraries

## When NOT to Use

- Reviewing a single PR or diff → `/ai-eng/review` or `/ai-eng/deep-review`
- Running lint/typecheck only → `/ai-eng/verify`
- Implementing fixes from a prior audit → `/ai-eng/plan` then `/ai-eng/work`

## Related

- Agent: `repo-audit-review`
- Skill: `repo-audit`
- Prompt origin: Claude Fable 5 "Repo Audit & Improvement Plan" (Obsidian `Project Review Prompt.md`)
