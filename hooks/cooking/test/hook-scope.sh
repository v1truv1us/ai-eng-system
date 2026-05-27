#!/bin/bash
#
# Test harness for hooks/cooking/stop-hook.sh.
#
# Covers the 5 cases from todo.html A1-6:
#   1. marker present + Stop          -> exit 2  (Claude)
#   2. absent + Stop                  -> exit 0
#   3. marker present + SubagentStop  -> exit 0
#   4. mismatched start_epoch         -> exit 0 + marker purged
#   5. parallel Stop fires            -> counter advances by exactly 2
#
# Plus:
#   6. marker present + Stop, Cursor payload -> exit 0 with followup_message JSON
#   7. iteration cap                  -> exit 0 once 10 reached, marker purged
#
# Each case uses a temporary HOME so the marker/counter files don't leak.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
HOOK="$REPO_ROOT/hooks/cooking/stop-hook.sh"

if [[ ! -x "$HOOK" ]]; then
  chmod +x "$HOOK"
fi

# ---------------------------------------------------------------------------
PASS=0
FAIL=0
FAIL_MSGS=()

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    PASS=$((PASS + 1))
    echo "  ok  $label"
  else
    FAIL=$((FAIL + 1))
    FAIL_MSGS+=("$label: expected '$expected', got '$actual'")
    echo "  FAIL $label  expected='$expected' got='$actual'"
  fi
}

setup_tmp() {
  TMP_HOME=$(mktemp -d)
  mkdir -p "$TMP_HOME/.claude/cooking"
  TEST_PID=99999
  TEST_LSTART="Mon Jan 01 00:00:00 2026"
}

teardown_tmp() {
  rm -rf "$TMP_HOME"
}

run_hook() {
  # Args: payload (string), event override (optional)
  local payload="$1" event_override="${2:-}"
  HOME="$TMP_HOME" \
    COOKING_TEST_PID="$TEST_PID" \
    COOKING_TEST_LSTART="$TEST_LSTART" \
    COOKING_TEST_EVENT="$event_override" \
    bash "$HOOK" <<< "$payload"
}

write_marker() {
  local epoch="$1"
  printf '{"start_epoch": "%s"}' "$epoch" > "$TMP_HOME/.claude/cooking/active-${TEST_PID}"
}

# ---------------------------------------------------------------------------
echo "Case 1: marker present + Stop -> exit 2"
setup_tmp
write_marker "$TEST_LSTART"
set +e
run_hook '{"hook_event_name":"Stop"}' "" >/dev/null 2>&1
rc=$?
set -e
assert_eq "case1.exit" "2" "$rc"
counter=$(cat "$TMP_HOME/.claude/cooking/iter-${TEST_PID}" 2>/dev/null || echo missing)
assert_eq "case1.counter" "1" "$counter"
mode=$(stat -f '%OLp' "$TMP_HOME/.claude/cooking/iter-${TEST_PID}" 2>/dev/null || echo missing)
assert_eq "case1.mode" "600" "$mode"
teardown_tmp

# ---------------------------------------------------------------------------
echo "Case 2: absent + Stop -> exit 0"
setup_tmp
set +e
run_hook '{"hook_event_name":"Stop"}' "" >/dev/null 2>&1
rc=$?
set -e
assert_eq "case2.exit" "0" "$rc"
teardown_tmp

# ---------------------------------------------------------------------------
echo "Case 3: marker present + SubagentStop -> exit 0"
setup_tmp
write_marker "$TEST_LSTART"
set +e
run_hook '{"hook_event_name":"SubagentStop"}' "" >/dev/null 2>&1
rc=$?
set -e
assert_eq "case3.exit" "0" "$rc"
# counter should NOT have incremented
counter=$(cat "$TMP_HOME/.claude/cooking/iter-${TEST_PID}" 2>/dev/null || echo absent)
assert_eq "case3.counter" "absent" "$counter"
teardown_tmp

# ---------------------------------------------------------------------------
echo "Case 4: marker with mismatched start_epoch -> exit 0 + marker purged"
setup_tmp
write_marker "Sun Dec 25 12:00:00 2024"
set +e
run_hook '{"hook_event_name":"Stop"}' "" >/dev/null 2>&1
rc=$?
set -e
assert_eq "case4.exit" "0" "$rc"
if [[ -f "$TMP_HOME/.claude/cooking/active-${TEST_PID}" ]]; then
  assert_eq "case4.marker_purged" "yes" "no"
else
  assert_eq "case4.marker_purged" "yes" "yes"
fi
teardown_tmp

# ---------------------------------------------------------------------------
echo "Case 5: parallel Stop fires -> counter advances by exactly 2"
setup_tmp
write_marker "$TEST_LSTART"
# Fire two hooks concurrently. flock should serialize the increment.
set +e
(run_hook '{"hook_event_name":"Stop"}' "" >/dev/null 2>&1) &
P1=$!
(run_hook '{"hook_event_name":"Stop"}' "" >/dev/null 2>&1) &
P2=$!
wait $P1
wait $P2
set -e
counter=$(cat "$TMP_HOME/.claude/cooking/iter-${TEST_PID}" 2>/dev/null || echo missing)
assert_eq "case5.counter" "2" "$counter"
teardown_tmp

# ---------------------------------------------------------------------------
echo "Case 6: marker + Stop, Cursor payload -> exit 0 + followup_message"
setup_tmp
write_marker "$TEST_LSTART"
set +e
out=$(run_hook '{"status":"completed","loop_count":1}' "Stop" 2>/dev/null)
rc=$?
set -e
assert_eq "case6.exit" "0" "$rc"
msg=$(printf '%s' "$out" | jq -r '.followup_message // empty' 2>/dev/null || echo missing)
case "$msg" in
  *"Cooking marker present"*) assert_eq "case6.followup_message" "ok" "ok" ;;
  *)                          assert_eq "case6.followup_message" "ok" "missing: $msg" ;;
esac
teardown_tmp

# ---------------------------------------------------------------------------
echo "Case 7: hard cap at 10 -> 11th Stop returns 0 + marker purged"
setup_tmp
write_marker "$TEST_LSTART"
# Pre-load counter to 10 so the next Stop hits the cap.
printf '10' > "$TMP_HOME/.claude/cooking/iter-${TEST_PID}"
chmod 0600 "$TMP_HOME/.claude/cooking/iter-${TEST_PID}"
set +e
run_hook '{"hook_event_name":"Stop"}' "" >/dev/null 2>&1
rc=$?
set -e
assert_eq "case7.exit" "0" "$rc"
if [[ -f "$TMP_HOME/.claude/cooking/active-${TEST_PID}" ]]; then
  assert_eq "case7.marker_purged" "yes" "no"
else
  assert_eq "case7.marker_purged" "yes" "yes"
fi
teardown_tmp

# ---------------------------------------------------------------------------
echo
echo "Summary: $PASS pass, $FAIL fail"
if (( FAIL > 0 )); then
  for m in "${FAIL_MSGS[@]}"; do
    echo "  - $m"
  done
  exit 1
fi
