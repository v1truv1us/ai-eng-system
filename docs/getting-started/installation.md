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

| Harness | Command |
| --- | --- |
| OpenCode | `ai-eng install` or `ai-eng install --platform opencode --scope project` |
| Cursor | `ai-eng install --platform cursor` → `.cursor/plugins/ai-eng-system/` |
| Gemini CLI | `ai-eng install --platform gemini` → `./.gemini/` |
| Pi | `ai-eng install --platform pi` → `./.pi/` or `pi install npm:@ai-eng-system/toolkit` |

Project installs run from your repo root. OpenCode also supports `--scope global` for `~/.config/opencode/`.

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
