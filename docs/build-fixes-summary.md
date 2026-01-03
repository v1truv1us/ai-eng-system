# Build System Fixes - Summary

## Date
2025-01-02

## Issues Fixed

### 1. Missing Constant Definitions
- Added `ROOT_OPENCODE_DIR` constant
- Added `NAMESPACE_PREFIX` constant
- Added Bun types reference for TypeScript

### 2. Undefined Variable Error
- Fixed `claudeHooksDir` undefined in `syncToLocalClaude()`
- Now properly defines `const claudeHooksDir = join(ROOT_CLAUDE_DIR, "hooks")`

### 3. Syntax/Structure Errors
- Removed duplicate closing braces in `syncToLocalClaude()` function
- Removed orphaned code fragment (lines 711-720) that duplicated `syncToClaudePlugin()` logic
- Fixed duplicate console.log statements

### 4. Hook Packaging Strategy
**Problem:** Hooks were being flattened when copied, losing directory structure required for Claude Code runtime.

**Solution:** Established canonical source structure:
- **Canonical:** `.claude/hooks/` is the authoritative source for Claude hooks
- **Derived outputs:** Hooks are now copied with directory structure preserved to:
  - `dist/.claude-plugin/hooks/` (for CI/tests)
  - `.claude-plugin/hooks/` (for local development)
  - `plugins/ai-eng-system/hooks/` (for marketplace distribution)

### 5. Build Flow Updates

#### `buildClaude()`
- Removed auto-generated `hooks.json` (only had SessionStart)
- Now copies entire `.claude/hooks/` directory from canonical source

#### `syncToLocalClaude()`
- Copies only hook files to `.claude/hooks/` (preserving structure)
- Removed prompt optimization library files from this sync (they belong in dist/)
- Properly defines `claudeHooksDir`

#### `syncPromptOptimizationLibrary()`
- Only copies prompt optimization library files to `dist/.claude-plugin/`
- No longer tries to copy hooks (handled by `buildClaude()`)

#### `syncToClaudePlugin()`
- Copies hooks directory from `dist/.claude-plugin/hooks/` to `.claude-plugin/hooks/`
- Preserves directory structure

#### `syncToMarketplacePlugin()`
- Copies hooks directory from `dist/.claude-plugin/hooks/` to `plugins/ai-eng-system/hooks/`
- Preserves directory structure for marketplace distribution

## Canonical Source/Derived Output Matrix

| Artifact | Canonical Source | Derived Outputs |
|----------|----------------|-----------------|
| Commands | `content/commands/` | `dist/.claude-plugin/commands/`, `.claude/commands/`, `plugins/ai-eng-system/commands/` |
| Agents | `content/agents/` | `dist/.claude-plugin/agents/`, `dist/.opencode/agent/`, `.opencode/agent/`, `.claude/agents/`, `plugins/ai-eng-system/agents/` |
| Skills | `skills/**/SKILL.md` (nested) | `dist/.claude-plugin/skills/`, `dist/skills/`, `.claude/skills/`, `plugins/ai-eng-system/skills/` |
| Claude Hooks | `.claude/hooks/` | `dist/.claude-plugin/hooks/`, `.claude/hooks/`, `.claude-plugin/hooks/`, `plugins/ai-eng-system/hooks/` |
| OpenCode Tool | `src/opencode-tool-prompt-optimize.ts` | `dist/.opencode/tool/prompt-optimize.ts`, `.opencode/tool/prompt-optimize.ts` |
| Prompt Optimization Library | `src/prompt-optimization/*` | `dist/prompt-optimization/*`, `dist/.claude-plugin/*.ts` (for npm package) |

## Next Steps

1. ✅ Build script is now structurally sound
2. ⏭️ Implement JSON-based OpenCode tool (returns structured prompt + steps)
3. ⏭️ Update installation scripts to automatically place hooks in consumer project's `.claude/hooks/`
4. ⏭️ Test full build pipeline to verify hook distribution
5. ⏭️ Implement step-by-step approval UX (multi-turn conversation orchestration)
