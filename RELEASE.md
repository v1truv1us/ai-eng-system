# Package Release Workflows

This document explains how to release packages in this monorepo using OIDC trusted publishing.

## Overview

The repo root is a private workspace package and is not published.

The recommended release path is the coordinated OIDC workflow:
- `publish-all-oidc.yml` - Publishes `@ai-eng-system/core` -> `@ai-eng-system/toolkit` -> `@ai-eng-system/cli`

Package-specific workflows may still exist for targeted publishes, but the all-in-one workflow is the canonical release path for the three-package model.

## Tag Naming Convention

- Core releases: `core-vX.Y.Z` (e.g., `core-v0.4.6`)
- CLI releases: `cli-vX.Y.Z` (e.g., `cli-v0.5.1`)
- Full three-package releases: `vX.Y.Z` (e.g., `v0.5.6`)

## Automated Release Process

### To Release All Three Packages
```bash
# 1. Ensure you're on the latest main
git checkout main
git pull origin main

# 2. Tag release
git tag v0.5.6

# 3. Push tag (triggers publish-all-oidc.yml)
git push origin v0.5.6
```

## Manual Release Process

You can also manually trigger releases via GitHub Actions:

1. Go to the **Actions** tab in GitHub
2. Select "Publish All Packages (OIDC)"
3. Click **Run workflow**
4. Enter the version number (e.g., `0.5.6`)
5. Optionally check **Dry run** to test without publishing
6. Click **Run workflow**

## OIDC Trusted Publishing

The coordinated workflow uses OIDC (no NPM_TOKEN required):
- ✅ Each package configured as trusted publisher on npmjs.com
- ✅ Uses short-lived, scoped credentials
- ✅ Automatic provenance generation
- ✅ Enhanced security vs. long-lived tokens

## Release Order Considerations

Release in this order:

1. **Release core first**
2. **Release toolkit second**
3. **Release CLI last**

## Dry Run Testing

The all-packages workflow supports dry-run mode:
```bash
# Via workflow_dispatch with dry_run=true
# Or use the package dry-run scripts locally before tagging
```

## Troubleshooting

### Failed OIDC Authentication
Check npm trusted publisher configuration:
1. Go to package settings on npmjs.com
2. Verify "Trusted Publisher" section has correct:
    - Organization: `v1truv1us`
    - Repository: `ai-eng-system`
    - Workflow filename: `publish-all-oidc.yml`

### Version Conflicts
Ensure local package.json versions don't conflict with published versions.

### Dependency Issues
Run `bun install` in both packages before tagging to ensure all dependencies are compatible.

## Current Published Versions

- `@ai-eng-system/core`: release from aligned workspace version
- `@ai-eng-system/toolkit`: release from aligned workspace version
- `@ai-eng-system/cli`: release from aligned workspace version

To sync versions, consider:
1. Align `core`, `toolkit`, and `cli` to the same version
2. Build the repo once
3. Publish through `publish-all-oidc.yml`

## NPM Trusted Publisher Configuration

**For @ai-eng-system/core on npmjs.com:**
```
Organization: v1truv1us
Repository: ai-eng-system
Workflow filename: publish-all-oidc.yml
```

**For @ai-eng-system/toolkit on npmjs.com:**
```
Organization: v1truv1us
Repository: ai-eng-system
Workflow filename: publish-all-oidc.yml
```

**For @ai-eng-system/cli on npmjs.com:**
```
Organization: v1truv1us
Repository: ai-eng-system
Workflow filename: publish-all-oidc.yml
```
