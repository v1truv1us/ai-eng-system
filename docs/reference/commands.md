# Commands Reference

47 commands are currently shipped under the `ai-eng/` namespace, plus 7 lifecycle alias commands and 5 runtime/orchestration commands (57 total content commands).

## Spec-Driven Workflow

- `/ai-eng/research` - multi-phase research and discovery
- `/ai-eng/specify` - feature/spec generation
- `/ai-eng/plan` - implementation planning
- `/ai-eng/work` - guided execution with quality gates
- `/ai-eng/review` - multi-agent review
- `/ai-eng/ralph-wiggum` - iterative full-cycle workflow

## Lifecycle Aliases

| Alias | Canonical Command |
|-------|-------------------|
| `/spec` | `/ai-eng/specify` |
| `/plan` | `/ai-eng/plan` |
| `/build` | `/ai-eng/work` |
| `/test` | TDD entrypoint via `test-driven-development` skill |
| `/review` | `/ai-eng/review` |
| `/code-simplify` | `/ai-eng/simplify` |
| `/ship` | `/ai-eng/deploy` |

## Plugin Development

- `/ai-eng/create-plugin` - end-to-end plugin creation workflow
- `/ai-eng/create-agent` - create a new agent
- `/ai-eng/create-command` - create a new command
- `/ai-eng/create-skill` - create a new skill
- `/ai-eng/create-tool` - create a new OpenCode tool

## DevOps and Deployment

- `/ai-eng/deploy` - deployment readiness and rollout
- `/ai-eng/coolify` - Coolify management
- `/ai-eng/docker` - Docker workflows
- `/ai-eng/k8s` - Kubernetes deployment automation
- `/ai-eng/cloudflare` - Cloudflare platform operations
- `/ai-eng/github` - GitHub workflow automation
- `/ai-eng/git-workflow` - Git workflow management
- `/ai-eng/monitoring` - monitoring and observability setup
- `/ai-eng/sentry` - Sentry incident response
- `/ai-eng/slack` - Slack integration workflows

## Code Quality and Security

- `/ai-eng/code-review` - code quality review
- `/ai-eng/security-scan` - security audits and vulnerability assessment
- `/ai-eng/simplify` - simplify changed code for reuse, quality, and efficiency
- `/ai-eng/socket-security` - npm/package supply-chain analysis
- `/ai-eng/fact-check` - verify technical claims and references
- `/ai-eng/knowledge-capture` - capture solved problems and patterns

## Testing and Debugging

- `/ai-eng/api-test` - API testing and validation
- `/ai-eng/playwright` - browser automation and E2E testing
- `/ai-eng/chrome-debug` - Chrome DevTools inspection
- `/ai-eng/ios-sim` - iOS simulator control
- `/ai-eng/xcodebuild` - Xcode build/test automation

## AI, Prompting, and Research

- `/ai-eng/verbalize` - verbalized sampling for response diversity
- `/ai-eng/content-optimize` - optimize prompts and other content
- `/ai-eng/agent-analyzer` - analyze agent performance and routing
- `/ai-eng/research-companion` - guided research synthesis
- `/ai-eng/deep-research` - deep multi-source web research
- `/ai-eng/context7-docs` - Context7 documentation retrieval

## Database and Data

- `/ai-eng/db-optimize` - database and query optimization

## Context and Utilities

- `/ai-eng/context` - session state and context engineering
- `/ai-eng/init` - initialize ai-eng-system in a project

## SEO

- `/ai-eng/seo` - technical SEO and Core Web Vitals review

## Planned Runtime Commands

| Command | Purpose | Status |
|---------|---------|--------|
| `/quality-gate` | Run standardized quality gate sequence | planned |
| `/verify` | Full verification loop (lint, type, test, build) | planned |
| `/model-route` | Route task to appropriate model | planned |
| `/sessions` | List, search, and manage sessions | planned |
| `/checkpoint` | Save session checkpoint | planned |
| `/resume-session` | Resume from saved checkpoint | planned |
| `/loop-start` | Start autonomous loop | planned |
| `/loop-status` | Check loop status | planned |
| `/harness-audit` | Audit harness configuration | planned |

## Planned Orchestration Commands

| Command | Purpose | Status |
|---------|---------|--------|
| `/multi-plan` | Multi-agent task decomposition | planned |
| `/multi-execute` | Orchestrated multi-agent execution | planned |
| `/multi-backend` | Backend-focused multi-agent work | planned |
| `/multi-frontend` | Frontend-focused multi-agent work | planned |
| `/orchestrate` | General multi-agent coordination | planned |

Canonical command definitions live in `content/commands/`.
See `docs/reference/workflow-surface-matrix.md` for the complete command-to-skill mapping.
