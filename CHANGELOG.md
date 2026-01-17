# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
