# `/ai-eng/ralph-wiggum` Implementation Plan

**Status**: Complete
**Created**: 2026-01-05
**Specification**: specs/ralph-wiggum-command/spec.md
**Estimated Effort**: 2 hours
**Complexity**: Medium

## Overview

This plan documents the implementation approach for the `/ai-eng/ralph-wiggum` command. The command is a **markdown instruction manual** that AI agents follow when invoked. The actual orchestration happens dynamically by the agent reading this file and executing the documented workflow.

**Key Insight**: No TypeScript code is required. The command orchestrates **existing** ai-eng-system commands (`/research`, `/specify`, `/plan`, `/work`, `/review`) with Ralph Wiggum iteration patterns already built into those commands.

## Specification Reference

### User Stories → Implementation Mapping

| User Story | Implementation Approach | Status |
|------------|----------------------|--------|
| US-001: Full-Cycle Feature Development | Document 5-phase workflow in markdown | ✅ Complete |
| US-002: Intelligent Gap Analysis | Document gap analysis rules and return-to logic | ✅ Complete |
| US-003: Progress Visibility | Document progress display at multiple verbosity levels | ✅ Complete |
| US-004: Optional Checkpoints | Document checkpoint interaction patterns | ✅ Complete |
| US-005: Resume Interrupted Builds | Document checkpoint format and resume process | ✅ Complete |
| US-006: Safety Limits | Document max cycles, stuck detection, token tracking | ✅ Complete |
| US-007: Starting from Existing Artifacts | Document artifact validation and skip flags | ✅ Complete |
| US-008: Quality Gate Integration | Document quality gate enforcement | ✅ Complete |
| US-009: Draft Pull Request | Document PR creation with summary template | ✅ Complete |

## Architecture

### Command-Based Architecture

This command is a **markdown instruction manual** that AI agents follow when invoked. The actual orchestration happens **when the command is executed** - the agent reads this file and follows the documented workflow, invoking existing commands (`/research`, `/specify`, `/plan`, `/work`, `/review`) with Ralph Wiggum iteration.

### Workflow Diagram

```
User: /ai-eng/ralph-wiggum "feature description"
           │
           ▼
    ┌──────────────────┐
    │ Agent reads     │
    │ ralph-wiggum.md │
    └──────────────────┘
           │
           ▼
    ┌────────────────────────────────────────────────┐
    │ Phase 1: Git Setup                    │
    │ Create branch: feat/[feature-slug]     │
    └────────────────────────────────────────────────┘
           │
           ▼
    ┌────────────────────────────────────────────────┐
    │ Phase 2: Main Cycle Loop (Ralph)      │
    │ ────────────────────────────────────────── │
    │ Cycle Start (check max_cycles)           │
    │      │                                  │
    │      ▼                                  │
    │  Research → Specify → Plan → Work → Review    │
    │  (each with --ralph iteration)            │
    │      │                                  │
    │      ▼                                  │
    │  Gap Analysis                           │
    │  (determine return-to phase)               │
    │      │                                  │
    │      ▼                                  │
    │  Next Cycle (or Complete)               │
    └────────────────────────────────────────────────┘
           │
           ▼
    ┌────────────────────────────────────────────────┐
    │ Phase 3: PR Creation (if complete)      │
    │ Create draft PR with summary             │
    └────────────────────────────────────────────────┘
```

### File Structure

```
content/commands/
└── ralph-wiggum.md                    # Command instruction manual (COMPLETE)

docs/
└── research/
    └── 2026-01-05-ralph-wiggum-full-cycle-command.md  # Research document (COMPLETE)

specs/
└── ralph-wiggum-command/
    ├── spec.md                           # Specification (COMPLETE)
    └── plan.md                           # This plan file (COMPLETE)
```

### Integration with Existing Commands

No new code files required. This command orchestrates **existing** ai-eng-system commands:

```
/ai-eng/ralph-wiggum "feature"
    │
    ├──▶ /ai-eng/research --ralph
    ├──▶ /ai-eng/specify --ralph
    ├──▶ /ai-eng/plan --ralph
    ├──▶ /ai-eng/work --ralph
    └──▶ /ai-eng/review --ralph
```

All phase commands already exist and are invoked directly by the agent following this instruction manual.

---

## Implementation Tasks

### Task 1: Create Command Markdown File
- **ID**: TASK-001
- **Depends On**: None
- **User Story**: All
- **Files**:
  - `content/commands/ralph-wiggum.md` (create)
- **Acceptance Criteria**:
  - [ ] YAML frontmatter with name, description, agent, version
  - [ ] All command options documented
  - [ ] Quick start examples provided
  - [ ] Phase orchestration documented (5 phases)
  - [ ] Gap analysis rules defined
  - [ ] Checkpoint management documented
  - [ ] Safety measures specified
  - [ ] Progress display documented (default/verbose/quiet)
  - [ ] PR creation documented
  - [ ] Dry run mode documented
  - [ ] Integration with existing commands explained
  - [ ] Spec AC: All user stories addressed
- **Time**: 120 min
- **Complexity**: Medium
- **Status**: ✅ Complete

### Task 2: Update Documentation
- **ID**: TASK-002
- **Depends On**: TASK-001
- **User Story**: All
- **Files**:
  - `AGENTS.md` (modify)
  - `CLAUDE.md` (modify)
- **Acceptance Criteria**:
  - [ ] Command added to AGENTS.md command table
  - [ ] Command added to CLAUDE.md core commands
  - [ ] Usage examples provided
  - [ ] Spec AC: Documentation updated
- **Time**: 30 min
- **Complexity**: Low
- **Status**: Pending

### Task 3: Build and Validate
- **ID**: TASK-003
- **Depends On**: TASK-001
- **User Story**: All
- **Files**:
  - Run build script
- **Acceptance Criteria**:
  - [ ] Build completes without errors
  - [ ] Command appears in dist/ directories
  - [ ] Build validation passes
  - [ ] Spec AC: Command is usable
- **Time**: 15 min
- **Complexity**: Low
- **Status**: Pending

---

## Dependencies

### External Dependencies
- `gh` CLI for PR creation (must be installed)
- Existing commands: `/research`, `/specify`, `/plan`, `/work`, `/review`
- These commands must have `--ralph` flags working

### Internal Dependencies
```
TASK-001 (command file) ──┬──▶ TASK-002 (documentation update)
                             ├──▶ TASK-003 (build validation)
```

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Command complexity causes confusion | Medium | Medium | Clear examples, step-by-step documentation |
| Phase execution order confusion | Low | Medium | Explicit workflow diagram, numbered phases |
| Gap analysis rules unclear | Medium | Low | Detailed categorization table provided |
| Checkpoint file conflicts | Low | Low | Auto-add to .gitignore |
| Token tracking expectations | Low | Medium | Clear "display-only" documentation |

---

## Testing Strategy

### Manual Testing (since it's a markdown command)
- [ ] Verify command appears in dist/ after build
- [ ] Test with simple feature (dry-run mode)
- [ ] Test with existing spec (skip phases)
- [ ] Test checkpoint/resume (if implemented)
- [ ] Verify all command flags documented

### Spec Validation
- [ ] All user stories have corresponding implementation
- [ ] All spec acceptance criteria covered in documentation
- [ ] Non-functional requirements addressed (safety, checkpoint, etc.)

---

## Rollback Plan

If issues arise:

1. **Remove command file**: Delete `content/commands/ralph-wiggum.md`
2. **Revert documentation**: Undo changes to AGENTS.md, CLAUDE.md
3. **Clean build**: Run `bun run clean && bun run build`

No existing functionality is modified, so rollback is straightforward.

---

## References

- [Specification](specs/ralph-wiggum-command/spec.md)
- [Research Document](docs/research/2026-01-05-ralph-wiggum-full-cycle-command.md)
- [Ralph Wiggum Skill](skills/workflow/ralph-wiggum/SKILL.md)
- [Existing Commands](content/commands/)
  - [work.md](content/commands/work.md) - Quality gates and task tracking
  - [research.md](content/commands/research.md) - Multi-phase research orchestration
  - [review.md](content/commands/review.md) - Multi-perspective code review

---

## Execution Summary

| Task | Status | Estimated Time |
|-------|--------|----------------|
| TASK-001: Create command file | ✅ Complete | 120 min |
| TASK-002: Update documentation | Pending | 30 min |
| TASK-003: Build and validate | Pending | 15 min |

**Total**: 3 tasks, ~165 minutes (2.75 hours) estimated

---

## Questions Before Deployment

1. **Documentation Updates**: Should I update AGENTS.md and CLAUDE.md to reference this command?
   - **Recommendation**: Yes, for discoverability

2. **Build Validation**: Should I run the build and verify output?
   - **Recommendation**: Yes, to ensure command appears in dist/

---

This plan is complete and ready for execution. The command file has been created successfully as a markdown instruction manual that orchestrates existing ai-eng-system commands.
