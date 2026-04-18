# AI Engineering System

## Who I Am
I'm an architect leading AI-assisted development across UnFergettable-Designs (client web dev) and personal projects.

## Philosophy: Compounding Engineering
Each unit of work should make future work easier: Plan → Build → Review → Codify.

## Agent Coordination
See **[AGENTS.md](./AGENTS.md)** for:
- Available agents and their modes (plan, build, review)
- Specialized subagents and their capabilities
- Commands and skills available in this system

This CLAUDE.md defines the **philosophy** that guides all agents. AGENTS.md documents the **agents and tools** that execute that philosophy.

## Key Commands
- /research — Multi-phase research orchestration
- /specify — Create feature specifications
- /plan — Create detailed implementation plans
- /work — Execute plans with quality gates and tracking
- /review — Multi-perspective code review (32 agents)
- /ralph-wiggum — Full-cycle iterative workflow
- /deploy — Pre-deployment checklist and deployment workflows
- /content-optimize — Content and prompt enhancement
- /context — Context management and retrieval
- /create-plugin — Guided plugin creation workflow
- /create-agent — AI-assisted agent generation
- /create-command — AI-assisted command generation
- /create-skill — AI-assisted skill creation
- /create-tool — AI-assisted tool creation
- /knowledge-capture — Document solved problems for team
- /knowledge-architecture — Build static-first knowledge maps
- /decision-journal — Record durable decisions
- /quality-gate — Define file-backed quality gates
- /maintenance-review — Review drift and maintenance debt

See `docs/reference/commands.md` for the full 49-command inventory.

## Agent Contexts

Specialized agent contexts for different project areas:

| Directory | AGENTS.md | Purpose |
|-----------|-----------|---------|
| Root | [AGENTS.md](./AGENTS.md) | Core agent coordination and commands |
| `src/` | [src/AGENTS.md](./src/AGENTS.md) | Core TypeScript implementation |
| `tests/` | [tests/AGENTS.md](./tests/AGENTS.md) | Comprehensive test suite |
| `docs/` | [docs/AGENTS.md](./docs/AGENTS.md) | Documentation and research materials |
| `.claude/` | [.claude/AGENTS.md](./.claude/AGENTS.md) | Claude Code command implementation details |
| `content/` | [content/AGENTS.md](./content/AGENTS.md) | Agent and command documentation |
| `skills/` | [skills/AGENTS.md](./skills/AGENTS.md) | Reusable skill definitions (DevOps, prompting) |

Each AGENTS.md includes hierarchy metadata linking back to this CLAUDE.md for philosophy and context.

## Project detection
Look for svelte.config.js, astro.config.mjs, go.mod, sst.config.ts to detect stack.
