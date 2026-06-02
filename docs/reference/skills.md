# Skills Reference

ai-eng-system currently ships 83 skills organized by lifecycle phase, domain, and repository-specific purpose.

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
- `seo-audit` - SEO, Lighthouse-style, metadata, structured data, and accessibility audits

## Development and Operations

- `coolify-deploy` - Coolify deployment workflows
- `git-worktree` - Git worktree management
- `knowledge-architecture` - build static-first knowledge maps
- `knowledge-capture` - document solved problems and patterns
- `monorepo-initialization` - AGENTS.md hierarchy setup

## Marketplace Packaging

- `knowledge-architecture` ships in the `ai-eng-learning` Claude plugin group.
- `knowledge-capture` remains packaged outside `ai-eng-learning`.

## Plugin, Extension, and Agent SDK Development

- `plugin-dev` - Claude Code/OpenCode plugin, command, agent, skill, and tool development
- `agents-sdk-dev` - Unified agent scaffolding across 5 harnesses (Anthropic, Cursor, OpenAI, OpenCode, Pi). Interactive project generator, per-harness SDK patterns, and built-in verification
- `gemini-agent-sdk` - Gemini SDK/ADK-style workflow adapters (runner not in repo yet)
- `orchestrate` - Planned Cursor cloud planner/worker tree; use `agents-sdk-dev` with harness=cursor until implemented

Reference runners: `agents/research-runner/` (research templates, 5 runtimes), `agents/seo-review-runner/` (SEO audit, 5 runtimes). Shared prompt helpers: `agents/seo-review-runner/shared/prompt.ts`. Shared workflow types: `agents/research-runner/shared/workflow-contract.ts`.

These skills are included in default installs (see `.ai-eng/install-manifest.json`) and in the `ai-eng-development` plugin group in `build.ts`.

## Notes

- Lifecycle skills are canonical workflow surfaces. Commands are thin entrypoints.
- Repo-specific skills supplement the lifecycle with domain or tool-specific workflows.
- Namespaced skills use `namespace/name` directory paths.
- See `docs/reference/skills-first-map.md` for the complete ownership mapping.
