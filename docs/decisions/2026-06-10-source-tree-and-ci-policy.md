# Decision: Canonical source tree, npm packages, and CI test tiers

- Status: Accepted
- Date: 2026-06-10
- Owner: John Ferguson

## Context

The 2026-06-10 repo audit found duplicate TypeScript trees (`src/` vs `packages/cli/src/`), a stale root dependency on `ai-eng-system@^0.4.0`, many root-level markdown status files of uncertain currency, and no CI quality gates. Several open questions blocked the de-duplication and CI milestones.

## Decision

1. **Canonical runtime source:** `packages/cli/src/` is the source of truth for shipped CLI/runtime code. Root `src/` is a legacy duplicate pending removal after drift is reconciled and tests/build import paths are repointed.

2. **Canonical npm packages:** `@ai-eng-system/core`, `@ai-eng-system/toolkit`, and `@ai-eng-system/cli` are the maintained publish surface. The legacy root package name `ai-eng-system` (0.4.x era) is not the current distribution model and should not be re-added as a workspace dependency.

3. **Root markdown status files:** Do not bulk-archive yet. Each file must be validated against the current codebase (claims, commands, counts, and workflows) before moving to `docs/archive/` or deleting. Treat unvalidated status docs as suspect, not authoritative.

4. **CI test tiers:**
   - **PR / main gates (required):** `typecheck`, `lint` (error level), fast unit + build tests (e.g. `tests/unit.test.ts`, `tests/build.test.ts`).
   - **Nightly (non-blocking):** slower suites including performance, learning-automation, integration, and other long-running tests.

## Options considered

- Option A: Keep both `src/` and `packages/cli/src/` in sync indefinitely — rejected; drift already caused silent divergence.
- Option B: Make root `src/` canonical — rejected; CLI package is what ships on npm.
- Option C: Gate every test suite on every PR — rejected; too slow; nightly coverage is sufficient for slow paths.

## Consequences

- Positive: Clear direction for milestone 1.2 (de-duplication) and package hygiene; CI design can split fast vs slow tiers explicitly.
- Negative: De-duplication still requires engineering work (import path updates, deleting root `src/`, reconciling six+ drifted files). Status-doc validation is manual until automated checks exist.

## Review trigger

Revisit when root `src/` is deleted, when `ai-eng-system@0.4.x` is formally deprecated on npm, or when CI tiers are implemented and nightly results show gaps the PR gate should absorb.

## Links

- Audit: [reports/2026-06-10-repo-audit.md](../../reports/2026-06-10-repo-audit.md)
- Runtime ownership: [docs/reference/skills-first-map.md](../reference/skills-first-map.md)
- Packaging: [docs/decisions/platform-packaging.md](./platform-packaging.md)
