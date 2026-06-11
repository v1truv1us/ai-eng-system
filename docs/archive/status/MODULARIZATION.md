# Modularization Status

The repository now uses a three-package model.

## Current Package Topology

```text
packages/core/     @ai-eng-system/core
packages/toolkit/  @ai-eng-system/toolkit
packages/cli/      @ai-eng-system/cli
```

The repo root package is private and acts only as the workspace coordinator.

## Package Responsibilities

### `@ai-eng-system/core`
- shared library exports
- content-loading helpers
- packaged content and path utilities

### `@ai-eng-system/toolkit`
- generated `.claude-plugin/` assets
- generated `.opencode/` assets
- generated `plugins/ai-eng-system/` assets
- stable helper functions for packaged asset paths

### `@ai-eng-system/cli`
- executable `ai-eng` command
- install workflow for project/global scopes
- release-safe CLI smoke tests and runtime commands

## Release Model

The coordinated release path is:

1. publish `core`
2. publish `toolkit`
3. publish `cli`

Trusted publishing runs through `.github/workflows/publish-all-oidc.yml`.

## Notes

- The older two-package description is now historical.
- The toolkit package was introduced to make generated integration assets publishable without overloading the CLI or private workspace root.
