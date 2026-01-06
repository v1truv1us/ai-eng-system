# `/ai-eng/ralph-wiggum` Command Specification

## Overview

A full-cycle feature development command that continuously iterates through all spec-driven workflow phases (Research → Specify → Plan → Work → Review) until the feature is complete. Named after the Ralph Wiggum continuous iteration pattern, this command orchestrates the entire development lifecycle autonomously.

## Context

### User Personas

- **Solo Developer**: Wants to implement features end-to-end with minimal manual intervention
- **Team Lead**: Wants to automate feature development for overnight/weekend runs
- **AI-Assisted Developer**: Wants to leverage AI for complete feature implementation with quality gates

### System Context

- Part of the ai-eng-system spec-driven workflow
- Orchestrates existing commands: `/research`, `/specify`, `/plan`, `/work`, `/review`
- Integrates with existing Ralph Wiggum skill for intra-phase iteration
- Uses existing quality gates and review perspectives

### Research Context

Key findings from research phase:

1. **Existing Ralph Wiggum Integration**: Each command has `--ralph` flags for intra-phase iteration, but no command orchestrates the full workflow
2. **Documented but Unimplemented**: `--feed-into` flag was documented but never implemented
3. **Gap Analysis Needed**: After review, command must analyze findings to determine where to return in the workflow
4. **Safety Measures Required**: Max cycles, stuck detection, cost tracking, and checkpointing are essential

## User Stories

### US-001: Full-Cycle Feature Development
**As a** developer
**I want** to run a single command that implements a complete feature
**So that** I can focus on high-level requirements while AI handles implementation details

#### Acceptance Criteria
- [ ] Command accepts a feature description as input
- [ ] Command orchestrates all 5 phases: Research → Specify → Plan → Work → Review
- [ ] Each phase uses Ralph Wiggum iteration internally
- [ ] Command loops until feature is complete or max cycles reached
- [ ] Command creates feature branch at start
- [ ] Command creates PR when feature is complete (as draft)

### US-002: Intelligent Gap Analysis
**As a** developer
**I want** command to analyze review findings and return to the appropriate phase
**So that** issues are fixed at the right level (spec, plan, or implementation)

#### Acceptance Criteria
- [ ] After review, command analyzes findings by severity and type
- [ ] Missing requirements return to SPECIFY phase
- [ ] Architectural issues return to PLAN phase
- [ ] Implementation bugs return to WORK phase
- [ ] Gap analysis is logged for visibility

### US-003: Progress Visibility
**As a** developer
**I want** to see progress throughout the build process
**So that** I can monitor feature development and intervene if needed

#### Acceptance Criteria
- [ ] Command shows current phase and cycle number
- [ ] Command shows quality gate status
- [ ] Command shows acceptance criteria completion percentage
- [ ] Command shows token usage for cost awareness
- [ ] Progress is updated after each phase completion

### US-004: Optional Checkpoints
**As a** developer
**I want** optional pause points between phases
**So that** I can review progress and provide feedback before continuing

#### Acceptance Criteria
- [ ] `--checkpoint` flag enables pause after each phase
- [ ] `--checkpoint=review` pauses only after review phase
- [ ] User can approve, modify, or abort at checkpoints
- [ ] Default behavior is fully autonomous (no checkpoints)

### US-005: Resume Interrupted Builds
**As a** developer
**I want** to resume an interrupted Ralph Wiggum build
**So that** I don't lose progress if process is stopped

#### Acceptance Criteria
- [ ] Command saves checkpoint after each cycle
- [ ] `--resume` flag continues from last checkpoint
- [ ] Checkpoint includes: current phase, cycle number, artifact paths
- [ ] Checkpoint file saved to `.ralph-wiggum/[feature]/checkpoint.json`
- [ ] `.ralph-wiggum/` directory added to `.gitignore` automatically

### US-006: Safety Limits
**As a** developer
**I want** safety limits to prevent runaway execution
**So that** I don't incur excessive costs or infinite loops

#### Acceptance Criteria
- [ ] `--max-cycles` limits total workflow cycles (default: 5)
- [ ] `--max-phase-iterations` limits iterations per phase (default: 10)
- [ ] Stuck detection alerts after 3 cycles without progress
- [ ] Token usage is tracked and displayed
- [ ] `/ai-eng/ralph-wiggum:cancel` stops active build

### US-007: Starting from Existing Artifacts
**As a** developer
**I want** to start from existing research, spec, or plan
**So that** I can skip phases that are already complete

#### Acceptance Criteria
- [ ] `--from-research` starts from existing research document
- [ ] `--from-spec` starts from existing specification
- [ ] `--from-plan` starts from existing plan
- [ ] `--skip-research` skips research phase entirely
- [ ] Command validates artifact exists before starting

### US-008: Quality Gate Integration
**As a** developer
**I want** quality gates to be enforced throughout the build
**So that** the final feature meets quality standards

#### Acceptance Criteria
- [ ] All quality gates from `/work` are enforced
- [ ] Critical/major issues block cycle completion
- [ ] Minor issues are logged but don't block
- [ ] Custom quality gate can be specified with `--quality-gate`
- [ ] Quality gate results are included in final report

### US-009: Draft Pull Request
**As a** developer
**I want** the command to create a draft PR when feature is complete
**So that** I can review before marking it ready for review

#### Acceptance Criteria
- [ ] PR is created in draft status
- [ ] PR description includes comprehensive summary
- [ ] PR description includes cycle history
- [ ] PR description links to all generated artifacts

## Non-Functional Requirements

### Security
- No credentials or secrets in checkpoint files
- Checkpoint files excluded from git by default (auto-add to `.gitignore`)
- API keys used only through existing secure mechanisms

### Performance
- Phase transitions complete within 5 seconds
- Progress updates displayed in real-time
- Checkpoint saves complete within 1 second

### Availability & Reliability
- Graceful handling of API failures with retry
- Checkpoint enables recovery from interruptions
- Clear error messages for all failure modes

### Maintainability
- Detailed logging of all phase transitions
- Iteration history saved for debugging
- Clear separation between orchestration and phase execution

### Cost Visibility
- Token usage tracked per phase and per cycle
- Cumulative tokens displayed in progress output
- Per-iteration token count shown for awareness
- No budget enforcement (users track their own limits)

## Command Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--max-cycles` | number | 5 | Maximum full workflow cycles |
| `--max-phase-iterations` | number | 10 | Max iterations per phase |
| `--checkpoint` | string | none | Pause points: `all`, `review`, or `none` |
| `--from-research` | path | - | Start from existing research document |
| `--from-spec` | path | - | Start from existing specification |
| `--from-plan` | path | - | Start from existing plan |
| `--skip-research` | boolean | false | Skip research phase |
| `--quality-gate` | command | - | Custom quality gate command |
| `--completion-promise` | string | (see below) | Custom completion criteria |
| `--show-progress` | boolean | true | Show detailed cycle progress |
| `--log-history` | path | - | Log all iterations to JSON |
| `--verbose` | boolean | false | Enable verbose output |
| `--quiet` | boolean | false | Minimal output (milestones only) |
| `--dry-run` | boolean | false | Show plan without executing |
| `--resume` | boolean | false | Resume from last checkpoint |
| `--parallel` | boolean | false | Run phases in parallel where safe |

**Default Completion Promise:**
```
"Feature is complete: all acceptance criteria met, quality gates passing, review approved, documentation updated"
```

## Phase Orchestration

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│            /ai-eng/ralph-wiggum "feature description"        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Create Branch    │
                    │  feat/[feature]   │
                    └───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CYCLE START (check max_cycles)                              │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   RESEARCH    │───▶│    SPECIFY    │───▶│     PLAN      │
│  (--ralph)    │    │   (--ralph)   │    │   (--ralph)   │
│  [checkpoint] │    │  [checkpoint] │    │  [checkpoint] │
└───────────────┘    └───────────────┘    └───────────────┘
                                                  │
                                                  ▼
                                         ┌───────────────┐
                                         │     WORK      │
                                         │   (--ralph)   │
                                         │  [checkpoint] │
                                         └───────────────┘
                                                  │
                                                  ▼
                                         ┌───────────────┐
                                         │    REVIEW     │
                                         │   (--ralph)   │
                                         │  [checkpoint] │
                                         └───────────────┘
                                                  │
                              ┌───────────────────┴───────────────────┐
                              ▼                                       ▼
                     ┌───────────────┐                       ┌───────────────┐
                     │   APPROVE?    │──── YES ────────────▶│  CREATE DRAFT │
                     └───────────────┘                       │      PR       │
                              │                               └───────────────┘
                              NO                                      │
                              │                                      ▼
                              ▼                              ┌───────────────┐
                     ┌───────────────┐                       │   COMPLETE    │
                     │ GAP ANALYSIS  │                       └───────────────┘
                     └───────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Spec Gap │   │ Plan Gap │   │ Work Gap │
        └──────────┘   └──────────┘   └──────────┘
              │               │               │
              ▼               ▼               ▼
        Return to       Return to       Return to
        SPECIFY          PLAN            WORK
              │               │               │
              └───────────────┴───────────────┘
                              │
                              ▼
                     ┌───────────────┐
                     │  NEXT CYCLE   │
                     │  (increment)  │
                     └───────────────┘
                              │
                              └──────────▶ CYCLE START
```

### Gap Analysis Logic

| Review Finding Type | Severity | Return To | Rationale |
|---------------------|----------|-----------|-----------|
| Missing requirements | Any | SPECIFY | Spec needs enhancement |
| Unclear acceptance criteria | Any | SPECIFY | Spec needs clarification |
| Architectural issues | Major/Critical | PLAN | Plan needs restructuring |
| Missing dependencies | Any | PLAN | Plan incomplete |
| Implementation bugs | Any | WORK | Code needs fixing |
| Test coverage gaps | Any | WORK | Tests need adding |
| Documentation gaps | Minor | WORK | Docs need updating |
| Security vulnerabilities | Critical | PLAN | May need architectural change |
| Security vulnerabilities | Major/Minor | WORK | Implementation fix |
| Performance issues | Critical | PLAN | May need architectural change |
| Performance issues | Major/Minor | WORK | Implementation optimization |

### Completion Criteria

The command completes successfully when ALL of these are true:

1. **Review Status**: APPROVE (no critical or major findings)
2. **Quality Gates**: All pass (tests, lint, build, security)
3. **Spec Coverage**: All acceptance criteria marked complete
4. **Test Coverage**: Meets threshold (default: 80%)
5. **Documentation**: Updated and complete

## Artifact Flow

```
/ai-eng/ralph-wiggum "user authentication"
    │
    ├── Creates: feat/user-authentication branch
    │
    ├── Phase 1: RESEARCH
    │   └── Output: docs/research/[date]-user-authentication.md
    │
    ├── Phase 2: SPECIFY
    │   └── Output: specs/user-authentication/spec.md
    │
    ├── Phase 3: PLAN
    │   └── Output: specs/user-authentication/plan.md
    │
    ├── Phase 4: WORK
    │   └── Output: Implementation files + tests
    │
    ├── Phase 5: REVIEW
    │   └── Output: code-review-report.json
    │
    ├── Checkpoint: .ralph-wiggum/user-authentication/checkpoint.json
    │
    └── Final: Draft Pull Request with summary
```

## Progress Output

### Default Progress Display

```
🔄 Ralph Wiggum Cycle 2/5 for "user authentication"

📊 Phase Status:
  ✅ Research: Complete (confidence: 0.9)
  ✅ Specify: Complete (5 user stories, 23 acceptance criteria)
  ✅ Plan: Complete (12 tasks, 8 hours estimated)
  🔄 Work: In Progress (8/12 tasks complete)
  ⏳ Review: Pending

📈 Quality Gates:
  ✅ Lint: Passing
  ✅ Types: Passing
  🔄 Tests: 15/20 passing (75%)
  ⏳ Build: Not run
  ⏳ Security: Not run

📋 Acceptance Criteria: 18/23 complete (78%)
🧪 Test Coverage: 72% (target: 80%)
💰 Token Usage: 45,230 total (this cycle: 12,450)
⏱️ Elapsed: 23m 45s
```

### Verbose Progress Display

Adds per-phase iteration details:
```
📝 Phase Details:
  Research: 3 iterations, 8,450 tokens
  Specify: 2 iterations, 5,230 tokens
  Plan: 4 iterations, 12,100 tokens
  Work: 6 iterations (ongoing), 19,450 tokens
```

### Quiet Progress Display

```
🔄 Cycle 2/5 | Work 8/12 | AC 78% | Tests 75%
```

## Open Questions

**All Resolved:**

- [x] Auto-add `.ralph-wiggum/` to `.gitignore` - Yes, automatically
- [x] Token budget tracking - Display tokens only, no enforcement
- [x] Draft PR vs ready PR - Create as draft PR
- [x] Auto-merge option - No auto-merge

## Success Criteria

- [x] All user stories have acceptance criteria defined
- [x] All non-functional requirements specified
- [x] Phase orchestration logic documented
- [x] Gap analysis rules defined
- [x] Safety measures specified
- [x] Progress output format defined
- [x] Ready for `/ai-eng/plan` phase

---

## Specification Summary

**Feature**: `/ai-eng/ralph-wiggum` Command
**Location**: `specs/ralph-wiggum-command/spec.md`

**User Stories**: 9
**Acceptance Criteria**: 43 total
**Non-Functional Requirements**: 5 categories
**Open Questions**: 0 (all resolved)

This specification defines a full-cycle feature development command that orchestrates the entire spec-driven workflow with continuous iteration until the feature is complete. It builds on existing Ralph Wiggum patterns while adding workflow orchestration, gap analysis, and safety measures.
