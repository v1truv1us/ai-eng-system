# @ai-eng-system/pi

Pi package for ai-eng-system.

## Includes

- `skills/` generated from canonical `skills/`
- `prompts/` generated from canonical `content/commands/`

## Install

```bash
pi install npm:@ai-eng-system/pi
```

Or locally:

```bash
pi install /path/to/ai-eng-system/packages/pi
```

## Notes

- Pi **skills** load natively from this package.
- ai-eng-system **commands** are exposed as Pi prompt templates.
  - Example: `ai-eng/plan` becomes `/ai-eng-plan`
  - Example: `ai-eng/create-plugin` becomes `/ai-eng-create-plugin`
- Pi does **not** have a native agent package type like Claude Code/OpenCode, so ai-eng-system agents are not auto-generated as Pi runtime resources.

## Build

From the repo root:

```bash
bun run build
```

That regenerates this package from the canonical shared sources.
