# Build System

TypeScript build script for package distribution.

---

## Build Targets

dist/.claude-plugin/ - Claude Code plugin

dist/.opencode/ - OpenCode plugin

dist/prompt-optimization/ - Shared library

dist/skills/ - Skill packs

---

## Build Commands

Build all: `bun run build`

Watch mode: `bun run build:watch`

Clean artifacts: `bun run clean`

Validate content: `bun run validate`

---

## Canonical Sources

content/ - Commands and agents

skills/ - Skill definitions

.claude/hooks/ - Prompt optimization hooks

src/prompt-optimization/ - Shared library

---

## Derived Outputs

Build copies content to dist/

Syncs to .claude/, .claude-plugin/, .opencode/

Copies to plugins/ai-eng-system/ for marketplace
