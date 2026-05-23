# packages/core — Generated Asset Notice

The `packages/core/content/`, `packages/core/opencode/`, and `packages/core/skills/` trees are **legacy parallel copies** of ai-eng-system content.

## Canonical sources (edit these)

- `content/commands/` and `content/agents/`
- `skills/**/SKILL.md`
- Root `build.ts` → `dist/`

## Do not edit directly

Changes to files under `packages/core/content/`, `packages/core/opencode/`, or `packages/core/skills/` will drift from the root build unless explicitly synced.

For new work, edit canonical sources and run:

```bash
bun run build
```

The CLI and core package consume generated output from `dist/` and `@ai-eng-system/toolkit` after build.
