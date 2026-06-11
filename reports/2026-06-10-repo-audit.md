# Repo Audit & Improvement Plan — ai-eng-system

Date: 2026-06-10 · Method: 4-phase principal-engineer audit (Discovery → Audit → Strategy → Task Plan) · Analysis only, no code modified.

---

## Executive Summary

Overall health grade: **C+**. The project is real and shipped — three npm packages with OIDC trusted publishing, a large agent/skill/command catalog, and substantial test suites — but the foundation under it is soft. `main` does not typecheck (7 errors in 3 files) and does not lint (114 errors), and no CI workflow runs tests, lint, or typecheck, so nothing prevents further regression. The single biggest structural risk is that `src/` and `packages/cli/src/` are near-complete duplicates of each other that have already drifted (at least 6 files differ between copies), meaning bug fixes silently land in one copy and not the other. Top 3 risks: (1) duplicated, drifting source trees; (2) zero CI quality gates on a red main; (3) documentation that asserts counts and behavior the repo contradicts (38 vs 44 agents, corrupted `src/AGENTS.md`). Top 3 opportunities: (1) pick one canonical source tree and delete the other — roughly 25k lines of liability removed; (2) a single CI workflow gating typecheck+lint+test, which makes every future change safer; (3) generate doc counts from the build instead of hand-writing them. Strengths worth preserving: modern Bun/Biome/TypeScript toolchain, provenance-enabled publishing, broad test files, and clean secret hygiene.

---

## Phase 1 — Repo Map

**Purpose**: AI engineering workflow toolkit for Claude Code, OpenCode, Cursor, Gemini, and Pi — namespaced commands, ~38–44 specialized agents, 85 skill directories, plus an installer CLI. Maturity: published npm packages (`@ai-eng-system/core`, `@ai-eng-system/toolkit`, `@ai-eng-system/cli`, root v1.6.10) — i.e., production-distributed tooling, though governed like a personal project.

**Stack**: TypeScript (strict), Bun runtime/workspaces, Biome lint/format, bun:test, GitHub Actions (publish-only), npm OIDC trusted publishing.

**Architecture sketch**: Content (agents/, skills/, .claude/, .opencode/, plugins/) is transformed by a 2,202-line root `build.ts` plus `scripts/build-*.ts` into per-platform distributions under `packages/toolkit` and `packages/cli/dist`. Runtime code lives in `src/` (agents, backends, cli, execution, research, context, learning-automation — ~24.8k LOC) and is **duplicated** in `packages/cli/src/` (~30.1k LOC including committed `.d.ts` files).

**Key directories**:
- `src/` — core TS implementation (execution loops, research pipeline, OpenCode backend client)
- `packages/cli/src/` — near-copy of `src/` plus CLI commands and generated `.d.ts`
- `packages/core`, `packages/toolkit`, `packages/daily-brief-sdk` — published lib, generated assets, brief workflows
- `skills/` (85 entries), `agents/`, `.claude/agents/` (44 files) — content catalog
- `tests/` — 8+ suites (unit, build, integration, learning-automation, performance)
- `.github/workflows/` — 7 workflows, all publish/release/marketplace sync; **no test workflow**
- Root — ~25 status/planning markdown files (`NEXT-STEPS.md`, `RELEASE-PLAN.md`, `temp_ai_provider_corrections.md`, …)

**Surprises**: (1) the wholesale `src/` ↔ `packages/cli/src/` duplication with drift; (2) root `package.json:97` lists `"ai-eng-system": "^0.4.0"` — the project depends on an old published version of itself, with no imports found; (3) `src/AGENTS.md` ends with leaked tool-call XML from an agent write.

---

## Phase 2 — Audit Report

Findings are facts unless marked *(judgment)*.

### Architecture & design

| Sev | Finding |
|-----|---------|
| **Critical** | `src/` and `packages/cli/src/` are duplicate trees that have drifted. `diff -rq` reports 83 entries; files that exist in both **and differ**: `agents/registry.ts`, `backends/opencode/client.ts`, `cli/flags.ts`, `cli/run-cli.ts`, `cli/run.ts`, `config/loadConfig.ts`. Example: `src/execution/ralph-loop.ts` (1,470 lines) vs `packages/cli/src/execution/ralph-loop.ts` (1,471). Consequence: a fix applied to one copy ships broken in the other; no mechanism syncs them. |
| Medium | Root `build.ts` is 2,202 lines / 71.6K — a god file for all platform transforms. *(judgment: works, but every platform change funnels through it and it currently has 2 of the 7 type errors.)* |
| Medium | Generated `.d.ts` files are committed inside the source tree (`packages/cli/src/agents/*.d.ts`, `packages/cli/src/cli/*.d.ts`, etc.) — build artifacts mixed with sources invite stale-declaration bugs. |

### Code quality

| Sev | Finding |
|-----|---------|
| **High** | `main` fails `bun run typecheck`: 7 errors in 3 files — `build.ts:44` (2), `packages/cli/src/install/clean.ts:189` (4), `src/execution/ralph-loop.ts:470` (1: `FlowState \| null` passed where `FlowState` required — the `!` is on `load()` result misplaced, `await this.flowStore.load()!` does not narrow). |
| **High** | `bun run lint` fails with 114 errors across 326 checked files. |
| Low | `src/AGENTS.md:56-57` ends with leaked tool-call XML (`</content><parameter name="filePath">src/AGENTS.md`) — corrupted agent-written file committed unreviewed. |

### Security

Healthy in one sentence: a credential-pattern scan over `src`, `packages`, `scripts`, `.github` found no hardcoded secrets, and publishing uses OIDC trusted publishing with provenance (`.github/workflows/publish-*-oidc.yml`) — keep this.

### Testing

| Sev | Finding |
|-----|---------|
| **High** | No CI runs any tests: `.github/workflows/` contains only `publish-all-oidc.yml`, `publish-cli-oidc.yml`, `publish-core-oidc.yml`, `release-cli.yml`, `release-core.yml`, `sync-claude-marketplace.yml`, `test-oidc-publishing.yml` (tests the publish pipeline, not the code). Tests exist and pass locally (`tests/unit.test.ts`: 20 pass, 4 skip) but nothing enforces them. |
| Medium | The duplicated tree is only tested on one side *(judgment: tests target `src/`/root; `packages/cli/src` drift is invisible to the suite)*. |

### Performance

Healthy enough for the project's shape; no hot-path findings at this depth. Lighter review area (see Constraints note).

### Dependencies

| Sev | Finding |
|-----|---------|
| Medium | `package.json:97` — `"ai-eng-system": "^0.4.0"`: the workspace depends on a year-old published copy of itself; no `from "ai-eng-system"` imports exist in `src`, `packages`, or `scripts`. Dead weight + version confusion. |
| Low | `bun.lock` is 211K and the root carries both `main_package.json` and `package.json` — *(judgment: publish-time swapping is workable but fragile)*. |

### DevEx & operations

| Sev | Finding |
|-----|---------|
| Medium | ~25 top-level markdown status files (`NEXT-STEPS.md`, `RELEASE-PLAN.md`, `IMPLEMENTATION-ROADMAP.md`, `IMPLEMENTATION-VERIFICATION.md`, `PATCH_NOTES.md`, `MODULARIZATION.md`, `TODO.md`, `temp_ai_provider_corrections.md`, …). Onboarding can't tell current docs from fossils. |
| Low | Two files tracked inside gitignored `eval-workspace/` (`eval-workspace/eval-vague-idea-build-faster*/output.md`) — ignore rules and index disagree. |

### Documentation

| Sev | Finding |
|-----|---------|
| Medium | Agent-count drift: `README.md:3` claims "38 specialized agents", `.claude/agents/` holds 44 files, `AGENTS.md:324` says "/review (32 agents)", the user-level CLAUDE.md says 29. Hand-written counts contradict the source of truth. |

### Strengths

- OIDC trusted publishing with provenance — ahead of most OSS hygiene.
- Modern, fast toolchain: Bun workspaces, Biome, strict TS.
- Real test investment: 8+ suites including build (29K), learning-automation (39K), integration, performance.
- Clean secret hygiene; clear package separation (core/toolkit/cli) in intent.
- Rich, genuinely useful content catalog (85 skills, 40+ agents) — the product itself is substantial.

---

## Phase 3 — Improvement Strategy

**Theme 1 — One source of truth for code.** Most risk traces to `src/` vs `packages/cli/src/` duplication. Target state: exactly one tree (recommend `packages/cli/src/` as canonical since it's what ships, with shared code extracted to `packages/core`); the other deleted; `.d.ts` emitted to `dist/` only. Principle: code that exists twice is wrong once.

**Theme 2 — Enforced gates, not aspirational ones.** Scripts for typecheck/lint/test exist but nothing runs them. Target state: one `ci.yml` running `typecheck && lint && test` on every PR and push to main, required for merge. Principle: a gate that doesn't block isn't a gate.

**Theme 3 — Generated facts, not hand-written ones.** Counts and inventories in docs drift. Target state: build step emits counts (agents/skills/commands) consumed by README/AGENTS.md; doc fossils moved to `docs/archive/`. Principle: derive, don't transcribe.

**Explicitly NOT recommending**: splitting the 2,202-line `build.ts` into a plugin architecture (works today, high churn risk, do after Theme 1); test-coverage targets (suite breadth is fine; the gap is enforcement, not volume); enterprise observability or monorepo tooling (Nx/Turbo) — wrong weight class for a solo-maintained toolkit.

**"Done" signals**: CI fails on type/lint/test errors; `bun run typecheck` and `bun run lint` exit 0 on main; `diff -rq src packages/cli/src` is meaningless because only one tree exists; zero Critical findings on re-audit; README counts generated by build.

---

## Phase 4 — Task Plan

### Milestone 0 — Safety net
| # | Task | Files | Acceptance | Effort | Risk | Deps |
|---|------|-------|------------|--------|------|------|
| 0.1 | Fix 7 typecheck errors | `build.ts:44`, `packages/cli/src/install/clean.ts:189`, `src/execution/ralph-loop.ts:470` | `bun run typecheck` exits 0 | S | Low | — |
| 0.2 | Add `ci.yml` (typecheck + lint:errors + unit/build tests on PR) | `.github/workflows/ci.yml` | Red PR cannot merge | S | Low | 0.1 |

### Milestone 1 — Critical fixes
| # | Task | Files | Acceptance | Effort | Risk | Deps |
|---|------|-------|------------|--------|------|------|
| 1.1 | Reconcile drifted files between trees (diff the 6 differing files, port newest-correct version both ways as interim) | the 6 files listed in Phase 2 | `diff` on those files clean; tests pass | M | Med | 0.2 |
| 1.2 | De-duplicate: choose canonical tree, repoint imports/build, delete the other | `src/` or `packages/cli/src/`, `build.ts`, tsconfigs | One tree; build + tests + `ai-eng install` smoke pass | XL → breakdown | High | 1.1 |

### Milestone 2 — High-leverage
| # | Task | Files | Acceptance | Effort | Risk | Deps |
|---|------|-------|------------|--------|------|------|
| 2.1 | Stop committing `.d.ts` in source; emit to dist | `packages/cli/src/**/*.d.ts`, tsconfig | No `.d.ts` under `src/` trees | S | Low | 1.2 |
| 2.2 | Generate agent/skill/command counts into docs at build | `build.ts` or `scripts/`, `README.md` | Counts match `ls` reality | M | Low | — |
| 2.3 | Drive lint errors 114 → 0; keep gate at error level | repo-wide | `bun run lint` exits 0 | M | Low | 0.2 |

### Milestone 3 — Quality & polish
| # | Task | Files | Acceptance | Effort | Risk | Deps |
|---|------|-------|------------|--------|------|------|
| 3.1 | Archive root doc fossils to `docs/archive/` | ~15 root .md files | ≤8 living root docs | S | Low | — |
| 3.2 | Fix corrupted `src/AGENTS.md` tail | `src/AGENTS.md:56` | File ends at content | S | Low | — |
| 3.3 | Remove self-dep + untrack eval-workspace outputs | `package.json:97`, `git rm --cached` 2 files | Install clean; `git status` quiet | S | Low | — |

### Quick wins (do immediately)
0.1 (typecheck green), 3.2 (AGENTS.md tail), 3.3 (self-dep + untrack) — all S-effort, near-zero risk.

### Implementation sketches — top 3

**0.1 Typecheck green**: `src/execution/ralph-loop.ts:470` — replace `await this.flowStore.load()!` with a load-then-guard (`const flow = await this.flowStore.load(); if (!flow) throw/return`). Inspect `clean.ts:189` and `build.ts:44` errors individually; gotcha: fix both copies of ralph-loop.ts until 1.2 lands, or the drift grows.

**0.2 CI workflow**: single job, `oven-sh/setup-bun`, `bun install --frozen-lockfile`, then `bun run typecheck && bun run lint && bun test tests/unit.test.ts tests/build.test.ts`. Gotcha: keep slow suites (performance, integration) out of the required path initially; add as non-blocking job.

**1.2 De-duplication**: (1) make `packages/cli/src` canonical; (2) move genuinely shared modules (research, execution, context) into `packages/core/src` and import via `@ai-eng-system/core`; (3) replace root `src/` with re-exports or delete and fix `tests/` imports; (4) verify with full test suite + `bun run build` + a scratch-dir `ai-eng install --scope project`. Gotcha: root `tsconfig.json` paths and `build.ts` copy steps both reference `src/` — grep before deleting.

---

## Open Questions — Resolved (2026-06-10)

Documented in [docs/decisions/2026-06-10-source-tree-and-ci-policy.md](../docs/decisions/2026-06-10-source-tree-and-ci-policy.md).

1. **Canonical tree:** `packages/cli/src/` — root `src/` is legacy duplicate to remove after reconciliation.
2. **npm packages:** `@ai-eng-system/*` is current; legacy `ai-eng-system@0.4.x` is not the maintained surface (remove workspace self-dep).
3. **Root markdown status files:** validate each against code before archiving; no bulk move until verified.
4. **Slow test suites:** run nightly; PR/main gates use fast typecheck, lint, unit, and build tests only.

### Remaining follow-up

- Optional: emit `packages/cli/src/**/*.d.ts` to `dist/` only (audit task 2.1).
- Optional: consolidate duplicate `tests/` vs `packages/cli/tests/` long-term.

## Progress (2026-06-10 follow-up)

- [x] **0.1** Typecheck green (`bun run typecheck` exits 0)
- [x] **0.2** CI workflows added: `.github/workflows/ci.yml` (fast gate) + `nightly.yml` (slow suites)
- [x] **0.3** Lint green (excluded `.claude/worktrees` and generated `.d.ts` from biome)
- [x] **1.2** Root `src/` removed; `packages/cli/src` canonical (claude-router migrated)
- [x] **1.3** Learning automation wired in `packages/cli/src/index.ts` (event hook + root `opencode.json(c)` detection)
- [x] **2.1** Status docs validated and archived to `docs/archive/status/`
- [x] **3.2** Fixed corrupted `packages/cli/src/AGENTS.md` tail (via root `src/` removal)
- [x] **3.3** Removed legacy workspace dep `ai-eng-system@^0.4.0`
- [x] ADR + status-doc triage: `docs/decisions/2026-06-10-source-tree-and-ci-policy.md`, `reports/2026-06-10-status-docs-validation.md`


*Constraint notes: depth was concentrated on the core ~20% (src/packages/cli duplication, build pipeline, CI, manifests). Lighter review: `docs-site/`, `benchmarks/`, `archive/`, `demo/`, per-skill content quality, and runtime performance.*
