# Gemini CLI Setup

## Overview

Install ai-eng-system skills and commands for Google Gemini CLI from the generated `.gemini/` bundle.

## Installation

### From npm toolkit (recommended)

```bash
npm install @ai-eng-system/toolkit
mkdir -p .gemini
cp -R node_modules/@ai-eng-system/toolkit/.gemini/* .gemini/
```

### From repository build

```bash
git clone https://github.com/v1truv1us/ai-eng-system.git
cd ai-eng-system
bun run build
mkdir -p .gemini
cp -R dist/.gemini/* .gemini/
```

## Bundle contents

After build, `dist/.gemini/` includes:

- `skills/` — All canonical skills with namespace paths preserved
- `commands/` — Command definitions from `content/commands/`

## Using skills

Gemini CLI loads skills automatically when the task matches their description. To manually reference a skill, open the relevant `SKILL.md` for context.

## Available commands

Commands mirror the ai-eng namespace: `/specify`, `/plan`, `/work`, `/review`, `/research`, `/deploy`, and others from `content/commands/`.

## Related

- [Cursor IDE Setup](./cursor-setup.md)
- [Attribution: Cursor plugins](./attribution/cursor-plugins.md)
