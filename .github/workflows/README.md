# OIDC Publishing Workflows

This directory contains the GitHub Actions workflows used for trusted publishing and package verification.

## Canonical Workflow

Use `.github/workflows/publish-all-oidc.yml` for coordinated releases.

That workflow:
- aligns workspace versions
- builds the repository once
- runs core tests
- runs a release-safe CLI smoke test suite
- publishes packages in order: `core -> toolkit -> cli`

## Package-specific Workflows

These targeted workflows still exist for focused package releases:

- `publish-core-oidc.yml`
- `publish-cli-oidc.yml`
- `release-core.yml`
- `release-cli.yml`

## Trusted Publisher Setup

On npm, each published package should trust the same workflow:

- Organization: `v1truv1us`
- Repository: `ai-eng-system`
- Workflow filename: `publish-all-oidc.yml`
- Environment: `production`

Packages:
- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

## Common Release Commands

### Trigger a dry-run release

```bash
gh workflow run publish-all-oidc.yml -f version=0.5.10 -f packages=core,toolkit,cli -f dry_run=true
```

### Trigger a production release

```bash
gh workflow run publish-all-oidc.yml -f version=0.5.10 -f packages=core,toolkit,cli -f dry_run=false
```

### Tag-based release

```bash
git tag v0.5.10
git push origin v0.5.10
```

## Current Status

The `0.5.10` coordinated publish path has been verified successfully with:

- OIDC dry-run workflow success
- OIDC production publish success
- package versions confirmed on npm for all three packages

The canonical workflow also skips non-dry-run publish steps when the requested package version already exists on npm, which makes post-release tagging safe.

## Note

If GitHub shows action-runtime deprecation warnings for Node 20 inside third-party actions, treat those as action-runtime warnings, not package-runtime failures. The `0.5.10` release flow still completed successfully.
