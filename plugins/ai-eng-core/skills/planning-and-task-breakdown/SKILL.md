---
name: planning-and-task-breakdown
description: Decompose specs into small, verifiable tasks with acceptance criteria and dependency ordering. Use when you have a spec and need implementable units.
---

# Planning and Task Breakdown

## Overview

Break a specification into atomic, independently verifiable tasks with clear acceptance criteria, dependency ordering, and time estimates. This is the canonical Plan-phase skill.

## When to Use

- After a spec is approved and before implementation begins
- When a feature feels too large to implement in one pass
- When multiple people or agents need to work on related changes
- Before using `incremental-implementation` or `test-driven-development`

## Task Hierarchy

```
Epic (the full feature)
└── Phase (logical grouping, ~1 day of work)
    └── Task (atomic unit, ~30 min)
        └── Subtask (only if task is still too large)
```

## Task Requirements

Every atomic task must include:

| Field | Description | Example |
|-------|-------------|---------|
| ID | Unique identifier | `FEAT-001-A` |
| Title | Action-oriented name | "Create SessionManager class" |
| Depends On | Blocking task IDs | `FEAT-001-B` or "None" |
| Files | Exact files to modify or create | `src/context/session.ts` |
| Acceptance Criteria | Checkboxes defining "done" | `[ ] Class exports correctly` |
| Spec Reference | Links to user story and acceptance criteria | `US-001: AC-2` |
| Estimated Time | Time box | `30 min` |
| Complexity | Low / Medium / High | `Medium` |

## Process

### Step 1: Read the Spec

- Extract all user stories and acceptance criteria
- Identify non-functional requirements
- Note constraints and boundaries

### Step 2: Map Stories to Tasks

For each user story, break it into implementation tasks:
- One task per cohesive change
- Each task should be completable in under an hour
- Tasks should be verifiable independently when possible

### Step 3: Order by Dependency

- Identify blocking relationships
- Group into phases where tasks within a phase can run in parallel
- Ensure each phase produces a buildable, testable state

### Step 4: Estimate and Validate

- Assign time estimates
- Validate that the total plan covers all spec acceptance criteria
- Check that no task is too large or too vague

### Step 5: Create Tasks

**Primary: Solo (if available)**

Check if Solo is available:
```bash
# Check if Solo directory exists and CLI is available
test -d ~/Github/Solo && which solo >/dev/null 2>&1
```

If Solo is available, create each task using the `solo task create` command:
```bash
solo task create \
  --title "Task title" \
  --description "Full task description with acceptance criteria and files" \
  --priority medium \
  --deps T-1,T-2 \
  --tags feature-name,phase-1 \
  --json
```

Solo task fields:
| Flag | Maps To |
|------|---------|
| `--title` | Task Title |
| `--description` | Acceptance Criteria + Files + Spec Reference |
| `--priority` | Derived from Complexity (Low→low, Medium→medium, High→high) |
| `--deps` | Comma-separated Solo task IDs from previous creates |
| `--tags` | Feature name and phase tags |

Solo returns the assigned task ID (e.g., `T-142`). Use this ID for dependency references in subsequent tasks.

**Fallback: File-based tasks (if Solo is not available)**

If Solo is not available, create individual task files:
```
specs/{feature}/tasks/
├── T-001.md
├── T-002.md
└── ...
```

Each task file follows this format:
```markdown
# T-001: [Task Title]

**Depends On:** None
**Priority:** medium
**Estimated Time:** 30 min
**Complexity:** Low

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Files
- `path/to/file.ts` - Create/modify description

## Spec Reference
- US-001: AC-2
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can just start with the first task" | Without dependency ordering, you will hit blockers mid-implementation. |
| "Tasks don't need acceptance criteria" | Without criteria, you cannot verify a task is actually complete. |
| "I will figure out dependencies as I go" | Discovered dependencies cause context switching and rework. |

## Verification

- [ ] Every spec acceptance criterion is covered by at least one task
- [ ] Every task has all required fields
- [ ] Dependency graph has no cycles
- [ ] Each phase produces a buildable, testable state
- [ ] Tasks created in Solo (if available) OR saved as `specs/{feature}/tasks/*.md` (fallback)
- [ ] Solo task IDs recorded for dependency tracking (if using Solo)

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I can just start with the first task" | Without dependency ordering, you will hit blockers mid-implementation. |
| "Tasks don't need acceptance criteria" | Without criteria, you cannot verify a task is actually complete. |
| "I'll figure out dependencies as I go" | Discovered dependencies cause context switching and rework. |
| "This task is small enough to not need details" | Small tasks without details still block other tasks. Specify them. |
| "The plan is obvious, no need to write it down" | What is obvious to you may not be obvious to the implementer. Write it down. |
