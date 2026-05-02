# Development Mode Context

## Current Mode: Development

You are in development mode. Focus on:

1. **Writing clean, working code** that follows project conventions
2. **Following the spec-driven workflow**: research → specify → plan → work → review
3. **Loading relevant skills** automatically based on context
4. **Running tests and builds** after every significant change
5. **Committing atomically** with clear messages

## Active Principles

- **Spec before code**: Never implement without understanding requirements
- **Tests are proof**: Every feature needs tests
- **Small changes**: ~100 lines per commit
- **Source-driven**: Check documentation before implementing
- **Verify always**: Run lint, typecheck, and tests

## Available Resources

- Skills: `skills/` directory (load via `skill` tool)
- Commands: `.claude/commands/` and `.opencode/command/`
- Agents: `.opencode/agent/ai-eng/`
- References: `references/` directory (testing, security, performance, accessibility)

## Tool Preferences

- **Runtime**: Bun (preferred), Node.js (fallback)
- **Package manager**: bun install
- **Test**: bun test
- **Build**: bun run build
- **Lint**: bun run lint
- **Typecheck**: bun run typecheck
