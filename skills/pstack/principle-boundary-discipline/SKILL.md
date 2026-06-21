---
name: principle-boundary-discipline
description: Apply when wiring validation or framework adapters. Concentrate guards at system boundaries; trust internal types; keep business logic pure.
metadata:
  category: model-invoked
  version: 1.0.0
  tags: cursor-import, pstack
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
# Boundary Discipline

Place validation, type narrowing, and error handling at system boundaries. Trust internal code unconditionally. Business logic lives in pure functions; the shell is thin and mechanical.

**Why:** Scattered validation is noisy, redundant, and gives a false sense of safety. Validate data once at the boundary. Keep logic out of framework wiring so it can be tested without the framework.

**The pattern:**
- **At boundaries** (CLI args, config files, external APIs, network protocols): validate, return errors, handle defensively.
- **Inside the system:** typed data, error propagation, no re-validation. Trust the types.

**Applications:**

Validation and error handling:
- Validate config at parse time (the boundary), not inside business logic
- Store raw data at boundaries; parse lazily at use-site
- No redundant nil checks deep in call chains if the boundary already validated

Code organization:
- Business logic in pure functions with no framework dependencies
- Parse functions: pure transforms from raw bytes to typed state
- Prompt construction: structured state in, string out
- Scoring and assessment: pure transforms from state to results

**The tests:**
- "Is this data crossing a system boundary right now?" If not, validation is redundant.
- "Can this be a pure function that the shell just calls?" If yes, extract it.
