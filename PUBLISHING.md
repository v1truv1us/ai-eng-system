# Publishing Guide

This repository is a private workspace with three publishable packages:

- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

Do not publish the repo root package.

## Recommended Path

Use GitHub OIDC trusted publishing through `.github/workflows/publish-all-oidc.yml`.

That workflow is the canonical release path and publishes in this order:

1. `core`
2. `toolkit`
3. `cli`

## Local Verification

Use Bun locally for build and dry-run verification:

```bash
bun install
bun run build
bun run publish:core:dry-run
bun run publish:toolkit:dry-run
bun run publish:cli:dry-run
```

## Local Publish Commands

```bash
bun run publish:core
bun run publish:toolkit
bun run publish:cli
```

These scripts are intended for local verification and emergency/manual publishing flows. The coordinated CI release should still go through OIDC.

## CLI Publish Manifest

The CLI uses separate development and publish manifests:

- `packages/cli/package.json` - development manifest with `workspace:*`
- `packages/cli/package.json.dev` - recovery/reference copy
- `packages/cli/package.json.publish` - publish manifest with real semver dependency on `@ai-eng-system/core`

The CLI publish helper swaps in the publish manifest, runs the publish command, then restores the development manifest.

## Version Sync

The release version source of truth starts from `packages/core/package.json`.

To align all package versions:

```bash
cd packages/core
bun ../../scripts/version-set.ts 0.6.0
cd ../..
bun run update-publish-versions 0.6.0
```

This updates:
- `packages/core/package.json`
- `packages/core/src/index.ts`
- `packages/toolkit/package.json`
- `packages/cli/package.json`
- `packages/cli/package.json.dev`
- `packages/cli/package.json.publish`

## Toolkit Package Notes

`packages/toolkit/` is a real publishable workspace package built from generated artifacts, not source folders.

Packaged directories include:
- `.claude-plugin/`
- `.opencode/`
- `plugins/ai-eng-system/`

## Current Release

Latest coordinated release: `0.6.0`
