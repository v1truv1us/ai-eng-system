---
name: ai-eng/simplify
description: Review recently changed files for code reuse, quality, and efficiency issues, then fix them
agent: build
version: 2.0.0
inputs:
  - name: focus
    type: string
    required: false
    description: "Focus area: readability, performance, duplication, error handling"
---

# Simplify Command

Load `skills/code-simplification/SKILL.md`.

Review recently changed files for code reuse, quality, and efficiency issues, then fix them.

## Workflow

1. Run `git diff --stat` to identify recently changed files
2. For each changed file, apply the simplification skill:
   - Understand before changing (Chesterton's Fence)
   - Identify: deep nesting, long functions, duplicate logic, misleading names, unnecessary wrappers
   - Apply one simplification at a time
   - Verify tests pass after each change
3. Report what was simplified with before/after summary

## Usage

```
/ai-eng/simplify
/ai-eng/simplify focus on memory efficiency
/ai-eng/simplify focus on readability
```

## Integration

Use within the spec-driven workflow:

```
/ai-eng/work "implement feature X"
/ai-eng/simplify
/ai-eng/review
```
