# Skill Health — 2026-07-18

**Catalog:** 85 core skills · 11 model-invoked · 64 with evals.
**Findings:** 9 (0 high, 9 medium, 0 low)

### High

_None._

### Medium (9)

- **dynamic-claude-router** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **interrogate** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **cursor-sdk** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **architect** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/why** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/how** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/reflect** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/poteto-mode** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/arena** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 

### Low

_None._

## What needs a human

- **[staleness]** dynamic-claude-router — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** interrogate — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** cursor-sdk — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** architect — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/why — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/how — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/reflect — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/poteto-mode — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/arena — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.

_Re-run `bun run skill:heal` weekly (see .github/workflows/skill-health.yml). A skill that no longer beats its no-skill baseline is a retire candidate — see reports/skill-eval-results.md._
