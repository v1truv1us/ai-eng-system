# @ai-eng-system/toolkit

Packaged integration assets for the AI Engineering System.

This package publishes generated Claude Code, OpenCode, Cursor, Gemini, Pi, and marketplace plugin assets as a first-class npm package.

## Package role

`@ai-eng-system/toolkit` is one of three published packages:

- `@ai-eng-system/core` — shared library and content loaders
- `@ai-eng-system/toolkit` — packaged generated assets (this package)
- `@ai-eng-system/cli` — executable installer and command-line workflows

Pi skills and prompts ship inside toolkit at `.pi/` (formerly `@ai-eng-system/pi`).

## What it contains

- `.claude-plugin/` — Claude Code plugin bundle
- `.opencode/` — OpenCode configuration and assets
- `.cursor-plugin/` — Cursor IDE plugin bundle
- `.gemini/` — Gemini CLI skills and commands
- `.pi/` — Pi skills and prompt templates
- `plugins/ai-eng-*` — Seven marketplace plugin directories

These directories are copied from generated repository artifacts (`dist/` and `plugins/`), not raw source folders.

## API

```js
import {
  version,
  getToolkitRoot,
  getClaudePluginDir,
  getOpenCodeDir,
  getCursorPluginDir,
  getGeminiDir,
  getPiDir,
  getMarketplacePluginDir,
} from "@ai-eng-system/toolkit";
```

## Build

From the repo root:

```bash
bun run build
```

To refresh only toolkit contents:

```bash
bun run build:toolkit
```

## Platform install paths

| Platform | Toolkit path | Install |
|----------|--------------|---------|
| Claude Code | `.claude-plugin/` + `plugins/ai-eng-*` | Claude plugin marketplace or copy |
| OpenCode | `.opencode/` | OpenCode config |
| Cursor | `.cursor-plugin/` | Copy to `.cursor/plugins/` |
| Gemini CLI | `.gemini/` | Copy to `.gemini/` |
| Pi | `.pi/` | `pi install npm:@ai-eng-system/toolkit` |

### Pi install

```bash
pi install npm:@ai-eng-system/toolkit
```

The toolkit `package.json` includes a `pi` manifest pointing at `.pi/skills` and `.pi/prompts/*.md`.

See [docs/cursor-setup.md](../../docs/cursor-setup.md) and [docs/gemini-cli-setup.md](../../docs/gemini-cli-setup.md) for other platform install instructions.
