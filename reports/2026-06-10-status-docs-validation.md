# Root status docs validation

Date: 2026-06-10 · Method: automated spot-check + manual triage queue

Living docs (keep at root for now): README, CHANGELOG, CLAUDE, CONTRIBUTING, PLUGIN, PUBLISHING, TODO, THIRD_PARTY_LICENSES, AGENTS, INSTALLATION.

## Triage table

| File | Verdict | Evidence |
|------|---------|----------|
| `EVALUATION_RESULTS.md` | **review** | Benchmark snapshot; check dates and eval scripts still exist |
| `IMPLEMENTATION-ROADMAP.md` | **likely-stale** | Historical roadmap; grep for completed milestones; may treat root src/ as canonical |
| `IMPLEMENTATION-VERIFICATION.md` | **likely-stale** | Point-in-time verification snapshot; may treat root src/ as canonical |
| `MODULARIZATION.md` | **likely-stale** | Modularization effort notes; compare to packages/* layout |
| `NEXT-STEPS.md` | **review** | Planning doc; verify tasks against open issues and CI state; may treat root src/ as canonical |
| `OPENCODE_EVALUATION_GUIDE.md` | **review** | Validate against current OpenCode install paths |
| `OPENCODE_VALIDATION_SETUP.md` | **review** | Validate env/setup steps against docs/getting-started |
| `PATCH_NOTES.md` | **review** | May belong in CHANGELOG only |
| `RELEASE-PLAN.md` | **review** | Release planning; cross-check with CHANGELOG and package versions; hand-written agent count may be stale |
| `RELEASE.md` | **review** | May duplicate RELEASE_NOTES / PUBLISHING |
| `RELEASE_NOTES.md` | **review** | Compare to latest git tags and CHANGELOG |
| `temp_ai_provider_corrections.md` | **archive-candidate** | Temp filename; likely disposable after merge |

## Next actions

1. For each **likely-stale** / **archive-candidate** row, confirm with owner, then move to `docs/archive/`.
2. For **review** rows, verify commands, paths, and counts against repo reality before keeping at root.
3. Do not bulk-delete until a file-specific review is done (per ADR 2026-06-10).

## Archived (2026-06-10)

Moved to `docs/archive/status/`:

- IMPLEMENTATION-ROADMAP.md
- IMPLEMENTATION-VERIFICATION.md
- MODULARIZATION.md
- temp_ai_provider_corrections.md
- NEXT-STEPS.md
- RELEASE-PLAN.md
- PATCH_NOTES.md
- RELEASE.md
- RELEASE_NOTES.md
- EVALUATION_RESULTS.md
- OPENCODE_EVALUATION_GUIDE.md
- OPENCODE_VALIDATION_SETUP.md
