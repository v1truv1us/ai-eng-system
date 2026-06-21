---
name: dynamic-claude-router
description: Conductor/subagent routing for tasks across multiple harnesses. Assesses task complexity and intent, then dispatches to the appropriate subagent model via a harness-specific adapter. Supports Anthropic (Claude), Cursor, OpenCode, Codex (OpenAI), and Pi adapters. Use via /dynamic-task command or direct invocation from other skills.
metadata:
  category: user-invoked
  version: 2.0.0
  tags: routing, conductor, subagent, adapter, anthropic, cursor, opencode, codex, pi
disable-model-invocation: true
---

# Dynamic Router

## Overview

The Dynamic Router is a conductor/subagent system that routes tasks to the right model based on task complexity and intent. It works across multiple harnesses (Anthropic, Cursor, OpenCode, Codex/OpenAI, Pi) via a shared core + adapter pattern.

**Key principle:** Use the cheapest model that can do the job well. The conductor assesses the task, the adapter maps it to the right model for the current harness.

## Architecture

```
User Task
    │
    ▼
┌─────────────┐
│  Conductor   │  Assesses complexity + intent
│  (core)      │  Builds execution plan
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│           Model Family Config             │
│   (role → model mapping per harness)     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│            Adapter Dispatch               │
│                                          │
│  anthropic  ── claude-haiku-4-5 / sonnet-4-6 / opus-4-8│
│  cursor     ── composer-mini / composer-2.5 │
│  opencode   ── haiku / sonnet-4 / opus-4  │
│  codex      ── gpt-5.4-mini / gpt-5.4 / gpt-5.5  │
│  pi         ── haiku / sonnet-4 / opus-4   │
└──────────────────────────────────────────┘
```

## Model Families

### Anthropic (default)

| Role | Model | Use For |
|------|-------|---------|
| LookupAgent | claude-haiku-4-5-20251001 | File scanning, quick lookups |
| WorkAgent | claude-sonnet-4-6 | Implementation, standard coding |
| PlannerAgent | claude-opus-4-8 | Architecture, planning, hard problems |
| DebuggerAgent | claude-sonnet-4-6 | Debugging, root-cause analysis |
| RefactorAgent | claude-opus-4-8 | Restructuring, design improvement |

### Cursor

| Role | Model | Use For |
|------|-------|---------|
| LookupAgent | composer-mini | Quick scans, lookups |
| WorkAgent | composer-2.5 | Standard coding tasks |
| PlannerAgent | composer-2.5 | Architecture, planning |
| DebuggerAgent | composer-2.5 | Debugging |
| RefactorAgent | composer-2.5 | Refactoring |

### OpenCode (hybrid Kimi + OpenAI)

Source: Kimi API (api.moonshot.cn/v1, OpenAI-compatible), OpenAI API

| Role | Model | Use For |
|------|-------|---------|
| LookupAgent | kimi-k2.6 | Quick scans (cost-efficient) |
| WorkAgent | kimi-k2.6 | Standard coding (cost-efficient) |
| PlannerAgent | gpt-5.5 | Architecture, planning |
| DebuggerAgent | kimi-k2.6 | Debugging (cost-efficient) |
| RefactorAgent | gpt-5.5 | Refactoring |

Override per-role via env vars: `OPENCODE_MODEL_LOOKUP`, `OPENCODE_MODEL_WORK`, etc.

### Codex (OpenAI)

| Role | Model | Use For |
|------|-------|---------|
| LookupAgent | gpt-5.4-mini | Quick scans |
| WorkAgent | gpt-5.4 | Standard coding |
| PlannerAgent | gpt-5.5 | Architecture, planning |
| DebuggerAgent | gpt-5.4 | Debugging |
| RefactorAgent | gpt-5.5 | Refactoring |

Override per-role via env vars: `OPENAI_MODEL_LOOKUP`, `OPENAI_MODEL_WORK`, etc.

### Pi (hybrid Kimi + OpenAI)

Source: Kimi API (api.moonshot.cn/v1, OpenAI-compatible), OpenAI API

| Role | Model | Use For |
|------|-------|---------|
| LookupAgent | kimi-k2.6 | Quick scans (cost-efficient) |
| WorkAgent | kimi-k2.6 | Standard coding (cost-efficient) |
| PlannerAgent | gpt-5.5 | Architecture, planning |
| DebuggerAgent | kimi-k2.6 | Debugging (cost-efficient) |
| RefactorAgent | gpt-5.5 | Refactoring |

Override per-role via env vars: `PI_MODEL_LOOKUP`, `PI_MODEL_WORK`, etc.

## Routing Logic

The conductor classifies tasks into three complexity tiers:

| Complexity | Signals | Example |
|------------|---------|---------|
| Trivial | find, scan, search, list, quick, show | "find all files with TODO" |
| Moderate | implement, fix, write, add, update, test | "implement user signup endpoint" |
| Complex | architect, design, plan, migrate, evaluate | "design a real-time notification system" |

Intent categories: Lookup, Implementation, Planning, Debugging, Refactoring.

Tasks that combine planning and implementation are automatically chained into multi-step plans.

## Usage

### CLI Command

```bash
# Defaults to Anthropic adapter
/dynamic-task "find all TypeScript files in the project"

# Specify harness
/dynamic-task --harness cursor "implement a new REST endpoint"
/dynamic-task --harness codex "design a real-time notification system"
```

### Programmatic

```typescript
import { conduct, routeTask, planTask } from "./src/agents/claude-router";

// Default (Anthropic)
const result = await conduct({ task: "fix the auth bug" });

// Specific harness
const result = await conduct({ task: "fix the auth bug" }, "cursor");
const result = await conduct({ task: "fix the auth bug" }, "codex");

// Quick route
const decision = routeTask("design a new architecture", "codex");
// → { role: "planner", model: "gpt-5.5" }

// Build plan
const plan = planTask("plan and implement a feature", "cursor");
// → { isChained: true, steps: [planner, work] }
```

### Custom Adapter

```typescript
import { RouterAdapter, SubagentRole, route } from "./src/agents/claude-router";

const myAdapter: RouterAdapter = {
    name: "custom",
    models: {
        [SubagentRole.LOOKUP]: "my-fast-model",
        [SubagentRole.WORK]: "my-balanced-model",
        [SubagentRole.PLANNER]: "my-strongest-model",
        [SubagentRole.DEBUGGER]: "my-balanced-model",
        [SubagentRole.REFACTORER]: "my-strongest-model",
    },
    async execute(decision, prompt) {
        // Call your custom API
    },
};

const decision = route("implement auth", myAdapter.models);
```

## File Structure

```
src/agents/claude-router/
├── core/
│   ├── types.ts      # Harness-neutral types, ModelFamily, RouterAdapter
│   ├── router.ts     # assessComplexity, detectIntent, selectRole, route, buildPlan
│   └── index.ts      # Core exports
├── adapters/
│   ├── anthropic.ts  # Claude models (haiku, sonnet, opus)
│   ├── cursor.ts     # Cursor SDK models (composer-mini, composer-2.5)
│   ├── opencode.ts   # Hybrid Kimi (kimi-k2.6) + OpenAI (gpt-5.5)
│   ├── codex.ts      # OpenAI models (gpt-5.4-mini, gpt-5.4, gpt-5.5)
│   ├── pi.ts         # Hybrid Kimi (kimi-k2.6) + OpenAI (gpt-5.5)
│   ├── shared.ts     # Adapter helpers
│   └── index.ts      # Adapter registry
├── conductor.ts      # High-level API (conduct, routeTask, planTask)
├── index.ts          # Public API exports
└── __tests__/
    └── conductor.test.ts
```

## How It Differs from v1

v1 was Anthropic-only with hardcoded model constants. v2 separates:

1. **Core routing** (complexity/intent/role selection) — harness-neutral, no SDK imports
2. **Model families** (role → model ID mapping) — one per harness
3. **Adapters** (execution) — one per harness, implement `RouterAdapter` interface

This matches how `agents/runner-shared/drivers/` works in the existing codebase.
