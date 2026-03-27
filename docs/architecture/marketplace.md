# Marketplace and Distribution

ai-eng-system is distributed as a three-package npm model plus marketplace/plugin outputs.

## Published Packages

- `@ai-eng-system/core` - library and content-loading helpers
- `@ai-eng-system/toolkit` - generated Claude/OpenCode/plugin assets
- `@ai-eng-system/cli` - installer and command-line workflows

The repo root package is private and is not published.

## Generated Asset Outputs

Generated plugin content is copied into:

- `dist/.claude-plugin/`
- `dist/.opencode/`
- `plugins/ai-eng-system/`

`@ai-eng-system/toolkit` packages those generated assets for consumption as a real npm package.

## Installation Behavior

The supported end-user path is:

```bash
npm install -g @ai-eng-system/cli
ai-eng install --scope project
```

Do not rely on npm postinstall hooks or `npm install ai-eng-system`.

## Updating

Update the CLI package, then rerun install if needed:

```bash
npm install -g @ai-eng-system/cli@latest
ai-eng install --scope project
```
