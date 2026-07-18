---
name: git-worktree
description: Manage git worktrees for isolated parallel development. Use when running multiple sessions concurrently or working on parallel features.
metadata:
  category: user-invoked
  version: 1.0.0
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Git Worktree Skill

## Systematic Approach


## Core Commands

### Create a Worktree

```bash
# Create worktree with new branch
git worktree add ../project-feature -b feature/user-auth

# Create worktree on existing branch
git worktree add ../project-bugfix hotfix/critical-fix

# Create worktree at specific commit
git worktree add ../project-v1 release/v1.0
```

### List Worktrees

```bash
git worktree list
# Output:
# /path/to/repo          abc1234 [main]
# /path/to/project-feature def5678 [feature/user-auth]
# /path/to/project-bugfix  ghi9012 [hotfix/critical-fix]
```

### Remove Worktrees

```bash
# Remove worktree (after merging branch)
git worktree remove ../project-feature

# Force remove if worktree has uncommitted changes
git worktree remove --force ../project-feature

# Prune stale worktree references
git worktree prune
```

## Naming Conventions

Use consistent, descriptive names:

```bash
# Good: describes the work
git worktree add ../myapp-feature-auth -b feature/auth
git worktree add ../myapp-bugfix-login -b hotfix/login-error
git worktree add ../myapp-experiment-v2 -b experiment/v2-redesign

# Bad: ambiguous names
git worktree add ../temp -b stuff
git worktree add ../test -b wip
```

## Integration with ai-eng-system

Worktrees enable running multiple Claude sessions in parallel:

```bash
# Terminal 1: Feature implementation
git worktree add ../project-auth -b feature/auth
cd ../project-auth
claude  # Run /ai-eng/work "implement authentication"

# Terminal 2: Bug fix (parallel)
git worktree add ../project-bugfix -b hotfix/critical-fix
cd ../project-bugfix
claude  # Run /ai-eng/work "fix login timeout"

# Terminal 3: Code review
cd ../project
claude  # Run /ai-eng/review
```

## Best Practices

1. **Create one worktree per task** — Keep worktrees focused
2. **Name descriptively** — Include project prefix and purpose
3. **Clean up after merge** — Remove worktrees when done
4. **Prune regularly** — Run `git worktree prune` to clean references
5. **Use sibling directories** — Keep worktrees next to main repo, not nested
6. **Don't share worktrees** — Each session gets its own worktree

## Common Workflows

### Feature Development with Review

```bash
# 1. Create feature worktree
git worktree add ../myapp-feature -b feature/new-api
cd ../myapp-feature

# 2. Develop the feature
# ... make changes, commit ...

# 3. Push and create PR
git push -u origin feature/new-api
gh pr create --title "Add new API" --body "..."

# 4. Switch back to main
cd ../myapp

# 5. Clean up after merge
git worktree remove ../myapp-feature
git branch -d feature/new-api
```

### Running Tests in Isolation

```bash
# Create worktree for test runs (won't affect main)
git worktree add ../myapp-tests -b test/run
cd ../myapp-tests
[run tests for your project]
cd ../myapp
git worktree remove ../myapp-tests
```

## Troubleshooting

### Stale Worktrees

```bash
# List all worktrees including stale ones
git worktree list --verbose

# Prune stale references
git worktree prune

# Manually remove if prune doesn't work
rm -rf ../path-to-stale-worktree
git worktree prune
```

### Worktree Won't Remove

```bash
# Force remove with uncommitted changes
git worktree remove --force ../project-feature

# If still failing, remove manually
rm -rf ../project-feature
git worktree prune
```

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll just switch branches instead of creating a worktree" | Switching branches loses uncommitted work and breaks running processes. Worktrees enable true parallelism. |
| "I don't need to clean up old worktrees" | Stale worktrees clutter the filesystem and confuse branch state. Prune regularly. |
| "Naming doesn't matter, I'll remember what it's for" | You won't. Descriptive names prevent confusion when juggling multiple worktrees. |
| "I can share this worktree with another session" | Shared worktrees cause git lock conflicts. Each session gets its own worktree. |
| "The worktree won't remove, I'll just leave it" | Force remove or manually delete. Stale worktrees cause git warnings and confusion. |
