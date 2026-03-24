---
title: "Command Migration Guide"
description: "How to migrate from old commands to new skills. Before/after examples for all four command conversions."
---

# Command Migration Guide

Complete guide for migrating from removed commands to new skills.

## Quick Reference

| Old Command | New Location | Migration Notes |
|-------------|--------------|-----------------|
| `/ai-eng/compound` | `knowledge-capture` skill | Same functionality, better organized |
| `/ai-eng/recursive-init` | `monorepo-initialization` skill | Same functionality, better organized |
| `/ai-eng/clean` | `text-cleanup` skill + `/ai-eng/optimize` | Consolidated and enhanced |
| `/ai-eng/optimize` | `content-optimization` skill | Exact same interface as before |

---

## Migration: /ai-eng/compound → knowledge-capture

### What It Does
Documents solved problems to build cumulative team knowledge.

### Before
```bash
/ai-eng/compound "redis connection pooling optimization"
# Prompted for documentation location
# Created docs/solutions/performance/redis-pooling.md
```

### After
```bash
# Claude Code
Use knowledge-capture skill to document: redis connection pooling optimization

# OpenCode / Python
use_skill("knowledge-capture", {
  "problem": "Redis connection exhaustion under load",
  "solution": "Implemented connection pooling with these settings...",
  "category": "performance"
})
```

### What's the Same
- Same output format (markdown file in docs/solutions/)
- Same documentation structure
- Same quality standards

### What's Better
- More discoverable as a skill
- Can be used independently
- Composable with other skills
- Better for team library of solutions

---

## Migration: /ai-eng/recursive-init → monorepo-initialization

### What It Does
Recursively initializes AGENTS.md in project subdirectories.

### Before
```bash
/ai-eng/recursive-init packages/ --depth=2
# Or with options:
/ai-eng/recursive-init . --min-score=7 --batch-size=5
```

### After
```bash
# Claude Code
Use monorepo-initialization skill to initialize AGENTS.md for project with depth=2

# OpenCode / Python
use_skill("monorepo-initialization", {
  "path": "packages/",
  "depth": 2,
  "min_score": 5,
  "batch_size": 3
})
```

### What's the Same
- Same discovery algorithm
- Same directory scoring
- Same hierarchy metadata
- Same output structure

### What's Better
- Easier to integrate into workflows
- Can be called from other contexts
- Better for monorepo setup tooling
- More reusable across projects

---

## Migration: /ai-eng/clean → text-cleanup skill + /ai-eng/optimize

### What It Does
Removes AI-generated verbosity and slop patterns.

### Before
```bash
/ai-eng/clean "verbose text here" --aggressive
# Or on files:
/ai-eng/clean src/auth.js --aggressive
# Or on git:
/ai-eng/clean --staged
```

### After (Option 1: text-cleanup skill)
```bash
# Claude Code
Use text-cleanup skill to remove verbosity from: verbose text here

# OpenCode / Python
use_skill("text-cleanup", {
  "content": "verbose text here",
  "mode": "aggressive"
})
```

### After (Option 2: combine with optimize)
```bash
# For documentation cleanup
/ai-eng/optimize "verbose documentation" --type=docs --mode=aggressive

# For code comments
/ai-eng/optimize src/auth.js --type=code --mode=aggressive
```

### What's the Same
- Same cleanup patterns (preambles, hedging, politeness, transitions)
- Same conservative/moderate/aggressive modes
- Same quality standards

### What's Better
- Integrated with comprehensive optimization
- Can target specific content types
- Better for batch cleanup operations
- Reusable as a skill

---

## Migration: /ai-eng/optimize → content-optimization

### What It Does
Enhance any content type using research-backed techniques.

### Before
```bash
/ai-eng/optimize "help me debug auth" --prompt --verbose
/ai-eng/optimize "SELECT * FROM users" --query --preview
/ai-eng/optimize src/auth.js --code --apply
/ai-eng/optimize "fix: resolve login bug" --commit
```

### After
```bash
# Same interface in Claude Code or OpenCode
Use content-optimization skill to optimize: "help me debug auth" --prompt

# Or programmatically:
use_skill("content-optimization", {
  "content": "help me debug auth",
  "type": "prompt",
  "mode": "moderate",
  "preview": False,
  "apply": True
})
```

### What's the Same
- **Exact same command interface** (all flags work the same)
- Same optimization techniques
- Same content type support (prompt, code, query, commit, docs, email)
- Same research-backed approach
- Same approval workflow for prompts

### What's Better
- Now available as reusable skill
- Can be called from other workflows
- Better for composition
- More modular architecture

---

## How to Update Your Workflows

### If You Have Scripts

**Before**:
```bash
#!/bin/bash
/ai-eng/compound "documentation update"
/ai-eng/recursive-init packages/
/ai-eng/clean --aggressive docs/
/ai-eng/optimize "refactor database query" --query
```

**After**:
```bash
#!/bin/bash
# Same commands still work! Or use skills:
# Use knowledge-capture skill to document: documentation update
# Use monorepo-initialization skill to initialize: packages/
# Use text-cleanup skill to clean: docs/
# Use content-optimization skill to optimize: "refactor..." --query
```

### If You Have Claude Code Workflows

**Before**:
```
Phase 1: /ai-eng/research
Phase 2: /ai-eng/specify
Phase 3: /ai-eng/plan
Phase 4: /ai-eng/work
Phase 5: /ai-eng/review
Phase 6: /ai-eng/compound (document)
Phase 7: /ai-eng/optimize (refactor docs)
Phase 8: /ai-eng/clean (cleanup)
```

**After**:
```
Phase 1: /ai-eng/research
Phase 2: /ai-eng/specify
Phase 3: /ai-eng/plan
Phase 4: /ai-eng/work
Phase 5: /ai-eng/review
Phase 6: Use knowledge-capture skill to document
Phase 7: Use content-optimization skill to optimize
Phase 8: Use text-cleanup skill to clean

(Or keep using /ai-eng/optimize if you prefer)
```

---

## FAQ

### Q: Do I have to change anything?
**A**: No! `/ai-eng/optimize` and `/ai-eng/clean` still work as commands. Only `/ai-eng/compound` and `/ai-eng/recursive-init` are now skills. But using the skills is recommended for better composability.

### Q: Will my existing scripts break?
**A**: No. The four removed commands are now skills, but if you're not using them, your workflow continues unchanged. The core 5-phase workflow is untouched.

### Q: How do I use skills in Claude Code?
**A**: 
```
Use [skill-name] skill to [action]: [content]
```

Example:
```
Use knowledge-capture skill to document: Redis optimization breakthrough
```

### Q: How do I use skills in OpenCode?
**A**:
- Reference in command prompts
- Or use programmatically via the skills API

### Q: Are the skill versions the same as before?
**A**: Yes. The functionality is identical. Only the delivery mechanism changed (command → skill).

### Q: Will there be `/ai-eng/` aliases for skills?
**A**: Not by default, but they can be added if needed. Currently access via skill system.

### Q: What if I prefer the old command names?
**A**: The migrations are 1:1 equivalent. You can create aliases or wrappers if desired.

---

## Summary

**The migration is minimal for most users**:
- ✅ Core 5-phase workflow unchanged
- ✅ Optional: Use new skills for better organization
- ✅ `/ai-eng/optimize` and `/ai-eng/clean` still work as before
- ✅ Full backward compatibility

**For new projects**:
- 🎯 Use skills for cleaner integration
- 🎯 Better composability
- 🎯 More discoverable

For questions, see the [Refactoring Overview](/refactoring/overview) or the [Skill Documentation](/skills).

