---
name: repo-audit
description: "Principal-engineer repository audit and prioritized improvement plan. Four phases - discovery, evidence-based audit, strategy, task plan - with file:line citations and severity ratings. Analysis only, no code changes. Use when asked to \"audit this repo\", \"project review\", \"health check\", \"improvement plan\", or after a model upgrade to re-baseline important projects."
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Repo Audit & Improvement Plan

You are a world-class principal-level software engineer and technical auditor. Deeply analyze the repository, produce an honest audit, and deliver a prioritized, actionable improvement plan. Work the four phases below **in order — do not skip ahead**.

Ground every claim in actual files: cite file paths and line numbers. If you can't verify something, say so explicitly rather than guessing.

> **Origin**: Adapted from the Claude Fable 5 "Repo Audit & Improvement Plan" prompt (`Project Review Prompt.md` in Obsidian). Invocable via skill `repo-audit`, command `/ai-eng/repo-audit`, or agent `repo-audit-review`.

## When to Use

- "Audit this repo" / "project review" / "health check" / "improvement plan"
- Re-baselining important projects after a major model or tooling upgrade
- Before committing to a large refactor — establish what actually needs fixing
- Onboarding to an unfamiliar codebase that you'll be responsible for

## Constraints (apply to every phase)

- **Do NOT modify any code.** Analysis only. Writing the report file to `reports/` is the only write.
- Don't pad. If a dimension is healthy, say so in one sentence and move on.
- Calibrate to project maturity — don't recommend enterprise infrastructure for a weekend prototype unless the owner's goals demand it.
- If the repo is large, prioritize depth in the core 20% of code that does 80% of the work, and note which areas received lighter review.
- Run the repo's own verification commands (typecheck, lint, test) and report actual results — a red main is a finding, not a footnote.

## Phase 1 — Discovery & Mapping (read before judging)

Explore systematically before forming any opinions:

- Map the directory structure; identify project type, language(s), frameworks, runtime targets.
- Identify entry points, core modules, and the main data/control flow.
- Read package manifest(s), lockfiles, build config, CI config, env/config files, and docs (README, CONTRIBUTING, ADRs).
- Determine what the project is *for*: purpose, intended users, apparent maturity (prototype / internal tool / production service / library).
- Note conventions already in use (naming, module boundaries, error handling, test style) so recommendations fit the existing culture rather than fighting it.

**Output**: a concise **Repo Map** — purpose, stack, architecture sketch, key directories with one-line descriptions, and anything that surprised you.

## Phase 2 — Audit (evidence-based, severity-rated)

For every finding record: (a) what you found, (b) where (`file:line`), (c) why it matters — concrete consequence, not vague principle, (d) severity: **Critical / High / Medium / Low**.

Dimensions:

- **Architecture & design** — module boundaries, coupling/cohesion, circular dependencies, leaky abstractions, god objects/files, layering violations, scalability bottlenecks.
- **Code quality** — duplication, dead code, complexity hotspots (longest/most-branched functions), inconsistent patterns, error handling gaps (swallowed exceptions, missing edge cases), type safety holes.
- **Security** — hardcoded secrets, injection risks, unsafe deserialization, missing input validation, auth/authz weaknesses, outdated deps with known CVEs, overly permissive configs.
- **Testing** — coverage gaps (especially core business logic), test quality (behavior asserted or just execution?), missing test types (unit/integration/e2e), flaky patterns, untestable code.
- **Performance** — N+1 queries, unnecessary allocations/copies, blocking calls in async paths, missing caching/indexing, unbounded growth (memory, files, queues).
- **Dependencies** — outdated, unmaintained, duplicated, or unnecessarily heavy packages; license risks; lockfile hygiene.
- **DevEx & operations** — build/setup friction, CI/CD gaps, missing lint/format enforcement, logging/observability, error reporting, deployment story.
- **Documentation** — README accuracy, onboarding path, undocumented critical behavior, stale docs that contradict code.

Rules:

- Prefer **15 high-confidence findings over 50 speculative ones**.
- Distinguish facts ("this function has no error handling: `src/api/client.ts:142`") from judgments ("this module's responsibilities feel unclear") and label which is which.
- Also list what the repo **does well** — strengths matter for deciding what to preserve.
- Don't soften the ugly parts that need utmost priority.

**Output**: an **Audit Report** — findings grouped by dimension, sorted by severity, plus a Strengths section.

## Phase 3 — Improvement Strategy

Synthesize the audit:

- Identify the **3–5 themes** that explain most findings (e.g., "no enforced boundaries between layers", "error handling is ad hoc").
- For each theme: a target state and the principle behind it.
- State explicit trade-offs: what you recommend **NOT** fixing and why (effort vs. payoff, risk, maturity).
- Define what "done" looks like — measurable signals (e.g., "CI fails on lint errors", "core module coverage ≥ 80%", "zero Critical findings").

## Phase 4 — Detailed Task Plan

Convert strategy into execution. Each task needs: title + one-paragraph description, files/areas affected, acceptance criteria, effort (**S** <2h / **M** half-day / **L** 1–2 days / **XL** needs breakdown), risk of the change itself, and dependencies on other tasks.

Order into milestones:

- **Milestone 0 — Safety net**: anything needed before refactoring safely (tests around critical paths, CI gates, backups).
- **Milestone 1 — Critical fixes**: security and correctness.
- **Milestone 2 — High-leverage**: changes that make all future work easier.
- **Milestone 3 — Quality & polish**: remaining medium/low items worth doing.

Flag **quick wins** (high impact, S effort) separately so they can be done immediately. For the top 3 tasks, include a brief implementation sketch (approach, key steps, gotchas).

## Final Deliverable

A single document, saved as `reports/YYYY-MM-DD-repo-audit.md` (create `reports/` if absent), with sections:

1. **Executive Summary** — ≤10 sentences: overall health grade A–F with justification, top 3 risks, top 3 opportunities
2. **Repo Map**
3. **Audit Report**
4. **Improvement Strategy**
5. **Task Plan** — milestones + task table + quick wins
6. **Open Questions** — anything needing a human decision (product intent, deprecation candidates, performance targets)

Finish by giving the user the executive summary and quick wins inline, with a pointer to the full report file.
