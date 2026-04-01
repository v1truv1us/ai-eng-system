---
name: ai-eng/simplify
description: Review recently changed files for code reuse, quality, and efficiency issues, then fix them
agent: build
version: 1.0.0
inputs:
  - name: focus
    type: string
    required: false
    description: "Focus area: readability, performance, duplication, error handling"
---

# Simplify Command

Load `skills/ai-eng/simplify/SKILL.md` and follow its instructions. Spawn three parallel review agents (code reuse, quality, efficiency), aggregate findings, and apply fixes.

## Workflow

1. Run `git diff --stat` to identify recently changed files
2. Spawn three parallel agents:
   - **Code Reuse**: Duplicated logic, extractable functions
   - **Quality**: Dead code, poor naming, complexity
   - **Efficiency**: Performance, allocations, algorithms
3. Aggregate and prioritize findings
4. Apply fixes, verify tests pass
5. Report confidence score

## Usage

```
/ai-eng/simplify
/ai-eng/simplify focus on memory efficiency
/ai-eng/simplify focus on readability
```

## Integration

Combine with the spec-driven workflow:

```
/ai-eng/work "implement feature X"
/ai-eng/simplify
/ai-eng/review
```
