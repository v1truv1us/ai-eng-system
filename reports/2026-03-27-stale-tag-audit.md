# Stale Tag Audit

Date: 2026-03-27

## Summary

The current release line on `main` is healthy, but a large number of historical semver tags do not belong to the current `main` ancestry.

- Current canonical release tag: `v0.5.10`
- Current canonical release commit: `c1983f52`
- Previous reachable semver tag on `main`: `v0.4.6`
- Reachable semver tags on `main`: `13`
- Stale semver tags not reachable from `main`: `409`

This is why GitHub compare pages can show inflated file-change counts for `v0.5.10`: GitHub may compare against a numerically recent tag like `v0.5.9` even though that tag is on an unrelated lineage.

## Current Canonical Semver Tags On `main`

- `v0.0.1`
- `v0.0.2`
- `v0.0.3`
- `v0.0.5`
- `v0.0.8`
- `v0.0.9`
- `v0.0.15`
- `v0.1.0`
- `v0.2.0`
- `v0.2.3`
- `v0.4.5`
- `v0.4.6`
- `v0.5.10`

## Recent Stale Tags Affecting Release Comparisons

These are the most visible stale tags because they look like the natural predecessors to `v0.5.10` but are not ancestors of `main`:

| Tag | Date | SHA | Subject |
| --- | --- | --- | --- |
| `v0.5.9` | 2025-08-20 | `2286a872c1f9` | `release: v0.5.9` |
| `v0.5.8` | 2025-08-20 | `c3c440948a33` | `release: v0.5.8` |
| `v0.5.7` | 2025-08-18 | `303a1044a84b` | `release: v0.5.7` |
| `v0.5.6` | 2025-08-18 | `446ce488c08d` | `release: v0.5.6` |
| `v0.5.5` | 2025-08-16 | `0b45187dc72d` | `release: v0.5.5` |
| `v0.5.4` | 2025-08-15 | `650e67f1dfd4` | `release: v0.5.4` |
| `v0.5.3` | 2025-08-15 | `314f7c56e743` | `release: v0.5.3` |
| `v0.5.2` | 2025-08-15 | `57b04d9eb703` | `release: v0.5.2` |
| `v0.5.1` | 2025-08-14 | `ecafa40bcf98` | `release: v0.5.1` |
| `v0.4.45` | 2025-08-13 | `e789abec79f7` | `release: v0.4.45` |

## Stale Tag Distribution

| Minor line | Stale tags |
| --- | ---: |
| `0.5` | 9 |
| `0.4` | 32 |
| `0.3` | 120 |
| `0.2` | 33 |
| `0.1` | 192 |
| `0.0` | 23 |

## Practical Impact

- GitHub compare pages can show misleading "files changed" counts.
- Humans may assume `v0.5.9` is the direct predecessor to `v0.5.10`, but it is not on the same line.
- Any tooling that discovers "latest prior tag" by version alone can be wrong.

## Verified Release State

The current release itself is correct:

- Tag: `v0.5.10`
- Tag target: `c1983f52`
- OIDC tag-triggered workflow succeeded
- Published packages:
  - `@ai-eng-system/core@0.5.10`
  - `@ai-eng-system/toolkit@0.5.10`
  - `@ai-eng-system/cli@0.5.10`

## Recommendation

Treat `main`-reachable semver tags as the canonical release line and leave historical off-line tags untouched until a deliberate cleanup window.
