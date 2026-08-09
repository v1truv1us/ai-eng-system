#!/bin/bash
#
# Session outcome recorder (Stop hook).
#
# Self-improving skills loop, observe stage: when a session ends, append one
# outcome-labeled line per invoked skill to skills/<name>/run-history.jsonl.
#
# Outcome derivation (deterministic, never prompted):
#   failure - payload carries an error/stop_reason=error, or a flow-store
#             state file touched during the session contains a failed gate
#   success - a flow-store state file touched during the session completed
#   unknown - anything else (no verifiable signal)
#
# Reads the central invocation ledger (reports/.skill-invocations.jsonl) for
# the session's skills. Never blocks; always exit 0.
#
# test harness: SKILL_LOG_TEST_INPUT overrides stdin; SKILL_LOG_LEDGER,
# SKILLS_ROOT, and RUNS_DIR override default paths.

set -euo pipefail

LEDGER="${SKILL_LOG_LEDGER:-reports/.skill-invocations.jsonl}"
SKILLS_ROOT="${SKILLS_ROOT:-skills}"
RUNS_DIR="${RUNS_DIR:-.ai-eng/runs}"
INPUT="${SKILL_LOG_TEST_INPUT:-$(cat)}"

[[ -f "$LEDGER" ]] || exit 0

SESSION_ID=$(printf '%s' "$INPUT" | jq -r '.session_id // .session.id // empty' 2>/dev/null || true)

# Collect skills invoked in this session. Without a session id, fall back to
# invocations from the last 6 hours.
if [[ -n "$SESSION_ID" ]]; then
  FILTER="select(.session_id == \$sid)"
else
  CUTOFF=$(( $(date +%s) - 21600 ))
  FILTER="select(.ts >= $CUTOFF)"
fi

SKILLS=$(jq -rc --arg sid "$SESSION_ID" "$FILTER | .skill" "$LEDGER" 2>/dev/null | sort -u || true)
[[ -n "$SKILLS" ]] || exit 0

# Earliest invocation timestamp bounds the flow-state scan window.
WINDOW_START=$(jq -r --arg sid "$SESSION_ID" "$FILTER | .ts" "$LEDGER" 2>/dev/null | sort -n | head -1 || true)
WINDOW_START="${WINDOW_START:-0}"

OUTCOME="unknown"
STOP_REASON=$(printf '%s' "$INPUT" | jq -r '.stop_reason // .error // empty' 2>/dev/null || true)
if [[ -n "$STOP_REASON" && "$STOP_REASON" != "end_turn" && "$STOP_REASON" != "stop" ]]; then
  OUTCOME="failure"
elif [[ -d "$RUNS_DIR" ]]; then
  FLOW_HIT=""
  while IFS= read -r -d '' flow; do
    MTIME=$(stat -f %m "$flow" 2>/dev/null || stat -c %Y "$flow" 2>/dev/null || echo 0)
    [[ "$MTIME" -ge "$WINDOW_START" ]] || continue
    if grep -q '"status":\s*"failed"' "$flow" 2>/dev/null || grep -q '"status":"failed"' "$flow" 2>/dev/null; then
      FLOW_HIT="failure"
      break
    fi
    if grep -qE '"status":\s*"(completed|success)"' "$flow" 2>/dev/null; then
      FLOW_HIT="success"
    fi
  done < <(find "$RUNS_DIR" -name '.flow' -print0 2>/dev/null)
  [[ -n "$FLOW_HIT" ]] && OUTCOME="$FLOW_HIT"
fi

VERIFY_PASSED="null"
case "$OUTCOME" in
  success) VERIFY_PASSED="true" ;;
  failure) VERIFY_PASSED="false" ;;
esac

TS="$(date +%s)"
while IFS= read -r skill; do
  [[ -n "$skill" ]] || continue
  # Namespaced skills (ai-eng/simplify) keep their relative path; skip entries
  # that would escape the skills root.
  case "$skill" in
    *..* | /*) continue ;;
  esac
  SKILL_DIR="$SKILLS_ROOT/$skill"
  [[ -d "$SKILL_DIR" ]] || continue
  printf '{"schema":1,"ts":%d,"skill":%s,"session_id":%s,"run_id":null,"outcome":%s,"signals":{"verify_passed":%s,"eval_pass_rate":null,"user_feedback":null},"source":"wrap-up"}\n' \
    "$TS" \
    "$(printf '%s' "$skill" | jq -Rs .)" \
    "$(printf '%s' "$SESSION_ID" | jq -Rs .)" \
    "$(printf '%s' "$OUTCOME" | jq -Rs .)" \
    "$VERIFY_PASSED" >> "$SKILL_DIR/run-history.jsonl"
done <<< "$SKILLS"

exit 0
