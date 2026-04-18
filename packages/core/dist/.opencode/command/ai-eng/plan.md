---
name: ai-eng/plan
description: Create detailed implementation plans from specifications
agent: plan
version: 2.0.0
inputs:
  - name: description
    type: string
    required: false
    description: Natural language description of what to implement
  - name: fromSpec
    type: string
    required: false
    description: Path to specification file
  - name: fromResearch
    type: string
    required: false
    description: Path to research document
outputs:
  - name: plan_file
    type: file
    format: YAML
    description: Implementation plan saved to specs/[feature]/plan.md
---

# Plan Command

Create a detailed implementation plan for: $ARGUMENTS

> **Phase 3 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

Load `skills/planning-and-task-breakdown/SKILL.md` and `skills/prompt-refinement/SKILL.md` (phase: plan).

## Quick Start

```bash
/ai-eng/plan "implement user authentication with JWT"
/ai-eng/plan --from-spec=specs/auth/spec.md
/ai-eng/plan --from-research=docs/research/2026-01-01-auth-patterns.md
/ai-eng/plan "microservices migration" --ralph --ralph-show-progress
```

## Options

| Option | Description |
|--------|-------------|
| `--from-spec <file>` | Create plan from specification file |
| `--from-research <file>` | Create plan from research document |
| `-s, --scope <scope>` | Plan scope (architecture\|implementation\|review\|full) [default: full] |
| `-o, --output <file>` | Output plan file [default: specs/[feature]/plan.md] |
| `-v, --verbose` | Enable verbose output |
| `--ralph` | Enable Ralph Wiggum iteration mode |

## Process

1. Load prompt refinement and clarify planning scope
2. Discovery: analyze codebase patterns, tech stack, existing conventions
3. Map spec user stories to technical tasks
4. Decompose into atomic tasks (see skill for task field requirements)
5. Order by dependency, identify parallel tracks
6. Assess risks and define testing strategy
7. Save to `specs/{feature}/plan.md`

## Task Fields (Required)

Every atomic task must include: ID, Title, Depends On, Files, Acceptance Criteria, Spec Reference, Estimated Time, Complexity.

## Validation

- All spec acceptance criteria covered by at least one task
- Dependency graph has no cycles
- Each phase produces a buildable, testable state

## Integration

- Reads from: `specs/{feature}/spec.md`, `docs/research/*.md`, `CLAUDE.md`
- Feeds into: `/ai-eng/work`

$ARGUMENTS
