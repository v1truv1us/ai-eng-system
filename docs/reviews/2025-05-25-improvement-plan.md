# Improvement Plan — Thermo-Nuclear Review Findings

**Generated:** 2025-05-25
**Source reviews:** Architecture, Code Quality, Security, Performance (agent-produced)
**Status:** IN PROGRESS — 6 commits, most phases complete or partially complete
**Commits:** `d5fcc63` (P0+P1.1), `b3e75a3` (P1.2-1.4), `8bfdf5d` (P2.1+P5.3+P6.3), `3ba9768` (P5.1)

---

## Methodology

Cross-referenced findings from all four thermo-nuclear reviews. Grouped by **dependency order** (what unblocks what) and **risk/reward** (what gives the most benefit for the least blast radius). Each phase is designed to be mergeable independently.

---

## Phase 0 — Immediate Safety (1-2 days)

> Security-critical fixes. No architectural changes needed. Each is a targeted patch.

### 0.1 ~~Sanitize gate commands before `execSync`~~ ✅ DONE

**Source:** Security C-1 (Critical)
**Files:** `packages/cli/src/execution/ralph-loop.ts`, `src/execution/ralph-loop.ts`
**What:** Added `validateCommand()` method that rejects shell metacharacters before execSync.
**Commit:** `d5fcc63`

### 0.2 ~~Sanitize plan task commands before `spawn`~~ ✅ DONE

**Source:** Security H-1 (High)
**Files:** `plan-parser.ts`, `task-executor.ts` (both trees)
**What:** Added metacharacter validation in plan-parser + defense-in-depth in task-executor with `shell: false`.
**Commit:** `d5fcc63`

### 0.3 ~~Strip stack traces from persisted state~~ ✅ DONE

**Source:** Security H-2 (High)
**Files:** `context/types.ts` (both trees)
**What:** Removed `stack` field from `errorPayload`.
**Commit:** `d5fcc63`

### 0.4 ~~Tighten version handler catch~~ ✅ DONE

**Source:** Code Quality #3
**Files:** `packages/cli/src/cli/run.ts`
**What:** Tightened catch to only swallow ENOENT. Moved -V/--version handling before subcommand switch.
**Commit:** `d5fcc63`

---

## Phase 1 — Hygiene (2-3 days)

> Structural cleanup that's independent of the big refactor. Reduces noise and removes tracked build outputs.

### 1.1 ~~Remove 667 tracked build-output files from git~~ ✅ DONE

**Source:** Code Quality #1 (Blocker), Architecture #3.3, Performance #1.1
**Files:** `.gitignore` + removed 667 files from tracking
**What:** Added gitignore entries for `.claude/agents|skills|commands/`, `.opencode/agent|command|skill|tool/`, `plugins/ai-eng-*/` generated content. Removed 667 files from tracking. Verified `bun run build` regenerates everything correctly (803ms).
**Commit:** `d5fcc63`
**Impact:** Removed 78,706 lines from git tracking. Diffs are now clean.

### 1.2 ~~Cache build artifacts in build.ts~~ ✅ DONE

Cached `getMarkdownFiles` (commands + agents), `discoverSkills`, and `package.json` reads.
5 package.json reads → 1. 6 getMarkdownFiles calls → 2 cached. Build time: ~800ms.
**Commit:** `b3e75a3`

**Source:** Performance #1.1, #1.2, #1.3, #2.1, #5.3
**Files:** `build.ts`
**What:**
1. Cache `getMarkdownFiles()` results — call once per directory at top of `buildAll()`
2. Cache `discoverSkills()` results — call once, pass to each build phase
3. Cache `package.json` — read once, pass to each function
4. Batch sequential `copyFile` calls with `Promise.all`
**Risk:** Low — same operations, just cached/batched.
**Test:** Build produces identical output. Build time decreases measurably.
**Impact:** Reduces build from ~600 file ops to ~100, eliminates redundant YAML parsing.

### 1.3 ~~Fix swallowed errors in research module~~ ✅ DONE

Replaced 10 `catch (error) {}` blocks with documented `catch (error) { /* non-critical, skip */ }`.
**Commit:** `b3e75a3`

**Source:** Code Quality #6
**Files:** `packages/cli/src/research/analysis.ts`, `packages/cli/src/research/discovery.ts`
**What:** Replace 5 instances of `catch (error) {}` with proper error logging or propagation.
**Risk:** Low — may surface previously hidden bugs.
**Test:** Research command still works; errors are now visible.

### 1.4 ~~Move Astro to devDependencies~~ ✅ DONE

Moved `astro`, `@astrojs/mdx`, `@astrojs/starlight` to devDeps. No runtime imports found.
**Commit:** `b3e75a3`

**Source:** Performance #6.5 (Blocker)
**Files:** `packages/cli/package.json`
**What:** Move `astro`, `@astrojs/mdx`, `@astrojs/starlight` from `dependencies` to `devDependencies`.
**Risk:** Medium — need to verify nothing imports these at runtime. Scan: `rg 'from ["\']astro' packages/cli/src/`.
**Test:** `bun run build` succeeds. `ai-eng install` succeeds. `npm pack` size decreases.

---

## Phase 2 — Type Safety (3-5 days)

> Breaks the three circular dependency pairs. Enables the larger restructuring.

### 2.1 Extract shared domain types into `types/` module

**Source:** Architecture #1.1, #1.2, #1.3 (all Blockers)
**Files:** New `packages/cli/src/types/` directory
**What:**
1. Create `types/flags.ts` — extract `RalphFlags` from `cli/flags.ts` (breaks cli↔config cycle)
2. Create `types/domain.ts` — extract `AgentTask`, `AgentTaskStatus`, `AgentType`, `Decision`, `Task` from `agents/types.ts` and `context/types.ts` (breaks agents↔context cycle)
3. Create `types/execution.ts` — extract execution-facing interfaces for flags and output (breaks cli↔execution cycle)
4. Update all imports to point to the new `types/` module
**Risk:** Medium — touches many files but is purely mechanical (move types, update imports).
**Test:** `bun run typecheck` passes. No circular imports: `npx madge --circular packages/cli/src/`.
**Impact:** Eliminates all 3 circular dependency pairs. Unblocks future modularization.

### 2.2 Reduce `any` usage in plan-generator and plan-parser

**Source:** Code Quality #7
**Files:** `packages/cli/src/agents/plan-generator.ts` (12 `any`), `packages/cli/src/execution/plan-parser.ts` (8 `any`)
**What:** Replace `any` with proper types. Use the domain types from 2.1.
**Risk:** Low — type narrowing only, no logic changes.
**Test:** `bun run typecheck` passes.

### 2.3 Add runtime validation at JSON.parse boundaries

**Source:** Security M-1
**Files:** `packages/cli/src/context/flow-store.ts`, `context/session.ts`, `context/memory.ts`, `context/types.ts`, `install/install.ts`, `install/manifest.ts`
**What:** Wrap `JSON.parse` calls in try/catch with clear error messages identifying the corrupted file. Optionally use zod schemas for the most critical state files.
**Risk:** Low — adds safety nets.
**Test:** Corrupted `.ai-eng/state.json` produces clear error, not cryptic crash.

---

## Phase 3 — Build System Decomposition (5-7 days)

> The biggest structural change. Breaks the 2k-line god file into per-platform modules.

### 3.1 Decompose `build.ts` into modules

**Source:** Architecture #2.1 (Blocker), Performance #7.1
**Files:** New `build/` directory
**What:**
1. `build/orchestrator.ts` — main `buildAll()` with cached data passing
2. `build/platforms/claude.ts` — Claude-specific build
3. `build/platforms/opencode.ts` — OpenCode-specific build
4. `build/platforms/pi.ts` — Pi-specific build
5. `build/platforms/cursor.ts` — Cursor-specific build
6. `build/platforms/gemini.ts` — Gemini-specific build
7. `build/content.ts` — skill discovery, markdown file listing, YAML parsing (cached)
8. `build/plugins.ts` — marketplace plugin generation
9. `build/utils.ts` — `copyDirRecursive`, `copySkillsPreservePath`, etc.
10. Root `build.ts` becomes a thin entry point: `import { buildAll } from './build/orchestrator.ts'`
**Risk:** Medium — large refactor but purely structural. Output must be byte-identical.
**Test:** `diff <(git show HEAD:build.ts output) <(new build output)` is empty. Build time improves.
**Impact:** Each file under 300 lines. Adding a new platform touches 1 file.

### 3.2 Parallelize independent build phases

**Source:** Performance #2.2, #2.3
**Files:** `build/orchestrator.ts` (from 3.1)
**What:** Run `buildClaude`, `buildPi`, `buildCursor`, `buildGemini` in parallel with `Promise.all`. Run marketplace generation in parallel too.
**Risk:** Low — each phase writes to separate directories.
**Test:** Build output is identical. Build time decreases 3-5x.

### 3.3 Parameterize thermo-nuclear agent definitions

**Source:** Code Quality #5
**Files:** New `build/templates/thermo-nuclear-agent.ts` + config
**What:** Generate the four agent definitions from a single template + variant config. Add to build pipeline.
**Risk:** Low — same output, generated instead of hand-written.
**Test:** Generated files match current files byte-for-byte.

---

## Phase 4 — Source Tree Unification (5-7 days)

> Eliminates the src/ ↔ packages/cli/src/ duplication. The single most impactful change.

### 4.1 Choose canonical source: `packages/cli/src/`

**Source:** Architecture #2.2 (Blocker)
**Rationale:** `packages/cli/src/` is the published package. It has the install subsystem, validation, and clean commands that `src/` lacks. `src/` has `learning-automation/` which `packages/cli/` doesn't.

**What:**
1. Copy `src/learning-automation/` (5 files) into `packages/cli/src/learning-automation/`
2. Update `packages/cli/src/index.ts` to re-export `createLearningAutomationRuntime`
3. Delete `src/` entirely
4. Update `build.ts` references from `src/` to `packages/cli/src/`
5. Update `tsconfig.json` if it references `src/`
6. Verify root `package.json` and `packages/cli/package.json` are consistent
**Risk:** High — touches the build pipeline, package entry points, and potentially downstream consumers.
**Test:** `bun run build` succeeds. `ai-eng install --platform pi --scope global` succeeds. `bun run typecheck` passes. Published package has same exports.
**Impact:** Eliminates ~22k lines of duplicated code. Single source of truth.

### 4.2 Expand `@ai-eng-system/core` to hold shared code

**Source:** Architecture #5.1
**Files:** `packages/core/src/`
**What:** Move shared domain types (from Phase 2.1) and shared utilities into `@ai-eng-system/core`. Both `packages/cli` and any future packages import from here.
**Risk:** Low — follows existing package structure.
**Test:** Package builds and imports work.

---

## Phase 5 — Runtime Performance (3-5 days)

> Async I/O conversion, cache bounding, bundle optimization.

### 5.1 ~~Convert install.ts from sync to async FS~~ ✅ DONE (partial)

Converted `install.ts` (27 sync → async). Deferred `flow-store.ts` and `ralph-loop.ts` — ripple through callers requires dedicated pass.
**Commit:** `3ba9768`

**Source:** Performance #2.4
**Files:** `packages/cli/src/install/` (6 files, 37+ sync calls)
**What:** Replace all `*Sync` calls with `fs/promises` equivalents.
**Risk:** Medium — changes install flow, needs integration testing.
**Test:** `ai-eng install` succeeds on fresh machine. Install time doesn't regress.

### 5.2 Convert `flow-store.ts` and `ralph-loop.ts` to async FS/exec

**Source:** Performance #2.5, #5.1, #5.2
**Files:** `packages/cli/src/execution/flow-store.ts`, `packages/cli/src/execution/ralph-loop.ts`
**What:**
1. Replace `execSync` with async `exec` in `getGitStatus()` and gate runner
2. Replace `writeFileSync` with `fs/promises.writeFile` in `flow-store.ts`
3. Add git status caching (check `.git/index` mtime before re-running)
**Risk:** Medium — changes loop execution flow.
**Test:** Ralph loop completes successfully. Gate commands run.

### 5.3 ~~Bound unbounded caches~~ ✅ DONE

- `context/retrieval.ts`: contextCache max 50 entries
- `context/progressive.ts`: loadedCache max 100 entries
Applied to both trees.
**Commit:** `8bfdf5d`

**Source:** Performance #3.1, #3.2
**Files:** `packages/cli/src/context/retrieval.ts`, `packages/cli/src/context/progressive.ts`
**What:** Add `maxSize` to both Maps. Simple LRU or clear-on-exceed.
**Risk:** Low — only affects caching behavior.
**Test:** Memory usage stays bounded during long sessions.

### 5.4 Fix `transpileCLI()` to externalize large deps

**Source:** Performance #6.1, #6.2, #6.3 (Blockers)
**Files:** `build.ts` (or `build/orchestrator.ts` after Phase 3)
**What:** Add `external: ['astro', '@astrojs/mdx', '@astrojs/starlight', 'web-tree-sitter', '@opentui/core']` to `Bun.build` calls. These become peer dependencies or optional.
**Risk:** High — changes runtime dependency resolution. Need to verify all import paths still work.
**Test:** `ai-eng` CLI works after install. Package size decreases significantly.

---

## Phase 6 — Boundary Discipline (3-5 days)

> Clean up leaked concerns. Makes the architecture review's boundary violations go away.

### 6.1 Inject notification interface into execution engine

**Source:** Architecture #3.2
**Files:** `packages/cli/src/execution/ralph-loop.ts`
**What:** Replace direct `DiscordWebhookClient` import with an injected `notify(message)` interface. CLI wires it to Discord at the boundary.
**Risk:** Low — dependency injection is a pure refactoring.
**Test:** Ralph loop still sends Discord notifications when configured.

### 6.2 Inject UI interface into execution engine

**Source:** Architecture #3.1
**Files:** `packages/cli/src/execution/ralph-loop.ts`
**What:** Replace direct `UI` method calls with an injected output interface. CLI provides the concrete implementation.
**Risk:** Medium — execution layer currently has many UI calls.
**Test:** Ralph loop output is identical. Execution engine is testable without CLI UI.

### 6.3 ~~Improve secret redaction~~ ✅ DONE

Replaced broad `/token/i` patterns with format-specific matchers (ghp_*, sk-*, xoxb-*) + key=value patterns with 8+ char values. No more false positives on words like "token" in code.
**Commit:** `8bfdf5d`

**Source:** Security M-2
**Files:** `packages/cli/src/execution/ralph-loop.ts`
**What:** Replace broad regex patterns with specific format matchers (`ghp_`, `sk-`, `xoxb-`, etc.). Or use a structured logging approach.
**Risk:** Low — only affects redaction output.
**Test:** Known secret formats are redacted. Normal words like "token" in code are not.

---

## Summary

| Phase | Duration | Risk | Impact | Dependencies |
|-------|----------|------|--------|-------------|
| **0. Safety** | 1-2 days | Low | Closes 1 critical + 2 high security findings | None |
| **1. Hygiene** | 2-3 days | Low | Removes 681 tracked files, speeds build 3-5x | None |
| **2. Types** | 3-5 days | Medium | Breaks 3 circular deps, adds boundary validation | None |
| **3. Build** | 5-7 days | Medium | 2k-line god file → 9 files <300 lines each | Phase 2 |
| **4. Unify** | 5-7 days | High | Eliminates 22k lines of duplication | Phase 2 |
| **5. Perf** | 3-5 days | Medium-High | Async I/O, bounded caches, smaller bundles | Phase 3 |
| **6. Boundaries** | 3-5 days | Medium | Clean separation of concerns | Phase 2 |

**Total estimated effort:** 22-34 days of focused work

**Recommended start:** Phase 0 (safety) and Phase 1 (hygiene) can start immediately and land independently. Phase 2 (types) unblocks everything else. Phase 4 (unification) is the highest-impact single change but carries the most risk.

---

## What This Plan Does NOT Address

- **`ralph-loop.ts` decomposition** (1441 lines) — deferred to a separate initiative after Phase 3-4 land
- **`packages/core/` expansion** — Phase 4.2 is a start, but full core package maturity is out of scope
- **Research orchestrator / AgentCoordinator overlap** — architectural decision needed first
- **Dashboard GUI** — explicitly low priority per existing TODO.md
- **New platforms / new skills** — the structural fixes in Phases 3-4 make these much easier to add later
