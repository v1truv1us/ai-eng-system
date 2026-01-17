# Package Release Workflows

This document explains how to release packages in this monorepo using OIDC trusted publishing.

## Overview

Each package has its own release workflow:
- `release-core.yml` - Publishes `@ai-eng-system/core`
- `release-cli.yml` - Publishes `@ai-eng-system/cli`
- `release-toolkit.yml` - Publishes `@ai-eng-system/toolkit`

## Tag Naming Convention

- Core releases: `core-vX.Y.Z` (e.g., `core-v0.4.6`)
- CLI releases: `cli-vX.Y.Z` (e.g., `cli-v0.5.1`)
- Toolkit releases: `toolkit-vX.Y.Z` (e.g., `toolkit-v0.5.1`)

## Automated Release Process

### To Release Core Package
```bash
# 1. Ensure you're on the latest main
git checkout main
git pull origin main

# 2. Tag release
git tag core-v0.4.6

# 3. Push tag (triggers release-core.yml)
git push origin core-v0.4.6
```

### To Release CLI Package
```bash
# 1. Ensure you're on the latest main
git checkout main
git pull origin main

# 2. Tag release
git tag cli-v0.5.1

# 3. Push tag (triggers release-cli.yml)
git push origin cli-v0.5.1
```

### To Release Toolkit Package
```bash
# 1. Ensure you're on the latest main
git checkout main
git pull origin main

# 2. Tag release
git tag toolkit-v0.5.1

# 3. Push tag (triggers release-toolkit.yml)
git push origin toolkit-v0.5.1
```

### To Release CLI Package
```bash
# 1. Ensure you're on the latest main
git checkout main
git pull origin main

# 2. Tag the release
git tag cli-v0.5.1

# 3. Push the tag (triggers release-cli.yml)
git push origin cli-v0.5.1
```

## Manual Release Process

You can also manually trigger releases via GitHub Actions:

1. Go to the **Actions** tab in GitHub
2. Select either "Release Core Package" or "Release CLI Package"
3. Click **Run workflow**
4. Enter the version number (e.g., `0.4.6`)
5. Optionally check **Dry run** to test without publishing
6. Click **Run workflow**

## OIDC Trusted Publishing

Both workflows use OIDC (no NPM_TOKEN required):
- ✅ Each package configured as trusted publisher on npmjs.com
- ✅ Uses short-lived, scoped credentials
- ✅ Automatic provenance generation
- ✅ Enhanced security vs. long-lived tokens

## Release Order Considerations

Since `@ai-eng-system/cli` depends on `@ai-eng-system/core`, release in this order:

1. **Release core first** (if updating core)
2. **Wait for core to publish** (check Actions tab)
3. **Update CLI dependency** (if needed)
4. **Release CLI**

## Dry Run Testing

Both workflows support dry-run mode:
```bash
# Via workflow_dispatch with dry_run=true
# Or use a test tag like core-v0.4.6-beta.0
```

## Troubleshooting

### Failed OIDC Authentication
Check npm trusted publisher configuration:
1. Go to package settings on npmjs.com
2. Verify "Trusted Publisher" section has correct:
   - Organization: `v1truv1us`
   - Repository: `ai-eng-system`
   - Workflow filename: `release-core.yml` or `release-cli.yml`

### Version Conflicts
Ensure local package.json versions don't conflict with published versions.

### Dependency Issues
Run `bun install` in both packages before tagging to ensure all dependencies are compatible.

## Current Published Versions

- `@ai-eng-system/core`: 0.4.3 (local: 0.4.5)
- `@ai-eng-system/cli`: 0.5.0 (local: 0.4.4)

To sync versions, consider:
1. Publishing core 0.4.5 to match local
2. Bumping CLI to 0.5.1 if needed  
3. Toolkit is already up-to-date (0.5.0)

## NPM Trusted Publisher Configuration

**For @ai-eng-system/core on npmjs.com:**
```
Organization: v1truv1us
Repository: ai-eng-system
Workflow filename: release-core.yml
```

**For @ai-eng-system/cli on npmjs.com:**
```
Organization: v1truv1us
Repository: ai-eng-system
Workflow filename: release-cli.yml
```

**For @ai-eng-system/toolkit on npmjs.com:**
```
Organization: v1truv1us
Repository: ai-eng-system
Workflow filename: release-toolkit.yml
```