# Skills Reference

ai-eng-system currently ships 33 canonical skills organized by lifecycle phase and repository-specific purpose.

## Namespaced Skills

- `ai-eng/simplify` - loaded from `skills/ai-eng/simplify/SKILL.md`
- `workflow/ralph-wiggum` - loaded from `skills/workflow/ralph-wiggum/SKILL.md`

## Lifecycle Skills

### Define

- `idea-refine` - structured divergent/convergent thinking for vague concepts
- `spec-driven-development` - write structured specifications before code

### Plan

- `planning-and-task-breakdown` - decompose specs into atomic, verifiable tasks

### Build

- `incremental-implementation` - thin vertical slice delivery
- `test-driven-development` - Red-Green-Refactor with 80%+ coverage
- `context-engineering` - feed agents the right information at the right time
- `source-driven-development` - ground decisions in official documentation
- `frontend-ui-engineering` - component architecture, accessibility, responsive design
- `api-and-interface-design` - contract-first API and module boundary design

### Verify

- `browser-testing-with-devtools` - runtime verification via Chrome DevTools
- `debugging-and-error-recovery` - systematic root-cause debugging

### Review

- `code-review-and-quality` - five-axis code review before merge
- `code-simplification` - reduce complexity while preserving behavior
- `security-and-hardening` - OWASP Top 10 prevention and boundary validation
- `performance-optimization` - measure-first performance improvement

### Ship

- `git-workflow-and-versioning` - trunk-based development with atomic commits
- `ci-cd-and-automation` - Shift Left pipelines and feature flag releases
- `deprecation-and-migration` - code-as-liability removal and migration patterns
- `documentation-and-adrs` - Architecture Decision Records and API docs
- `shipping-and-launch` - pre-launch checklists and staged rollouts

## Research and Prompting

- `comprehensive-research` - multi-phase research orchestration
- `prompt-engineering` - comprehensive prompt engineering for coding agents (structured prompts, few-shot, chain-of-thought, decomposition, agent workflow patterns)
- `prompt-refinement` - TCRO prompt structuring
- `incentive-prompting` - research-backed prompting techniques (+45-115% quality)
- `content-optimization` - content and prompt enhancement
- `text-cleanup` - AI-generated verbosity removal

## Development and Operations

- `coolify-deploy` - Coolify deployment workflows
- `git-worktree` - Git worktree management
- `knowledge-architecture` - build static-first knowledge maps
- `knowledge-capture` - document solved problems and patterns
- `monorepo-initialization` - AGENTS.md hierarchy setup

## Marketplace Packaging

- `knowledge-architecture` ships in the `ai-eng-learning` Claude plugin group.
- `knowledge-capture` remains packaged outside `ai-eng-learning`.

## Plugin and Extension Development

- `plugin-dev`
## Notes

- Lifecycle skills are canonical workflow surfaces. Commands are thin entrypoints.
- Repo-specific skills supplement the lifecycle with domain or tool-specific workflows.
- Namespaced skills use `namespace/name` directory paths.
- See `docs/reference/skills-first-map.md` for the complete ownership mapping.
