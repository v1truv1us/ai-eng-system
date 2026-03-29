# Historical Tag Cleanup Plan

Date: 2026-03-27

## Goal

Reduce confusion from stale historical semver tags without risking package provenance, GitHub Releases, or automation that still depends on those tags.

## Current State

- Canonical release line now ends at `v0.5.10` on `main`
- `409` semver tags are not ancestors of `main`
- The most confusing stale tags are `v0.5.1` through `v0.5.9`

## Principles

- Do not rewrite or delete historical tags casually
- Preserve reproducibility and provenance records
- Prefer guardrails first, destructive cleanup later

## Phase 1: Freeze and Document

1. Treat `main`-reachable semver tags as canonical
2. Keep `reports/2026-03-27-stale-tag-audit.md` as the current inventory
3. Point release docs to the canonical line starting at `v0.4.6 -> v0.5.10`

Outcome:
- humans understand why compare counts are noisy
- no remote history changes required

## Phase 2: Tooling Guardrails

Update any scripts or docs that infer the previous release to use only tags merged into `main`.

Recommended commands:

```bash
git tag --merged main --list 'v*'
git describe --tags --match 'v*' --abbrev=0 main
```

Do not use all `v*` tags globally when deriving release history.

Outcome:
- future release automation uses the correct ancestry line
- stale tags stop polluting normal release operations

## Phase 3: Historical Classification

Before deletion, classify stale tags into buckets:

- legacy release-branch tags
- prerelease tags
- accidental or orphaned tags
- tags backed by GitHub Releases or external links

Questions to answer before cleanup:

- Does a GitHub Release object exist for the tag?
- Does any CI workflow still reference it?
- Is it used in package provenance, release notes, or external documentation?

Outcome:
- only truly non-canonical and non-consumed tags become cleanup candidates

## Phase 4: Optional Archival Namespace

If long-term preservation matters, move stale history into documented archival naming before deletion from the main semver namespace.

Example archival patterns:

- `archive/v0.5.9`
- `legacy/v0.3.12`

This phase is optional and should only be done if preserving lookup access matters.

## Phase 5: Coordinated Cleanup Window

Only after the prior phases are complete:

1. announce the cleanup window
2. export the final stale-tag list
3. delete confirmed stale tags from remote and local
4. re-verify GitHub Releases and release compare flows

Example deletion command pattern:

```bash
git push origin :refs/tags/<tag>
git tag -d <tag>
```

Do not run bulk deletion until the classification and dependency review are complete.

## Risks

- GitHub compare links can change behavior after deletions
- bookmarked release URLs may still refer to old tags
- third-party automation may break if it assumes those tags exist
- historical package provenance investigations may become harder

## Recommended Near-Term Action

Do not clean up tags yet.

Instead:

1. keep the audit report in-repo
2. continue releasing from the canonical `main` line
3. revisit deletion only after one or two more clean releases (`v0.5.11+`) on the same ancestry line

## Success Criteria

Cleanup should only proceed when all of these are true:

- canonical release docs clearly describe the issue
- release automation uses `--merged main` semantics
- stale tags are classified and reviewed
- package provenance and GitHub Release history are preserved or intentionally archived
