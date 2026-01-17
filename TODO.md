# TODO: AI Engineering System

**Current Version**: 0.0.14
**Last Updated**: 2026-01-01

## High Priority

*All High Priority documentation cleanup and count fixes completed. See Completed Tasks for details.*

## Completed Tasks

### ai-eng ralph CLI Implementation (2026-01-11) ✅

- [x] Re-implemented complete CLI runner with TUI (6 screens, keyboard navigation)
- [x] Added timeout handling (120s default) to prevent indefinite hangs
- [x] Added rate-limit detection (HTTP 429, quota errors) with exponential backoff
- [x] Implemented exponential backoff with jitter for retries
- [x] Added configurable models per task type (research/planning/exploration/coding)
- [x] Set all defaults to github-copilot/gpt-5.2
- [x] Implemented 4-tier model resolution priority (task → default → opencode → fallback)
- [x] Created comprehensive test suite (42 tests, all passing)
- [x] Added documentation in docs/ai-eng-ralph-cli-complete.md
- [x] Added documentation site page at docs-site/src/content/docs/features/ai-eng-ralph-cli.md
- [x] Updated README.md with CLI usage instructions
- [x] Committed to feature/ai-eng-ralph-cli branch
- [x] Pushed to GitHub
- [x] Created worktree for feature development

**Fixes applied from specs/fix-timeout-and-model-config.md:**
- Timeout handling for OpenCode prompts
- Rate-limit detection and backoff strategy
- Configurable models with proper resolution
- All 42 CLI tests passing

**Commit**: 5562fc32e - "feat: ai-eng ralph CLI with timeout and model config"

## Medium Priority

### Modularization - COMPLETED ✅
- [x] Complete workspace modularization into packages/core and packages/cli
- [x] Publish @ai-eng-system/core@0.4.5 with all agents, skills, commands
- [x] Publish @ai-eng-system/cli@0.5.0 with orchestration logic
- [x] Set up OIDC publishing via GitHub Actions
- [x] Verify end-to-end installation and functionality
- [x] Update documentation (MODULARIZATION.md, PUBLISHING.md)

### Feature Enhancements
- [ ] Review and prioritize feature requests from GitHub issues
- [ ] Implement any pending agent enhancements
- [ ] Evaluate new agent/command additions
- [ ] Update skill packs if needed

### Testing & Quality
- [ ] Run full test suite and verify all tests pass
- [ ] Review test coverage and add tests if needed
- [ ] Validate build process completes successfully
- [ ] Check for any TypeScript errors or warnings

### Documentation
- [x] Update README.md with latest features and improvements
- [x] Verify all command references are accurate (currently 17 commands)
- [x] Verify all agent references are accurate (currently 28 agents)
- [ ] Update installation guides if needed
- [x] Document Ralph Wiggum flag usage across all commands
- [x] Add Ralph Wiggum examples to command documentation

## Low Priority

### Architecture & Performance
- [ ] Evaluate performance optimization opportunities
- [ ] Consider caching improvements for research results
- [ ] Review agent context window usage and optimization

### Community & Integration
- [ ] Update marketplace listing if needed
- [ ] Review and respond to GitHub issues
- [ ] Consider additional platform integrations

## Completed Tasks

### Ralph Wiggum Integration (2026-01-05)
- [x] Added `--ralph` flag support to all 5 phase commands
- [x] `/ai-eng/work` - Full TDD cycle with quality gates and progress tracking
- [x] `/ai-eng/research` - Iterative research refinement with gap analysis
- [x] `/ai-eng/specify` - Specification refinement with completeness tracking
- [x] `/ai-eng/plan` - Planning enhancement with task atomicity focus
- [x] `/ai-eng/review` - Multi-perspective review with escalating focus
- [x] Consistent flag set across all commands (8 Ralph Wiggum options)
- [x] Phase-specific completion promises and quality gates
- [x] Progress tracking with iteration metrics and status updates
- [x] Comprehensive documentation with examples and best practices

### Documentation & Count Fix (2026-01-01)
- [x] Updated TODO.md version from 0.0.12 to 0.0.14
- [x] Corrected agent count from 29 to 28 across all documentation
- [x] Corrected skill count from 13 to 7 (SKILL.md files only)
- [x] Reorganized completed High Priority items to Completed Tasks section
- [x] Updated CHANGELOG.md with missing v0.0.13 and v0.0.14 entries

### Documentation Cleanup (2025-12-30)
- [x] Remove outdated v0.3.0/v0.4.0 references from IMPLEMENTATION-ROADMAP.md
- [x] Remove outdated v0.3.0/v0.4.0 references from IMPLEMENTATION-VERIFICATION.md
- [x] Archive outdated release notes:
  - RELEASE-v0.3.0.md
  - RELEASE-v0.3.1.md
  - RELEASE-v0.3.0-rc1.md
- [x] Update docs/decisions/2025-12-11-local-vs-cloud-execution.md (remove version-specific references)
- [x] Update docs/research/2025-12-11-agent-swarm-execution-strategies.md (remove version-specific references)
- [x] Update plans/2025-01-05-phase3-research-orchestration.md (remove version-specific references)
- [x] Update docs/PHASE-3-USAGE.md (remove version reference)
- [x] Review plan files (phase1.md, phase2.md) and archive as historical records

### Version Consistency (2025-12-30)
- [x] Audit all documentation for version consistency (v0.0.x)
- [x] Update CHANGELOG.md to properly reflect v0.0.x history
- [x] Verify package.json version is current

### Plan Cleanup (2025-12-30)
- [x] Archived all outdated plans to archive/plans/
- [x] Removed plans/ directory
- [x] Updated CHANGELOG.md to remove v0.3.x and v0.4.0 entries
- [x] Fixed package.json version from 0.4.0 to 0.0.10

### Documentation Cleanup (2025-12-26)
- [x] Created comprehensive TODO.md for task tracking
- [x] Updated IMPLEMENTATION-ROADMAP.md (removed v0.3.0/v0.4.0 references, updated status)
- [x] Updated IMPLEMENTATION-VERIFICATION.md (removed outdated references, updated notes)
- [x] Updated docs/decisions/2025-12-11-local-vs-cloud-execution.md (removed version-specific references)
- [x] Updated docs/research/2025-12-11-agent-swarm-execution-strategies.md (removed version-specific references)
- [x] Updated docs/PHASE-3-USAGE.md (removed version reference)
- [x] Updated plans/2025-01-05-phase3-research-orchestration.md (removed version-specific references)
- [x] Archived outdated release notes to archive/ directory

### Version 0.0.10 (2025-12-26)
- [x] Released version 0.0.10 to npm
- [x] Auto-installation plugin working
- [x] 17 commands, 28 agents, 7 skill files deployed

### Previous Versions
- [x] v0.0.7 - OpenCode Plugin Auto-Installation
- [x] v0.0.4 - Command registration fixes, documentation-specialist agent
- [x] v0.0.2 - Initial beta release
- [x] v0.0.1 - Core system architecture

## Notes

- The project has reverted to v0.0.x versioning for current development
- All v0.2.x, v0.3.x, and v0.4.x references in documentation are outdated
- Documentation cleanup completed - all version references now reflect v0.0.x
- Outdated release notes (v0.3.0, v0.3.1, v0.3.0-rc1) have been archived
- All outdated plans have been archived to archive/plans/ directory
- Build system is working well with <200ms build times

## Spec-Driven Development Methodology

This toolkit follows **spec-driven development methodology** from GitHub's official blog post:
- **Source**: [Spec-driven development with AI: Get started with a new open source toolkit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

### Complete Workflow (Research → Specify → Plan → Work → Review)

| Phase | Command | Purpose |
|-------|---------|---------|
| 1. Research | `/ai-eng/research` | Multi-phase research with codebase and external context |
| 2. Specify | `/ai-eng/specify` | Create detailed specifications with TCRO framework |
| 3. Plan | `/ai-eng/plan` | Generate implementation plans from specs |
| 4. Work | `/ai-eng/work` | Execute tasks with quality gates and validation |
| 5. Review | `/ai-eng/review` | Multi-perspective code review (28 agents) |

This approach ensures specifications are your "source of truth" for what gets built, reducing guesswork and enabling reliable AI-assisted development.

### Commands Following This Methodology
- ✅ `/ai-eng/research` - Multi-phase research orchestration
- ✅ `/ai-eng/specify` - Specification creation with TCRO framework
- ✅ `/ai-eng/plan` - Technical planning from specifications
- ✅ `/ai-eng/work` - Task execution with quality gates and validation
- ✅ `/ai-eng/review` - Multi-perspective code review
- ✅ All spec-driven commands properly implement the workflow

### Workflow Guide

For visual workflow diagrams and complete examples, see:
- **[docs/spec-driven-workflow.md](./docs/spec-driven-workflow.md)** - Complete workflow guide with Mermaid diagrams
