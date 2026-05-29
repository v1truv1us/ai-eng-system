#!/bin/bash
set -euo pipefail

# Competitor scan — rotates through competitor list
# shellcheck source=paths.sh
. /app/scripts/paths.sh
TOPICS="${SCHEDULED_DIR}/competitors.txt"
PI_DIR="${HOME}/.pi/agent"
LOG_DIR="/app/logs"
LOCK_DIR="/app/locks"

mkdir -p "$LOG_DIR" "$LOCK_DIR" "$OUTPUT_DIR"

TARGET=$("/app/scripts/rotate-topic.sh" "$TOPICS")

if [ -z "$TARGET" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — No competitors in rotation list. Skipping."
    exit 0
fi

TODAY=$(date '+%Y-%m-%d')
OUT_FILE="${OUTPUT_DIR}/competitor-scan-${TODAY}-${TARGET// /-}.md"

MODEL=$(/app/scripts/pick-model.sh --task-type scan 2>>"${LOG_DIR}/competitor-scan.log" || echo "")
MODEL_FLAG=""
[ -n "$MODEL" ] && MODEL_FLAG="--model $MODEL"

echo "[competitor-scan] START $(date '+%Y-%m-%d %H:%M:%S')" >> "${LOG_DIR}/runtimes.log"

pi -p $MODEL_FLAG \
    "ROLE: You are a competitive intelligence analyst who produces concise, decision-ready market snapshots.

Research ${TARGET} using web search. Cover: market position, key offerings, strengths, weaknesses, and differentiation. Include source citations.

### MARKET SNAPSHOT
- Who they are (1 sentence)
- What they do (3 bullet points)
- Their angle / moat

### STRENGTHS
Top 3, with evidence

### WEAKNESSES
Top 3, with evidence

### THREAT LEVEL
Low / Medium / High — with one-sentence rationale

### SOURCES
- [Name](url) — [what it contributed]

STOP after these sections." \
    > "$OUT_FILE" 2>&1

EXIT=$?
echo "[competitor-scan] $( [ $EXIT -eq 0 ] && echo OK || echo FAIL exit=$EXIT ) at $(date '+%Y-%m-%d %H:%M:%S')" >> "${LOG_DIR}/runtimes.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Competitor scan for '${TARGET}' saved${MODEL:+ (model: $MODEL)}"
exit $EXIT
