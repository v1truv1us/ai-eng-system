# Ferg Engineering System

## Who I Am
I'm an architect leading AI-assisted development across UnFergettable-Designs (client web dev) and ferg-cod3s (personal projects).

## Philosophy: Compounding Engineering
Each unit of work should make future work easier: Plan → Build → Review → Codify.

## Agent Coordination
See **[AGENTS.md](./AGENTS.md)** for:
- Available agents and their modes (plan, build, review)
- Specialized subagents and their capabilities
- Commands and skills available in this system

This CLAUDE.md defines the **philosophy** that guides all agents. AGENTS.md documents the **agents and tools** that execute that philosophy.

## Core Commands
- /plan — Create implementation plans
- /work — Execute plans with worktrees and todos
- /review — Multi-agent code review
- /seo — SEO audit
- /deploy — Deployment checklist (Coolify)
- /compound — Document learnings

## Agent Contexts

Specialized agent contexts for different project areas:

| Directory | AGENTS.md | Purpose |
|-----------|-----------|---------|
| Root | [AGENTS.md](./AGENTS.md) | Core agent coordination and commands |
| `.claude/` | [.claude/AGENTS.md](./.claude/AGENTS.md) | Claude Code command implementation details |
| `skills/` | [skills/AGENTS.md](./skills/AGENTS.md) | Reusable skill definitions (DevOps, prompting) |
| `content/` | [content/AGENTS.md](./content/AGENTS.md) | Agent and command documentation |
| `scripts/` | [scripts/AGENTS.md](./scripts/AGENTS.md) | Build and installation utilities |
| `.opencode/skills/` | [.opencode/skills/AGENTS.md](./.opencode/skills/AGENTS.md) | OpenCode-specific skills |
| `.claude-plugin/skills/` | [.claude-plugin/skills/AGENTS.md](./.claude-plugin/skills/AGENTS.md) | Claude Code plugin skills |

Each AGENTS.md includes hierarchy metadata linking back to this CLAUDE.md for philosophy and context.

## Project detection
Look for svelte.config.js, astro.config.mjs, go.mod, sst.config.ts to detect stack.
