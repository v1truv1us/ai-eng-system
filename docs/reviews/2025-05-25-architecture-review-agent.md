# Thermo-Nuclear Architecture Review

**Date:** 2025-05-25  
**Scope:** Full codebase structure + branch changes (main~4..HEAD, 4994 lines across 52 files)  
**Reviewer:** thermo-nuclear-architecture-review agent  

---

## Executive Summary

**This codebase has a structural decomposition problem.** It is one system living in three partially-overlapping source trees (`src/`, `packages/cli/src/`, `packages/core/src/`) with substantial copy-paste duplication, multiple circular dependency pairs, and a 1,989-line build god-file. The branch changes are predominantly content (skills, agents, markdown) — they add surface area without addressing any of the pre-existing structural decay.

The core architecture violates the project's own documented principles. Every significant change requires understanding which of the three source trees is canonical and how they diverge. This is not a codebase where you can make a change in one place and be done.

**Verdict: BLOCKED.** Pre-existing structural issues are presumptive blockers. The branch does not worsen them materially, but it does not fix them either.

---

## Priority 1: Circular Dependencies and Wrong-Way Imports

### Finding 1.1 — Circular: `cli` ↔ `config` 🔴 BLOCKER

```
cli/run-cli.ts     → imports from config/schema
cli/run.ts         → imports from config/loadConfig
config/loadConfig.ts → imports type { RalphFlags } from cli/flags
```

`config/loadConfig.ts` imports `RalphFlags` from `cli/flags`. The config layer now depends on the CLI layer. **Config is infrastructure that everything uses; CLI is a presentation layer. The dependency points the wrong way.**

**Remedy:** Extract `RalphFlags` (and any shared flag types) into `types/` or `config/flags.ts`. Config must not import from CLI.

### Finding 1.2 — Circular: `cli` ↔ `execution` 🔴 BLOCKER

```
cli/run-cli.ts       → imports from execution/ralph-loop
execution/ralph-loop.ts → imports from cli/flags, cli/ui
```

The execution engine depends on CLI flag types and UI output. `ralph-loop.ts` (1,441 lines) imports `RalphFlags` from `cli/flags` and `UI` from `cli/ui`. **Execution is business logic. It should not know the CLI exists.**

**Remedy:** Define execution-facing interfaces for flags and output in `execution/types.ts`. CLI adapts its flags/output to those interfaces at the boundary.

### Finding 1.3 — Circular: `agents` ↔ `context` 🔴 BLOCKER

```
agents/communication-hub.ts → imports MemoryManager from context/memory
agents/improvement-tracker.ts → imports MemoryManager from context/memory
agents/types.ts → imports Decision, Task from context/types
context/session.ts → imports AgentTask, AgentTaskStatus, AgentType from agents/types
```

The agent layer and context layer are mutually dependent. You cannot change an agent type without potentially breaking context, and vice versa.

**Remedy:** Extract shared domain types (`AgentTask`, `Decision`, `Task`, `MemoryManager` interface) into a `types/` module that both depend on. Neither agents nor context should import from each other.

### Finding 1.4 — `execution` reaches into 6 other modules 🟡

`execution/ralph-loop.ts` (the largest file in the codebase at 1,441 lines) imports from:
- `backends/opencode/client`
- `cli/flags`
- `cli/ui`
- `config/schema`
- `prompt-optimization/optimizer`
- `util/discord-webhook`
- `util/log`
- `execution/flow-store`
- `execution/flow-types`

This is a know-it-all module. The execution engine directly references CLI flags, UI rendering, Discord webhooks, prompt optimization, and backend client types. It has 16 imports and touches nearly every subsystem.

**Remedy:** `ralph-loop.ts` is doing too much. Decompose into an orchestration core (dependency injection for backend, UI, config) and separate handlers for quality gates, flow management, and notification.

---

## Priority 2: God Modules and Coupling Hotspots

### Finding 2.1 — `build.ts` is a 1,989-line god file 🔴 BLOCKER

The build script is the largest single file in the entire repository. It contains:
- Filesystem traversal and copying logic
- YAML parsing and content generation
- Plugin manifest generation for 8 marketplace plugins
- Platform-specific build targets (OpenCode, Claude, Cursor, Gemini, Pi)
- Watch mode implementation
- Validation logic
- CLI flag parsing

A 2K-line build file is a coupling hotspot. Every platform, every plugin format, every content source is wired into a single file. Adding a new platform or plugin requires editing this monolith.

**Remedy:** Decompose into a build orchestrator + per-platform builders + shared content pipeline. Each platform's build logic should be in its own module.

### Finding 2.2 — `src/` and `packages/cli/src/` are ~80% copy-paste duplication 🔴 BLOCKER

The `src/` directory and `packages/cli/src/` share 51 files with identical names and overlapping directory structure. Analysis shows:

| Metric | Value |
|--------|-------|
| Files in `src/` | 55 |
| Files in `packages/cli/src/` | 57 |
| Identical copies | ~35 files (zero diff) |
| Diverged copies | ~16 files (some minor, some major) |
| `src/`-only | 5 files (learning-automation) |
| `packages/cli/`-only | 7 files (clean, manifest, sync-skills, toolkit-path, validation) |

The `learning-automation/` module exists only in `src/`. The install subsystem in `packages/cli/` has diverged significantly (495 lines vs 303 lines for `install.ts`, 607 vs 383 lines for `run.ts`).

**This is the most damaging structural problem in the codebase.** There is no clear ownership. Which tree is canonical? Changes must be made in both places or they silently diverge. The diff shows `packages/cli/src/install/install.ts` has 434 lines of diff from `src/install/install.ts` — they are the "same" module doing different things.

**Remedy:** Choose one canonical source. Delete the other. If both packages need different entry points, share the implementation through `@ai-eng-system/core` (which already exists but contains only 3 files). The current structure is unmaintainable.

### Finding 2.3 — No module is imported by >10 others, but coupling is diffuse 🟡

No single module is a classic "god module" by import count. The problem is structural rather than concentrated: circular dependencies are distributed across the architecture rather than centralized in one place. This makes them harder to see but equally damaging.

---

## Priority 3: Boundary Violations and Leaked Internals

### Finding 3.1 — Execution layer depends on presentation 🟡

`execution/ralph-loop.ts` directly calls `UI` methods. The execution engine is coupled to a specific CLI rendering implementation. This means:
- You cannot run the execution engine without the CLI UI.
- You cannot test execution without mocking UI output.
- You cannot add a new interface (e.g., API, daemon mode) without editing the execution layer.

### Finding 3.2 — Execution layer depends on Discord infrastructure 🟡

`ralph-loop.ts` imports `DiscordWebhookClient` and `createDiscordWebhookFromEnv` directly. A notification concern is hardwired into the execution engine. This is infrastructure coupling in business logic.

**Remedy:** Inject a notification interface. The execution engine calls `notify(message)`. The CLI wires it to Discord/Slack/stdout as appropriate.

### Finding 3.3 — Content triplication across build outputs 🟡

The same skill/agent markdown content exists in:
1. `content/` (source of truth)
2. `.claude/` (Claude runtime)
3. `.opencode/` (OpenCode runtime)
4. `plugins/*/` (8 marketplace plugins)
5. `skills/` (skill pack sources)
6. `dist/` (build output)

Adding a new skill requires changes in `content/`, `skills/`, and potentially multiple `plugins/` directories. The build script (`build.ts`) is responsible for synchronizing all of these, but the content is also checked into the repo in multiple locations.

---

## Priority 4: Shared Mutable State and Unclear Data Ownership

### Finding 4.1 — `FlowStore` is shared mutable state across execution 🟡

`flow-store.ts` manages flow state that is read and written by `ralph-loop.ts`, `task-executor.ts`, and `quality-gates.ts`. Without clear single-writer ownership, state transitions are scattered.

### Finding 4.2 — Config loading scatters state across boundaries 🟡

`config/loadConfig.ts` imports from `cli/flags` to determine behavior. Config resolution is influenced by CLI flags rather than receiving a clean configuration object. The config module's behavior depends on who calls it.

---

## Priority 5: Unnecessary Abstractions and Pass-Through Layers

### Finding 5.1 — `packages/core/` is 3 files doing almost nothing 🟡

`packages/core/src/` contains:
- `index.ts` (package entry)
- `content-loader.ts`
- `paths.ts`

Both `src/index.ts` and `packages/cli/src/index.ts` import from `@ai-eng-system/core` dynamically. The core package is an abstraction that exists to be imported but doesn't contain the actual core logic. The real "core" (agents, execution, research, context) lives in both `src/` and `packages/cli/src/`.

### Finding 5.2 — `AgentCoordinator` is imported by research but the research module also has its own orchestration 🟡

`research/orchestrator.ts` imports `AgentCoordinator` from `agents/coordinator.ts`, but research also has its own `DiscoveryHandler`, `AnalysisHandler`, and `SynthesisHandler`. The boundary between "agent coordination" and "research orchestration" is unclear.

---

## Priority 6: Domain-Framework Coupling

### Finding 6.1 — Agent types depend on OpenCode backend types 🟡

`agents/types.ts` (471 lines) and `agents/coordinator.ts` (673 lines) reference backend-specific types. The agent abstraction should be backend-agnostic.

### Finding 6.2 — `src/index.ts` imports `createLearningAutomationRuntime` from learning-automation 🟡

The root index re-exports learning automation, coupling the package entry point to a module that exists only in `src/` (not in `packages/cli/`). The two package entry points are already diverged.

---

## Priority 7: Structural Decay — Changes Are Non-Local

### Finding 7.1 — Adding a new platform requires touching 5+ locations 🔴

To add a new platform (e.g., "windsurf"):
1. `build.ts` — add platform build target
2. `packages/cli/src/install/install.ts` — add install logic
3. `packages/cli/src/install/types.ts` — add platform type
4. `packages/cli/src/install/clean.ts` — add clean logic
5. `packages/cli/src/cli/run.ts` — add CLI flags
6. Potentially `src/install/install.ts` — if maintaining the old tree
7. Possibly a new `plugins/ai-eng-windsurf/` directory

This is 5-7 files for a single concept ("support a new platform"). The architecture is fighting the domain.

### Finding 7.2 — Adding a new skill requires touching 6+ locations 🔴

A new skill must be authored in `skills/`, then the build script generates copies to:
1. `.claude/skills/`
2. `.opencode/skill/`
3. `content/` (agent documentation)
4. `plugins/ai-eng-quality/skills/` (or another plugin)
5. `dist/` (build output)

Each location is also checked into git. A single conceptual change — "add a skill" — fans out across the repository.

---

## Branch-Specific Assessment

The branch (main~4..HEAD) adds:
- 4 new thermo-nuclear review agents (architecture, code quality, performance, security)
- 6 new skills (fix-ci, loop-on-ci, review-and-ship, verify-this, + 4 thermo-nuclear skills)
- Updated build.ts for new content generation
- Updated `packages/cli/src/cli/run.ts` (clean/reinstall commands, multi-platform support)
- 4 review documents in `docs/reviews/`

**Assessment:** The branch changes are primarily content (markdown skills/agents) and incremental CLI improvements. They do not introduce *new* circular dependencies or worsen existing ones. However, they do add to the content triplication problem — each new skill/agent must exist in 4-6 places.

The `packages/cli/src/cli/run.ts` changes (607 lines, up from 383 in `src/`) continue the divergence between the two source trees rather than converging them.

---

## Summary of Findings

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1.1 | Circular: `cli` ↔ `config` | 🔴 BLOCKER | Pre-existing |
| 1.2 | Circular: `cli` ↔ `execution` | 🔴 BLOCKER | Pre-existing |
| 1.3 | Circular: `agents` ↔ `context` | 🔴 BLOCKER | Pre-existing |
| 1.4 | `ralph-loop.ts` is a know-it-all (16 imports, 6 modules) | 🟡 Warning | Pre-existing |
| 2.1 | `build.ts` is a 1,989-line god file | 🔴 BLOCKER | Pre-existing |
| 2.2 | `src/` and `packages/cli/src/` ~80% copy-paste | 🔴 BLOCKER | Pre-existing |
| 3.1 | Execution depends on CLI UI | 🟡 Warning | Pre-existing |
| 3.2 | Execution depends on Discord infrastructure | 🟡 Warning | Pre-existing |
| 3.3 | Content triplication across 6+ locations | 🟡 Warning | Worsened by branch |
| 7.1 | New platform = 5-7 file changes | 🔴 BLOCKER | Pre-existing |
| 7.2 | New skill = 6+ location changes | 🔴 BLOCKER | Pre-existing |

---

## Recommended Priority Remediation

1. **Eliminate the `src/` / `packages/cli/src/` duplication.** Pick one canonical tree. Delete the other. If the packages need different entry points, share implementation through `@ai-eng-system/core` (expand it from 3 files to the actual shared code). This single change eliminates the largest source of structural decay.

2. **Extract shared domain types into `types/`.** Move `RalphFlags`, `AgentTask`, `Decision`, `Task`, and `MemoryManager` interface to a shared types module. This breaks all three circular dependency pairs at once.

3. **Decompose `build.ts`** into per-platform builders behind a shared pipeline. Target: no build file over 300 lines.

4. **Decompose `ralph-loop.ts`** (1,441 lines). Extract quality gates, flow management, and notification into separate modules behind injected interfaces.

5. **Centralize content management.** One source of truth (`content/` + `skills/`). Everything else is build output, not checked-in duplication.

---

## Approval Decision

**BLOCKED.** The codebase carries pre-existing architectural debt that meets the presumptive blocker criteria:
- Circular dependencies between core modules (3 pairs)
- A god file (`build.ts`, 1,989 lines)
- Copy-paste duplication across ~80% of the source tree
- Changes that require coordinated edits across 5+ modules for single concepts

The branch itself does not worsen these problems significantly, but it also does not address them. Each new skill and agent adds to the duplication surface area. The content triplication is actively worsened by the branch's additions.

**Unblock condition:** Resolve at minimum the three circular dependency pairs and establish a single canonical source tree. The god file and non-local change problems can be addressed incrementally but should have a tracked remediation plan.
