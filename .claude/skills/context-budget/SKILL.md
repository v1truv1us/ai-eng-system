---
name: context-budget
description: Context window management for AI agents. Optimize context usage, prevent overflow, and ensure critical information is always available. Use when working with large codebases or long sessions.
---

# Context Budget

## Overview

Context windows are finite resources. This skill provides strategies for managing context budget effectively — ensuring critical information is always available while staying within limits.

## When to Use

- Session context is growing large
- Agent starts losing track of earlier instructions
- Working with large codebases or long files
- Before starting a complex multi-step task

## Context Budget Tiers

| Tier | Context Used | Strategy |
|------|-------------|----------|
| Green | 0-50% | Normal operation |
| Yellow | 50-75% | Start compressing, remove stale context |
| Orange | 75-90% | Aggressive compression, checkpoint state |
| Red | 90-100% | Checkpoint, start fresh session |

## Optimization Strategies

### 1. Progressive Disclosure
Load information only when needed:
- Skills: description loaded at startup, full content on demand
- References: loaded only when skill requires them
- Code: read only the relevant sections, not entire files

### 2. Context Packing
Compress information without losing meaning:
- Remove redundant instructions
- Summarize long discussions into key decisions
- Replace verbose explanations with references

### 3. Session Checkpointing
Save state before context runs out:
```
Checkpoint:
- Current task: [what you're doing]
- Progress: [what's done]
- Next steps: [what's pending]
- Key decisions: [important choices made]
```

### 4. Context Prioritization
Keep critical information, discard the rest:

| Priority | Keep | Discard |
|----------|------|---------|
| Critical | Current task, active constraints | Completed task details |
| Important | Project conventions, key decisions | Exploration dead ends |
| Nice-to-have | Related patterns, examples | Verbose explanations |
| Disposable | Previous conversation turns | Tool output already processed |

## Monitoring

### Signs of Context Pressure
- Agent repeats questions already answered
- Agent forgets earlier instructions
- Agent starts hallucinating information
- Responses become shorter or less detailed

### Recovery Actions
1. **Checkpoint**: Save current state
2. **Summarize**: Compress conversation into key points
3. **Restart**: Begin new session with checkpoint data
4. **Verify**: Confirm context is correct after restart

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "Context is plenty, no need to optimize" | Context pressure creeps up silently. Monitor usage and optimize proactively. |
| "I'll just keep everything in context" | Full context wastes tokens on stale information. Progressive disclosure is more efficient. |
| "Checkpointing takes too long" | A 30-second checkpoint saves a 30-minute session restart. It pays for itself. |
| "The agent should remember everything" | Context windows are finite. Design workflows that work within constraints. |
