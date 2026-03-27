# @ai-eng-system/cli

Executable package for the AI Engineering System.

This is the package end users install when they want the `ai-eng` command and the guided installation flow for OpenCode and related assets.

## Install

```bash
npm install -g @ai-eng-system/cli
```

Then install the packaged assets into your target environment:

```bash
ai-eng install --scope project
ai-eng install --scope global
```

## Package Role

`@ai-eng-system/cli` is one of three published packages:

- `@ai-eng-system/core` - shared library and content-loading helpers
- `@ai-eng-system/toolkit` - packaged Claude/OpenCode/plugin assets
- `@ai-eng-system/cli` - executable installer and command-line workflows

## Typical Usage

```bash
ai-eng ralph "implement authentication"
ai-eng install --scope project
```

Installed command assets include:
- `/ai-eng/research`
- `/ai-eng/specify`
- `/ai-eng/plan`
- `/ai-eng/work`
- `/ai-eng/review`
- `/ai-eng/simplify`

## Build From Source

From the repo root:

```bash
bun install
bun run build
```

From this package directory:

```bash
bun run build:cli
bun run test:build
```

## Manifest Layout

- `packages/cli/package.json` - development manifest with `workspace:*`
- `packages/cli/package.json.dev` - recovery/reference copy
- `packages/cli/package.json.publish` - publish manifest with a real semver dependency on `@ai-eng-system/core`

## Current Release

Current published version: `0.5.10`
