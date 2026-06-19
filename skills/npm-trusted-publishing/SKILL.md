---
name: npm-trusted-publishing
description: Publish npm packages via GitHub Actions with OIDC trusted publishing and provenance. Use when setting up automated npm publishes, debugging ENEEDAUTH/E404 errors, configuring provenance attestations, or setting up a new package for publication.
metadata:
  category: model-invoked
  version: 2.0.0
---

# npm Trusted Publishing

Publish npm packages from GitHub Actions without long-lived tokens. Uses OIDC
for authentication and generates provenance attestations automatically.

## How It Works

1. GitHub Actions workflow runs on tag push
2. Workflow requests short-lived OIDC token from GitHub
3. npm exchanges OIDC token for publish token via registry
4. Package publishes with provenance attestation (supply-chain security)
5. No `NPM_TOKEN` secret needed — ever

## Prerequisites

### npmjs.org (one-time per package)

1. Go to https://www.npmjs.com/settings/
2. Packages → your package → Settings → Trusted publishing
3. Provider: GitHub Actions
4. Organization or user: matches GitHub username exactly (case-sensitive)
5. Repository: matches repo name exactly (case-sensitive)
6. Workflow filename: `publish.yml` (exact — not `publish.yaml`)
7. No environment name unless using GitHub deployment environments

### package.json

```json
{
  "name": "@scope/package-name",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Requirements:
- `repository.url` matches `https://github.com/<user>/<repo>` (no `.git` suffix)
- Package must be public (private packages cannot use provenance)
- Repository must be public (private repos cannot generate provenance)

## Complete Working Workflow

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to publish'
        required: true
        type: string
      dry_run:
        description: 'Dry run'
        required: false
        type: boolean
        default: false

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Publish to npm
        if: <!-- not a dry run -->
        run: npm publish --access public --provenance
```

## Node Version Note

| Node | Bundled npm | Trusted publishing |
|------|-------------|-------------------|
| 18.x | 9.x | ❌ Not supported |
| 20.x | 10.x | ❌ Not supported |
| 22.x | 10.x | ❌ Use `npx npm@11 publish` |
| 24.x | 11.x | ✅ Works directly |
| 26.x | 11.x | ✅ Works directly |

**For Node 20/22:** Use `npx npm@11 publish` instead of `npm publish`.

## Multi-Package Workspaces

For monorepos with multiple publishable packages:

```yaml
- name: Publish core
  working-directory: ./packages/core
  run: npm publish --access public --provenance

- name: Publish toolkit
  working-directory: ./packages/toolkit
  run: npm publish --access public --provenance
```

## Dry Run

Test without publishing:

```yaml
- name: Dry run
  run: npm publish --dry-run --access public --provenance
```

## Provenance Verification

After publish:

```bash
# Confirm version is live
npm view @scope/package version

# Confirm provenance attestation exists
npm view @scope/package dist.attestations.provenance

# View full provenance details
npm view @scope/package --json | jq '.dist.attestations'
```

On npmjs.com package page, look for the **"Provenance"** badge.

## Debugging Failed Publishes

### Check npm version
```bash
npm --version  # Must be 11.x for trusted publishing
```

### Check OIDC env vars
```yaml
- run: |
    echo "ACTIONS_ID_TOKEN_REQUEST_URL: ${ACTIONS_ID_TOKEN_REQUEST_URL:+set}"
    echo "ACTIONS_ID_TOKEN_REQUEST_TOKEN: ${ACTIONS_ID_TOKEN_REQUEST_TOKEN:+set}"
```

### Check trusted publisher config
- Org/user, repo, and workflow filename are all **case-sensitive**
- npm does NOT validate the config on save
- Must match exactly: `https://github.com/Org/Repo` vs `https://github.com/org/repo`

### Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ENEEDAUTH` | No `registry-url` in setup-node | Add `registry-url: 'https://registry.npmjs.org'` |
| `404 Not Found` | npm 10.x with trusted publishing | Use Node 24+ or `npx npm@11 publish` |
| `403 Forbidden` | Trusted publisher mismatch | Check case-sensitive org/repo/workflow |
| `EPUBLISHCONFLICT` | Version already exists | Bump version or check if already published |

## Security Best Practices

- ✅ Use `permissions: id-token: write` (minimal)
- ✅ No `NPM_TOKEN` secret needed
- ✅ No `--provenance` flag needed (automatic on GitHub Actions)
- ❌ Never commit `.npmrc` with auth tokens
- ❌ Never use `secrets.NPM_TOKEN` in workflow
- ❌ Never use long-lived publish tokens

## Related

- `ci-cd-and-automation` — General CI/CD patterns
- `shipping-and-launch` — Pre-launch checklists
- `security-and-hardening` — Secrets management
