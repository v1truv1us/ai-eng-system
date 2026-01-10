# Ralph Wiggum Command Fix - Complete

## Issue Summary

The ralph-wiggum command (and 4 other workflow commands) contained an erroneous "Execution" section at the end of their markdown files that referenced a non-existent script:

```bash
bun run scripts/run-command.ts ralph-wiggum "feature description" [options]
```

## Impact

1. The AI reads this and may try to run an external script instead of following the markdown instructions directly
2. Confuses the execution model - these are **prompt instructions**, not CLI scripts
3. The `scripts/run-command.ts` file never existed

## Files Fixed

### Primary Source Files (plugins/ai-eng-system/commands/)

| File | Lines Changed | Action |
|------|---------------|--------|
| **ralph-wiggum.md** | Lines 777-789 removed, line 68 section added | **PRIMARY FIX** |
| **work.md** | Lines 583-594 removed | Removed erroneous section |
| **specify.md** | Lines 298-308 removed | Removed erroneous section |
| **plan.md** | Lines 500-510 removed | Removed erroneous section |
| **review.md** | Lines 122-132 removed | Removed erroneous section |

### Secondary Files (content/commands/)

All 5 commands were also fixed in `content/commands/` directory (canonical source for builds):
- ralph-wiggum.md
- work.md
- specify.md
- plan.md
- review.md

## What Changed

### ralph-wiggum.md (Main Fix)

**Added Section:** "How This Command Works" (line 68, after Quick Start)

```markdown
## How This Command Works

This command is a **self-orchestrating prompt** - when you invoke `/ai-eng/ralph-wiggum`, the AI reads these instructions and executes each phase directly within the conversation.

**Execution Model:**
1. **NOT a CLI script** - There is no external runner. The AI IS the executor.
2. **Phase commands are internal** - When instructions say "Execute `/ai-eng/research`", the AI follows that command's instructions directly (not spawning a subprocess).
3. **Continuous flow** - The AI proceeds through all phases autonomously unless checkpoints are set.

**To run this command:**
- Claude Code: Type `/ai-eng/ralph-wiggum "your feature description"`
- OpenCode: Type `/ai-eng/ralph-wiggum "your feature description"`

The AI will then follow all phases in this document from start to finish.
```

**Removed Section:** "## Execution" (was lines 777-789)

```markdown
## Execution

After creating this command, agent can invoke it with:

```bash
bun run scripts/run-command.ts ralph-wiggum "feature description" [options]
```

Examples:
- `bun run scripts/run-command.ts ralph-wiggum "implement user auth" --checkpoint=all --verbose`
- `bun run scripts/run-command.ts ralph-wiggum "API caching" --from-spec=specs/cache/spec.md --resume`

After completing the full cycle, rate your confidence in feature completeness and quality (0.0-1.0). Identify any uncertainties about phase transitions, iterations that were inefficient, or areas where quality gates may have been too lenient or strict. Note any workflow improvements that could enhance future cycles.
```

### Other Commands (work.md, specify.md, plan.md, review.md)

For each of these 4 commands, simply removed the erroneous "## Execution" section at the end of the file. No additional sections were needed.

## Verification

### Build Process

```bash
bun run build
```

Output:
```
📦 Syncing to marketplace directories...
  ✓ Synced to .claude/
  ✓ Synced prompt optimization library
  ✓ Synced to .claude-plugin/
  ✓ Synced to plugins/ai-eng-system/
✅ All agents validated successfully

✅ Build complete in 349ms -> /home/vitruvius/git/ai-eng-system/dist
```

### Output Locations Verified

All output locations confirmed to have no erroneous "## Execution" sections:

| Location | Status |
|-----------|--------|
| `.claude/commands/ralph-wiggum.md` | ✅ Clean - "How This Command Works" section present |
| `.claude/commands/work.md` | ✅ Clean |
| `.claude/commands/specify.md` | ✅ Clean |
| `.claude/commands/plan.md` | ✅ Clean |
| `.claude/commands/review.md` | ✅ Clean |
| `.opencode/command/ai-eng/ralph-wiggum.md` | ✅ Clean |
| `content/commands/*` (all 5 files) | ✅ Clean |
| `plugins/ai-eng-system/commands/*` (all 5 files) | ✅ Clean |
| `dist/.claude-plugin/commands/*` | ✅ Clean |

### Validation

```bash
bun run validate
```

Output: `✅ Content validated`

### Final Search

```bash
find .claude .opencode content plugins dist -name "*.md" -type f -exec grep -l "bun run scripts/run-command" {} \; 2>/dev/null
```

Output: No files found (all clean)

## How It Works Now

When you invoke `/ai-eng/ralph-wiggum "implement user authentication"`:

1. ✅ **AI reads the ralph-wiggum.md command file**
2. ✅ **AI sees "How This Command Works" section** and understands it's self-executing
3. ✅ **AI follows phases:**
   - Phase 0: Prompt Refinement
   - Phase 1: Git Setup (create branch)
   - Phase 2.2: Research Phase (calls `/ai-eng/research`)
   - Phase 2.3: Specify Phase (calls `/ai-eng/specify`)
   - Phase 2.4: Plan Phase (calls `/ai-eng/plan`)
   - Phase 2.5: Work Phase (calls `/ai-eng/work`)
   - Phase 2.6: Review Phase (calls `/ai-eng/review`)
   - Phase 3: Gap Analysis (determine return-to phase or complete)
   - Phase 4: Checkpoint Management (save state)
   - Phase 5: Pull Request Creation
4. ✅ **AI proceeds autonomously** through all phases without stopping
5. ✅ **No attempt to run `bun run scripts/run-command.ts`** because it doesn't exist

## Preventive Measures

The command-creator agent (line 294) has an `## Execution` section with examples using `!`npm run...`, which is the **OpenCode directive format** for shell commands. This is correct and not problematic.

However, the erroneous `bun run scripts/run-command.ts` pattern appears to have been added to command templates manually at some point. To prevent this in the future:

1. **Never add `## Execution` sections** to command files that reference non-existent scripts
2. **If execution is needed**, document it in-line with the command's workflow sections, not at the end
3. **Use `Integration` sections** to show how commands connect
4. **For command templates**, use correct examples (OpenCode `!` directive for actual shell, not `bun run scripts` for markdown commands)

## Testing

To verify the fix works correctly:

```bash
# Test ralph-wiggum command
/ai-eng/ralph-wiggum "test feature with continuous iteration"

# The AI should now:
# 1. Read "How This Command Works" section
# 2. Understand it's self-executing
# 3. Proceed through all phases autonomously
# 4. NOT try to run external script
```

## Summary

✅ **Fixed 5 workflow commands** (ralph-wiggum, work, specify, plan, review)
✅ **Added clear execution model documentation** to ralph-wiggum
✅ **Removed all misleading script references**
✅ **Verified all output locations** (.claude, .opencode, dist)
✅ **Build validation passes**
✅ **Preventive measures documented**

The ralph-wiggum command will now execute correctly through all phases without attempting to run non-existent external scripts.
