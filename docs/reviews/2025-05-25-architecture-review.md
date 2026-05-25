# Architecture Review — 2025-05-25

**Reviewer:** Thermo-nuclear architecture review skill
**Scope:** Full codebase, with focus on recent changes (version command, cursor-team-kit import, thermo-nuclear variants)

## Finding 1 — CRITICAL: `src/` and `packages/cli/src/` are a full codebase duplication

22,083 lines of source code exist in both `src/` and `packages/cli/src/` with near-identical directory trees. 44 of 57 root `src/` files have twins in `packages/cli/src/`.

Most files are byte-identical. Some have drifted (install.ts: 303 vs 495 lines, 434 diff lines). This is a two-source-of-truth problem — the published npm package (`packages/cli`) and the root workspace (`src/`) are diverging silently.

**Impact:** Every change must be made twice or drift is guaranteed. The `version` command was added to `packages/cli/src/cli/run.ts` but NOT `src/cli/run.ts`. They're already out of sync.

**Remedy:** Pick one source of truth. Either:
- Delete `src/` and make `packages/cli/src/` the only copy (the published package already uses it), or
- Make `src/` canonical and have `packages/cli` import from the root package (`@ai-eng-system/workspace`).

## Finding 2 — CRITICAL: `build.ts` is a 1,989-line god file

`build.ts` contains 30+ functions doing at least 7 distinct jobs:
1. YAML frontmatter parsing and validation
2. Claude plugin generation
3. OpenCode plugin generation
4. Cursor plugin generation
5. Gemini plugin generation
6. Pi plugin generation
7. CLI transpilation
8. Plugin mapping and marketplace manifest generation
9. Local sync to `.claude/`
10. Skill validation and copying

Every platform's build is coupled to every other's. Adding a new skill requires editing a mapping in the middle of a 2k-line file that also handles YAML parsing and CLI transpilation.

**Remedy:** Split into `scripts/build/` with one module per platform:
```
scripts/build/
├── shared.ts          # frontmatter, skill discovery, copy helpers
├── claude.ts
├── opencode.ts
├── cursor.ts
├── gemini.ts
├── pi.ts
├── plugins.ts         # plugin mapping and manifest generation
└── cli.ts             # transpilation
```

## Finding 3 — MAJOR: Six build output directories are committed to source control

| Directory | Files | Size | What it is |
|-----------|-------|------|------------|
| `.claude/` | 232 | 1.6MB | Claude build output |
| `.opencode/` | 234 | 58MB | OpenCode build output |
| `plugins/` | 199 | 1.4MB | Plugin marketplace output |
| `dist/` | 1163 | 24MB | Transpiled JS |
| `.pi/` | — | — | Pi build output |
| `packages/toolkit/` | 309 | 9MB | Toolkit package build output |

`bun run build` regenerates all of these. Every PR diff is polluted with hundreds of lines of generated file moves. The recent 3 commits touched 50 files, of which ~35 were build artifacts.

**Remedy:** Add to `.gitignore`. Keep only canonical sources (`skills/`, `content/`, `src/`, `build.ts`). Build in CI and publish from there.

## Finding 4 — MAJOR: Skills have 4+ redundant copies, no single source of truth

A single skill exists in:
1. `skills/` (root canonical)
2. `.claude/skills/` (build output)
3. `.opencode/skill/` (build output)
4. `plugins/ai-eng-quality/skills/` (build output)
5. `packages/toolkit/plugins/ai-eng-quality/skills/` (build output)

All are committed. If someone edits `.claude/skills/` directly, the build overwrites it next run.

**Remedy:** Same as Finding 3 — gitignore the build outputs, keep only `skills/` as source.

## Finding 5 — MAJOR: `agents/research-runner/` is 765MB of unrelated code

Standalone tool for multi-model research execution. Contains its own node_modules, Python bytecode caches. 765MB — half the repo's non-git size. No import relationship with the main codebase.

**Remedy:** Extract to its own repository. Reference as a git submodule or npm dependency if needed.

## Finding 6 — WARNING: Plugin mapping hidden in `build.ts`

Which agent goes to which plugin is defined in a JS object inside `build.ts`, not in any manifest alongside the content. No way to discover plugin ownership from the agent file itself.

**Remedy:** Add `plugin: "ai-eng-quality"` to agent/command YAML frontmatter. Make `build.ts` read the mapping from content, not define it.

## Finding 7 — WARNING: `packages/core/` is an empty shell

Has its own package.json and tsconfig, but all actual source lives in `packages/cli/src/` or root `src/`. The `packages/core/dist/` gets populated by copying from toolkit builds.

**Remedy:** Either give `packages/core` a real job, or eliminate it and fold into `packages/cli`.

## Verdict

NOT APPROVED. Two critical structural problems (code duplication and god-file build) that will continue to cause drift and confusion. Remedies for #3/#4 are straightforward (gitignore build outputs). #1 and #2 are the real architecture work.
