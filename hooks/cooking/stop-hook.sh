#!/bin/bash
#
# Cooking-routines Stop hook (host-agnostic).
#
# Trust boundary for the "let it cook" pattern. Fires when the agent reports
# a Stop event; if a marker file exists for the agent's PID with a matching
# process start time, the hook returns exit 2 (Claude Code) or a
# followup_message JSON (Cursor) to keep the loop going. Otherwise no-op.
#
# Marker:   ~/.claude/cooking/active-<pid>     (JSON: {"start_epoch": "..."} )
# Counter:  ~/.claude/cooking/iter-<pid>       (single integer, mode 0600)
#
# Hard cap: 10 iterations regardless of marker presence.
#
# Hosts:
#   Claude Code:   stdin = { hook_event_name: "Stop"|"SubagentStop", session_id, ... }
#                  exit 2 + reason on stderr -> continue; exit 0 -> stop
#   Cursor:        stdin = { status, loop_count, ... }
#                  output { followup_message: "..." } on stdout -> continue;
#                  exit 0 with no output -> stop
#
# We detect the host from payload shape, not from $CURSOR_PROJECT_DIR or any
# other host-specific env, so the script works identically under either host
# (and under direct invocation from hook-scope.sh).

set -euo pipefail

COOKING_DIR="${HOME}/.claude/cooking"
HARD_CAP=10

HOOK_INPUT=$(cat)

# --- detect event ----------------------------------------------------------
# Claude payload uses hook_event_name. Cursor uses status. Test harness can
# pass COOKING_TEST_EVENT to force a value without faking JSON.
EVENT="${COOKING_TEST_EVENT:-}"
if [[ -z "$EVENT" ]]; then
  EVENT=$(printf '%s' "$HOOK_INPUT" | jq -r '.hook_event_name // empty' 2>/dev/null || true)
fi
if [[ -z "$EVENT" ]]; then
  CURSOR_STATUS=$(printf '%s' "$HOOK_INPUT" | jq -r '.status // empty' 2>/dev/null || true)
  if [[ -n "$CURSOR_STATUS" ]]; then
    EVENT="Stop"
  fi
fi

# Honour Stop only. SubagentStop must never trigger the parent loop counter.
if [[ "$EVENT" != "Stop" ]]; then
  exit 0
fi

# --- locate marker ---------------------------------------------------------
# COOKING_TEST_PID lets the test harness exercise PID-specific logic without
# spawning real processes. Default: parent of this hook (the agent process).
PID="${COOKING_TEST_PID:-${PPID}}"
MARKER="${COOKING_DIR}/active-${PID}"
COUNTER="${COOKING_DIR}/iter-${PID}"

if [[ ! -f "$MARKER" ]]; then
  exit 0
fi

# --- start_epoch validation (PID reuse defense) ---------------------------
RECORDED_EPOCH=$(jq -r '.start_epoch // empty' "$MARKER" 2>/dev/null || true)

if [[ -n "${COOKING_TEST_LSTART:-}" ]]; then
  CURRENT_EPOCH="$COOKING_TEST_LSTART"
else
  CURRENT_EPOCH=$(ps -p "$PID" -o lstart= 2>/dev/null | sed 's/^ *//;s/ *$//' || true)
fi

if [[ -z "$RECORDED_EPOCH" || -z "$CURRENT_EPOCH" || "$RECORDED_EPOCH" != "$CURRENT_EPOCH" ]]; then
  # Marker is stale (process died, PID reused, or epoch missing). Purge.
  rm -f "$MARKER" "$COUNTER"
  exit 0
fi

# --- iteration counter under mkdir-based mutex ----------------------------
# `mkdir` is the only POSIX-portable atomic mutex primitive that works on
# macOS without extra deps (flock(1) is Linux-only). Spin up to ~5s, then
# break the lock as a last resort — this hook must never deadlock the agent.
mkdir -p "$COOKING_DIR"
if [[ ! -f "$COUNTER" ]]; then
  printf '0' > "$COUNTER"
  chmod 0600 "$COUNTER"
fi

LOCK_DIR="${COUNTER}.lock"
LOCK_HELD=0
trap '[[ "$LOCK_HELD" == "1" ]] && rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT

ATTEMPTS=0
while ! mkdir "$LOCK_DIR" 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if (( ATTEMPTS > 100 )); then
    rmdir "$LOCK_DIR" 2>/dev/null || true
    mkdir "$LOCK_DIR" 2>/dev/null || true
    break
  fi
  sleep 0.05
done
LOCK_HELD=1

CURRENT=$(cat "$COUNTER" 2>/dev/null || printf '0')
if [[ ! "$CURRENT" =~ ^[0-9]+$ ]]; then
  CURRENT=0
fi
NEXT=$((CURRENT + 1))
printf '%s' "$NEXT" > "$COUNTER"
chmod 0600 "$COUNTER"

rmdir "$LOCK_DIR" 2>/dev/null || true
LOCK_HELD=0

# --- enforce hard cap ------------------------------------------------------
if (( NEXT > HARD_CAP )); then
  rm -f "$MARKER" "$COUNTER"
  echo "Cooking loop reached the iteration cap of ${HARD_CAP}. Marker cleared." >&2
  exit 0
fi

# --- emit continuation in the right shape per host ------------------------
REASON="Cooking marker present for pid ${PID} (iteration ${NEXT} of ${HARD_CAP}). Marker file gates this; remove it to end the loop."

# Cursor: emit followup_message JSON, exit 0.
if printf '%s' "$HOOK_INPUT" | jq -e '.status' >/dev/null 2>&1; then
  jq -n --arg msg "$REASON" '{"followup_message": $msg}'
  exit 0
fi

# Claude Code: exit 2 with reason on stderr.
echo "$REASON" >&2
exit 2
