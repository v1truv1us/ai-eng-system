# TODO: AI Engineering System

**Current Version**: 0.6.0
**Last Updated**: 2026-03-30

## High Priority

*All current high-priority release tasks are complete.*

## Medium Priority

- [ ] Update remaining historical docs that still reference pre-0.5 packaging patterns
- [ ] Decide whether to tag package-specific releases in addition to coordinated `vX.Y.Z` releases
- [ ] Reduce GitHub Actions deprecation warnings by moving remaining workflow actions to Node 24-compatible runtime settings

## Low Priority

- [ ] Review marketplace listing copy after the toolkit package rollout
- [ ] Expand command and skills reference pages with more examples
- [ ] Add a lightweight post-release verification checklist for future releases

## Completed Tasks

### Three-Package Release and OIDC Publishing (2026-03-27) ✅

- [x] Added a real `packages/toolkit/` workspace package
- [x] Published `@ai-eng-system/core@0.5.10`
- [x] Published `@ai-eng-system/toolkit@0.5.10`
- [x] Published `@ai-eng-system/cli@0.5.10`
- [x] Verified the coordinated OIDC workflow in dry-run and production modes
- [x] Preserved namespaced generated skills such as `ai-eng/simplify` and `workflow/ralph-wiggum`
- [x] Updated release, publishing, installation, and marketplace documentation

### Agent Coverage Expansion and 0.6.0 Release Prep (2026-03-30) ✅

- [x] Added `mobile-developer`
- [x] Added `data-engineer`
- [x] Added `aws-architect`
- [x] Added `agent-developer`
- [x] Normalized canonical and generated agent inventories to 32 active agents
- [x] Updated registry, marketplace, and reference docs for the 0.6.0 release line

### Simplify Skill and Skill Best-Practice Audit (2026-03-27) ✅

- [x] Added `/ai-eng/simplify`
- [x] Added `skills/ai-eng/simplify/SKILL.md`
- [x] Added skill evaluation scaffolding
- [x] Fixed missing skill templates and reference assets
- [x] Expanded thin skills and aligned descriptions with current best practices

### Earlier Completed Work

- [x] CLI package TypeScript build fixes
- [x] ai-eng ralph CLI implementation
- [x] Ralph Wiggum command integration
- [x] Initial modularization into published workspace packages
