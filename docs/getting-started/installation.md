# Installation

Install ai-eng-system per harness. **Generated bundles are built on release (git tag → GitHub Actions → npm)** — do not commit `dist/` or `packages/toolkit/.cursor-plugin/` etc.

## Prerequisites

- Node.js 20+
- Bun for local development from source

## Claude Code (marketplace)

```bash
/plugin marketplace add v1truv1us/ai-eng-system
/plugin install ai-eng-system@ai-eng-marketplace
```

## OpenCode, Cursor, Gemini, Pi (CLI + toolkit)

```bash
npm install -g @ai-eng-system/cli @ai-eng-system/toolkit
```

### Upgrade or refresh an install

`ai-eng install` **cleans previous ai-eng-managed files first** (commands, agents, skills, bundles), then installs the current package version. For an explicit two-step upgrade:

```bash
ai-eng reinstall --platform cursor          # clean + install
ai-eng clean --platform opencode --scope global   # uninstall only
ai-eng install --skip-clean                 # install without pre-clean (not recommended)
```

Install state is tracked in `.ai-eng/install-manifest.json` (project) or `~/.config/ai-eng/install-manifest.json` (global) so cleans remove stale skills/commands without touching your own files.

| Harness | Project | Global |
| --- | --- | --- |
| OpenCode | `ai-eng install` or `ai-eng install --scope project` | `ai-eng install --scope global` → `~/.config/opencode/` |
| Cursor | `ai-eng install --platform cursor` → plugin + `.agents/skills/` | `ai-eng install --platform cursor --scope global` → `~/.cursor/plugins/local/ai-eng-system/` + `~/.agents/skills/` |
| Gemini | `ai-eng install --platform gemini` → `./.gemini/` | `ai-eng install --platform gemini --scope global` → merge into `~/.gemini/` |
| Pi | `ai-eng install --platform pi` → `.pi/` + `.agents/skills/` | `ai-eng install --platform pi --scope global` → `~/.agents/skills/` only |

Cursor and Pi discover [Agent Skills](https://agentskills.io) from `.agents/skills/` (project) and `~/.agents/skills/` (user). Global Cursor installs include the full plugin bundle under `~/.cursor/plugins/local/ai-eng-system/`. Global Pi remains skills-only; use project scope for the full `.pi/` prompts bundle.

## Build from source (contributors)

```bash
bun install
bun run build
```

Release tags run `.github/workflows/publish-all-oidc.yml`, which builds all harness bundles into `@ai-eng-system/toolkit` before publish.

## Verification

```bash
ai-eng install --help
bun scripts/verify-toolkit-harnesses.ts   # after bun run build
```
