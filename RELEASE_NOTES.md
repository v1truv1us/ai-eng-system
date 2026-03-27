# ai-eng-system v0.5.10 Release Notes

Release date: 2026-03-27

## Overview

`v0.5.10` is the first fully verified three-package release for ai-eng-system.

Published packages:
- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

This release also completes the move to GitHub OIDC trusted publishing with provenance for coordinated releases.

## Highlights

### Three-package release model

- `@ai-eng-system/core` now represents the shared library and packaged content loaders.
- `@ai-eng-system/toolkit` is now a real published package that ships generated Claude Code, OpenCode, and marketplace assets.
- `@ai-eng-system/cli` remains the user-facing executable package for installation and command-line workflows.

### Trusted publishing with provenance

- Release automation now runs through `.github/workflows/publish-all-oidc.yml`.
- The canonical publish order is `core -> toolkit -> cli`.
- npm trusted publishers are configured so releases can be run from GitHub Actions without long-lived npm publish tokens.

### Namespaced skill packaging

- Generated outputs now preserve namespaced skill paths instead of flattening them.
- The simplify skill is available as `ai-eng/simplify` and powers `/ai-eng/simplify`.
- `workflow/ralph-wiggum` is also preserved across generated outputs.

### Documentation and release cleanup

- Installation guides now point to the CLI-based install flow.
- Marketplace and publishing docs now reflect the three-package model.
- Release notes, changelog, and package READMEs were updated for the `0.5.10` release.

## User-facing changes

### Install paths

End users should install the CLI package:

```bash
npm install -g @ai-eng-system/cli
ai-eng install --scope project
```

The root workspace package is private and should not be installed or published.

### New command and skill alignment

- Command: `/ai-eng/simplify`
- Skill path: `skills/ai-eng/simplify/SKILL.md`

## Release verification

Release validation completed successfully for:
- repository build
- core tests
- release-safe CLI smoke tests
- core publish dry-run
- toolkit publish dry-run
- CLI publish dry-run
- full production OIDC publish

Published npm versions:
- `@ai-eng-system/core@0.5.10`
- `@ai-eng-system/toolkit@0.5.10`
- `@ai-eng-system/cli@0.5.10`

## Related files

- `CHANGELOG.md`
- `RELEASE.md`
- `PUBLISHING.md`
- `.github/workflows/publish-all-oidc.yml`
