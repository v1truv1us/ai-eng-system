# Cursor IDE Setup

## Overview

Install ai-eng-system as an official Cursor plugin bundle (skills, agents, rules) generated from the canonical `skills/` and `content/` sources.

## Installation

### Option 1: CLI (recommended)

```bash
npm install -g @ai-eng-system/cli @ai-eng-system/toolkit
ai-eng install --platform cursor --scope project
```

Installs to `.cursor/plugins/ai-eng-system/` (project) or `~/.cursor/plugins/local/ai-eng-system/` (global) with the official nested layout (`.cursor-plugin/plugin.json`) plus `.agents/skills/`.

### Option 2: Cursor team marketplace (like Claude)

Import this repository as a team marketplace in Cursor Settings → Plugins. The repo root includes `.cursor-plugin/marketplace.json` with eight modular plugins under `plugins/ai-eng-*` (mirrors Claude's marketplace layout).

### Option 3: From npm toolkit (manual)

```bash
npm install @ai-eng-system/toolkit
mkdir -p .cursor/plugins/ai-eng-system
cp -R node_modules/@ai-eng-system/toolkit/.cursor-plugin/* .cursor/plugins/ai-eng-system/
```

### Option 4: From repository build

```bash
git clone https://github.com/v1truv1us/ai-eng-system.git
cd ai-eng-system
bun run build
mkdir -p .cursor/plugins/ai-eng-system
cp -R dist/.cursor-plugin/* .cursor/plugins/ai-eng-system/
```

### Option 5: Skills only (legacy)

Copy individual skills from `skills/*/SKILL.md` into `.cursor/rules/` if you only need skill context without the full plugin manifest.

## Plugin contents

After build, `dist/.cursor-plugin/` includes:

- `.cursor-plugin/plugin.json` — Cursor plugin manifest (official nested layout)
- `skills/` — All canonical skills (including Cursor-imported workflows and pstack)
- `agents/` — Agent definitions from `content/agents/`
- `rules/` — Cursor-specific rules from `rules/cursor/`
- `commands/` — Core workflow commands (`research`, `specify`, `plan`, `work`, `review`, `ralph-wiggum`)
- `hooks/` — Ralph loop hooks for iterative agent workflows (`cursor-hooks.json`)

Verify cursor/plugins import coverage:

```bash
bun scripts/verify-cursor-plugins-coverage.ts
```

## Using agents

Cursor supports plugin agents when installed via the plugin bundle. For ad-hoc use, paste agent instructions from `content/agents/` into Chat.

## Best practices

1. Use skills as context for task-specific work
2. Follow the workflow: research → specify → plan → work → review
3. Verify after every change: tests, lint, typecheck
4. Keep changes small (~100 lines per commit)

## Related

- [Gemini CLI Setup](./gemini-cli-setup.md)
- [Attribution: Cursor plugins](./attribution/cursor-plugins.md)
