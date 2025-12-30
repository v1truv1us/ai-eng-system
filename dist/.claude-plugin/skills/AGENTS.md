# Skills Repository Context

**Hierarchy Level:** Reusable skill definitions
**Parent:** [../AGENTS.md](../AGENTS.md) — Agent coordination and skill registry
**Philosophy:** [../CLAUDE.md](../CLAUDE.md) — Compounding Engineering philosophy

Modular, reusable skill definitions that support the agents defined in the parent AGENTS.md.

## Project Overview

Flat directory structure of skill definitions for Claude Code and OpenCode. Each skill is self-contained in its own directory with a `SKILL.md` file and optional supporting files.

## Directory Structure

```
skills/
├── comprehensive-research/   # Multi-phase research orchestration
│   └── SKILL.md
├── coolify-deploy/           # Coolify deployment best practices
│   └── SKILL.md
├── git-worktree/             # Git worktree workflows
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

## Available Skills

| Skill | Description | Invoked By |
|-------|-------------|------------|
| `prompt-refinement` | Transform prompts into structured TCRO format | `/ai-eng/research`, `/ai-eng/plan`, `/ai-eng/work`, `/ai-eng/specify` |
| `incentive-prompting` | Research-backed prompting techniques (+45-115% quality) | `/ai-eng/optimize`, agent enhancement |
| `comprehensive-research` | Multi-phase research orchestration | `/ai-eng/research` |
| `text-cleanup` | Remove AI-generated verbosity and slop | `/ai-eng/clean` |
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
