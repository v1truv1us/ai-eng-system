# Prompt Optimization System - Implementation Plan

## Status
✅ Build system repaired and canonical structure established
✅ OpenCode tool updated to return structured JSON

## Next Steps

### 1. Installation Script Enhancement (Priority: High)
**Goal:** Automatically place hook files into consumer project's `.claude/hooks/` on marketplace install.

**Files to update:**
- `scripts/install.js` (or create new install script)

**Requirements:**
- Read canonical hooks from `plugins/ai-eng-system/hooks/`
- Copy to user's project `.claude/hooks/`
- Preserve directory structure
- Handle existing `.claude/hooks/` (backup or merge)
- Support both global and local install modes

**Implementation approach:**
```javascript
// In install.js
const hookSrc = join(pluginDir, 'hooks');
const hookDest = join(process.cwd(), '.claude', 'hooks');

// Copy hooks
if (existsSync(hookDest)) {
  // Backup existing hooks
  await copyDirRecursive(hookDest, `${hookDest}.backup`);
}
await copyDirRecursive(hookSrc, hookDest);

console.log('✓ Claude prompt optimization hooks installed to .claude/hooks/');
```

### 2. Step-by-Step Approval UX (Priority: Medium)
**Goal:** Interactive flow where user can approve/modify each optimization step.

**Approach:** Multi-turn conversation orchestrated by commands, not by tools directly.

**Implementation phases:**

#### Phase 1: Tool-First Approach
- Tool already returns JSON with steps
- Command parses tool output
- Command asks user: approve all / approve step N / modify step N / edit final

#### Phase 2: Command Enhancement
Update `/ai-eng/optimize` command to:
1. Call `prompt-optimize` tool
2. Parse JSON result
3. Display steps with before/after
4. Guide user through approval flow
5. Apply approvals and return final prompt

**Example interaction:**
```
User: /ai-eng/optimize "help me debug authentication"

Tool returns: {
  version: 1,
  steps: [
    { id: "persona", title: "Expert Persona", after: "You are a senior security engineer..." },
    { id: "reasoning", title: "Step-by-Step Reasoning", after: "Take a deep breath..." }
  ],
  optimizedPrompt: "You are a senior security engineer...\n\nTake a deep breath..."
}

Command displays:
📋 Prompt Optimization Plan (complex, security)

Step 1: Expert Persona
  after: You are a senior security engineer with 15+ years of authentication experience.

Step 2: Step-by-Step Reasoning
  after: Take a deep breath and analyze this step by step.

Step 3: Stakes Language
  after: This is important for the project's success...

Options:
  1. Approve all steps
  2. Approve step 1 only
  3. Modify step 1
  4. Edit final prompt
  5. Cancel

User: 1

Command: ✓ All steps approved. Using optimized prompt.
```

#### Phase 3: Claude Code Hook Enhancement
**Challenge:** `UserPromptSubmit` hooks don't naturally support multi-turn interaction.

**Options:**

**Option A (Recommended):** Hook does silent optimization, command provides interactive flow
- Hook: Always optimizes automatically (or reads config)
- User can use `/ai-eng/optimize` command for interactive review
- Hook respects `!` prefix and config settings

**Option B:** Hook injects multi-turn flow into conversation
- Hook rewrites prompt AND adds a "review steps?" suggestion
- Complex and may break expected UX

**Option C:** Hook delegates to command automatically
- Hook calls `prompt-optimize` tool
- Hook returns optimized prompt + suggestion: "To review steps, use /ai-eng/optimize"
- Balances automatic optimization with optional review

**Recommendation:** Start with Option A (automatic + optional review), evolve to Option C if needed.

### 3. Configuration Management (Priority: Medium)
**Goal:** Store configuration in `.claude/ai-eng-config.json`.

**Current config structure:**
```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": false,
    "verbosity": "normal",
    "escapePrefix": "!"
  }
}
```

**Enhancements needed:**
- Hook reads config file
- Defaults to `true` if not present
- Config controls:
  - `enabled`: Enable/disable prompt optimization
  - `autoApprove`: Skip interactive approval (use all steps)
  - `verbosity`: "quiet" | "normal" | "verbose"
  - `escapePrefix`: Character to bypass optimization
- Session commands update config:
  - `/optimize-auto on|off` → set autoApprove
  - `/optimize-verbosity quiet|normal|verbose` → set verbosity
  - `/optimize-toggle` → enable/disable

### 4. Verification and Testing (Priority: High)

#### Build Verification
```bash
# Run build
bun run build

# Verify artifacts
ls -la dist/.claude-plugin/hooks/
ls -la .claude/hooks/
ls -la plugins/ai-eng-system/hooks/
ls -la dist/.opencode/tool/prompt-optimize.ts

# Verify marketplace plugin has hooks
ls -la plugins/ai-eng-system/hooks/
cat plugins/ai-eng-system/hooks/hooks.json
```

#### Hook Verification
```bash
# Test escape hatch
echo "Test bypass" | # Should use original prompt when prefixed with !

# Test optimization
echo "help me design authentication system" | # Should optimize (complex + security)
```

#### OpenCode Tool Verification
```bash
# Test tool returns valid JSON
# Test schema version 1
# Test skip with ! prefix
# Test simple prompt skip
```

## Implementation Order

1. ✅ Fix build.ts (done)
2. ✅ Update OpenCode tool to JSON (done)
3. ⏭️ Implement installation script for hooks
4. ⏭️ Update `/ai-eng/optimize` command for step-by-step flow
5. ⏭️ Implement config file reading in hooks
6. ⏭️ Add session toggle commands
7. ⏭️ Test full pipeline end-to-end
8. ⏭️ Document usage and verify marketplace install

## Files to Create/Update

### New Files
- `docs/prompt-optimization-implementation-plan.md` (this file)
- `scripts/install-hooks.js` (or update existing `install.js`)

### Update Files
- `content/commands/optimize.md` (add step-by-step flow instructions)
- `.claude/hooks/prompt-optimizer-hook.py` (add config file reading)
- `src/prompt-optimization/` (add config schema if needed)

## Open Questions

1. **Hook UX:** Should hook show "optimized with X steps" message? (verbosity control)
2. **Session commands:** Implement as actual commands or just CLI args?
3. **Config defaults:** Should install create default config or auto-create on first use?
4. **Marketplace hooks:** Should marketplace plugin include install script or rely on separate installation?
5. **OpenCode tool:** Should tool support "stateful" updates (apply steps + user edits in one call)?

## Success Criteria

- [ ] Build completes without errors
- [ ] Hooks are in `.claude/hooks/` after install
- [ ] Marketplace plugin includes hooks directory
- [ ] OpenCode tool returns valid JSON with version 1
- [ ] Escape hatch (`!` prefix) works correctly
- [ ] Config file is read and respected
- [ ] Step-by-step flow works in `/ai-eng/optimize` command
- [ ] Session toggle commands work
- [ ] Documentation is complete and accurate
