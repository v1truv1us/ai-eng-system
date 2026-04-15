---
name: ai-eng/work
description: Execute a plan or task with systematic tracking, quality gates, and comprehensive validation.
agent: build
version: 2.0.0
inputs:
  - name: plan
    type: string
    required: false
    description: Plan file path or task ID
  - name: fromPlan
    type: string
    required: false
    description: Path to plan file to execute
outputs:
  - name: execution_report
    type: structured
    format: JSON
    description: Execution report with task results and quality gate outcomes
---

# Work Command

Execute a plan or task: $ARGUMENTS

> **Phase 4 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

Load `skills/incremental-implementation/SKILL.md`, `skills/test-driven-development/SKILL.md`, and `skills/prompt-refinement/SKILL.md` (phase: work). If using `--ralph`, also load `skills/workflow/ralph-wiggum/SKILL.md`.

## Quick Start

```bash
/ai-eng/work "specs/auth/plan.md"
/ai-eng/work --from-plan=specs/auth/plan.md --continue
/ai-eng/work "FEAT-001" --dry-run
/ai-eng/work "implement feature" --ralph --ralph-show-progress
```

## Options

| Option | Description |
|--------|-------------|
| `--from-plan <path>` | Path to plan file to execute |
| `--continue` | Resume interrupted work |
| `--validate-only` | Run validation without implementation |
| `--dry-run` | Show what would be done without executing |
| `-v, --verbose` | Enable verbose output |
| `--ralph` | Enable Ralph Wiggum iteration mode |

## Process

### Phase 1: Setup
- Load plan from `specs/{feature}/plan.md`
- Load spec from `specs/{feature}/spec.md` if it exists
- Create feature branch: `git checkout -b feat/{feature-slug}`
- Initialize todo tracking from plan tasks

### Phase 2: Task Execution Loop
For each task in dependency order:
1. Mark task in progress
2. Implement changes following project conventions
3. Write/update tests (TDD: red → green → refactor)
4. Run quality gates: lint → typecheck → unit tests → build
5. Commit with descriptive message including task ID
6. Mark task complete

### Phase 3: Validation
- Full test suite
- Full build
- Spec validation (cross-reference completed tasks with spec acceptance criteria)
- Security check if applicable

### Phase 4: Review Preparation
- Update documentation
- Create pull request
- Request review via `/ai-eng/review`

## Quality Gates (Run In Order)

| Gate | Command | Must Pass |
|------|---------|-----------|
| Lint | `bun run lint` | Yes |
| Types | `bun run type-check` | Yes |
| Unit Tests | `bun run test:unit` | Yes (80%+ coverage) |
| Build | `bun run build` | Yes |
| Integration | `bun run test:integration` | Yes |

**No task is complete until all gates pass.**

## Integration

- Reads from: `/ai-eng/plan` output (plan.md), `/ai-eng/specify` output (spec.md)
- Feeds into: `/ai-eng/review`

$ARGUMENTS
