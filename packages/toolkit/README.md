# @ai-eng-system/toolkit

Publishable integration assets for ai-eng-system.

This package ships generated toolkit artifacts for:

- Claude Code: `.claude-plugin/`
- OpenCode: `.opencode/`
- Marketplace/plugin installs: `plugins/ai-eng-system/`

## Build

From the repo root:

```bash
bun run build
```

Or just refresh toolkit contents:

```bash
bun run build:toolkit
```

The toolkit package is built from generated repository artifacts, not source folders:

- `dist/.claude-plugin/`
- `dist/.opencode/`
- `plugins/ai-eng-system/`

## API

```js
import {
  version,
  getClaudePluginDir,
  getOpenCodeDir,
  getMarketplacePluginDir,
} from "@ai-eng-system/toolkit";
```

These helpers return stable absolute paths to the packaged asset directories.
