---
name: cross-repo-refactor
description: Coordinate a multi-repo refactor by fanning out subagents per repo, gathering changes onto a single feature branch named cook/refactor-<slug>-<short-sha>, and pushing for review. Pairs with the branch-guard PreToolUse hook to make pushes to main physically impossible.
metadata:
  category: model-invoked
---

# Cross-Repo Refactor

Coordinate a refactor that spans multiple repos. The orchestrating session reads the change description, plans the per-repo edits, fans out subagents to make them, collects the results onto a single feature branch in each repo, and pushes for review. The branch-guard hook ships alongside this skill — it physically prevents pushing to `main`/`master`/`develop` or any pre-existing branch.

## When to Use

- A refactor needs coordinated changes in 3+ repos (e.g., shared library bump + downstream consumer updates)
- The change is mechanical or systematic — no novel design decisions per repo
- You need the agent to do the legwork without supervision

## When NOT to Use

- The change touches only one repo — just edit and PR normally
- Different repos need different design decisions — handle each one in its own session
- You haven't decided on the new shape yet — explore in one repo first; come back to fan out

## How to Run

1. Confirm clean working trees in every target repo. The hook is the safety net, not the only one.
2. Provide Claude with: a change description, the list of repos, and (if relevant) the exact symbol/file pattern to find.
3. Tell Claude: "Run cross-repo-refactor in cook mode for `<repos>`. Slug: `<short-slug>`. Description: `<one-liner>`."
4. The orchestrating session derives a `<short-sha>` (typically from `date +%s | sha1sum | cut -c1-7` or a stable hash of the slug+date).
5. Per repo, the session fans out a subagent:
   - Run `git checkout -b cook/refactor-<slug>-<short-sha>` (the branch-guard hook validates the name is fresh and matches the pattern)
   - Make the edits
   - Commit with a structured message: `refactor(<slug>): <one-line summary>`
   - `git push -u origin cook/refactor-<slug>-<short-sha>`
6. The orchestrator collects per-repo branch URLs and writes a single summary message listing each.

## Branch naming

```
cook/refactor-<slug>-<short-sha>
```

- `<slug>` — kebab-case, alphanumeric + hyphens, ≤ 30 chars (e.g., `bump-zod-3.23`)
- `<short-sha>` — at least 7 hex characters (matches the regex `^[0-9a-f]{7,}$`)

The branch-guard hook regex is:

```
^cook/refactor-[a-z0-9-]+-[0-9a-f]{7,}$
```

Branches that don't match are rejected by the hook on `git checkout -b`. Pushes to `main`/`master`/`develop` are rejected outright. Pushes targeting `HEAD:main` (refspec form) are also rejected.

## TERMINATION

Stop when ALL of these are true:

- Each target repo has a feature branch matching the naming pattern
- Each branch contains the per-repo edits committed with the structured message
- Each branch has been pushed to `origin` successfully
- The orchestrator session has emitted a summary listing per-repo branch URLs (or a clear failure note for any repo where the change couldn't be made)
- The cooking marker file is removed

When termination triggers:

```bash
rm -f ~/.claude/cooking/active-$PID ~/.claude/cooking/iter-$PID
```

If iteration 10 hits before completing the fan-out, write a partial-progress note (which repos shipped, which didn't, why) and exit. Do not skip the structured-message format to "make it work."

## Anti-patterns

- **Don't** push to `main`. The hook will reject; if the agent retries with a different approach, retry will also be rejected. The fix is naming the branch correctly, not bypassing the hook.
- **Don't** reuse a pre-existing branch — every cook refactor gets a fresh branch. The hook enforces this on `git checkout -b`.
- **Don't** combine multiple unrelated refactors under one slug. One refactor, one slug, one set of branches.
- **Don't** edit `hooks/cooking/branch-guard.sh` to relax it during a session. The skill's safety boundary is the hook; relaxing it makes the skill silently dangerous.

## Host limitation

The branch-guard hook runs as a Claude Code PreToolUse Bash matcher (`hooks.json` `PreToolUse` matcher with `Bash` tool, command pattern). **Cursor does not expose an equivalent PreToolUse Bash hook today**, so under Cursor this enforcement is **skill prose only** — no runtime guard. Use this skill from Claude Code when correctness matters; from Cursor, audit the branch names before you push.

## Verification

`bash hooks/cooking/test/branch-guard.sh` covers 11 cases including push-to-main, push-to-master, push-to-HEAD:main, the cook-pattern accept path, the pre-existing-branch reject, and pattern mismatch. Run it after any branch-guard.sh edit.

## Related

- Branch guard: `hooks/cooking/branch-guard.sh`
- Stop hook: `hooks/cooking/stop-hook.sh`
- Status command: `/cook-status`
- Sibling skills: `test-fix-loop`, `investigation-loop`, `dreaming-consolidator`
