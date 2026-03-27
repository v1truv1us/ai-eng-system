# @ai-eng-system/toolkit

Packaged integration assets for the AI Engineering System.

This package exists so the generated Claude Code, OpenCode, and marketplace/plugin assets can be published and consumed as a first-class npm package.

## Package role

`@ai-eng-system/toolkit` is one of three published packages:

- `@ai-eng-system/core` - shared library and content loaders
- `@ai-eng-system/toolkit` - packaged generated assets
- `@ai-eng-system/cli` - executable installer and command-line workflows

## What it contains

- `.claude-plugin/`
- `.opencode/`
- `plugins/ai-eng-system/`

These directories are copied from generated repository artifacts, not raw source folders.

Current generated asset sources:
- `dist/.claude-plugin/`
- `dist/.opencode/`
- `plugins/ai-eng-system/`

## API

```js
import {
  version,
  getToolkitRoot,
  getClaudePluginDir,
  getOpenCodeDir,
  getMarketplacePluginDir,
} from "@ai-eng-system/toolkit";
```

These helpers return stable absolute paths to the packaged asset directories.

## Why this package exists

The toolkit package makes the three-package release model explicit:

- `core` provides programmatic access to content
- `toolkit` provides generated packaged assets
- `cli` provides the executable user workflow

This is also where packaged command assets include namespaced commands such as `/ai-eng/simplify`.

## Build

From the repo root:

```bash
bun run build
```

To refresh only toolkit contents:

```bash
bun run build:toolkit
```

## Release status

Current published version: `0.5.10`
