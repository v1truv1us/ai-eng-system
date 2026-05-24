---
name: context-engineering
description: Feed agents the right information at the right time. Use when
  starting a session, switching tasks, or when output quality drops due to
  missing or stale context.
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
# Context Engineering

## Overview

Ensure that agents receive the right information at the right time. Context engineering is the practice of actively managing what an agent knows, rather than hoping it discovers what it needs.

## When to Use

- Starting a new development session
- Switching between unrelated tasks
- When agent output quality degrades
- When context window is approaching limits
- Before delegating to a subagent

## Context Sources

### Rules Files

- `CLAUDE.md`, `AGENTS.md`, `.claude/rules/`: persistent project-level guidance
- Load automatically at session start
- Keep concise and actionable

### Context Packing

When starting a task, gather:
- Relevant source files (not the entire codebase)
- Related test files
- Type definitions and interfaces
- Recent git diff for the area of change
- Any existing spec or plan

### MCP Integrations

- Use documentation lookup tools for library-specific guidance
- Use search tools for cross-repository patterns
- Favor structured retrieval over dumping large files into context

## Process

### Step 1: Assess Current Context

- What does the agent already know?
- What files has it read?
- What context was loaded at session start?

### Step 2: Identify Gaps

- What information is needed for the current task?
- What is missing from the current context?
- What is stale or potentially outdated?

### Step 3: Pack Targeted Context

- Load only the files relevant to the current task
- Include type definitions for modified interfaces
- Include test files that define expected behavior
- Include recent changes to the affected area

### Step 4: Verify Context Quality

- Can the agent describe the current state of the affected code?
- Does it know the testing strategy for the area?
- Does it know the relevant constraints and boundaries?

### Step 5: Manage Context Budget

- Monitor context window usage
- Compact or checkpoint when approaching limits
- Drop stale context before loading new context

## Delegation Context

When delegating to a subagent, include:
- Goal: one sentence describing what to accomplish
- Scope: what files and areas to focus on
- Constraints: what must be preserved or avoided
- Deliverable: what format the output should take
- Known context: what has already been checked

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The agent can search the codebase itself" | Search is expensive and imprecise. Targeted context is faster and more accurate. |
| "More context is always better" | Excess context wastes window space and increases noise. |
| "I will load context once at the start" | Context needs change as tasks progress. |

## Verification

- [ ] Agent has the specific files needed for the current task
- [ ] Type definitions and interfaces are available
- [ ] Test files are loaded for the affected area
- [ ] Context window is not approaching limits

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "The agent can search the codebase itself" | Search is expensive and imprecise. Targeted context is faster and more accurate. |
| "More context is always better" | Excess context wastes window space and increases noise. Pack only what is needed. |
| "I'll load context once at the start" | Context needs change as tasks progress. Reassess and repack as you go. |
| "The agent already knows the project" | Agents do not retain knowledge across sessions. Pack context every time. |
| "Context packing takes too much time" | Poor context causes more time wasted on wrong answers than packing ever costs. |
