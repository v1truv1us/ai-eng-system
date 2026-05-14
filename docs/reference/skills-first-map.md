# Skills-First Surface Map

Every user-facing surface in ai-eng-system maps to one of four ownership categories: **skill**, **command**, **agent**, or **runtime**. This document defines which category owns each concept and how aliases relate to canonical surfaces.

## Ownership Categories

| Category | Role | Example |
|----------|------|---------|
| skill | Canonical workflow logic. Lives in `skills/` | `skills/code-review-and-quality/SKILL.md` |
| command | Thin entrypoint or alias. Lives in `content/commands/` and `.claude/commands/` | `content/commands/review.md` |
| agent | Specialist persona with routing logic. Lives in `content/agents/` | `content/agents/code-reviewer.md` |
| runtime | CLI engine behavior. Lives in `packages/cli/src/` | `packages/cli/src/execution/quality-gates.ts` |

## Rules

1. Workflow logic belongs in skills. Commands invoke skills or runtime features.
2. Agents define persona and routing, not workflow steps.
3. Runtime code implements reusable engine behavior. Commands surface it.
4. Aliases must not duplicate logic from their canonical target.

## Lifecycle Phases

| Phase | Canonical Skill | Command Entrypoint | Alias |
|-------|----------------|--------------------|-------|
| Define | `idea-refine` | `/ai-eng/specify` | `/spec` |
| Define | `spec-driven-development` | `/ai-eng/specify` | `/spec` |
| Plan | `planning-and-task-breakdown` | `/ai-eng/plan` | `/plan` |
| Build | `incremental-implementation` | `/ai-eng/work` | `/build` |
| Build | `test-driven-development` | `/ai-eng/work` | `/test` |
| Build | `context-engineering` | `/ai-eng/context` | - |
| Build | `source-driven-development` | `/ai-eng/context` | - |
| Build | `frontend-ui-engineering` | `/ai-eng/work` | - |
| Build | `api-and-interface-design` | `/ai-eng/work` | - |
| Verify | `browser-testing-with-devtools` | - | - |
| Verify | `debugging-and-error-recovery` | - | - |
| Verify | quality gate loop | `/verify` | - |
| Review | `code-review-and-quality` | `/ai-eng/review` | - |
| Review | `code-simplification` | `/ai-eng/simplify` | `/code-simplify` |
| Review | `security-and-hardening` | `/ai-eng/security-scan` | - |
| Review | `performance-optimization` | `/ai-eng/review --focus=performance` | - |
| Ship | `git-workflow-and-versioning` | - | - |
| Ship | `ci-cd-and-automation` | `/ai-eng/deploy` | `/ship` |
| Ship | `deprecation-and-migration` | - | - |
| Ship | `documentation-and-adrs` | `/ai-eng/decision-journal` | - |
| Ship | `shipping-and-launch` | `/ai-eng/deploy` | `/ship` |

## Repo-Specific Skills

These are unique to ai-eng-system and sit outside the standard lifecycle.

| Skill | Path | Purpose |
|-------|------|---------|
| `comprehensive-research` | `skills/comprehensive-research/` | Multi-phase research orchestration |
| `prompt-refinement` | `skills/prompt-refinement/` | TCRO prompt structuring |
| `incentive-prompting` | `skills/incentive-prompting/` | Research-backed prompting techniques |
| `content-optimization` | `skills/content-optimization/` | Content and prompt enhancement |
| `text-cleanup` | `skills/text-cleanup/` | AI verbosity removal |
| `coolify-deploy` | `skills/coolify-deploy/` | Coolify deployment workflows |
| `git-worktree` | `skills/git-worktree/` | Git worktree management |
| `knowledge-capture` | `skills/knowledge-capture/` | Problem documentation |
| `monorepo-initialization` | `skills/monorepo-initialization/` | AGENTS.md hierarchy setup |
| `plugin-dev` | `skills/plugin-dev/` | Plugin creation workflows |
| `ai-eng/simplify` | `skills/ai-eng/simplify/` | Code quality simplification |
| `workflow/ralph-wiggum` | `skills/workflow/ralph-wiggum/` | Iterative full-cycle workflow |

## Deprecated / Consolidation Candidates

| Surface | Status | Canonical Target |
|---------|--------|-----------------|
| `research-companion` | Alias candidate | `comprehensive-research` |
| `context7-docs` | Alias candidate | `comprehensive-research` (docs profile) |
| `fact-check` | Alias candidate | `comprehensive-research` (verification profile) |
| `deep-research` | Alias candidate | `comprehensive-research` (deep profile) |
| `git-workflow` (command) | Alias candidate | `git-workflow-and-versioning` (skill) |
| `ai-eng/simplify` (skill) | Alias candidate | `code-simplification` (canonical skill) |

## Naming Rules

- Canonical skills use `kebab-case` directory names
- Namespaced skills use `namespace/name` paths (e.g. `ai-eng/simplify`)
- Commands use the `ai-eng/` prefix for the primary surface
- Alias commands have no prefix (e.g. `/spec`, `/build`, `/ship`)
- Agent names match their filename: `content/agents/{name}.md`
- Runtime features surface through commands, never directly
