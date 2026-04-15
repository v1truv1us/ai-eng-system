---
name: build
description: Implement incrementally using test-driven development
agent: build
version: 1.0.0
---

# Build (Lifecycle Alias)

This is a lifecycle alias for `/ai-eng/work`. See `content/commands/work.md` for the full command.

Load the `test-driven-development` and `incremental-implementation` skills. Pick the next pending task from the plan. For each task:

1. Read the task's acceptance criteria
2. Load relevant context
3. Write a failing test for the expected behavior (RED)
4. Implement the minimum code to pass (GREEN)
5. Run the full test suite
6. Run the build
7. Commit with a descriptive message
8. Mark the task complete

$ARGUMENTS
