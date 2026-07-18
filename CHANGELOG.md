# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.12.1](https://github.com/v1truv1us/ai-eng-system/compare/v1.12.0...v1.12.1) (2026-07-18)

### Fixed
- **Singular `skill/` re-pollution**: the build and installer were writing skills to both `skill/` (singular, legacy) and `skills/` (plural, canonical), causing stale duplicates to reappear after `bun run install:global`. The build now writes skills to `skills/` only; the installer removes any legacy `skill/` dir and no longer copies a singular surface. Deleted stale `packages/core/opencode/skill/` and `packages/core/skills/` sources.
- **Retired `+45-115%` hook claim**: removed the unverified prompt-optimization quality claim from the installer output.

## [1.12.0](https://github.com/v1truv1us/ai-eng-system/compare/v1.11.3...v1.12.0) (2026-07-18)

### Fixed
- **Singular `skill/` re-pollution**: the build and installer were writing skills to both `skill/` (singular, legacy) and `skills/` (plural, canonical), causing stale duplicates to reappear after `bun run install:global`. The build now writes skills to `skills/` only; the installer removes any legacy `skill/` dir and no longer copies a singular surface. Deleted stale `packages/core/opencode/skill/` and `packages/core/skills/` sources.
- **Retired `+45-115%` hook claim**: removed the unverified prompt-optimization quality claim from the installer output.

## [1.11.3] - 2026-07-16

### Fixed
- **`/deep-review`, `/review`, `/maintenance-review`, `/seo` failed with "Agent Not Found":** these commands set `agent: review`, but no `review` agent existed. Added a `review` agent (read-only multi-axis review orchestrator that dispatches `code-reviewer` / `security-scanner` / `architect-advisor` / `performance-engineer` via the Task tool) and wired it into the `ai-eng-quality` plugin.

## [1.11.2] - 2026-07-16

### Fixed
- **OpenCode agent discovery (the real fix):** OpenCode 1.18 reads **singular** dirs (`agent/`, `command/`, `skill/`, `tool/`), not plural — the v1.11.0 plural change broke discovery on 1.18. The build now writes **both** singular (1.18) and plural (≥1.19), with **flat** agent names (`agent/code-reviewer.md`), so `@code-reviewer` resolves on every version.
- **Installer cleans stale nested installs:** older installs wrote agents nested under `agent/ai-eng/<category>/` (so `code-reviewer` was only discoverable as `ai-eng/quality-testing/code-reviewer`). The installer now purges that stale namespace and writes flat agents to both singular + plural target dirs. Re-run the installer to repair an existing global install.

## [1.11.1] - 2026-07-16

### Fixed
- **OpenCode agents not found** (`/deep-review`, etc.): agents were nested under `agents/ai-eng/<category>/`, and OpenCode derives agent names from the full file path — so `code-reviewer` was only discoverable as `ai-eng/quality-testing/code-reviewer`, which commands never reference. Agents are now written **flat** (`agents/<name>.md`), matching the OpenCode docs convention and command references like `@code-reviewer`.
- **Claude hook install**: the installer looked for hooks at the removed `plugins/ai-eng-system/hooks/` (gone since v1.9.0), so the hook step always skipped. It now resolves from `dist/.claude-plugin/hooks/` (with `.claude/hooks/` fallback) and skips `test_*`/doc files so only real hooks land in `~/.claude/hooks/`.

## [1.11.0] - 2026-07-16

### Changed
- **OpenCode = global content library**: the installer now targets `~/.config/opencode/` by default (`--local` for project). Content is discovered natively — the `plugin: ["ai-eng-system"]` reference is removed, so OpenCode no longer loads the stale legacy `ai-eng-system@0.4.0` package. Content lands in `~/.config/opencode/{commands,agents,skills,tools}/` (and Claude hooks in `~/.claude/hooks/`).
- **Plural OpenCode dirs**: generated outputs now use the canonical `commands/`, `agents/`, `skills/`, `tools/` (previously singular), matching current OpenCode docs.
- **Claude plugin / OpenCode parity**: every catalog skill/agent/command now lands in at least one marketplace plugin. `build.ts` routes any unassigned item into the `ai-eng-core` catch-all (245 skills routed this release), so the Claude plugins collectively ship the same catalog OpenCode gets. Enforced by a new parity test.

### Fixed
- **build.ts tool path**: `buildOpenCode()` now copies the `prompt-optimize` tool from its real source (`packages/cli/src/opencode-tool-prompt-optimize.ts`) instead of a non-existent `src/` path, so the tool regenerates with the canonical source.
- **Installer copies tools**: the global/project install now also installs `tools/` (e.g. `prompt-optimize`), not just commands/agents/skills.

## [1.10.0] - 2026-07-16

### Changed
- **Output-contract discipline across the catalog**: 128 skills, 45 agents, and 29 commands now carry a `Default output:` contract (return only result, blockers, and required evidence; omit preambles, process narration, repeated context, confidence scores, and follow-up offers). Net ~2.7k lines of narration removed from generated assets, continuing the routing/execution token-cost reduction.
- **Canonical `tools` object format**: agent frontmatter is now authored in OpenCode object form (`tools: { read: true, ... }`) as the single source; per-harness transforms convert to each target.

### Fixed
- **Claude Code agent build**: added `transformAgentMarkdownForClaude()` so generated `.claude`/marketplace agents convert canonical object `tools` to the Claude Code array form and strip the OpenCode-only `permission` field (previously copied through verbatim). Cursor output now validates agent `tools` is an array.
- **Install telemetry paths**: `packages/cli/src/install/telemetry.ts` resolves `~/.ai-eng` via `process.env.HOME || os.homedir()` instead of `os.homedir()` alone, fixing telemetry/opt-out location in environments where the two differ.

## [1.9.0] - 2026-06-22

### Added
- **GTM skills (opt-in)**: vendor [LeadMagic/gtm-skills](https://github.com/LeadMagic/gtm-skills) (205 B2B go-to-market playbooks across 24 categories) via `scripts/vendor-gtm-skills.sh`; expose to the build with `scripts/install-gtm-skills.sh`. Gitignored by default — installed only on demand.
- **storm-research skill**: Stanford STORM multi-perspective research method (4 sequential phases: scan, contradiction map, synthesis, peer review).
- **sync-skill-taxonomy skill**: classifies every skill as user-invoked vs model-invoked, ensures `disable-model-invocation` consistency, injects `metadata.category`.
- **Skill taxonomy**: every skill now carries `metadata.category` (`user-invoked` or `model-invoked`) and `disable-model-invocation: true` on user-invoked skills.

### Changed
- **Skill catalog consolidated**: canonical `skills/` is now the single source. Promoted 48 unique skills out of the drifted `.pi/skills/` and `.agents/skills/` trees (both now gitignored as derived outputs). Removed 9 stale pstack duplicates and the superseded `continuous-learning-v2`.
- **Routing token cost cut ~73%**: startup routing dropped from ~10,875 to ~2,894 tokens. 269 of 332 skills are now user-invoked (excluded from model routing); only 63 broad-capability core skills remain model-invoked. All 205 GTM skills are user-invoked.
- **Tightened descriptions**: 42 core model-invoked descriptions rewritten to 80–150 chars; all 205 GTM descriptions tightened (81.8k → 24.7k chars, 70% smaller). Stripped trigger-phrase lists, framework attributions, and feature enumerations.
- **Plugin build artifacts untracked**: `plugins/ai-eng-*/{skills,agents,commands,hooks,docs,templates,plugin.json,.cursor-plugin}` are now correctly gitignored (were committed historically). `bun run build` regenerates them.

### Fixed
- `scripts/vendor-gtm-skills.sh`: `set -u` crash from non-ASCII ellipsis adjacent to variable refs; `--ref` arg handling.
- `tests/integration.test.ts`: per-test `beforeEach(build)` → `beforeAll(build)` to reduce build overhead (strict improvement; remaining test timeouts are pre-existing).

## [1.6.3] - 2026-05-23

### Changed
- Refactored cursor/plugins merged skills into single cohesive bodies (no append-only `Imported from` sections or `-v2` parallel skills).
- Integrated thermo-nuclear review as strict maintainability mode in `code-review-and-quality` and `code-reviewer`.
- Renamed `continuous-learning-v2` to canonical `continuous-learning` with unified instinct + workspace memory workflow.
- Import script now treats merges as native-only (re-import never appends duplicate skill/agent sections).
- Coverage verifier recognizes native integration markers for merged agents.

### Added
- Full cursor-team-kit agent import set (ci-watcher, compatibility agents, agents-memory-updater, poteto-agent, etc.) wired in PLUGIN_MAP.

## [0.6.0] - 2026-03-30

### Added
- Added four new specialists to close high-priority coverage gaps:
  - `mobile-developer`
  - `data-engineer`
  - `aws-architect`
  - `agent-developer`
- Added coordinated registry and reference updates so the published agent inventory now reflects the actual 32-agent system.

### Changed
- Normalized canonical and generated agent inventories across `content/`, `.claude-plugin/`, `.opencode/`, `plugins/ai-eng-system/`, `packages/core/`, and `packages/toolkit/`.
- Updated marketplace metadata, installation docs, and agent registries to use the current 32-agent count.
- Bumped the coordinated package version to `0.6.0` for `@ai-eng-system/core`, `@ai-eng-system/toolkit`, and `@ai-eng-system/cli`.

### Fixed
- Fixed stale subagent orchestration references so routing guidance now points to the correct current specialists, including `api-builder-enhanced`.

## [0.5.10] - 2026-03-27

### Added
- Published the first coordinated three-package release:
  - `@ai-eng-system/core`
  - `@ai-eng-system/toolkit`
  - `@ai-eng-system/cli`
- Added `@ai-eng-system/toolkit` as a real workspace package built from generated `.claude-plugin`, `.opencode`, and marketplace plugin artifacts.
- Added stable toolkit path helpers for consumers that need packaged asset locations.
- Added the new `/ai-eng/simplify` command backed by the namespaced skill at `skills/ai-eng/simplify/SKILL.md`.

### Changed
- Standardized release automation around the coordinated OIDC workflow in `.github/workflows/publish-all-oidc.yml`.
- Preserved namespaced skill paths such as `ai-eng/simplify` and `workflow/ralph-wiggum` across generated Claude, OpenCode, marketplace, and toolkit outputs.
- Updated installation, marketplace, publishing, and package-role documentation to reflect the three-package model.

### Fixed
- Fixed trusted-publishing workflow issues involving workspace lockfiles, toolkit artifact generation in CI, and CLI publish manifest recursion.
- Fixed release workflow validation to use a release-safe CLI smoke-test suite.
- Fixed generated skill packaging so nested skill directories are no longer flattened incorrectly.

### [0.4.7](https://github.com/v1truv1us/ai-eng-system/compare/v0.4.6...v0.4.7) (2026-01-19)

### [0.4.4](https://github.com/v1truv1us/ai-eng-system/compare/v0.2.3...v0.4.4) (2026-01-17)


### ⚠ BREAKING CHANGES

* Model must now be explicitly configured in config.yaml
or opencode.model. No automatic fallback to claude-3-5-sonnet-latest.
* None
This addresses all requirements from issue analysis and provides
a complete clean reinstall solution with working hooks.

### Features

* ai-eng ralph CLI with timeout and model config ([5562fc3](https://github.com/v1truv1us/ai-eng-system/commit/5562fc32e61891e1f798591930c7c5e5762de4dc))
* apply prompt optimization improvements across all agents and commands ([550139e](https://github.com/v1truv1us/ai-eng-system/commit/550139ec4aeb5d5d4783ace2a022bfa93eef862b))
* v0.3.0 - Complete clean reinstall and hooks implementation ([42ec81c](https://github.com/v1truv1us/ai-eng-system/commit/42ec81c4036cbc05c4b4c9d1a9b808e70053a68a))
* v0.4.0 CLI improvements and bug fixes ([2561006](https://github.com/v1truv1us/ai-eng-system/commit/2561006a3dc89baadf047114738cd4c169f53daf))


### Bug Fixes

* add @opentui/core dependency for TUI ([2ce7eee](https://github.com/v1truv1us/ai-eng-system/commit/2ce7eeecfea50dd23b0fce8d7f20bb20a0218273))
* address pre-existing issues ([5e470ff](https://github.com/v1truv1us/ai-eng-system/commit/5e470ff87fb26987201f1ce22e700265df211147))
* Correct OpenCode messageID format and remove invalid config keys ([08c2fe6](https://github.com/v1truv1us/ai-eng-system/commit/08c2fe66c38ac93fe2af5a5fe62cdfc56f032ea9))
* Resolve critical CLI reliability issues ([678ebe5](https://github.com/v1truv1us/ai-eng-system/commit/678ebe563f50db878d942c9de9b3885418804a1a))
* resolve OpenCode session creation with proper server lifecycle management ([e90f64f](https://github.com/v1truv1us/ai-eng-system/commit/e90f64f1ec747403d5e732c19009e5eb4d6b7426))
* use process.cwd() for working directory ([6944987](https://github.com/v1truv1us/ai-eng-system/commit/694498761219e8a569d7cad63913bdfa138e1507))


### Build System

* add CLI to dist + remove model fallback ([830eed5](https://github.com/v1truv1us/ai-eng-system/commit/830eed552d26f0009e41386e83cb70965a649fdc))

### [0.4.3](https://github.com/v1truv1us/ai-eng-system/compare/v0.2.3...v0.4.3) (2026-01-17)


### ⚠ BREAKING CHANGES

* Model must now be explicitly configured in config.yaml
or opencode.model. No automatic fallback to claude-3-5-sonnet-latest.
* None
This addresses all requirements from issue analysis and provides
a complete clean reinstall solution with working hooks.

### Features

* ai-eng ralph CLI with timeout and model config ([5562fc3](https://github.com/v1truv1us/ai-eng-system/commit/5562fc32e61891e1f798591930c7c5e5762de4dc))
* apply prompt optimization improvements across all agents and commands ([550139e](https://github.com/v1truv1us/ai-eng-system/commit/550139ec4aeb5d5d4783ace2a022bfa93eef862b))
* v0.3.0 - Complete clean reinstall and hooks implementation ([42ec81c](https://github.com/v1truv1us/ai-eng-system/commit/42ec81c4036cbc05c4b4c9d1a9b808e70053a68a))
* v0.4.0 CLI improvements and bug fixes ([2561006](https://github.com/v1truv1us/ai-eng-system/commit/2561006a3dc89baadf047114738cd4c169f53daf))


### Bug Fixes

* add @opentui/core dependency for TUI ([2ce7eee](https://github.com/v1truv1us/ai-eng-system/commit/2ce7eeecfea50dd23b0fce8d7f20bb20a0218273))
* address pre-existing issues ([5e470ff](https://github.com/v1truv1us/ai-eng-system/commit/5e470ff87fb26987201f1ce22e700265df211147))
* Correct OpenCode messageID format and remove invalid config keys ([08c2fe6](https://github.com/v1truv1us/ai-eng-system/commit/08c2fe66c38ac93fe2af5a5fe62cdfc56f032ea9))
* Resolve critical CLI reliability issues ([678ebe5](https://github.com/v1truv1us/ai-eng-system/commit/678ebe563f50db878d942c9de9b3885418804a1a))
* resolve OpenCode session creation with proper server lifecycle management ([e90f64f](https://github.com/v1truv1us/ai-eng-system/commit/e90f64f1ec747403d5e732c19009e5eb4d6b7426))
* use process.cwd() for working directory ([6944987](https://github.com/v1truv1us/ai-eng-system/commit/694498761219e8a569d7cad63913bdfa138e1507))


### Build System

* add CLI to dist + remove model fallback ([830eed5](https://github.com/v1truv1us/ai-eng-system/commit/830eed552d26f0009e41386e83cb70965a649fdc))

## [0.2.4] - 2026-01-12

### Fixed
- **OpenCode SDK Compatibility**: Upgraded @opencode-ai/plugin from 1.0.218 to 1.1.13 to resolve messageID validation errors with OpenCode 1.1.13 server
- **Session Management**: SDK v1.1.13 fixes API response format validation issues that prevented proper session creation and closure

### Changed
- **Dependencies**: Updated OpenCode SDK to 1.1.13 for compatibility with latest OpenCode CLI server
- **Build**: Regenerated bun.lock with updated dependency tree

### Technical Details
The OpenCode 1.1.x server introduced API response format changes that were incompatible with SDK 1.0.x clients. The error manifested as:
```
Invalid string: must start with "msg"
```
Upgrading to SDK 1.1.13 resolves this without any breaking API changes to ai-eng-ralph-cli.

### Verification
- ✅ Clean build successful with all 662 packages
- ✅ Tested with fleettools project - session created and closed successfully
- ✅ No source code changes required - SDK API remained compatible

### [0.2.3](https://github.com/v1truv1us/ai-eng-system/compare/v0.2.0...v0.2.3) (2026-01-10)


### ⚠ BREAKING CHANGES

* Default behavior is now autonomous. Use --refine-each-phase for original interactive behavior.

### Bug Fixes

* ralph-wiggum autonomous execution between phases ([16f9c1c](https://github.com/v1truv1us/ai-eng-system/commit/16f9c1cc733dc190539f5538efbac70d0be50311))
* ralph-wiggum autonomous looping issue with continuous phase execution ([53241c7](https://github.com/v1truv1us/ai-eng-system/commit/53241c7c681b1e3c0c37ba12b7d66e33ae36ee54))
* resolve plugin installation issues and sync commands ([1bfc229](https://github.com/v1truv1us/ai-eng-system/commit/1bfc229af516d60c7d46ed0f36054d3cd23fc214))

## [0.2.2] - 2026-01-07

### Fixed
- **Ralph Wiggum Autonomous Looping**: Command no longer stops between workflow phases, ensuring continuous iteration
- **Prompt Refinement Optimization**: Only performs prompt-refinement once at Phase 0, storing refined context for subsequent phases
- **Checkpoint Compatibility**: Maintains full backward compatibility with existing checkpoint system
- **Performance Enhancement**: Reduced redundant prompt processing, improving workflow execution speed

### Added
- **--refine-each-phase Flag**: New optional flag for interactive mode that refines prompts at each phase (default: disabled)
- **Explicit Continuation Instructions**: Added clear phase transition guidance to prevent workflow interruption
- **Context Persistence**: Refined context is now stored and reused across all phases for consistency

### Changed
- **Phase Transition Logic**: Improved flow between Research → Specify → Plan → Work → Review phases
- **Documentation**: Updated ralph-wiggum.md with comprehensive usage examples and troubleshooting guide
- **Command Structure**: Enhanced from 761 to 789 lines with additional error handling and edge case coverage

### Technical Details
The issue was caused by prompt-refinement being invoked at every phase transition, creating natural stopping points in the autonomous workflow. The fix involves:

1. **Single Refinement**: Prompt-refinement occurs only once at initialization (Phase 0)
2. **Context Storage**: Refined prompts are cached and reused for all subsequent phases
3. **Continuation Signals**: Explicit "continue to next phase" instructions prevent workflow interruption
4. **Fallback Mode**: `--refine-each-phase` flag allows original behavior for interactive use cases

### Backward Compatibility
- All existing ralph-wiggum usage patterns remain unchanged
- Checkpoint system fully compatible with new workflow
- Default behavior provides the fix, no configuration required
- Optional flag available for users who prefer per-phase refinement

### [0.1.1](https://github.com/v1truv1us/ai-eng-system/compare/v0.0.15...v0.1.1) (2026-01-06)


### Features

* integrate Ralph Wiggum skill and remove CLI executor ([61c56be](https://github.com/v1truv1us/ai-eng-system/commit/61c56be1d7472926dd2350d220395783e96879d9))

## [0.0.14] - 2026-01-01

### Fixed
- **Documentation Accuracy**: Corrected agent count from 29 to 28 across all documentation
- **Skill Count**: Corrected skill file count from 13 to 7 (SKILL.md files only)
- **TODO.md Cleanup**: Reorganized completed tasks, updated version references

### Changed
- **Version Consistency**: All documentation now reflects accurate counts
- **TODO.md**: Moved completed High Priority items to Completed Tasks section

### Infrastructure
- **Build**: Stable
- **Commands**: 17 total
- **Agents**: 28 total
- **Skills**: 7 SKILL.md files

## [0.0.13] - 2025-12-31

### Added
- **Research Document**: Added thinking signature error analysis (`docs/research/2026-01-01-thinking-signature-error.md`)

### Infrastructure
- **Build**: Stable
- **Commands**: 17 total
- **Agents**: 28 total
- **Skills**: 7 SKILL.md files

## [0.0.12] - 2025-12-30

### Added
- **Spec-Driven Development Workflow**: Complete 5-phase workflow (Research → Specify → Plan → Work → Review)
- **Visual Workflow Diagrams**: Mermaid diagrams in README.md showing the workflow
- **Workflow Guide** (`docs/spec-driven-workflow.md`): Comprehensive guide with examples and checklist
- **17 Commands**: Added `/ai-eng/research` as primary workflow command (now 17 total)
- **GitHub Methodology Reference**: Added link to [GitHub's spec-driven development blog post](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

### Changed
- **Documentation Cleanup**: Removed outdated v0.3.x and v0.4.0 references from all files
- **Version Alignment**: All documentation now reflects v0.0.x versioning consistently
- **Command Structure**: Reorganized commands into primary workflow (5) and additional (12)
- **Build Optimization**: Build time now under 500ms

### Fixed
- **Plan Archival**: Archived 7 outdated plans to `archive/plans/`
- **Version Consistency**: Fixed package.json (0.4.0 → 0.0.12), CHANGELOG, TODO.md, IMPLEMENTATION-ROADMAP.md
- **Test Suite**: All 457 tests passing with no failures

### Removed
- **Outdated Plans**: Removed plans/ directory, consolidated to IMPLEMENTATION-ROADMAP.md

### Infrastructure
- **Build**: 475ms build time
- **Tests**: 457 pass, 0 fail
- **TypeScript**: No errors
- **Commands**: 17 total (5 primary + 12 additional)
- **Agents**: 28 total
- **Skills**: 7 files

## [0.0.10] - 2025-12-26

### Added
- **Auto-Installation Plugin Working**: Plugin automatically installs commands, agents, and skills when loaded
- **16 Commands**: Complete command suite including /plan, /work, /research, /review, /optimize, /deploy, and creation commands
- **29 Agents**: Comprehensive agent ecosystem across architecture, development, quality, devops, AI/ML, content, and plugin development
- **13 Skill Files**: DevOps, prompting, research, and plugin-development skill packs

### Changed
- **Documentation Cleanup**: Removed outdated v0.3.x and v0.4.0 references
- **Version Alignment**: All documentation now reflects v0.0.x versioning
- **Archived Release Notes**: Outdated release notes moved to archive/ directory
- **Archived Plans**: All outdated plans moved to archive/plans/ directory

### Fixed
- **Version Consistency**: All documentation files updated to reflect v0.0.x versioning
- **TODO.md Tracking**: Created comprehensive TODO.md for task tracking and documentation cleanup

## [0.0.7] - 2025-12-24

### Added
- **OpenCode Plugin Auto-Installation**: Plugin now automatically installs commands, agents, and skills when loaded
- **Dual Installation**: Works via plugin initialization OR npm postinstall
- **Postinstall Script**: Automatically detects `opencode.jsonc` and installs to project directory
- **16 Commands**: All commands in `ai-eng` namespace for OpenCode
- **30 Agents**: 5 categories of specialized agents
- **13 Skill Files**: Complete skill pack including devops, prompting, research, and plugin-dev
- **Usage Examples**: Added comprehensive usage documentation in README.md

### Fixed
- **Installation Path Resolution**: Plugin correctly detects if running from `dist/` or package root
- **Auto-detection**: postinstall script finds `opencode.jsonc` by traversing up directories
- **Documentation**: Updated command count to 16, skills to 13 files

### Changed
- **Plugin Implementation**: Moved from TypeScript file to pure markdown-based installation
- **Configuration**: `.opencode/opencode.jsonc` template includes `opencode-skills` dependency

## [0.0.4] - 2025-12-21

### Fixed
- Command registration fixes - all 15 commands now properly available
- NPM publishing workflow implementation
- Removed GitHub Packages configuration for cleaner publishing
- Build artifacts preservation and formatting improvements
- OpenCode agent categories corrected to avoid namespace collision
- Anthropic marketplace pattern implementation with embedded plugin
- Build system fixes for marketplace compliance and mirror validation

### Added
- **documentation-specialist Agent**: Comprehensive technical documentation generation
  - Senior technical documentation specialist with 15+ years experience
  - Generates API docs, user guides, technical specifications, and reference materials
  - Analyzes codebases to create accurate, user-friendly documentation
  - Proactive documentation needs identification for code changes and new features
- Updated agent registry to include all 26 specialized agents
- Fixed swarm integration tests to reflect correct agent count

## [0.0.2] - 2025-11-30

### Added
- Initial release with core functionality
- Basic agent and command structure
- Documentation system foundation

## [0.0.1] - 2025-11-30

### Added
- Beta release
- Core system architecture
- Initial command and agent definitions
