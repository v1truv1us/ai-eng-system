---
title: Ralph Wiggum
description: Autonomous feature development with continuous iteration
---

# Ralph Wiggum

Autonomous feature development with continuous iteration through all phases.

---

## Philosophy

"Iteration > Perfection, Failures Are Data, Persistence Wins"

Executes complete spec-driven workflow in persistent loops until feature completion.

---

## What It Does

Orchestrates all five phases automatically:

Research → Specify → Plan → Work → Review

Returns to earlier phases based on review findings

Stops when all acceptance criteria met

---

## Quick Start

```bash
# Full-cycle feature development
/ai-eng/ralph-wiggum "implement user authentication with JWT tokens"

# Start from existing specification
/ai-eng/ralph-wiggum "user authentication" --from-spec=specs/auth/spec.md

# Start from existing plan
/ai-eng/ralph-wiggum "user authentication" --from-plan=specs/auth/plan.md

# With checkpoints for manual review
/ai-eng/ralph-wiggum "user authentication" --checkpoint=all

# Dry run to see execution plan
/ai-eng/ralph-wiggum "user authentication" --dry-run
```

---

## Key Options

| Option | Default | Description |
|--------|---------|-------------|
| `--max-cycles <n>` | 5 | Maximum full workflow cycles |
| `--max-phase-iterations <n>` | 10 | Max iterations per phase |
| `--checkpoint` | none | Pause points: `all`, `review`, or `none` |
| `--from-research <path>` | - | Start from existing research document |
| `--from-spec <path>` | - | Start from existing specification |
| `--from-plan <path>` | - | Start from existing plan |
| `--show-progress` | true | Show detailed cycle progress |
| `--dry-run` | false | Show plan without executing |
| `--resume` | false | Resume from last checkpoint |

---

## How It Works

### Phase 0: Prompt Refinement

Transforms your prompt into structured TCRO format (Task, Context, Requirements, Output)

### Phase 1: Git Setup

Creates feature branch automatically

### Phase 2: Main Cycle Loop

Executes all five phases in sequence

After review, analyzes gaps and returns to appropriate phase

Repeats until completion criteria met or max cycles reached

### Phase 3: Checkpoint Management

Saves state after each cycle to `.ralph-wiggum/[feature]/checkpoint.json`

Enables resume with `--resume` flag

### Phase 4: Pull Request Creation

Creates draft PR with comprehensive summary when complete

---

## Completion Criteria

Feature completes when:

- Review status: APPROVE (no critical or major findings)
- Quality gates: All pass
- Spec coverage: All acceptance criteria marked complete
- Test coverage: ≥ 80%
- Documentation: Updated and complete

---

## Progress Tracking

Shows detailed metrics after each cycle:

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

💰 Token Usage: 45,230 total (this cycle: 12,450)
⏱️ Elapsed: 23m 45s
```

---

## Gap Analysis

After review, determines which phase to return to:

| Finding Type | Severity | Return To |
|-------------|-----------|-----------|
| Missing requirements | Any | SPECIFY |
| Unclear acceptance criteria | Any | SPECIFY |
| Architectural issues | Major/Critical | PLAN |
| Missing dependencies | Any | PLAN |
| Implementation bugs | Any | WORK |
| Test coverage gaps | Any | WORK |

---

## Safety Features

Max cycles limit prevents infinite loops

Stuck detection alerts after 3 cycles without progress

Token usage tracked and displayed

Checkpoints enable resume after interruption

---

## Using Ralph Wiggum Flags on Individual Commands

All phase commands support `--ralph` flag for persistent iteration:

```bash
# Ralph Wiggum iteration on research only
/ai-eng/research "complex topic" --ralph --ralph-show-progress

# Ralph Wiggum iteration on implementation only
/ai-eng/work "feature" --ralph --ralph-max-iterations 15 --ralph-quality-gate="npm test"

# Ralph Wiggum iteration on review only
/ai-eng/review . --ralph --ralph-focus=security --ralph-max-iterations 12
```

---

## When to Use Ralph Wiggum

### Ideal For

Well-defined features with clear acceptance criteria

Complex features requiring multiple iterations

Unattended development (overnight builds)

Features with comprehensive quality requirements

### Less Ideal For

Exploratory research without clear goals

Quick bug fixes

Experimental prototypes

Small, trivial changes

---

## Comparison: Full-Cycle vs. Individual Phases

| Approach | Use Case | Control |
|----------|-----------|---------|
| `/ai-eng/ralph-wiggum` | Complete feature development | Autonomous execution |
| `/ai-eng/research --ralph` | Deep research only | Single phase iteration |
| `/ai-eng/work --ralph` | Implementation refinement | Single phase iteration |

---

## Related Documentation

- [Commands Reference](../reference/commands.md) - All available commands
- [Spec-Driven Workflow](../spec-driven-workflow.md) - Complete development cycle
- [Agent Coordination](./agent-coordination.md) - Three-mode workflow
- [Skills Reference](../reference/skills.md) - ralph-wiggum skill details
