---
name: git-workflow-and-versioning
description: Trunk-based development, atomic commits, change sizing (~100
  lines), commit-as-save-point pattern. Use when making any code change.
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
# Git Workflow and Versioning

## Overview

Use trunk-based development with atomic commits. Keep changes small, write clear commit messages, and treat every commit as a save point that could be deployed independently.

## When to Use

- Every code change, without exception

## Core Principles

### Trunk-Based Development

- Work on short-lived feature branches
- Merge to main frequently (at least daily)
- Keep branches small and focused
- Use feature flags for incomplete work

### Atomic Commits

Each commit should:
- Contain one logical change
- Leave the codebase in a buildable, testable state
- Be revertable without breaking other work

### Change Sizing

- Target ~100 lines per change for easy review
- Maximum ~400 lines unless the change is mechanical (renames, generated code)
- If a change is too large, break it into smaller sequential commits

### Commit-as-Save-Point

Treat each commit as a checkpoint:
- All tests pass at each commit
- The system is deployable at each commit
- Each commit message explains what and why

## Commit Message Format

```
type: short description (50 chars max)

- What changed
- Why it changed
- Any relevant context

Refs: #issue-number
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

## Process

### Step 1: Create Feature Branch

```bash
git checkout -b feat/short-description main
```

### Step 2: Make Atomic Commits

- Stage related changes together
- Write a clear commit message
- Run tests before committing
- Push after each meaningful milestone

### Step 3: Keep Branch Up to Date

```bash
git fetch origin main
git rebase origin/main
```

Resolve conflicts promptly. Do not let branches diverge for days.

### Step 4: Create Pull Request

- Write a clear description of what changed and why
- Include a test plan
- Keep PRs small enough for thorough review

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I will commit everything at the end" | A single large commit is hard to review, hard to revert, and loses intermediate context. |
| "WIP commits are fine, I will squash later" | If you squash, you lose the save points. If you don't, you merge messy history. |
| "This change is too small for its own commit" | Small changes are exactly what make good atomic commits. |

## Verification

- [ ] Each commit is one logical change
- [ ] Tests pass at each commit
- [ ] Commit messages follow the format
- [ ] Branch is up to date with main
- [ ] PR description includes test plan

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll commit everything at the end" | A single large commit is hard to review, hard to revert, and loses intermediate context. |
| "WIP commits are fine, I'll squash later" | If you squash, you lose the save points. If you don't, you merge messy history. |
| "This change is too small for its own commit" | Small changes are exactly what make good atomic commits. |
| "I'll rebase later when the branch is done" | Letting branches diverge creates painful merge conflicts. Rebase frequently. |
| "Feature flags are overkill for this" | Feature flags enable merging incomplete work safely. They prevent long-lived branches. |
