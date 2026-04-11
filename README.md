# AI Engineering System

AI engineering workflow toolkit for Claude Code and OpenCode with 42 commands, 32 specialized agents, and 16 reusable skills.

## Packages

This repository ships three npm packages:

- `@ai-eng-system/core` - shared library and content-loading helpers
- `@ai-eng-system/toolkit` - generated Claude Code, OpenCode, and marketplace assets
- `@ai-eng-system/cli` - executable installer and command-line workflows

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

## Core Workflow

| Phase | Command | Purpose |
| --- | --- | --- |
| Research | `/ai-eng/research` | Multi-phase codebase and external research |
| Specify | `/ai-eng/specify` | Feature/spec generation with TCRO structure |
| Plan | `/ai-eng/plan` | Implementation planning |
| Work | `/ai-eng/work` | Guided execution with quality gates |
| Review | `/ai-eng/review` | Multi-agent code review |

Lifecycle mapping to the more common `agent-skills` command names:

| This repo | Common lifecycle alias |
| --- | --- |
| `/ai-eng/specify` | `/spec` |
| `/ai-eng/plan` | `/plan` |
| `/ai-eng/work` | `/build` |
| `/ai-eng/review` | `/review` |

Related commands:
- `/ai-eng/ralph-wiggum` - iterative full-cycle workflow
- `/ai-eng/simplify` - code reuse, quality, and efficiency simplification

## What Is Included

- 42 commands under the `ai-eng/` namespace
- 32 specialized agents
- 16 skills, including namespaced skills such as `ai-eng/simplify` and `workflow/ralph-wiggum`

Selected commands beyond the core workflow:
- creation: `/ai-eng/create-plugin`, `/ai-eng/create-agent`, `/ai-eng/create-command`, `/ai-eng/create-skill`, `/ai-eng/create-tool`
- quality and analysis: `/ai-eng/code-review`, `/ai-eng/agent-analyzer`, `/ai-eng/fact-check`, `/ai-eng/deep-research`, `/ai-eng/content-optimize`
- operations: `/ai-eng/deploy`, `/ai-eng/docker`, `/ai-eng/cloudflare`, `/ai-eng/github`, `/ai-eng/k8s`, `/ai-eng/monitoring`, `/ai-eng/security-scan`
- utilities: `/ai-eng/context`, `/ai-eng/knowledge-capture`, `/ai-eng/init`, `/ai-eng/seo`

See `docs/reference/commands.md` for the full command list.

## Skills

The generated outputs now preserve namespaced skill paths.

Examples:
- `skills/ai-eng/simplify/SKILL.md` -> `/ai-eng/simplify`
- `skills/workflow/ralph-wiggum/SKILL.md` -> `/ai-eng/ralph-wiggum`
- `skills/comprehensive-research/SKILL.md` -> `/ai-eng/research`

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
content/                Canonical command and agent docs
skills/                 Canonical skill definitions
packages/core/          Published core library package
packages/toolkit/       Published toolkit assets package
packages/cli/           Published CLI package
plugins/ai-eng-system/  Marketplace plugin output
dist/                   Generated root outputs
```

## Documentation

- `docs/getting-started/installation.md`
- `docs/getting-started/quick-start.md`
- `docs/reference/commands.md`
- `docs/reference/skills.md`
- `docs/architecture/marketplace.md`
- `PUBLISHING.md`
- `RELEASE.md`
- `RELEASE_NOTES.md`
