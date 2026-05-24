---
name: context-budget
description: Context window management for AI agents. Optimize context usage,
  prevent overflow, and ensure critical information is always available. Use
  when working with large codebases or long sessions.
---

## Pi Context-Aware Execution

When this skill is invoked in Pi, treat the user's current request and any skill arguments as the task input. Do not treat this file as the task by itself.

Before applying the skill, establish only the context needed for the request:

1. Identify the current working directory and relevant project scope.
2. Read local guidance first when present: AGENTS.md, CLAUDE.md, TODO.md, or nearby task/spec files.
3. Inspect the current codebase with targeted searches (prefer rg) and read relevant files before making claims or proposing changes.
4. Ground findings and recommendations in project evidence: cite file paths, commands, tests, docs, or external sources as applicable.
5. Ask a concise clarification only when the arguments and codebase context are insufficient to proceed safely.

Operate conservatively: avoid broad scans, large reads, subagents, or parallel fanout unless the user's requested depth clearly requires them.
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
