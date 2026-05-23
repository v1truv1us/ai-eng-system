# Cursor IDE Setup

## Overview

Install ai-eng-system as an official Cursor plugin bundle (skills, agents, rules) generated from the canonical `skills/` and `content/` sources.

## Installation

### Option 1: From npm toolkit (recommended)

```bash
npm install @ai-eng-system/toolkit
```

Copy or symlink the Cursor plugin bundle into your project:

```bash
mkdir -p .cursor
cp -R node_modules/@ai-eng-system/toolkit/.cursor-plugin .cursor/plugins/ai-eng-system
```

Or reference the plugin path in Cursor's plugin settings if installing globally.

### Option 2: From repository build

```bash
git clone https://github.com/v1truv1us/ai-eng-system.git
cd ai-eng-system
bun run build
cp -R dist/.cursor-plugin .cursor/plugins/ai-eng-system
```

### Option 3: Skills only (legacy)

Copy individual skills from `skills/*/SKILL.md` into `.cursor/rules/` if you only need skill context without the full plugin manifest.

## Plugin contents

After build, `dist/.cursor-plugin/` includes:

- `plugin.json` — Cursor plugin manifest
- `skills/` — All canonical skills (including Cursor-imported workflows)
- `agents/` — Agent definitions from `content/agents/`
- `rules/` — Cursor-specific rules from `rules/cursor/`

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
