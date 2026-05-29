#!/bin/bash
set -euo pipefail

# Deep research — rotates through research topics
# shellcheck source=paths.sh
. /app/scripts/paths.sh
PI_DIR="${HOME}/.pi/agent"
LOG_DIR="/app/logs"
LOCK_DIR="/app/locks"

mkdir -p "$LOG_DIR" "$LOCK_DIR" "$OUTPUT_DIR"

QUESTION=$("/app/scripts/rotate-topic.sh" "${SCHEDULED_DIR}/research-topics.txt")

if [ -z "$QUESTION" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — No research topics in rotation list. Skipping."
    exit 0
fi

TODAY=$(date '+%Y-%m-%d')
SLUG=$(echo "$QUESTION" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/-$//')
OUT_FILE="${OUTPUT_DIR}/research-deep-${TODAY}-${SLUG}.md"

MODEL=$(/app/scripts/pick-model.sh --task-type research 2>>"${LOG_DIR}/research-deep.log" || echo "")
MODEL_FLAG=""
[ -n "$MODEL" ] && MODEL_FLAG="--model $MODEL"

echo "[research-deep] START $(date '+%Y-%m-%d %H:%M:%S')" >> "${LOG_DIR}/runtimes.log"

pi -p $MODEL_FLAG --skill "/app/skills/auto-research" \
    "ROLE: You are a research director who decomposes hard questions into tractable sub-questions, delegates each to focused investigation, synthesizes findings with explicit confidence levels, and delivers a report that is both comprehensive and immediately actionable.

Research question: ${QUESTION}

### RESEARCH QUESTION
Restate the question exactly as scoped.

### EXECUTIVE SUMMARY
3–5 sentences. Bottom-line answer, confidence level overall, and single most important caveat.

### KEY FINDINGS
Numbered findings. Each: [CONFIDENCE] Finding — Source(s). Order by importance.

### CONFLICTING EVIDENCE
Claims from credible sources that contradict the Key Findings. If none, write 'None found.'

### GAPS AND UNKNOWNS
What the research could not answer, and why.

### SOURCES
Full list: [Source name / URL] — [what it contributed]

STOP after delivering these six sections." \
    > "$OUT_FILE" 2>&1

EXIT=$?
echo "[research-deep] $( [ $EXIT -eq 0 ] && echo OK || echo FAIL exit=$EXIT ) at $(date '+%Y-%m-%d %H:%M:%S')" >> "${LOG_DIR}/runtimes.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Research deep-dive '${QUESTION}' saved${MODEL:+ (model: $MODEL)}"
exit $EXIT
