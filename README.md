# AI Engineering System

AI engineering workflow toolkit for Claude Code and OpenCode with namespaced commands, 38 specialized agents, and reusable skills covering the full development lifecycle from idea to production.

## Packages

This repository ships four npm packages:

- `@ai-eng-system/core` - shared library and content-loading helpers
- `@ai-eng-system/toolkit` - generated Claude Code, OpenCode, and marketplace assets
- `@ai-eng-system/cli` - executable installer and command-line workflows
- `@ai-eng-system/pi` - generated Pi skills and prompt templates

The repo root package is private and is never published.

## Quick Start

### Install the CLI

```bash
npm install -g @ai-eng-system/cli

# Install commands, agents, and skills into the current project
ai-eng install --scope project

# Or install globally for OpenCode
ai-eng install --scope global
```

### Claude Code

```bash
/plugin marketplace add v1truv1us/ai-eng-system
/plugin install ai-eng-system@ai-eng-marketplace
```

### OpenCode

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-skills", "ai-eng-system"]
}
```

OpenCode learning automation now surfaces toast-based suggestions for `/ai-eng/decision-journal` and `/ai-eng/quality-gate`, then waits for explicit `/ai-eng/learning-approve`, `/ai-eng/learning-dismiss`, or `/ai-eng/learning-snooze` consent. Local policy and state live under `.ai-context/learning/`.

### Pi

```bash
pi install npm:@ai-eng-system/pi
```

Pi loads ai-eng-system skills natively from the package `skills/` directory and exposes generated command prompts from `prompts/`.

## Core Workflow

| Phase | Command | Purpose |
| --- | --- | --- |
| Research | `/ai-eng/research` | Multi-phase codebase and external research |
| Specify | `/ai-eng/specify` | Feature/spec generation with TCRO structure |
| Plan | `/ai-eng/plan` | Implementation planning |
| Work | `/ai-eng/work` | Guided execution with quality gates |
| Verify | `/verify` | Lint, typecheck, test, build gate |
| Review | `/ai-eng/review` | Multi-agent code review |

Shorthand lifecycle entrypoints:

| Shorthand | Canonical Command |
| --- | --- |
| `/spec` | `/ai-eng/specify` |
| `/build` | `/ai-eng/work` |

`/ai-eng/plan` and `/ai-eng/review` are direct lifecycle entrypoints with no separate shorthand file.

Related commands:
- `/ai-eng/ralph-wiggum` - iterative full-cycle workflow
- `/ai-eng/simplify` - code reuse, quality, and efficiency simplification

## What Is Included

- Commands under the `ai-eng/` namespace plus shorthand lifecycle entrypoints
- 38 specialized agents
- Skills covering the full development lifecycle (Define, Plan, Build, Verify, Review, Ship) plus repository-specific workflows

Selected commands beyond the core workflow:
- creation: `/ai-eng/create-plugin`, `/ai-eng/create-agent`, `/ai-eng/create-command`, `/ai-eng/create-skill`, `/ai-eng/create-tool`
- quality and analysis: `/ai-eng/code-review`, `/ai-eng/agent-analyzer`, `/ai-eng/fact-check`, `/ai-eng/deep-research`, `/ai-eng/content-optimize`
- operations: `/ai-eng/deploy`, `/ai-eng/docker`, `/ai-eng/cloudflare`, `/ai-eng/github`, `/ai-eng/k8s`, `/ai-eng/monitoring`, `/ai-eng/security-scan`
- utilities: `/ai-eng/context`, `/ai-eng/knowledge-capture`, `/ai-eng/knowledge-architecture`, `/ai-eng/decision-journal`, `/ai-eng/quality-gate`, `/ai-eng/maintenance-review`, `/ai-eng/learning-approve`, `/ai-eng/learning-dismiss`, `/ai-eng/learning-snooze`, `/ai-eng/init`, `/ai-eng/seo`

Claude marketplace packaging note:
- `ai-eng-core` keeps the core plan/work/review workflow
- `ai-eng-learning` now packages `/ai-eng/knowledge-architecture`, `/ai-eng/decision-journal`, `/ai-eng/quality-gate`, `/ai-eng/maintenance-review`, `/ai-eng/learning-approve`, `/ai-eng/learning-dismiss`, and `/ai-eng/learning-snooze`
- `/ai-eng/knowledge-capture` remains outside that plugin group

See `docs/reference/commands.md` for the full command list.

## Skills

The generated outputs now preserve namespaced skill paths.

Examples:
- `skills/ai-eng/simplify/SKILL.md` -> `/ai-eng/simplify`
- `skills/workflow/ralph-wiggum/SKILL.md` -> `/ai-eng/ralph-wiggum`
- `skills/comprehensive-research/SKILL.md` -> `/ai-eng/research`
- `skills/knowledge-architecture/SKILL.md` -> `/ai-eng/knowledge-architecture`

See `docs/reference/skills.md` for the full skill inventory.

## Alignment Notes

This repository now aligns more closely with the `addyosmani/agent-skills` lifecycle without dropping its existing `ai-eng/*` command namespace, marketplace build pipeline, or specialized agent model.

Recent alignment work includes:

- build-time validation for broken command-to-skill references
- a smaller set of upstream-inspired skills such as `code-review-and-quality`, `code-simplification`, `debugging-and-error-recovery`, and `incremental-implementation`
- explicit third-party attribution in `THIRD_PARTY_LICENSES.md`

## Release Model

The current coordinated release version is `1.0.0` for:

- `@ai-eng-system/core`
- `@ai-eng-system/toolkit`
- `@ai-eng-system/cli`

Trusted publishing runs through `.github/workflows/publish-all-oidc.yml` using GitHub OIDC.

## Development

### Prerequisites

- Bun >= 1.0.0
- Node.js >= 20
- Python 3 for Claude hook helpers

### Common commands

```bash
bun install
bun run build
bun run build:toolkit
bun test
```

### Repository structure

```text
content/                Canonical command and agent docs (source of truth)
skills/                 Canonical skill definitions (source of truth)
docs/                   Canonical long-form and reference documentation
templates/              Decision and quality gate templates
packages/core/          Published core library package
packages/toolkit/       Published toolkit assets package
packages/cli/           Published CLI package
packages/pi/            Published Pi package (generated skills/prompts)
plugins/                Marketplace plugin output (generated)
dist/                   Generated root outputs
docs-site/              Published documentation site (mirror of docs/)
```

## Documentation

Canonical documentation lives in `docs/`. Command definitions live in `content/commands/`. Skill definitions live in `skills/`. Generated mirrors (`.claude/`, `.opencode/`, `dist/`, `plugins/`) are rebuilt from these canonical sources and should not be edited directly.

- `docs/getting-started/installation.md`
- `docs/getting-started/quick-start.md`
- `docs/reference/commands.md`
- `docs/reference/skills.md`
- `docs/architecture/marketplace.md`
- `docs/opencode-learning-automation.md`
- `PUBLISHING.md`
- `RELEASE.md`
- `RELEASE_NOTES.md`
