# Release Plan — ai-eng-system → v2.0.0 Stable

> **Date:** 2026-04-25  
> **Current version:** 1.4.0 (core, cli, toolkit on npm)  
> **Target:** v2.0.0 — first stable, adoption-ready release  
> **Repo:** github.com/v1truv1us/ai-eng-system  

---

## 1. Current State Assessment

### What's in the Box

| Package | npm | Role |
|---------|-----|------|
| `@ai-eng-system/core` | v1.4.0 | Shared library — content loading, path helpers, type declarations |
| `@ai-eng-system/toolkit` | v1.4.0 | Generated Claude Code plugins, OpenCode skills, marketplace assets |
| `@ai-eng-system/cli` | v1.4.0 | `ai-eng` CLI — install, init, TUI, ~27K lines TS |

The monorepo ships **38 agents**, **50+ commands**, and **10 skills** covering a full engineering lifecycle (research → specify → plan → work → verify → review). It targets two platforms: **Claude Code** (plugin marketplace) and **OpenCode** (skill/plugin system).

### Build & Test Status

- ✅ `bun run build` — clean (498ms, 49 files transpiled, 1 skipped)
- ✅ Unit tests — 20 pass, 4 skip, 0 fail (228ms)
- ✅ TypeScript declarations generated
- ✅ OIDC-based publishing CI with trusted publishing
- ✅ 3 workflow files for per-package and all-package publish
- ⚠️ Full test suite (`bun test`) hangs/gets killed — likely an execution or context test that doesn't terminate
- ⚠️ `research/discovery.ts` skipped during build (Bun-specific imports)

### CI/CD

- 6 workflow files in `.github/workflows/` covering publish, release, and OIDC testing
- OIDC trusted publishing (no npm tokens in secrets)
- Tag-based triggers (`core-v*`, `cli-v*`) plus manual `workflow_dispatch`

### Claude Code Marketplace

- Plugin generates 7 sub-plugins (core, learning, research, devops, quality, content, plugin-dev)
- `plugin.json` with 50+ commands and 38 agents
- Marketplace metadata generated via build scripts
- Integration path: `/plugin marketplace add v1truv1us/ai-eng-system`

### OpenCode Integration

- Skills directory with 10 skill packages
- Plugin integration via `opencode.json` config
- Learning automation with toast-based suggestions

---

## 2. What Works Well

### Why 6 Stars

People are starring a project that solves a real pain point: **bringing structured engineering workflows to AI coding assistants**. Specifically:

1. **Comprehensive lifecycle** — research → deploy in one toolkit, not scattered scripts
2. **Multi-platform** — works with both Claude Code and OpenCode
3. **Real agents** — 38 specialized agents (not just prompts), with coordination and communication
4. **Plugin marketplace integration** — proper Claude Code marketplace support
5. **Three-package architecture** — clean separation of concerns (core lib, assets, CLI)
6. **OIDC publishing** — modern, tokenless npm publishing
7. **Active development** — consistent version bumps, changelogs, structured releases

### Technical Strengths

- Clean workspace setup with proper `exports` maps and TypeScript declarations
- Content loading and path resolution for multi-platform asset delivery
- Quality gates, flow stores, and the "Ralph Wiggum" iterative loop
- Context engineering with vector/memory/session modules
- Research orchestration with discovery → analysis → synthesis pipeline
- Prompt optimization subsystem
- TUI interface via `@opentui/core`

---

## 3. What's Broken or Missing

### Critical

| Issue | Impact |
|-------|--------|
| **Test suite hangs** — `bun test` (full suite) doesn't complete | Can't verify correctness; blocks CI confidence |
| **No integration/E2E tests** — only unit tests for install logic | 27K lines of code with near-zero test coverage |
| **`research/discovery.ts` skipped** during build | Bun-specific imports mean feature doesn't work in published package |
| **No `engines` enforcement** — `@ai-eng-system/core` only requires `bun`, no `node` fallback | Users with `node` but not `bun` can't use core |
| **CLI entry point is `bun.ts`** — requires bun runtime | The `ai-eng` bin is a bun-specific file, not a standalone binary |

### High

| Issue | Impact |
|-------|--------|
| **README says 38 agents, build output says 32** — inconsistent counts | Confusion for users evaluating the project |
| **`plugin.json` version is 1.2.0** while packages are 1.4.0 | Stale metadata in published plugin |
| **No contributing guide** (CONTRIBUTING.md) | Barrier for community participation |
| **No CI for PRs** — workflows only trigger on tags/dispatch | No automated checks on pull requests |
| **`archive/` has 30+ stale doc files** | Repo clutter, confusing for newcomers |
| **`docs-site/` is a full Astro app inside the monorepo** | Increases clone size, confusing structure |

### Medium

| Issue | Impact |
|-------|--------|
| No `CHANGELOG.md` entries for 1.0–1.4 versions | Version history gap; changelog stops at 0.6.0 |
| No `SECURITY.md` | Required for npm provenance/marketplace trust |
| Only `bun` as runtime — no `node`/`npx` support for CLI | Limits audience to bun users |
| No interactive demo or playground | Hard to evaluate without installing |
| No benchmarks or performance claims | Can't justify "engineering automation" value |
| Heavy deps (astro, starlight) in CLI package | CLI package is bloated for its actual needs |

---

## 4. Feature Scope for v2.0.0 Stable

The goal: **ship something a stranger can install, use, and love in 5 minutes.**

### Must-Have (v2.0.0)

1. **All tests pass, full suite completes under 60s**
2. **CLI works with `npx`** — no bun requirement for end users
3. **One clear getting-started path** per platform (Claude Code, OpenCode, standalone)
4. **Version consistency** — all packages, plugin.json, marketplace.json agree
5. **PR CI** — lint, typecheck, test on every PR
6. **Clean repo** — archive stale docs, remove docs-site or move to separate repo
7. **CONTRIBUTING.md** — how to contribute, dev setup, PR expectations
8. **`research/discovery.ts` builds cleanly** or is properly gated

### Nice-to-Have (v2.1+)

- Node.js compatibility for core package
- Interactive demo / web playground
- Plugin for Cursor/Windsurf
- Video walkthrough
- Performance benchmarks
- Community skill/agent marketplace

---

## 5. Ordered Work Items

| # | Task | Estimate | Priority |
|---|------|----------|----------|
| 1 | **Fix hanging tests** — identify and fix tests that don't terminate. Add timeouts. | 2h | P0 |
| 2 | **Add test timeouts and CI config** — `bun test --timeout 10000`, add PR workflow | 1h | P0 |
| 3 | **Sync all version numbers** — plugin.json, marketplace.json, all package.json → same version | 30m | P0 |
| 4 | **Fix `research/discovery.ts`** build skip — refactor Bun-specific imports or gate the module | 1h | P0 |
| 5 | **Separate CLI runtime from bun** — bundle CLI to a standalone JS file runnable with `node` | 3h | P1 |
| 6 | **Remove heavy deps from CLI** — move astro/starlight to docs-site only, not CLI workspace dep | 1h | P1 |
| 7 | **Add PR CI workflow** — lint, typecheck, test on pull_request | 30m | P1 |
| 8 | **Write CONTRIBUTING.md** — dev setup, how to run tests, PR template | 1h | P1 |
| 9 | **Clean up archive/** — move to separate branch or delete; keep repo lean | 30m | P1 |
| 10 | **Move docs-site to its own repo** — or add to .gitignore | 30m | P2 |
| 11 | **Add missing CHANGELOG entries** for v0.6.0 → v1.4.0 | 30m | P2 |
| 12 | **Consolidate agent count** — audit actual agents, update all docs to match reality | 1h | P2 |
| 13 | **Add `npx @ai-eng-system/cli install` smoke test to CI** | 1h | P2 |
| 14 | **Write SECURITY.md** — reporting policy, supported versions | 30m | P2 |
| 15 | **Update README** — remove version-specific counts, add "what's new in v2.0" section | 1h | P1 |

**Total estimate: ~15 hours**

---

## 6. Release Checklist

### Pre-release

- [ ] All tests pass (`bun test` completes < 60s)
- [ ] `bun run build` succeeds with 0 warnings
- [ ] All versions synchronized (core/cli/toolkit = 2.0.0)
- [ ] `plugin.json` and `marketplace.json` version = 2.0.0
- [ ] CHANGELOG.md has v2.0.0 entry with all changes
- [ ] `CONTRIBUTING.md` exists
- [ ] `SECURITY.md` exists
- [ ] archive/ cleaned up
- [ ] docs-site moved or gitignored
- [ ] PR CI workflow active and passing on main
- [ ] CLI install smoke test passes (`npx @ai-eng-system/cli install --dry-run`)
- [ ] Agent count consistent across all docs
- [ ] README accurate for v2.0.0

### Publish

- [ ] Tag `core-v2.0.0`, `cli-v2.0.0`, `toolkit-v2.0.0`
- [ ] OIDC publish succeeds for all three packages
- [ ] Verify `npm view @ai-eng-system/cli@2.0.0` shows correct metadata
- [ ] Verify CLI works: `npx @ai-eng-system/cli@2.0.0 install --help`
- [ ] Claude Code marketplace picks up updated plugin
- [ ] GitHub release created with changelog notes

### Post-release

- [ ] Announce on Twitter/X, Hacker News (Show HN), Reddit r/codingagent
- [ ] Post to Claude Code community / Discord
- [ ] Update any related blog posts or docs
- [ ] Monitor npm download stats for first 48h
- [ ] Respond to initial issues/feedback within 24h

---

## 7. Distribution & Discovery Plan

### npm

- **Already live** at `@ai-eng-system/core`, `cli`, `toolkit`
- Add **better descriptions** and **screenshots/GIF** in README for npm page
- Ensure keywords cover: `claude-code`, `opencode`, `ai-agent`, `engineering-workflow`, `code-review`, `developer-tools`
- Consider `npx @ai-eng-system/cli` as the primary install path (zero-config)

### Claude Code Marketplace

- Already integrated via `/plugin marketplace add v1truv1us/ai-eng-system`
- Ensure plugin metadata is **complete** with description, tags, and preview
- Add **marketplace README** with screenshots and quickstart
- Consider splitting into fewer sub-plugins for discoverability (7 is a lot)

### Community & Content

| Channel | Action |
|---------|--------|
| **GitHub** | Polish README, add "used by" section, respond to issues fast |
| **Show HN** | "Structured engineering workflows for AI coding agents" |
| **r/codingagent, r/ClaudeAI** | Share with honest assessment of what it does |
| **Claude Code Discord** | Share in relevant channels, answer questions |
| **Dev.to / Medium** | "How we built an engineering system for AI agents" article |
| **YouTube** | 5-min walkthrough of install → research → work flow |

### Growth Targets

| Metric | Current | v2.0 (30 days) | v2.1 (90 days) |
|--------|---------|----------------|----------------|
| GitHub stars | 6 | 50 | 200 |
| npm weekly downloads | ~0 | 100 | 500 |
| Claude Code marketplace installs | unknown | 25 | 100 |
| Contributors | 1 | 3 | 10 |

### Key Messaging

> "AI Engineering System gives your coding agent structured workflows — from research to deployment — with 38 specialized agents, quality gates, and one-command install for Claude Code and OpenCode."

Position as: **the missing engineering rigor layer for AI coding assistants.**

---

*Plan created 2026-04-25. Adjust estimates and priorities based on available time.*
