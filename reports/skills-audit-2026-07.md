# Skills Audit — 2026-07-17

**Audience:** maintainers of `ai-eng-system`.
**Framework:** A skill earns its place only by providing (A) **private context**, (B) **custom tool access**, or (C) a **specific custom workflow**. Skills that restate public knowledge, duplicate another skill, or are plain-prompting-equivalent are retired — on current frontier models they fight the model's training, inflate routing cost, and add noise. (Source: *Skills could be making your AI worse*, Every.io; corroborated by SWE-Skills-Bench: 39 of 49 tested SE skills had no impact, 3 were net-negative.)

## Headline

| | Before | After | Delta |
|---|---:|---:|---:|
| Core skills (`skills/`, excl. `gtm/`) | 127 | **87** | −40 |
| → of which **model-invoked** (auto-load; routing cost) | 69 | **32** | **−37** |
| → of which user-invoked (opt-in; ~0 cost) | 58 | 55 | −3 |
| `skills-gtm/` (vendored, advisory only) | 205 | 205 | 0 |

The auto-load surface shrank by **54%** — the set that actually costs startup tokens and can contaminate the model. The 40 retirements are reversible via git.

## What was retired (40)

Full per-skill rationale and migration paths: `skills/DELETED_SKILLS.md` → **Batch 2**. Summary:

- **2a — Stubs & public-knowledge domain restatements (20):** `check-compiler-errors`, `fix-merge-conflicts`, `get-pr-comments`, `new-branch-and-pr`, `run-smoke-tests`, `review-and-ship`, `what-did-i-get-done`, `git-workflow-and-versioning`, `deprecation-and-migration`, `documentation-and-adrs`, `frontend-ui-engineering`, `api-and-interface-design`, `performance-optimization`, `context-budget`, `context-engineering`, `graphify`, `dependency-graph-analysis`, `idea-refine`, `content-optimization`, `verify-this`.
- **2b — Duplicate principle skills (18):** all 5 root `principle-*` + 13 `pstack/principle-*`. Each restated a well-known axiom (YAGNI, root-cause debugging, type discipline, boundary validation, idempotency…). `docs/attribution/cursor-plugins.md` already marked them "Skipped (duplicate)". `poteto-mode` was updated to inline the one-line guidance, so the leaves are no longer needed.
- **2c — Prompt cluster collapse (2):** `prompt-engineering` and `incentive-prompting` → survivor `prompt-refinement` (the only one wired into `/ai-eng/{research,specify,plan,work,review}`).

## Integrity findings (fixed)

1. **`incentive-prompting` self-contradiction (FIXED).** The skill's v2 (`SKILL.md:14`) explicitly forbade the persona/stakes/challenge techniques that `AGENTS.md` and `skills/AGENTS.md` still advertised as "+45-115% quality improvement" — a live false-advertising loop. Retired the skill; rewrote `AGENTS.md` (removed the "Automatic Prompt Optimization System" section + the Bsharat/Yang/Li/Kong research-claims block) and `skills/AGENTS.md` to describe `prompt-refinement`'s actual Task/Context/Constraints/Output/Verify contract.
2. **`pstack` cluster drift.** `poteto-mode` pointed at 18 leaf skills that the attribution doc already treated as duplicates. Inlined; the aggregator is now self-contained.
3. **Templated marketing.** Several `+n%` / "Expert n" placeholders in `AGENTS.md` were already half-scrubbed; the prompt-optimization rewrite completes that.

## The 87 survivors — classification

### KEEP — private context / custom tool / specific workflow (≈40)
Repo-specific workflows and tool wiring the model can't reproduce: `npm-trusted-publishing`, `cursor-sdk`, `agents-sdk-dev`, `cross-repo-refactor`, `investigation-loop`, `test-fix-loop`, `dreaming-consolidator`, `dynamic-claude-router`, `orchestrate`, `architect`, `interrogate`, `comprehensive-research`, `using-agent-skills`, `sync-skill-taxonomy`, `plugin-dev`, `monorepo-initialization`, `knowledge-architecture`, `teach`, `pr-review-canvas`, `storm-research`, `planning-and-task-breakdown`, `check-agent-compatibility`, `create-goal`, `grill-me`, `grill-with-docs`, `eval-harness`, `repo-audit`, `morning-brief`, `weekly-review`, `docs-canvas`, `gemini-agent-sdk`, `control-cli`, `control-ui`, `multimodal-corpus-ingestion`, `graph-rag`, `context-engineering`(n/a — deleted)… (full list in `skills/`).

### RETEST — version-pinned / shelf-life (re-audit each model bump)
`docker`, `k8s`, `github`, `sentry`, `slack`, `playwright`, `xcodebuild`, `monitoring`, `coolify-deploy`, `source-driven-development`, `dynamic-claude-router`, `architect`, `interrogate`, `cursor-sdk`. These encode version/API specifics that drift; `dynamic-claude-router`/`architect`/`interrogate` carry hard-coded model slugs already at risk. **Phase 4 eval harness validates these.**

### DEFERRED — public-knowledge content, but hard-loaded by a command/agent (kept pending repoint)
Per the framework, a skill that is the documented procedure of a command counts as a "specific workflow" and was **not** deleted in-place. To retire these, their command/agent must be repointed first:
- `code-simplification` ← `/simplify` + `ai-eng/simplify`
- `incremental-implementation` ← `/work`
- `spec-driven-development` ← `/spec`
- `thermo-nuclear-{code-quality,security,architecture,performance}-review` ← `/deep-review` dispatch table + 4 reviewer agents
- `security-and-hardening` ← `security-scanner` agent
- `debugging-and-error-recovery`, `code-review-and-quality`, `ci-cd-and-automation`, `shipping-and-launch`, `test-driven-development`, `verification-loop`, `browser-testing-with-devtools` — referenced by review/verify flows (borderline; revisit in Batch 2e with eval evidence)
- `knowledge-capture` ← `teach` + docs
- `research-deep` ← deployed `agents/research-runner/` cron service — **stays**

## How safety was verified

- `build.ts:209 validateCommandSkillReferences` + `build.ts:939 validateCanonicalSkills` fail loudly if a deleted skill is still command-loaded. Every batch passed `bun run build` + `bun run validate`.
- Pre-execution reference sweep classified every candidate as wired (defer) vs unwired (delete). Skill→skill fixups applied (`monorepo-initialization`, `control-ui`, `poteto-mode`, 2 prompt-repoint agents, `plugin-dev`).
- `tests/integration/content-parity.test.ts`: 111/111 pass.
- Full suite: **43 failures before and after — identical, zero regressions** (failures are pre-existing parallel-test pollution in build/perf/installation fixtures, unrelated to skills).
- `bun run format:skills`: 0 errors, 0 warnings across 292 skills.
- Index docs + counts updated: `README.md` (292 = 87 core + 205 GTM), `docs/reference/skills.md` (87), `skills-first-map.md`, `workflow-surface-matrix.md`, `using-agent-skills`, `AGENTS.md`, `skills/AGENTS.md`, `build.ts` PLUGIN_MAP, `tests/integration/content-parity.test.ts`.

## Follow-ups

- **Batch 2e (borderline):** run the Phase 4 with/without eval on `code-review-and-quality`, `debugging-and-error-recovery`, `verification-loop`, and the RETEST set; retire any that don't beat the no-skill baseline.
- **Deferred repoint:** rewrite `/simplify`, `/work`, `/spec`, `/deep-review` and the `security-scanner` agent to inline their skill's guidance, then retire the underlying skills.
- **`skills-gtm/`:** see `reports/skills-gtm-advisory.md` — 156/205 are public-knowledge RETIRE candidates; advisory only (vendored).
- **Governance:** Phase 5 adds an "add a skill only if" policy + CI lint requiring `evals/` on every model-invoked skill, to prevent re-bloat.
