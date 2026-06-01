---
name: test-fix-loop
description: Self-continuing loop that fixes a deliberately failing test, reruns it, and exits cleanly when green. Smallest cooking-routines skill — pairs with the cooking Stop hook to keep iterating past natural stops.
---

# Test Fix Loop

Smallest cooking-routines skill. Hand the agent a failing test (or a set of them) and a marker file; the cooking Stop hook will keep the agent looping through fix-and-rerun cycles until either the tests pass or the iteration counter hits 10. Marker file is the trust boundary; remove it to end the loop.

## When to Use

- A unit/integration test is failing and the fix is mechanical (assertion update, missing import, simple refactor)
- You want the agent to iterate without supervision until green
- You explicitly do **not** want the agent to ship the fix anywhere — `cross-repo-refactor` handles branch+push; this skill only edits the working tree

## When NOT to Use

- Tests are failing because of a real design bug — fix the design first, don't loop
- Tests touch multi-repo state — use `cross-repo-refactor` instead
- You don't have a clean working tree — the loop edits files; commit or stash first

## How to Run

1. Confirm a clean working tree: `git status --short` returns no output, OR you accept that the loop will edit working-tree files.
2. Identify the failing test command (e.g., `npm test -- failing-test.spec.ts`, `bun test path/to/test`, `pytest tests/foo.py::test_bar`).
3. Create the marker file with the agent's PID:
   ```bash
   mkdir -p ~/.claude/cooking
   PID=$$
   START_EPOCH=$(ps -p $PID -o lstart= | sed 's/^ *//;s/ *$//')
   printf '{"start_epoch": "%s"}' "$START_EPOCH" > ~/.claude/cooking/active-$PID
   ```
4. Tell Claude: "Run `<failing test command>` in cook mode. Fix the test until it passes."
5. The agent runs the test, edits the failing implementation/assertion, reruns, repeats. The Stop hook returns exit 2 after each turn, so the agent keeps iterating until termination.
6. The skill **must** remove the marker file in a `finally`-equivalent path (whether the loop terminates cleanly or aborts).

## TERMINATION

Stop when ANY of these are true:

- The failing test command exits with status 0 (test is green)
- Iteration count reaches 10 (the cooking Stop hook hard-caps regardless of marker)
- The agent determines the failure is a real design bug, not a mechanical fix — in this case write a brief note describing the bug and exit
- The marker file is removed (manually or by the agent)

When termination triggers:

```bash
rm -f ~/.claude/cooking/active-$PID ~/.claude/cooking/iter-$PID
```

## Anti-patterns

- **Don't** suppress the failing assertion to "make it green" — that's removing tests, which the spec forbids.
- **Don't** silently delete the test if it can't be made to pass — write a note and exit.
- **Don't** run this on a dirty working tree without warning the user; the loop edits files.
- **Don't** use this for end-to-end / browser tests where each iteration costs minutes — use `investigation-loop` instead and reason about the failure first.

## Verification

`/cook-status` should show this loop's marker as `active` while running, and as gone after termination. The iteration counter file (`~/.claude/cooking/iter-<pid>`) should be ≤ 10 at any observation point.

## Related

- Stop hook: `hooks/cooking/stop-hook.sh`
- Status command: `/cook-status`
- Sibling skills: `investigation-loop`, `cross-repo-refactor`, `dreaming-consolidator`
