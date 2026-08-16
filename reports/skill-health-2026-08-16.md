# Skill Health — 2026-08-16

**Catalog:** 85 core skills · 11 model-invoked · 78 with evals.
**Findings:** 9 (0 high, 9 medium, 0 low)

## Auto-healed (1)

- format-skills: normalized frontmatter

### High

_None._

### Medium (9)

- **pstack/reflect** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/arena** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/why** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/poteto-mode** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **pstack/how** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **architect** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **cursor-sdk** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **interrogate** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 
- **dynamic-router** — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks. 

### Low

_None._

## What needs a human

- **[staleness]** pstack/reflect — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/arena — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/why — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/poteto-mode — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** pstack/how — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** architect — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** cursor-sdk — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** interrogate — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.
- **[staleness]** dynamic-router — Hard-coded model slug(s) that will drift: . Refresh against provider docs or use capability checks.

_Re-run `bun run skill:heal` weekly (see .github/workflows/skill-health.yml). A skill that no longer beats its no-skill baseline is a retire candidate — see reports/skill-eval-results.md._
