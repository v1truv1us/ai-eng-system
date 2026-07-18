# Autoreview Skill-Health Loop

A self-healing, self-learning auditor for the skills catalog. Runs on a weekly cron (`.github/workflows/skill-health.yml`), locally via `bun run skill:health`, and after every skill change. Adapts the article's *autoreview* pattern (package changes → separate model reviews → fix → repeat until clean) to skill hygiene.

## The loop

```
        ┌─────────────────────────────────────────────────────┐
        │  skill-invocation-logger (PostToolUse hook)          │
        │  appends every `skill` call to a JSONL ledger        │
        └──────────────┬──────────────────────────────────────┘
                       │ usage signal (learning)
                       ▼
┌──────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌──────────┐
│ DETECT   │→ │  SELF-HEAL        │→ │  REPORT           │→ │ HUMAN    │
│ 5 checks │  │  safe fixes only  │  │  dated + history  │  │ merge/   │
└──────────┘  └──────────────────┘  └──────────────────┘  └──────────┘
```

1. **DETECT** — five scanners (`scripts/lib/skill-health.ts`):
   - `redundancy` — near-duplicate descriptions (Jaccard on tokens). Possible merges.
   - `staleness` — hard-coded model slugs / version pins that drift. Flagged for refresh against provider docs; never auto-rewritten (that would be guessing).
   - `eval-gap` — model-invoked skills (auto-load) without `evals/` proof. **Enforced as HIGH.**
   - `unused` — zero `skill`-tool invocations in the ledger window. Possible dead weight.
   - `frontmatter-drift` / `oversize` — taxonomy violations and >12KB auto-loads.
2. **SELF-HEAL** (`--heal`) — safe, mechanical fixes only: `format-skills:fix`, eval scaffolding for model-invoked skills. Anything needing judgment (merges, slug refreshes) is **reported, not applied**.
3. **REPORT** — `reports/skill-health-YYYY-MM-DD.md` grouped by severity, plus a `skill-health-history.jsonl` trend line so each run is comparable to the last.
4. **HUMAN** — the weekly PR (`chore/skill-health`) carries the report; merges/staleness refresh stay human decisions.

## Learning signals (how it gets smarter over time)

- **Invocation ledger** (`reports/.skill-invocations.jsonl`, written by `hooks/skill-invocation-logger.sh`): skills that are never invoked get flagged for re-audit; heavily-used skills are weighted as worth keeping.
- **Eval-results ledger** (`reports/skill-eval-results.md`, written by `benchmarks/evaluation/skill-ablation.ts`): the with-skill-vs-without-skill verdict per skill. Re-run on every model upgrade — a skill that stops beating baseline is a retire candidate (shelf-life detection).
- **History ledger** (`reports/skill-health-history.jsonl`): finding-count trend. A rising trend means new bloat is creeping in.

## Commands

| Command | Effect |
|---|---|
| `bun run skill:health` | Audit only; exit 1 on any HIGH finding (CI gate). |
| `bun run skill:heal` | Audit + self-heal safe findings. |
| `bun run eval:skill <name>` | Emit + judge with/without pairs for one skill. |
| `bun run lint:skill-evals` | Hard gate: every model-invoked skill has `evals/`. |

## Wiring

- **CI** (`ci.yml`): `format:skills` + `lint:skill-evals` run on every PR.
- **Cron** (`skill-health.yml`): weekly self-heal + PR.
- **Hook** (`hooks/hooks.json`): `skill-invocation-logger` on PostToolUse.

## Philosophy

Skills earn their place with proof (private context / custom tool / specific workflow) — the same bar as `skills/AGENTS.md`'s "Adding a Skill" policy and `reports/skills-audit-2026-07.md`. The loop keeps the catalog honest as models improve and as new skills are added, without needing a manual audit each time.
