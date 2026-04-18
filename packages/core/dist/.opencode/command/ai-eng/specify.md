---
name: ai-eng/specify
description: Create a feature specification using structured requirements gathering
agent: plan
version: 2.0.0
inputs:
  - name: feature
    type: string
    required: false
    description: Feature description or name
  - name: fromResearch
    type: string
    required: false
    description: Path to research document
outputs:
  - name: spec_file
    type: file
    format: Markdown
    description: Specification saved to specs/[feature]/spec.md
---

# Specify Command

Create a comprehensive feature specification: $ARGUMENTS

> **Phase 2 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

Load `skills/spec-driven-development/SKILL.md` and `skills/prompt-refinement/SKILL.md` (phase: specify).

## Quick Start

```bash
/ai-eng/specify "user authentication system"
/ai-eng/specify "payment integration" --from-research=docs/research/payment.md
/ai-eng/specify "multi-tenant architecture" --ralph --ralph-show-progress
```

## Options

| Option | Description |
|--------|-------------|
| `--from-research <path>` | Use existing research document as context |
| `--template <name>` | Use a specific specification template |
| `--output <path>` | Custom output path [default: `specs/[feature]/spec.md`] |
| `--no-confirmation` | Skip confirmation prompts |
| `--verbose` | Show detailed process |
| `--ralph` | Enable Ralph Wiggum iteration mode |

## Process

1. Load prompt refinement skill and clarify the specification scope
2. Gather requirements: user needs, constraints, success criteria
3. Write the spec covering all six sections (objective, interfaces, structure, style, testing, boundaries)
4. Validate: all acceptance criteria testable, ambiguities marked with `[NEEDS CLARIFICATION]`
5. Save to `specs/{feature}/spec.md` and confirm with user

## Spec Structure

The spec must cover:
- Objective and measurable success criteria
- Interface contracts (API signatures, CLI commands, function signatures)
- Project structure (new and modified files)
- Code style and conventions
- Testing strategy (framework, coverage targets, test categories)
- Boundaries (always do, ask first, never do)

## Validation

- All user stories have acceptance criteria
- Non-functional requirements defined
- No unresolved `[NEEDS CLARIFICATION]` markers
- Success criteria are specific and measurable

## Integration

- Reads from: `CLAUDE.md`, `docs/research/*.md` (via `--from-research`)
- Feeds into: `/ai-eng/plan`

$ARGUMENTS
