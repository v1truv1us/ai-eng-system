---
name: dynamic-task
description: >
  Route a task to the right Anthropic-powered subagent. The conductor
  assesses complexity and intent, then dispatches to LookupAgent (Haiku),
  WorkAgent (Sonnet), PlannerAgent (Opus), DebuggerAgent (Sonnet), or
  RefactorAgent (Opus).
arguments:
  - name: task
    description: The task to route and execute.
    required: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# /dynamic-task

Route a task to the optimal Anthropic model via the dynamic-claude-router conductor.

## Usage

```
/dynamic-task "find all TypeScript files in the project"
/dynamic-task "implement a new REST endpoint for user profiles"
/dynamic-task "design a real-time notification system"
/dynamic-task "plan and implement a new caching layer"
```

## How It Works

1. The conductor assesses task complexity (trivial, moderate, complex).
2. It detects intent (lookup, implementation, planning, debugging, refactoring).
3. It routes to the appropriate subagent:
   - **LookupAgent** (claude-haiku-4-5-20251001) — quick scans and lookups
   - **WorkAgent** (claude-sonnet-4-6) — coding and implementation
   - **PlannerAgent** (claude-opus-4-8) — architecture and planning
   - **DebuggerAgent** (claude-sonnet-4-6) — debugging and root-cause analysis
   - **RefactorAgent** (claude-opus-4-8) — refactoring and restructuring
4. For combined tasks ("plan and implement"), it chains subagents automatically.

## Execution

When this command is invoked:

1. Load the `dynamic-claude-router` skill.
2. Import `conduct` from `src/agents/claude-router`.
3. Call `conduct({ task: "<user's task>" })`.
4. Present the routing decision and results to the user.
