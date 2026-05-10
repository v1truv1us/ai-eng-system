---
name: npm-trusted-publishing
description: "Publish npm packages via GitHub Actions with OIDC trusted publishing and provenance. Use when setting up automated npm publishes, debugging ENEEDAUTH/E404 errors, or configuring provenance attestations."
version: 1.0.0
---

# npm Trusted Publishing Skill

## Critical Requirement

**npm CLI 11.5.1+ is mandatory for trusted publishing.** `actions/setup-node@v4` with Node 22 still bundles npm 10.x, which CANNOT complete the OIDC token exchange for the actual registry publish. The error is a misleading `404 Not Found` on `PUT https://registry.npmjs.org/<package>` — *after* provenance successfully signs. This wastes hours if you don't know the root cause.

## The Misleading Error

When using npm 10.x with trusted publishing configured correctly, you see:

```
npm notice publish Signed provenance statement with source and build information from GitHub Actions
npm http fetch PUT 404 https://registry.npmjs.org/your-package - Not found
npm error 404  'your-package@x.y.z' is not in this registry.
```

**This is NOT a missing package or auth config problem. It is npm 10.x being unable to exchange the OIDC token for a publish token.**

## The Fix: Use npm 11 for Publish Only

Never try to globally upgrade npm in GitHub Actions. `setup-node` prepends its own PATH, so `npm install -g npm@latest` and `corepack` both silently fail to override it.

Use `npx` to run npm 11 exclusively for the publish command:

```yaml
- name: Publish to npm
  run: npx npm@11 publish
  working-directory: ./your-package
```

This downloads npm 11 on demand and uses it for just the publish operation. No global install, no PATH wrestling.

## Complete Working Workflow

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

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
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm install

      - name: Publish to npm with trusted publishing
        run: npx npm@11 publish
```

## Checklist

### npmjs.org Setup (one-time per package)
- [ ] Go to Package Settings → Trusted publishing
- [ ] Provider: GitHub Actions
- [ ] Organization or user: matches GitHub username exactly (case-sensitive)
- [ ] Repository: matches repo name exactly (case-sensitive)
- [ ] Workflow filename: `publish.yml` (exact — not `publish.yaml`)
- [ ] No environment name unless using GitHub deployment environments

### package.json Requirements
- [ ] `repository.url` matches `https://github.com/<user>/<repo>` (no `.git` suffix)
- [ ] Package is public (private packages cannot use provenance)
- [ ] Repository is public (private repos cannot generate provenance)
- [ ] Version being published does not already exist in the registry

### Workflow Requirements
- [ ] `permissions: id-token: write` at job or workflow level
- [ ] `actions/setup-node@v4` with `registry-url: 'https://registry.npmjs.org'`
- [ ] Publish step uses `npx npm@11 publish` (NOT `npm publish`)
- [ ] NO `--provenance` flag needed — provenance is automatic on GitHub Actions
- [ ] NO `NPM_TOKEN` secret needed — OIDC replaces it entirely
- [ ] NO `secrets` context in step `if` conditions — GitHub Actions rejects this silently

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails |
|--------------|-------------|
| `npm publish --provenance` | Flag is automatic; manual flag can conflict |
| `npm install -g npm@latest` | `setup-node` PATH takes precedence; still runs npm 10 |
| `corepack prepare npm@11 --activate` | Same PATH precedence problem |
| `npx npm@latest publish` | Could pull a future broken version; pin to `@11` |
| `secrets.NPM_TOKEN != ''` in step `if` | `secrets` context unavailable in step conditions; step skips silently |
| Removing `registry-url` from `setup-node` | Breaks `.npmrc` auth config; npm cannot authenticate at all |
| `.git` suffix in `repository.url` | npm normalizes it with a warning; harmless but noisy |

## Verification After Publish

```bash
# Confirm version is live
npm view <package> version

# Confirm provenance attestation exists
npm view <package> dist.attestations.provenance

# View full provenance details
npm view <package> --json | jq '.dist.attestations'
```

## Debugging Failed Publishes

1. Check the npm version in the publish step output:
   ```
   npm info using npm@10.9.7   ← FAILS (too old)
   npm info using npm@11.5.1   ← WORKS
   ```

2. Check if provenance signed but PUT failed:
   ```
   "Signed provenance statement" followed by "404 Not Found" → npm version issue
   ```

3. Check if OIDC env vars are present:
   ```yaml
   - run: |
       echo "ACTIONS_ID_TOKEN_REQUEST_URL: ${ACTIONS_ID_TOKEN_REQUEST_URL:+set}"
       echo "ACTIONS_ID_TOKEN_REQUEST_TOKEN: ${ACTIONS_ID_TOKEN_REQUEST_TOKEN:+set}"
   ```

4. Check npmjs.org Trusted Publisher config matches exactly:
   - Org/user, repo, and workflow filename are all case-sensitive
   - npm does NOT validate the config on save

## Related Skills

- `ci-cd-and-automation` — General CI/CD patterns and security
- `shipping-and-launch` — Pre-launch checklists and rollback procedures
- `security-and-hardening` — Token-less auth and secrets management
