# ai-eng-system v0.6.0 Release Notes

Release date: 2026-03-30

## Overview

`v0.6.0` expands ai-eng-system's specialist coverage with four new high-priority agents and normalizes the published inventories around the current 32-agent system.

Published packages:
- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

This release continues the coordinated three-package model with refreshed registry, marketplace, and package metadata.

## Highlights

### Expanded specialist coverage

- `mobile-developer` adds first-class iOS, Android, React Native, and Flutter coverage.
- `data-engineer` adds modern data-stack coverage for Airflow, dbt, Kafka, Spark, and warehouses.
- `aws-architect` adds dedicated AWS architecture guidance and Well-Architected coverage.
- `agent-developer` adds MCP, A2A, tool-calling, and multi-agent orchestration expertise.

### Inventory normalization

- Canonical and generated artifacts now agree on the current 32-agent inventory.
- Subagent orchestration documentation now routes to the correct current specialists.
- Marketplace metadata and public references no longer report stale 28/29-agent counts.

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
- Release notes, changelog, and package READMEs were updated for the `0.6.0` release.

## User-facing changes

### Install paths

End users should install the CLI package:

```bash
npm install -g @ai-eng-system/cli
ai-eng install --scope project
```

The root workspace package is private and should not be installed or published.

### New specialist alignment

- Agent inventory: `32 specialized agents`
- New specialists: `mobile-developer`, `data-engineer`, `aws-architect`, `agent-developer`

## Release verification

Use the coordinated release workflow in `RELEASE.md` and `PUBLISHING.md` for dry-run and production publication.

## Related files

- `CHANGELOG.md`
- `RELEASE.md`
- `PUBLISHING.md`
- `.github/workflows/publish-all-oidc.yml`
