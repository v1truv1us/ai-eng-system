# Skills Repository Context

**Hierarchy Level:** Reusable skill definitions
**Parent:** [../AGENTS.md](../AGENTS.md) — Agent coordination and skill registry
**Philosophy:** [../CLAUDE.md](../CLAUDE.md) — Compounding Engineering philosophy

Modular, reusable skill definitions that support the agents defined in the parent AGENTS.md.

## Project Overview

Mostly flat skill definitions for Claude Code and OpenCode, with a small number of namespaced subdirectories such as `ai-eng/` and `workflow/`. Each skill is self-contained in its own directory with a `SKILL.md` file and optional supporting files.

## Directory Structure

```
skills/
├── comprehensive-research/   # Multi-phase research orchestration
│   └── SKILL.md
├── code-review-and-quality/   # Multi-axis review before merge
│   └── SKILL.md
├── code-simplification/       # Behavior-preserving simplification
│   └── SKILL.md
├── coolify-deploy/           # Coolify deployment best practices
│   └── SKILL.md
├── debugging-and-error-recovery/ # Root-cause debugging workflow
│   └── SKILL.md
├── git-worktree/             # Git worktree workflows
│   └── SKILL.md
├── incremental-implementation/ # Thin-slice implementation workflow
│   └── SKILL.md
├── incentive-prompting/      # Research-backed prompting techniques
│   └── SKILL.md
├── plugin-dev/               # Plugin development knowledge base
│   ├── SKILL.md
│   └── references/           # Supporting documentation
├── prompt-refinement/        # TCRO prompt structuring
│   ├── SKILL.md
│   └── templates/            # Phase-specific templates
├── text-cleanup/             # AI verbosity removal patterns
│   ├── SKILL.md
│   └── patterns/             # Pattern definitions
└── AGENTS.md                 # This file
```

## Skill Format

Each skill follows the Claude Code/OpenCode skill format:

```markdown
---
name: skill-name
description: Brief description for semantic matching. Include trigger words.
---

# Skill Name

[Skill instructions and content]
```

## Selected Skills

The table below highlights the most commonly invoked skills in this repository. Additional namespaced and alignment skills are also available under `skills/`.

| Skill | Description | Invoked By |
|-------|-------------|------------|
| `prompt-refinement` | Transform prompts into structured TCRO format | `/ai-eng/research`, `/ai-eng/plan`, `/ai-eng/work`, `/ai-eng/specify` |
| `incentive-prompting` | Research-backed prompting techniques (+45-115% quality) | `/ai-eng/optimize`, agent enhancement |
| `comprehensive-research` | Multi-phase research orchestration | `/ai-eng/research` |
| `code-review-and-quality` | Multi-axis review before merge | `/ai-eng/code-review` |
| `code-simplification` | Behavior-preserving simplification | Alignment with `/ai-eng/simplify` workflow |
| `debugging-and-error-recovery` | Root-cause debugging and recovery | Failure analysis and break-fix work |
| `incremental-implementation` | Thin vertical slice implementation | Multi-file feature and refactor work |
| `text-cleanup` | Remove AI-generated verbosity and slop | Text cleanup and editing workflows |
| `coolify-deploy` | Coolify deployment best practices | `/ai-eng/deploy` |
| `git-worktree` | Git worktree workflow management | `/ai-eng/work` (large features) |
| `plugin-dev` | Plugin development for Claude Code/OpenCode | `/ai-eng/create-*` commands |

## Skill Loading Mechanism

Skills are loaded via the native `skill` tool in Claude Code and OpenCode:

1. **Discovery**: At startup, skill names and descriptions are indexed
2. **Activation**: When a request matches a skill's description, the agent invokes `skill({ name: "skill-name" })`
3. **Loading**: Full `SKILL.md` content is loaded into context
4. **Execution**: Agent follows the skill's instructions

## Code Style

- Each skill has dedicated `SKILL.md` with YAML frontmatter
- Use descriptive `description` field with trigger words for semantic matching
- Keep skill descriptions concise and actionable
- Include practical examples and usage patterns
- Supporting files go in subdirectories (e.g., `templates/`, `patterns/`, `references/`)

## Integration Notes

- Skills integrate with parent AGENTS.md coordination system
- Must maintain compatibility with command implementations
- Each skill should be self-contained and reusable
- Skills are synced to `.claude/skills/` and `.opencode/skill/` during build
