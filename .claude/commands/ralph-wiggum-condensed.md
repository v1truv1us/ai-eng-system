---
name: ai-eng/ralph-wiggum
description: Full-cycle feature development with continuous iteration through all spec-driven workflow phases (Research → Specify → Plan → Work → Review) until feature is complete.
agent: build
version: 1.0.0
inputs:
  - name: feature
    type: string
    required: true
    description: Feature description or requirement to implement
  - name: fromResearch
    type: string
    required: false
    description: Path to existing research document to start from
  - name: fromSpec
    type: string
    required: false
    description: Path to existing specification to start from
  - name: fromPlan
    type: string
    required: false
    description: Path to existing plan to start from
outputs:
  - name: build_report
    type: structured
    format: JSON
    description: Complete build report with all phase outputs, cycle history, and final summary
---

# Ralph Wiggum Full-Cycle Command

Execute complete feature development cycle: $ARGUMENTS

> **Continuous Research → Specify → Plan → Work → Review iteration until feature complete**

## Quick Start
```bash
/ai-eng/ralph-wiggum "implement user authentication"                    # Full cycle
/ai-eng/ralph-wiggum "user auth" --from-spec=specs/auth/spec.md        # From spec
/ai-eng/ralph-wiggum "user auth" --checkpoint=review --resume          # With resume
/ai-eng/ralph-wiggum "user auth" --dry-run                             # Dry run
```

## Options
| Flag | Default | Description |
|------|---------|-------------|
| `--max-cycles <n>` | 5 | Max workflow cycles |
| `--max-phase-iterations <n>` | 10 | Max per phase |
| `--checkpoint <type>` | none | Pause: all/review/none |
| `--from-research <path>` | - | Start from research |
| `--from-spec <path>` | - | Start from spec |
| `--from-plan <path>` | - | Start from plan |
| `--skip-research` | false | Skip research |
| `--quality-gate <cmd>` | npm test && npm run lint && npm run build | Custom gate |
| `--completion-promise <text>` | Feature complete: AC met, quality gates passing, review approved | Custom criteria |
| `--show-progress` | true | Show progress |
| `--log-history <file>` | - | Log to JSON |
| `--verbose` | false | Verbose |
| `--quiet` | false | Minimal |
| `--dry-run` | false | Plan only |
| `--resume` | false | Resume |
| `--parallel` | false | Parallel phases |
| `--refine-each-phase` | false | Re-refine each phase |

## Phase 0: Prompt Refinement
Load `skills/prompt-refinement/SKILL.md` (phase `plan`). Transform to TCRO. Store as `$REFINED_CONTEXT`.

## Phase 1: Git Setup
```bash
git checkout -b feat/[feature-slug]  # lowercase, hyphens, max 50 chars
```

## Phase 2: Main Cycle Loop

### Cycle Start
```
🔄 Ralph Wiggum Cycle 1/5 for "feature"
```

Check: max cycles not exceeded, load checkpoint if `--resume`, detect stuck state (3 cycles no progress).

### Research (if not skipped)
```bash
/ai-eng/research "$FEATURE" --ralph --ralph-max-iterations $MAX --ralph-completion-promise "Research comprehensive" --show-progress
```
**Output**: `docs/research/[date]-[feature].md` • **Acceptance**: confidence ≥ 0.7

### Specify (if not skipped)
```bash
/ai-eng/specify "$FEATURE" --from-research=$RESEARCH_OUTPUT --ralph --ralph-max-iterations $MAX --ralph-completion-promise "Spec ready" --show-progress
```
**Output**: `specs/[feature]/spec.md` • **Acceptance**: user stories with AC, no `[NEEDS CLARIFICATION]`

### Plan (if not skipped)
```bash
/ai-eng/plan --from-spec=$SPEC_OUTPUT --ralph --ralph-max-iterations $MAX --ralph-completion-promise "Plan comprehensive" --show-progress
```
**Output**: `specs/[feature]/plan.md` • **Acceptance**: tasks with dependencies, testing strategy

### Work
```bash
/ai-eng/work $PLAN_OUTPUT --ralph --ralph-max-iterations $MAX --ralph-completion-promise "$COMPLETION_PROMISE" --ralph-quality-gate="$QUALITY_GATE" --show-progress
```
**Acceptance**: implementation complete, tests passing, coverage ≥ 80%, quality gates passing

### Review
```bash
/ai-eng/review . --ralph --ralph-max-iterations $MAX --ralph-completion-promise "Review comprehensive" --show-progress
```
**Output**: `code-review-report.json` • **Acceptance**: findings with severity, all perspectives

## Phase 3: Gap Analysis

### Findings Categorization
| Finding Type | Severity | Return To |
|--------------|----------|-----------|
| Missing requirements | Any | SPECIFY |
| Unclear AC | Any | SPECIFY |
| Architectural issues | Major/Critical | PLAN |
| Missing dependencies | Any | PLAN |
| Implementation bugs | Any | WORK |
| Test coverage gaps | Any | WORK |
| Security vulns | Critical | PLAN, Major/Minor | WORK |
| Performance issues | Critical | PLAN, Major/Minor | WORK |

### Completion Check
**ALL REQUIRED**: Review APPROVE (no critical/major), quality gates pass, all AC complete, coverage ≥ 80%, documentation updated.

If complete → Phase 5. If not → Continue cycle returning to appropriate phase.

### Return-To Decision
```
📊 Gap Analysis: 3 SPECIFY gaps, 0 PLAN gaps, 2 WORK gaps → Return to SPECIFY
```

## Phase 4: Checkpoint Management

### Save Checkpoint
**File**: `.ralph-wiggum/[feature]/checkpoint.json`
```json
{"feature": "name", "cycle": 2, "max_cycles": 5, "current_phase": "WORK", "refined_context": {...}, "artifacts": {...}, "token_usage": {...}, "last_review": {...}, "gap_analysis": {...}}
```

### Resume Checkpoint
Load checkpoint, validate, switch to branch, restore state, display summary.

## Phase 5: Pull Request Creation
```bash
gh pr create --title "[Feature] $FEATURE" --body "$PR_BODY" --draft
```
**PR Body**: Feature summary, cycle history, changes, testing, quality gates, artifacts, completion.

## Progress Display

### Default (balanced)
```
🔄 Ralph Wiggum Cycle 2/5 for "user auth"

📊 Phase Status:
  ✅ Research: Complete (0.9)
  ✅ Specify: Complete (5 stories, 23 AC)
  ✅ Plan: Complete (12 tasks, 8h)
  🔄 Work: 8/12 tasks
  ⏳ Review: Pending

📈 Quality Gates:
  ✅ Lint: Passing
  ✅ Types: Passing  
  🔄 Tests: 15/20 (75%)
  ⏳ Build: Not run

📋 AC: 18/23 (78%) | 🧪 Coverage: 72% | 💰 Tokens: 45,230
```

### Quiet
```
🔄 Cycle 2/5 | Work 8/12 | AC 78% | Tests 75%
```

### Verbose
Adds per-phase iteration details and token breakdown.

## Safety Measures

### Max Cycles
Stop when `cycle > maxCycles`. Display summary, remaining gaps, suggest manual intervention.

### Stuck Detection
No progress in 3 consecutive cycles → alert user, save checkpoint, offer pause.

### Token Tracking
Display cumulative and per-cycle usage. No enforcement, tracking only.

## Dry Run Mode
Show execution plan with estimated phases, iterations, tokens, time. No actual execution.

## Completion Report
```
## Build Complete

**Feature**: $FEATURE  
**Status**: ✅ COMPLETE / ⚠️ INCOMPLETE

**Summary**: N cycles, N tokens, N time
**Acceptance**: M/N complete (X%)  
**Quality Gates**: All passing
**Review**: APPROVE/CHANGES_REQUESTED

**PR**: https://github.com/user/repo/pull/N
**Next Steps**: Review PR, merge, delete branch
```

## Integration Commands

This orchestrates existing ai-eng-system commands:
- `/ai-eng/research --ralph`
- `/ai-eng/specify --ralph`  
- `/ai-eng/plan --ralph`
- `/ai-eng/work --ralph`
- `/ai-eng/review --ralph`

## Best Practices

See `docs/ralph-wiggum-guide.md` for comprehensive guidance on effective builds, ideal scenarios, and troubleshooting.

## Success Criteria

✅ All phases executed with appropriate returns  
✅ Gap analysis determines correct return-to phase  
✅ Checkpoints saved/loaded correctly  
✅ Progress displayed at appropriate verbosity  
✅ Safety limits enforced (max cycles, stuck detection)  
✅ Token usage tracked  
✅ Draft PR created with comprehensive summary  
✅ Build report generated with all artifacts

---