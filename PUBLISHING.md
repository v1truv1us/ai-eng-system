# Publishing Guide

This repository is a private workspace with three publishable npm packages:

- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

Do not publish the repo root package.

## Prerequisites

- Bun installed
- Node/npm installed
- npm auth configured, or GitHub OIDC trusted publishing configured
- Clean working tree

## Local Release Flow

From the repo root:

```bash
bun install
bun run build
bun test
```

Publish `core` first:

```bash
bun run publish:core:dry-run
bun run publish:core
```

`publish:core:dry-run` uses `bun publish --dry-run` to verify the tarball without uploading it.

Then publish `toolkit`:

```bash
bun run publish:toolkit:dry-run
bun run publish:toolkit
```

`publish:toolkit:dry-run` runs `bun publish --dry-run` against the built package.

Then publish `cli`:

```bash
bun run publish:cli:dry-run
bun run publish:cli
```

`publish:cli:dry-run` swaps in the publish manifest and runs `bun publish --dry-run`.

The CLI publish script:
- updates `packages/cli/package.json.publish`
- swaps it into `packages/cli/package.json`
- runs `bun publish` or `bun publish --dry-run`
- restores the development manifest automatically

## Versioning

- `packages/core/package.json` is the source of truth for the release version
- `scripts/update-publish-versions.ts` syncs:
  - `packages/cli/package.json`
  - `packages/cli/package.json.dev`
  - `packages/cli/package.json.publish` version
  - `packages/cli/package.json.publish` dependency on `@ai-eng-system/core`
  - `packages/toolkit/package.json`
- `scripts/version-set.ts` updates package versions and also syncs `packages/core/src/index.ts`

Example:

```bash
cd packages/core
bun ../../scripts/version-set.ts 0.5.6
cd ../..
bun run update-publish-versions 0.5.6
```

## Dry-Run Verification

You can inspect the packaged tarball without publishing:

```bash
cd packages/core && bun publish --dry-run --access public --provenance
cd ../toolkit && bun publish --dry-run --access public --provenance
cd ../cli && bun publish --dry-run
```

## GitHub Actions / OIDC

Recommended workflows:

- `.github/workflows/publish-core-oidc.yml`
- `.github/workflows/publish-cli-oidc.yml`
- `.github/workflows/publish-all-oidc.yml`

Use `core`, then `toolkit`, then `cli`. Local release scripts use Bun, while the coordinated OIDC workflow remains the canonical CI publish path. The CLI package depends on the published core version, and toolkit is built from generated root artifacts.

## Notes

- `packages/cli/package.json` is the development manifest and keeps `@ai-eng-system/core` as `workspace:*`
- `packages/cli/package.json.publish` is the publish-ready manifest with a real semver dependency
- `packages/cli/package.json.dev` mirrors the development manifest for recovery/reference
- `packages/toolkit/` is a real publishable workspace package built from `dist/.claude-plugin`, `dist/.opencode`, and `plugins/ai-eng-system`
- The repo root package remains private and is never published
