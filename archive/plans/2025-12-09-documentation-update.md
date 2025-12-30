# Documentation Update Implementation Plan

**Status**: Draft
**Created**: 2025-12-09
**Estimated Effort**: 16 hours (4 days)
**Complexity**: Medium

## Overview

Comprehensive update of all documentation files in the ai-eng-system repository to ensure accuracy, consistency, and completeness. The current documentation has significant inconsistencies including wrong repository names, outdated package references, incorrect command/agent counts, and missing information.

## Success Criteria
- [ ] All documentation references correct repository (`v1truv1us/ai-eng-system`)
- [ ] All package names use `@v1truv1us/ai-eng-system`
- [ ] Command counts match actual implementation (15 commands, 29 agents)
- [ ] Namespace references use `ai-eng/` consistently
- [ ] Version numbers are current and consistent
- [ ] File structure diagrams match actual directories
- [ ] All build commands use `bun` instead of `npm`

## Architecture

The documentation system uses a single-source-of-truth approach with content in `content/` being transformed to platform-specific formats in `dist/`. Updates must maintain this consistency across all documentation files.

## Phase 1: Critical Documentation Fixes

**Goal**: Fix the most broken documentation files that users see first
**Duration**: 4 hours

### Task 1.1: Complete PLUGIN.md Rewrite
- **ID**: DOC-001-A
- **Depends On**: None
- **Files**:
  - `PLUGIN.md` (complete rewrite)
- **Acceptance Criteria**:
   - [ ] Repository name corrected to `v1truv1us/ai-eng-system`
  - [ ] Package name updated to `@v1truv1us/ai-eng-system`
  - [ ] Command count updated to 15 commands
  - [ ] Agent count updated to 29 agents
  - [ ] File structure diagram matches actual directories
  - [ ] Installation instructions verified working
- **Time**: 2 hours
- **Complexity**: High

### Task 1.2: Update INSTALLATION.md
- **ID**: DOC-001-B
- **Depends On**: DOC-001-A
- **Files**:
  - `INSTALLATION.md` (update)
- **Acceptance Criteria**:
  - [ ] Package name corrected to `@v1truv1us/ai-eng-system`
  - [ ] Namespace updated from `/ferg/` to `/ai-eng/`
  - [ ] Command and agent counts accurate
  - [ ] All installation methods tested and working
- **Time**: 1 hour
- **Complexity**: Medium

### Task 1.3: Update Root AGENTS.md
- **ID**: DOC-001-C
- **Depends On**: None
- **Files**:
  - `AGENTS.md` (update)
- **Acceptance Criteria**:
  - [ ] All 29 agents listed with descriptions
  - [ ] All 15 commands documented
  - [ ] Agent coordination modes accurate
  - [ ] Skills section complete
- **Time**: 1 hour
- **Complexity**: Medium

## Phase 2: Package Name and Repository Corrections

**Goal**: Fix all references to old package names and repository across all files
**Duration**: 6 hours

### Task 2.1: Update IMPLEMENTATION-SUMMARY.md
- **ID**: DOC-002-A
- **Depends On**: None
- **Files**:
  - `IMPLEMENTATION-SUMMARY.md` (rename and update)
- **Acceptance Criteria**:
  - [ ] File renamed to `OIDC-IMPLEMENTATION.md` or rewritten as proper summary
  - [ ] Repository references updated to `v1truv1us`
  - [ ] Package names corrected
- **Time**: 1 hour
- **Complexity**: Low

### Task 2.2: Update RELEASE-v0.2.0.md
- **ID**: DOC-002-B
- **Depends On**: None
- **Files**:
  - `RELEASE-v0.2.0.md` (update)
- **Acceptance Criteria**:
  - [ ] Package name corrected to `@v1truv1us/ai-eng-system`
  - [ ] All installation commands updated
- **Time**: 30 min
- **Complexity**: Low

### Task 2.3: Update IMPLEMENTATION-GUIDE.md
- **ID**: DOC-002-C
- **Depends On**: None
- **Files**:
  - `IMPLEMENTATION-GUIDE.md` (update)
- **Acceptance Criteria**:
  - [ ] Version references updated (current: 0.2.1, target: future versions)
  - [ ] Phase status accurate (Phase 3 is implemented)
- **Time**: 1 hour
- **Complexity**: Medium

### Task 2.4: Update QUICK-START-PHASE-1.md
- **ID**: DOC-002-D
- **Depends On**: None
- **Files**:
  - `QUICK-START-PHASE-1.md` (update)
- **Acceptance Criteria**:
  - [ ] All `npm` commands changed to `bun`
  - [ ] Time estimates consistent
  - [ ] Current version references accurate
- **Time**: 1 hour
- **Complexity**: Medium

### Task 2.5: Update docs/PHASE-3-USAGE.md
- **ID**: DOC-002-E
- **Depends On**: None
- **Files**:
  - `docs/PHASE-3-USAGE.md` (update)
- **Acceptance Criteria**:
  - [ ] CLI usage vs slash commands clearly distinguished
  - [ ] Import paths verified correct
  - [ ] Examples work as documented
- **Time**: 1 hour
- **Complexity**: Medium

### Task 2.6: Update content/AGENTS.md
- **ID**: DOC-002-F
- **Depends On**: None
- **Files**:
  - `content/AGENTS.md` (update)
- **Acceptance Criteria**:
  - [ ] All 29 agents properly categorized (original vs imported)
  - [ ] Agent descriptions accurate
  - [ ] Integration notes current
- **Time**: 1 hour
- **Complexity**: Medium

## Phase 3: Minor Fixes and New Documentation

**Goal**: Complete remaining updates and create missing documentation
**Duration**: 4 hours

### Task 3.1: Update README.md
- **ID**: DOC-003-A
- **Depends On**: DOC-001-A, DOC-001-B
- **Files**:
  - `README.md` (minor updates)
- **Acceptance Criteria**:
  - [ ] Installation date removed or made dynamic
  - [ ] Command/agent counts verified against dist/
  - [ ] Build commands consistent
- **Time**: 30 min
- **Complexity**: Low

### Task 3.2: Update CLAUDE.md
- **ID**: DOC-003-B
- **Depends On**: None
- **Files**:
  - `CLAUDE.md` (update)
- **Acceptance Criteria**:
  - [ ] All current commands listed
  - [ ] Agent contexts accurate
  - [ ] Project detection information current
- **Time**: 30 min
- **Complexity**: Low

### Task 3.3: Create CHANGELOG.md
- **ID**: DOC-003-C
- **Depends On**: None
- **Files**:
  - `CHANGELOG.md` (create)
- **Acceptance Criteria**:
  - [ ] Version history from v0.0.1 to current
  - [ ] Major changes documented
  - [ ] Release dates included
  - [ ] Links to full release notes
- **Time**: 1 hour
- **Complexity**: Medium

### Task 3.4: Create CONTRIBUTING.md
- **ID**: DOC-003-D
- **Depends On**: None
- **Files**:
  - `CONTRIBUTING.md` (create)
- **Acceptance Criteria**:
  - [ ] Development setup instructions
  - [ ] Code style guidelines
  - [ ] Pull request process
  - [ ] Testing requirements
  - [ ] Commit message conventions
- **Time**: 1 hour
- **Complexity**: Medium

### Task 3.5: Verify TESTING.md
- **ID**: DOC-003-E
- **Depends On**: None
- **Files**:
  - `TESTING.md` (verify/update)
- **Acceptance Criteria**:
  - [ ] CI/CD examples current
  - [ ] Test commands work
  - [ ] Coverage requirements accurate
- **Time**: 30 min
- **Complexity**: Low

## Phase 4: Verification and Testing

**Goal**: Ensure all updates are correct and consistent
**Duration**: 2 hours

### Task 4.1: Cross-Reference Verification
- **ID**: DOC-004-A
- **Depends On**: All previous tasks
- **Files**:
  - All documentation files
- **Acceptance Criteria**:
  - [ ] All package names consistent: `@v1truv1us/ai-eng-system`
   - [ ] All repository URLs: `v1truv1us/ai-eng-system`
  - [ ] All namespaces: `ai-eng/`
  - [ ] All command counts: 15 commands
  - [ ] All agent counts: 29 agents
  - [ ] All build commands: `bun`
- **Time**: 1 hour
- **Complexity**: Medium

### Task 4.2: Build and Test Documentation
- **ID**: DOC-004-B
- **Depends On**: DOC-004-A
- **Files**:
  - `dist/` (verify build output)
- **Acceptance Criteria**:
  - [ ] Build successful with no errors
  - [ ] All files sync correctly to dist/
  - [ ] Platform-specific outputs accurate
  - [ ] No broken links or references
- **Time**: 30 min
- **Complexity**: Low

### Task 4.3: Final Review and Commit
- **ID**: DOC-004-C
- **Depends On**: DOC-004-B
- **Files**:
  - All updated files
- **Acceptance Criteria**:
  - [ ] All changes committed with clear messages
  - [ ] Documentation renders correctly
  - [ ] Links and cross-references work
  - [ ] Version consistency verified
- **Time**: 30 min
- **Complexity**: Low

## Dependencies

### External Dependencies
- Access to verify current package versions
- Testing of installation commands
- Verification of dist/ output accuracy

### Internal Dependencies
- Current implementation must remain stable during updates
- Build system must work correctly
- No breaking changes to command/agent structure

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Missing some outdated references | High | Medium | Use grep to search for old patterns |
| Breaking existing functionality | High | Low | Test all changes before committing |
| Inconsistent version numbers | Medium | Medium | Centralize version management |
| Incomplete agent/command lists | Medium | Low | Cross-reference with dist/ output |
| Build system changes during updates | High | Low | Work in feature branch, test builds |

## Testing Plan

### Unit Tests
- [ ] Verify all file updates don't break existing functionality
- [ ] Test build process with updated documentation

### Integration Tests
- [ ] Verify cross-file consistency
- [ ] Test documentation links and references
- [ ] Validate installation instructions

### Manual Testing
- [ ] Review all updated files for accuracy
- [ ] Test installation methods mentioned in docs
- [ ] Verify command/agent counts match implementation

## Rollback Plan

If issues are discovered:
1. Revert changes in feature branch
2. Identify specific problematic updates
3. Fix issues and reapply selectively
4. Test thoroughly before merging

## References

- [Current Implementation Audit](./docs/research/2025-12-09-ferg-namespace-commands-analysis.md)
- [Package.json](./package.json) - Current version and package info
- [dist/ Directory](./dist/) - Actual built output for verification
- [GitHub Repository](https://github.com/v1truv1us/ai-eng-system) - Current state

## Post-Planning Actions

1. **Create feature branch**: `git checkout -b docs-update-2025-12-09`
2. **Set up tracking**: Create GitHub issue to track progress
3. **Schedule work**: Allocate specific time blocks for each phase
4. **Review with team**: Get feedback on the plan before starting

## Parallel Tracks

Tasks that can be worked on simultaneously:
- Phase 1 tasks (independent files)
- Phase 2 tasks (mostly independent)
- Phase 3 documentation creation (CHANGELOG.md and CONTRIBUTING.md)

This plan ensures systematic, atomic updates to all documentation while maintaining consistency and accuracy across the entire codebase.