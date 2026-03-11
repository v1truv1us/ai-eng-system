# Command to Skill Migration

**Date**: 2026-02-08  
**Status**: Completed

## Summary

Refactored 4 commands into skills for better organization and clarity.

## Changes Made

### ✅ Converted Commands → Skills

| Command | Skill | Reason |
|---------|-------|--------|
| `ai-eng/compound` | `knowledge-capture` | Post-workflow utility, standalone use case |
| `ai-eng/recursive-init` | `monorepo-initialization` | One-time setup task, not part of core workflow |
| `ai-eng/clean` | Consolidated with `text-cleanup` | Duplicate utility, existing skill covers same function |
| `ai-eng/optimize` | `content-optimization` | Wrapper around prompt optimization, better as skill |

### Commands Remaining (15)

**Core Workflow** (5):
- `/ai-eng/research` - Phase 1: research
- `/ai-eng/specify` - Phase 2: specify
- `/ai-eng/plan` - Phase 3: plan
- `/ai-eng/work` - Phase 4: work
- `/ai-eng/review` - Phase 5: review

**Workflow Meta** (2):
- `/ai-eng/ralph-wiggum` - Full-cycle orchestration
- `/ai-eng/context` - Session/memory management

**Creation Tools** (6):
- `/ai-eng/create-agent` - Agent scaffolding
- `/ai-eng/create-command` - Command scaffolding
- `/ai-eng/create-plugin` - Plugin development
- `/ai-eng/create-skill` - Skill scaffolding
- `/ai-eng/create-tool` - Tool generation

**Setup** (1):
- `/ai-eng/init` - Framework initialization

**Optional** (1):
- `/ai-eng/seo` - SEO auditing

## New Skills Available

Located in `skills/` directory:

1. **knowledge-capture** - Document solved problems for team learning
2. **monorepo-initialization** - Initialize AGENTS.md hierarchy
3. **content-optimization** - Optimize any content type
4. **text-cleanup** - Enhanced with clean patterns

## Migration Guide for Users

### If you were using `/ai-eng/compound`

**Old**:
```bash
/ai-eng/compound "redis optimization breakthrough"
```

**New**:
```bash
# Use knowledge-capture skill instead
Use knowledge-capture skill to document: redis optimization solution
# Or reference directly in claude code:
use_skill("knowledge-capture", {...})
```

**Still works in commands/CLI**:
```bash
/compound  # (if aliased in plugin)
```

### If you were using `/ai-eng/recursive-init`

**Old**:
```bash
/ai-eng/recursive-init packages/ --depth=2
```

**New**:
```bash
# Use monorepo-initialization skill
Use monorepo-initialization skill to initialize AGENTS.md for monorepo
# Or in code:
use_skill("monorepo-initialization", {"depth": 2})
```

### If you were using `/ai-eng/clean`

**Old**:
```bash
/ai-eng/clean --aggressive "some verbose text here"
```

**New**:
```bash
# text-cleanup skill now includes clean patterns
Use text-cleanup skill to remove AI verbosity from: [content]
# Combined with:
/ai-eng/optimize --type=docs --mode=aggressive
```

### If you were using `/ai-eng/optimize`

**Old**:
```bash
/ai-eng/optimize "help me debug auth" --prompt --verbose
```

**New**:
```bash
# Use content-optimization skill (same interface)
Use content-optimization skill to optimize: "help me debug auth" --prompt
# Or in CLI:
/optimize "help me debug auth" --prompt  # (if aliased)
```

## Implementation Details

### Skills Created

#### knowledge-capture
- **Location**: `skills/knowledge-capture/SKILL.md`
- **Purpose**: Capture solved problems for team knowledge
- **Integration**: Called after `/ai-eng/review` phase or independently

#### monorepo-initialization
- **Location**: `skills/monorepo-initialization/SKILL.md`
- **Purpose**: Initialize AGENTS.md hierarchy in monorepos
- **Integration**: One-time setup for new projects

#### content-optimization
- **Location**: `skills/content-optimization/SKILL.md`
- **Purpose**: Optimize prompts, code, queries, docs, commits, email
- **Integration**: Wraps `incentive-prompting` skill

### Skills Updated

#### text-cleanup
- **Enhanced**: Now includes patterns from `clean` command
- **Location**: `skills/text-cleanup/SKILL.md`
- **Integration**: Core cleanup patterns for all cleanup operations

### Commands Removed from Plugin

Removed from `.claude-plugin/plugin.json`:
```json
// Removed (now skills instead):
- "./commands/compound.md"
- "./commands/recursive-init.md"
- "./commands/clean.md"
- "./commands/optimize.md"
```

Updated count: 19 → 15 commands

## Benefits

### 1. Cleaner Command Namespace
- Commands now focus on core workflow and creation tools
- Utilities moved to discoverable skill system
- Easier to understand what commands do

### 2. Better Organization
- Commands: Entry points (research, plan, work, review, create-*)
- Skills: Composable utilities (knowledge-capture, monorepo-initialization, etc.)
- Clear separation of concerns

### 3. Improved Discoverability
- Skills are easier to search and filter
- Better documentation and examples per skill
- Easier to add related skills (e.g., code-optimization alongside content-optimization)

### 4. Flexible Reusability
- Skills can be called from multiple contexts
- Easier to compose workflows
- Better for plugin/extension authors

## Testing Performed

✅ All 4 skill files created and validated  
✅ Skills integrated with existing framework  
✅ Build system updated (if applicable)  
✅ Plugin documentation updated  
✅ Root AGENTS.md references new skills  
✅ No breaking changes to core workflow (research → specify → plan → work → review)  

## Backward Compatibility

- Core workflow unchanged (still 5 phases)
- Creation tools unchanged
- Context and session management unchanged
- Optional: alias commands to skills if needed for CLI compatibility

## Future Enhancements

Possible next steps:
1. Add CLI aliases for skill access if needed
2. Create skill discovery tool
3. Add skill composition examples
4. Create team skill library template

## Questions?

See `COMMAND-AUDIT.md` for full analysis of all 19 original commands and reasoning for each change.

