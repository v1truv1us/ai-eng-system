# Three-Package OIDC Release Plan

## Current State

The repo currently has **two real workspace packages**:
- `packages/core` -> `@ai-eng-system/core`
- `packages/cli` -> `@ai-eng-system/cli`

The repo root `package.json` is now a **private workspace package**:
- `@ferg-engineering/system`
- `private: true`
- It should **not** be treated as the third published package.

There is also a **stale third-package concept** in docs:
- `RELEASE.md` still refers to `@ai-eng-system/toolkit`
- `release-toolkit.yml` no longer exists
- `packages/toolkit/` does not exist

## Recommendation

Use a real three-package model:

1. **Keep the repo root private** as the workspace orchestrator
2. **Keep `@ai-eng-system/core`** as the library/content loader package
3. **Keep `@ai-eng-system/cli`** as the runnable CLI package
4. **Create `@ai-eng-system/toolkit`** as the third published package

This is the cleanest option because it matches the older docs, avoids publishing the root workspace package, and gives the third package a clear purpose.

## Recommended Third Package Definition

Create `packages/toolkit/` as a publishable package that ships the installable toolkit assets.

### Recommended package shape

Create a real workspace package with this initial layout:

```text
packages/toolkit/
  package.json
  README.md
  LICENSE
  index.js
  index.d.ts
  .claude-plugin/
  .opencode/
  plugins/ai-eng-system/
```

Recommended exports:
- `.` -> lightweight path helpers / version export
- `./claude-plugin` -> packaged Claude plugin assets
- `./opencode` -> packaged OpenCode assets
- `./plugin` -> marketplace plugin assets

Recommended `package.json` characteristics:
- `name: @ai-eng-system/toolkit`
- `type: module`
- `private: false`
- `publishConfig.access: public`
- `files` whitelist for only packaged assets and entrypoints
- version kept in lockstep with `core` and `cli`

### Suggested responsibility

`@ai-eng-system/toolkit` should contain the packaged integration assets for editor/agent ecosystems, for example:
- `.claude-plugin/`
- `.opencode/`
- `plugins/ai-eng-system/`
- related manifests such as `plugin.json`, `marketplace.json`, and `opencode.jsonc`

It should be built from **generated artifacts**, not directly from mixed source folders, so the package contents match what the build already produces and validates.

### What it should not be

- Not the repo root package
- Not a duplicate of the CLI runtime
- Not another copy of `core`

## Package Responsibilities

### `@ai-eng-system/core`
- Source of truth for shared content loaders and packaged content assets
- Exports library/runtime helpers
- Build output already exists and is publishable

### `@ai-eng-system/cli`
- User-facing executable
- Depends on published `@ai-eng-system/core`
- Keeps dev manifest with `workspace:*`
- Uses publish manifest with real semver dependency

### `@ai-eng-system/toolkit`
- Content/plugin distribution package
- Ships integration artifacts without the full CLI runtime
- Can be consumed by users who want the packaged toolkit content but not the full CLI
- Should expose stable asset paths so downstream installers can locate packaged plugin directories without hardcoding npm cache paths

## OIDC Design

Use **one workflow** for all three published packages:
- `.github/workflows/publish-all-oidc.yml`

Register that same workflow as the trusted publisher for:
- `@ai-eng-system/core`
- `@ai-eng-system/cli`
- `@ai-eng-system/toolkit`

Use GitHub environment:
- `production`

## Publish Order

Recommended order inside `publish-all-oidc.yml`:
1. `core`
2. `toolkit`
3. `cli`

Rationale:
- `cli` depends on `core`
- `toolkit` is content-first and should publish after `core` assets are built
- root stays private and is never published

## Immediate First Step

Implement `packages/toolkit/` first before changing npm trusted publisher configuration for a third package.

Until `packages/toolkit/` exists, there are still only two actual publishable packages, so npm OIDC should remain configured for two packages only.

## Implementation Plan

### Phase 1: Create a real toolkit package

Add `packages/toolkit/` with:
- `package.json`
- `README.md`
- `LICENSE`
- build script
- `files` whitelist
- publish config
- `index.js` / `index.d.ts` for stable path helpers

Recommended package name:
- `@ai-eng-system/toolkit`

Recommended versioning:
- same release version as `core` and `cli`

#### Phase 1A: Normalize versions before introducing toolkit

Current workspace versions are already drifting (`core` and `cli` are not aligned). Before creating the third package:
- choose the next release version (recommended: next unpublished stable version)
- align `packages/core/package.json`
- align `packages/cli/package.json.dev`
- align `packages/cli/package.json.publish`
- create `packages/toolkit/package.json` with the same version

This keeps the first 3-package release simple and avoids one-off version exceptions.

#### Phase 1B: Toolkit asset model

Recommended source of truth for toolkit contents:
- root `dist/.claude-plugin/`
- root `dist/.opencode/`
- root `plugins/ai-eng-system/`

Recommended toolkit build behavior:
1. run the existing root build first
2. clear `packages/toolkit/.claude-plugin/`, `packages/toolkit/.opencode/`, and `packages/toolkit/plugins/ai-eng-system/`
3. copy generated artifacts into `packages/toolkit/`
4. verify required marker files exist:
   - `packages/toolkit/.claude-plugin/plugin.json`
   - `packages/toolkit/.opencode/opencode.jsonc`
   - `packages/toolkit/plugins/ai-eng-system/plugin.json`

This avoids duplicating content-generation logic inside the new package.

#### Phase 1C: Toolkit entrypoint contract

Recommended minimal `index.js` API:
- export `version`
- export absolute-path helper functions such as:
  - `getClaudePluginDir()`
  - `getOpenCodeDir()`
  - `getMarketplacePluginDir()`

That gives users and installers a stable programmatic API rather than forcing them to inspect package internals manually.

### Phase 2: Define toolkit build inputs

Decide the exact publish surface. Recommended default:
- package `plugins/ai-eng-system/`
- package `.claude-plugin/`
- package `.opencode/`
- include only generated artifacts, not repo-only source folders

Recommended exclusions:
- root source directories like `content/`, `skills/`, and `src/`
- test files
- duplicated transient build folders unless intentionally part of the toolkit contract

### Phase 3: Add toolkit workspace scripts

Add scripts such as:
- `build:toolkit`
- `publish:toolkit`
- `publish:toolkit:dry-run`

Update root build flow to include toolkit generation before publish.

Recommended root script changes:
- add `build:toolkit`
- make `build` run `build:core`, `build:cli`, and `build:toolkit`
- add `publish:toolkit`
- add `publish:toolkit:dry-run`
- add `publish:packages` ordering: `core -> toolkit -> cli`

### Phase 4: Extend version sync

Versioning should update:
- `packages/core/package.json`
- `packages/cli/package.json.publish`
- `packages/toolkit/package.json`

If toolkit embeds versioned plugin manifests, sync those too.

Also update any helper/version exports inside:
- `packages/core/src/index.ts`
- `packages/toolkit/index.js`

### Phase 5: Extend OIDC workflow

Update `publish-all-oidc.yml` to:
- build all workspaces
- publish `core`
- publish `toolkit`
- publish `cli`
- restore any swapped manifests on failure

Recommended CI sequencing:
1. install workspace deps
2. set target version
3. build root once
4. publish `core`
5. build/copy toolkit package contents from generated root artifacts
6. publish `toolkit`
7. prepare CLI publish manifest
8. publish `cli`
9. restore swapped manifests in `always()` cleanup steps

Recommended CI runtime updates:
- use Node `24` (or at minimum `22.14+`) in Actions for npm trusted publishing compatibility
- keep Bun for build/test steps
- keep `npm publish` in OIDC workflows because that is the documented trusted-publishing path

Trusted publisher setup on npm should point each package to:
- repo: `v1truv1us/ai-eng-system`
- workflow: `publish-all-oidc.yml`
- environment: `production`

## Docs That Need Alignment

These currently conflict with reality and should be updated during implementation:
- `RELEASE.md`
- `PUBLISHING.md`
- any references to `release-toolkit.yml`
- any docs implying the root package is publishable

Specific doc cleanup required:
- replace historical references to `@ai-eng-system/toolkit` as if it already exists
- document that the repo root is a private workspace only
- document the new toolkit package purpose and publish order

## Decision Needed

Recommended default:
- **Create `packages/toolkit`** as the third package
- **Keep the root package private**
- **Use one OIDC workflow for all three**

Alternative (not recommended):
- publish the repo root as the third package
- this mixes workspace orchestration with distributable package concerns
- it is harder to reason about and easier to break

## Success Criteria

The final release setup should satisfy all of these:
- repo root remains private
- `core`, `toolkit`, and `cli` are each independently publishable
- one trusted OIDC workflow can publish all three
- `bun run build` still passes
- each package supports a dry-run publish verification
- docs match the actual package topology
- toolkit contents are copied from generated artifacts, not ad hoc source folders
- toolkit exposes stable path helpers for consumers
