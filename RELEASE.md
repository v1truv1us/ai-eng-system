# Package Release Workflows

This document describes the current release flow for the ai-eng-system monorepo.

## Release Model

The repository contains one private workspace root and three published npm packages:

- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

The repo root package is private and is never published.

## Canonical Release Path

The canonical release path is the coordinated OIDC workflow:

- `.github/workflows/publish-all-oidc.yml`

The coordinated workflow is idempotent for already-published versions, so pushing a matching release tag after a successful workflow-dispatch publish is safe.

Publish order is always:

1. `core`
2. `toolkit`
3. `cli`

That order matters because the CLI publish manifest depends on the published core version, and toolkit is built from generated artifacts produced during the release build.

## Tag Naming

- Core-only release: `core-vX.Y.Z`
- CLI-only release: `cli-vX.Y.Z`
- Full release: `vX.Y.Z`

Example full release tag:

```bash
git tag v0.5.10
git push origin v0.5.10
```

## Manual Release via GitHub Actions

1. Open GitHub Actions
2. Select `Publish All Packages (OIDC)`
3. Run the workflow with:
   - `version`: `0.5.10` or the next release version
   - `packages`: `core,toolkit,cli`
   - `dry_run`: `true` first, then `false`

## Trusted Publishing

OIDC trusted publishing is configured per package on npm for:

- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

All three should point to:

- Organization: `v1truv1us`
- Repository: `ai-eng-system`
- Workflow: `publish-all-oidc.yml`
- Environment: `production`

## Local Verification Before Release

From the repo root:

```bash
bun install
bun run build
bun run publish:core:dry-run
bun run publish:toolkit:dry-run
bun run publish:cli:dry-run
```

## Version Alignment

To align the workspace to a release version:

```bash
cd packages/core
bun ../../scripts/version-set.ts 0.5.10
cd ../..
bun run update-publish-versions 0.5.10
```

This keeps `core`, `toolkit`, and the CLI manifests aligned.

## Current Release

Latest coordinated release: `0.5.10`
