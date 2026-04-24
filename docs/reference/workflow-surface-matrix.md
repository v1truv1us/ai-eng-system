# Workflow Surface Matrix

Complete mapping of every command to its canonical owner: skill, runtime feature, or agent workflow.

## Core Lifecycle Commands

| Command | Type | Canonical Owner | Skill Path |
|---------|------|-----------------|------------|
| `/ai-eng/research` | skill-backed | `comprehensive-research` | `skills/comprehensive-research/SKILL.md` |
| `/ai-eng/specify` | skill-backed | `spec-driven-development` | `skills/spec-driven-development/SKILL.md` |
| `/ai-eng/plan` | skill-backed | `planning-and-task-breakdown` | `skills/planning-and-task-breakdown/SKILL.md` |
| `/ai-eng/work` | skill-backed | `incremental-implementation` + `test-driven-development` | `skills/incremental-implementation/SKILL.md` |
| `/verify` | command-backed | quality gate loop | `content/commands/verify.md` |
| `/ai-eng/review` | skill-backed | `code-review-and-quality` | `skills/code-review-and-quality/SKILL.md` |
| `/ai-eng/simplify` | skill-backed | `code-simplification` | `skills/code-simplification/SKILL.md` |
| `/ai-eng/ralph-wiggum` | skill-backed | `workflow/ralph-wiggum` | `skills/workflow/ralph-wiggum/SKILL.md` |

## Research Family

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/research` | canonical | `comprehensive-research` | Primary research surface |
| `/ai-eng/research-companion` | alias | `comprehensive-research` | Guided synthesis profile |
| `/ai-eng/deep-research` | alias | `comprehensive-research` | Deep multi-source profile |
| `/ai-eng/context7-docs` | alias | `comprehensive-research` | Docs retrieval profile |
| `/ai-eng/fact-check` | alias | `comprehensive-research` | Verification profile |

## Code Quality and Security

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/code-review` | alias | `code-review-and-quality` | Same as `/ai-eng/review` |
| `/ai-eng/security-scan` | skill-backed | `security-and-hardening` | `skills/security-and-hardening/SKILL.md` |
| `/ai-eng/socket-security` | runtime | npm supply-chain analysis | External tool wrapper |
| `/ai-eng/fact-check` | alias | `comprehensive-research` | Verification profile |

## DevOps and Deployment

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/deploy` | skill-backed | `ci-cd-and-automation` + `shipping-and-launch` | Combined ship surface |
| `/ai-eng/coolify` | skill-backed | `coolify-deploy` | `skills/coolify-deploy/SKILL.md` |
| `/ai-eng/docker` | domain | container patterns | Standalone domain command |
| `/ai-eng/k8s` | domain | Kubernetes patterns | Standalone domain command |
| `/ai-eng/cloudflare` | domain | Cloudflare operations | Standalone domain command |
| `/ai-eng/github` | domain | GitHub automation | Standalone domain command |
| `/ai-eng/git-workflow` | alias | `git-workflow-and-versioning` | `skills/git-workflow-and-versioning/SKILL.md` |
| `/ai-eng/monitoring` | agent-backed | `monitoring-expert` | Observability setup |
| `/ai-eng/sentry` | domain | incident response | Standalone domain command |
| `/ai-eng/slack` | domain | integration workflows | Standalone domain command |

## Testing and Debugging

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/api-test` | domain | API testing | Standalone domain command |
| `/ai-eng/playwright` | skill-backed | `browser-testing-with-devtools` | E2E testing |
| `/ai-eng/chrome-debug` | skill-backed | `browser-testing-with-devtools` | DevTools inspection |
| `/ai-eng/ios-sim` | domain | iOS simulator | Platform-specific |
| `/ai-eng/xcodebuild` | domain | Xcode automation | Platform-specific |

## AI, Prompting, and Optimization

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/content-optimize` | skill-backed | `content-optimization` | `skills/content-optimization/SKILL.md` |
| `/ai-eng/verbalize` | domain | verbalized sampling | Standalone domain command |
| `/ai-eng/agent-analyzer` | agent-backed | `subagent-orchestration` | Agent performance analysis |

## Plugin Development

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/create-plugin` | skill-backed | `plugin-dev` | `skills/plugin-dev/SKILL.md` |
| `/ai-eng/create-agent` | skill-backed | `plugin-dev` | Uses agent-creator flow |
| `/ai-eng/create-command` | skill-backed | `plugin-dev` | Uses command-creator flow |
| `/ai-eng/create-skill` | skill-backed | `plugin-dev` | Uses skill-creator flow |
| `/ai-eng/create-tool` | skill-backed | `plugin-dev` | Uses tool-creator flow |

## Database and Data

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/db-optimize` | agent-backed | `database-optimizer` | Query optimization |

## Context and Utilities

| Command | Type | Canonical Owner | Notes |
|---------|------|-----------------|-------|
| `/ai-eng/context` | runtime | session + memory | `packages/cli/src/context/` |
| `/ai-eng/init` | runtime | install system | `packages/cli/src/install/` |
| `/ai-eng/knowledge-capture` | skill-backed | `knowledge-capture` | `skills/knowledge-capture/SKILL.md` |
| `/ai-eng/seo` | agent-backed | `seo-specialist` | Technical SEO review |

## Alias Commands (Compatibility)

| Alias | Canonical Target |
|-------|-----------------|
| `/spec` | `/ai-eng/specify` |
| `/plan` | `/ai-eng/plan` |
| `/build` | `/ai-eng/work` |
| `/test` | TDD entrypoint via `test-driven-development` skill |
| `/review` | `/ai-eng/review` |
| `/code-simplify` | `/ai-eng/simplify` |
| `/ship` | `/ai-eng/deploy` |

## Runtime Surfaces (Planned)

| Surface | Backed By | Status |
|---------|-----------|--------|
| `/quality-gate` | `packages/cli/src/execution/quality-gates.ts` | planned |
| `/model-route` | `packages/cli/src/config/modelResolver.ts` | planned |
| `/sessions` | `packages/cli/src/context/session.ts` | planned |
| `/checkpoint` | `packages/cli/src/context/session.ts` | planned |
| `/resume-session` | `packages/cli/src/context/session.ts` | planned |
| `/loop-start` | `packages/cli/src/execution/ralph-loop.ts` | planned |
| `/loop-status` | `packages/cli/src/execution/ralph-loop.ts` | planned |
| `/harness-audit` | config/schema validation | planned |

## Orchestration Surfaces (Planned)

| Surface | Purpose | Status |
|---------|---------|--------|
| `/multi-plan` | Multi-agent task decomposition | planned |
| `/multi-execute` | Orchestrated multi-agent execution | planned |
| `/multi-backend` | Backend-focused multi-agent work | planned |
| `/multi-frontend` | Frontend-focused multi-agent work | planned |
| `/orchestrate` | General multi-agent coordination | planned |
