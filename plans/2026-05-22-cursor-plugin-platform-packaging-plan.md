# Cursor Plugin Import and Multi-Platform Packaging Plan

Date: 2026-05-22

## Current Situation

The repository currently has canonical ai-eng content and several generated/package areas, but Cursor official plugins have not yet been imported.

### Existing content areas

- `content/agents/` contains agent documentation/source files.
- `content/commands/` contains command documentation/source files.
- `skills/` is the root canonical skill source used by the build.
- `packages/pi/skills/` contains Pi package skill assets.
- `plugins/` contains ai-eng marketplace plugin directories such as:
  - `ai-eng-core`
  - `ai-eng-content`
  - `ai-eng-devops`
  - `ai-eng-learning`
  - `ai-eng-plugin-dev`
  - `ai-eng-quality`
  - `ai-eng-research`

### Work already completed

Four Pi skill files were fixed by adding required YAML frontmatter with `description` fields:

- `packages/pi/skills/doc-review/SKILL.md`
- `packages/pi/skills/morning-brief/SKILL.md`
- `packages/pi/skills/repurpose/SKILL.md`
- `packages/pi/skills/research-deep/SKILL.md`

A validation check confirmed all `packages/pi/skills/**/SKILL.md` files now include `description:`.

### Missing pieces

- Official Cursor plugins from `https://github.com/cursor/plugins` are not yet present.
- `cursor-team-kit` is not yet imported.
- The build does not yet clearly create first-class Gemini or Cursor packages.
- Existing build outputs primarily target Claude Code, OpenCode, Pi, and ai-eng marketplace plugin directories.

## Goal

Import the official Cursor plugin content, with `cursor-team-kit` as the highest priority, and make the repository produce packages/assets for:

1. Gemini
2. Cursor
3. Pi
4. OpenCode
5. Claude Code

## Cursor Plugins to Add

Import all official Cursor plugins, prioritizing `cursor-team-kit` first:

- `cursor-team-kit`
- `continual-learning`
- `create-plugin`
- `agent-compatibility`
- `cli-for-agent`
- `pr-review-canvas`
- `docs-canvas`
- `cursor-sdk`
- `orchestrate`
- `ralph-loop`
- `teaching`

## Cursor Team Kit Priority Content

`cursor-team-kit` includes high-value skills such as:

- `loop-on-ci`
- `review-and-ship`
- `pr-review-canvas`
- `verify-this`
- `control-cli`
- `control-ui`
- `make-pr-easy-to-review`
- `run-smoke-tests`
- `fix-ci`
- `new-branch-and-pr`
- `get-pr-comments`
- `check-compiler-errors`
- `what-did-i-get-done`
- `weekly-review`
- `fix-merge-conflicts`
- `deslop`
- `workflow-from-chats`
- `thermo-nuclear-code-quality-review`

It also includes agents and rules that should be mapped carefully instead of blindly copied.

## Import Mapping

### Cursor `skills/`

Map to repo skill format:

- Source: Cursor plugin `skills/**/SKILL.md`
- Destination options:
  - canonical: `skills/<skill-name>/SKILL.md`
  - Pi generated/synced: `packages/pi/skills/<skill-name>/SKILL.md`
  - plugin-scoped: `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`

Required normalized frontmatter:

```yaml
---
name: skill-name
description: Clear trigger/use description
version: 1.0.0
tags: [cursor, imported]
---
```

### Cursor `agents/`

Map to agent content or plugin-local agents:

- `content/agents/<agent-name>.md` if broadly useful across ai-eng.
- `plugins/<plugin-name>/agents/<agent-name>.md` if plugin-specific.

### Cursor `rules/*.mdc`

Do not blindly copy into every platform.

Map options:

- Convert durable coding rules into `rules/` or `AGENTS.md` guidance where appropriate.
- Reference rules from related skills.
- Keep plugin-local copies if only relevant to Cursor.

### Cursor `.cursor-plugin/plugin.json`

Use as metadata only:

- plugin name
- description
- author/license
- listed components

Do not assume this manifest works unchanged for Pi, OpenCode, Gemini, or Claude Code.

### Cursor `mcp.json`

Keep separate as MCP configuration. Do not treat as skill content.

## Proposed Package Layout

Add or confirm first-class packages:

```txt
packages/
  claude-code/
  cursor/
  gemini/
  opencode/
  pi/
```

Existing package status:

- `packages/pi/` exists.
- `packages/core/`, `packages/cli/`, and `packages/toolkit/` exist.
- Separate `packages/cursor/`, `packages/gemini/`, `packages/opencode/`, and `packages/claude-code/` still need to be created or intentionally mapped to existing packages.

## Build Changes Needed

Update `build.ts` and related scripts so canonical content generates:

```txt
dist/.claude-plugin/
dist/.opencode/
dist/.pi/
dist/.cursor-plugin/
dist/.gemini/
```

Also sync assets into package directories:

```txt
packages/claude-code/
packages/opencode/
packages/pi/
packages/cursor/
packages/gemini/
```

## Implementation Phases

### Phase 1 — Read-only audit

- Inspect current build pipeline in `build.ts`.
- Identify exactly how `skills/`, `content/agents/`, and `content/commands/` sync to outputs.
- Confirm whether `packages/toolkit` already partially covers Claude/OpenCode packaging.
- Decide whether new packages should be standalone or wrappers around `packages/toolkit`.

### Phase 2 — Import `cursor-team-kit`

- Add imported `cursor-team-kit` source content.
- Normalize all skill frontmatter.
- Map agents and rules deliberately.
- Add MIT attribution/reference to avoid license ambiguity.
- Validate all imported `SKILL.md` files.

### Phase 3 — Import remaining Cursor plugins

- Import remaining official Cursor plugins one at a time.
- Preserve original plugin boundaries under `plugins/cursor-*` or an equivalent namespace.
- Normalize skills and metadata.
- Validate after each plugin import.

### Phase 4 — Add platform packages

- Create package directories/manifests for missing platforms.
- Ensure each package includes only the platform-relevant files.
- Avoid duplicating canonical content manually; prefer build-generated output.

### Phase 5 — Extend build outputs

- Add Cursor output generation.
- Add Gemini output generation.
- Ensure existing Claude Code, OpenCode, and Pi outputs still work.
- Add validation checks for each platform output.

### Phase 6 — Verification

Run focused checks first, then full build when memory pressure is acceptable:

```bash
python3 - <<'PY'
from pathlib import Path
missing=[]
for p in Path('packages/pi/skills').rglob('SKILL.md'):
    text=p.read_text()
    if not text.startswith('---') or 'description:' not in text.split('---',2)[1]:
        missing.append(str(p))
print('\n'.join(missing) or 'ok')
PY
```

Then:

```bash
bun run typecheck
bun run build
bun run validate
```

If memory pressure remains critical, run only narrow validation first.

## Acceptance Criteria

- `cursor-team-kit` content is present and mapped.
- All listed official Cursor plugins are present or explicitly documented as skipped with reason.
- All imported skills have valid `name` and `description` frontmatter.
- Build creates or syncs assets for Gemini, Cursor, Pi, OpenCode, and Claude Code.
- Package manifests exist for each intended platform package or a documented decision explains why an existing package covers that platform.
- Existing ai-eng plugins continue to build.
- License attribution for imported Cursor plugin content is preserved.

## Risks and Constraints

- System memory pressure is critical, so avoid large parallel jobs, large reads, or multi-agent fanout.
- Cursor plugin manifests are platform-specific and should not be treated as universal package definitions.
- Rules and MCP configs need careful mapping; blindly copying them may create invalid packages.
- Build changes should be incremental because `build.ts` is large and already handles multiple outputs.

## Immediate Next Step

Start with Phase 1 and Phase 2 only:

1. Audit the build output functions in `build.ts`.
2. Import `cursor-team-kit` skills first.
3. Validate imported skill frontmatter.
4. Only then proceed to other Cursor plugins and package generation.
