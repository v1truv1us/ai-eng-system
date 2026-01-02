# Changelog

All notable changes to the Ferg Engineering System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
