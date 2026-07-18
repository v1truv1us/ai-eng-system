#!/bin/bash
#
# Skill invocation logger (PostToolUse).
#
# Learning capture for the skill-health loop: every time the `skill` tool is
# invoked, append the skill name to a JSONL ledger. The loop reads this ledger
# to flag skills that are never invoked (dead weight) and to weight the audit
# by real usage. Fires only when the tool is `skill`; otherwise no-op.
#
# Payload shape (host-agnostic, like cooking-stop-hook.sh):
#   Claude Code: stdin = { tool_name: "skill", tool_input: { name: "..." }, ... }
#   Cursor:      stdin = { tool: { name: "skill", input: {...} }, ... }
# We parse defensively and never block the tool (always exit 0).
#
# Ledger: reports/.skill-invocations.jsonl  (one {"ts","skill"} per line)
#
# test harness: SKILL_LOG_TEST_INPUT overrides stdin; SKILL_LOG_LEDGER overrides
# the ledger path.

set -euo pipefail

LEDGER="${SKILL_LOG_LEDGER:-reports/.skill-invocations.jsonl}"
INPUT="${SKILL_LOG_TEST_INPUT:-$(cat)}"

# Extract tool name and skill name from either payload shape.
TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name // .tool.name // empty' 2>/dev/null || true)
if [[ "$TOOL" != "skill" ]]; then
  exit 0
fi

SKILL=$(printf '%s' "$INPUT" | jq -r '.tool_input.name // .tool.input.name // .tool_input.skill // .tool.input.skill // empty' 2>/dev/null || true)
if [[ -z "$SKILL" ]]; then
  exit 0
fi

mkdir -p "$(dirname "$LEDGER")"
printf '{"ts":%d,"skill":%s}\n' "$(date +%s)" "$(printf '%s' "$SKILL" | jq -Rs .)" >> "$LEDGER"
exit 0
