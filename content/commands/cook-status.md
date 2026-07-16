---
name: ai-eng/cook-status
description: List active cooking-routines loops by reading marker files. Prunes stale markers (dead PIDs or mismatched start_epoch).
agent: plan
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Cook Status

Inspect active cooking-routines self-continuing loops and prune stale markers.

> **Phase A2 of cook-and-brief**: companion to the Stop hook (`hooks/cooking/stop-hook.sh`). Markers live at `~/.claude/cooking/active-<pid>` with a `start_epoch` field used to defend against PID reuse.

## What to do

Run this command to:

1. List every marker file in `~/.claude/cooking/`.
2. For each marker, parse the recorded `start_epoch` and compare to `ps -p <pid> -o lstart=` for the live process.
3. Mark each entry as one of:
   - **active** — process is alive and start_epoch matches → loop is genuinely running
   - **stale (dead pid)** — process no longer exists → marker is leftover and should be pruned
   - **stale (epoch mismatch)** — pid was reused by a different process → marker is leftover and should be pruned
4. Prune the stale entries by deleting both the marker (`active-<pid>`) and the iteration counter (`iter-<pid>`).

## Implementation

Run the following bash. It reads markers, decides per-row what's active vs stale, and emits a tabular summary plus a prune action for stale rows.

```bash
COOKING_DIR="$HOME/.claude/cooking"

if [[ ! -d "$COOKING_DIR" ]]; then
  echo "No cooking directory at $COOKING_DIR — no active loops."
  exit 0
fi

shopt -s nullglob
markers=("$COOKING_DIR"/active-*)
if (( ${#markers[@]} == 0 )); then
  echo "No active markers in $COOKING_DIR — no active loops."
  exit 0
fi

printf '%-6s  %-30s  %-12s  %s\n' "PID" "MARKER START_EPOCH" "STATUS" "ACTION"
printf '%-6s  %-30s  %-12s  %s\n' "------" "------------------------------" "------------" "----------"

for marker in "${markers[@]}"; do
  pid="${marker##*active-}"
  recorded=$(jq -r '.start_epoch // empty' "$marker" 2>/dev/null || echo "")

  if ! kill -0 "$pid" 2>/dev/null; then
    status="dead-pid"
    action="prune"
  else
    current=$(ps -p "$pid" -o lstart= 2>/dev/null | sed 's/^ *//;s/ *$//')
    if [[ "$current" == "$recorded" ]]; then
      status="active"
      action="-"
    else
      status="epoch-mismatch"
      action="prune"
    fi
  fi

  iter=$(cat "$COOKING_DIR/iter-$pid" 2>/dev/null || echo "0")
  printf '%-6s  %-30s  %-12s  %s (iter=%s)\n' "$pid" "${recorded:-<none>}" "$status" "$action" "$iter"

  if [[ "$action" == "prune" ]]; then
    rm -f "$marker" "$COOKING_DIR/iter-$pid"
  fi
done
```

## Output format

A table with one row per marker. Active rows have `ACTION=-`; stale rows show `ACTION=prune` and are deleted.

## When to run

- Before starting a long cooking session (confirms no leftover markers from a crash)
- After noticing odd loop behavior (prune stale state and try again)
- Periodically — markers from killed processes accumulate otherwise

## Related

- Stop hook: `hooks/cooking/stop-hook.sh`
- Skills that use this loop pattern: `test-fix-loop`, `investigation-loop`, `cross-repo-refactor`, `dreaming-consolidator`
