---
name: investigation-loop
description: Long-running Jira investigation that self-continues past natural stops until a written hypothesis with evidence citations is produced. Pairs with the cooking Stop hook and hard-stops at 10 iterations.
metadata:
  category: model-invoked
---

# Investigation Loop

Long-form investigation skill for tickets where the answer requires walking multiple linked tickets, code paths, and Confluence pages. Hand the agent a ticket and a marker file; the cooking Stop hook keeps it iterating until either (a) a written hypothesis with at least three evidence citations exists, or (b) the iteration counter hits 10.

## When to Use

- A Jira (or similar) ticket whose root cause is non-obvious and requires reading code, related tickets, and historical decisions
- The investigation will take 30+ minutes and you don't want to babysit it
- You need a written hypothesis at the end, not just a fix — investigation is the deliverable

## When NOT to Use

- The fix is obvious — just do it; don't loop
- The work is mechanical (test fixing, refactor) — use `test-fix-loop` or `cross-repo-refactor`
- You don't have access to the systems involved (Jira, repo, etc.) — the loop will spin without progress

## How to Run

1. Decide on the target. Have the ticket key (e.g. `RF-9421`) and any obvious entry point (a stack trace, a failing PR, a recent regression).
2. Create the marker file with the agent's PID:
   ```bash
   mkdir -p ~/.claude/cooking
   PID=$$
   START_EPOCH=$(ps -p $PID -o lstart= | sed 's/^ *//;s/ *$//')
   printf '{"start_epoch": "%s"}' "$START_EPOCH" > ~/.claude/cooking/active-$PID
   ```
3. Tell Claude: "Investigate JIRA `<TICKET-KEY>` in cook mode. Goal: written hypothesis with at least 3 evidence citations."
4. The agent reads the ticket, walks linked tickets and the relevant code, and either:
   - **Finds enough** — writes the hypothesis, removes the marker, exits
   - **Needs another cycle** — leaves the marker; the Stop hook returns exit 2 and the agent continues from where it left off
5. The skill **must** remove the marker file in a `finally`-equivalent path.

## TERMINATION

Stop when ALL of these are true:

- A written hypothesis exists in the conversation answering the ticket's central question
- At least 3 evidence citations support the hypothesis (each citation must be a concrete reference: code at `path:line`, ticket key, doc URL, commit SHA, or test result)
- The agent has explicitly stated **"I have enough to write up findings"** (verbatim trigger string), OR the iteration counter has reached 10
- The marker file is removed

When termination triggers:

```bash
rm -f ~/.claude/cooking/active-$PID ~/.claude/cooking/iter-$PID
```

If iteration 10 hits without a hypothesis, write a brief note describing what's missing (which file/ticket couldn't be accessed, what evidence is incomplete) and exit anyway — never run past 10. The hook hard-caps regardless.

## Anti-patterns

- **Don't** reach a hypothesis and immediately try to fix the bug — this skill's deliverable is the hypothesis. Hand off to a normal coding session for the fix.
- **Don't** count "I think it's probably X" as an evidence citation — citations must reference something concrete the user can verify.
- **Don't** silently skip a citation requirement to terminate early — if you can't find 3 sources, hit iteration 10 honestly and exit with a "what's missing" note.
- **Don't** write the hypothesis to a file in the repo — the deliverable lives in the conversation transcript. The user reads it directly.

## Verification

`/cook-status` should show this loop's marker as `active` mid-run. After termination, the marker is gone and the conversation transcript contains the hypothesis with its citations. The iteration counter file should be ≤ 10 at any observation point.

## Related

- Stop hook: `hooks/cooking/stop-hook.sh`
- Status command: `/cook-status`
- Sibling skills: `test-fix-loop`, `cross-repo-refactor`, `dreaming-consolidator`
