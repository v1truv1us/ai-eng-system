#!/bin/bash
set -euo pipefail

# Run ai-eng-system research-runner against a topic from the queue
# This uses the full template engine (9 templates, parallel, synthesized)
#
# Usage: run-research-runner.sh <question>
#   Or reads next topic from research-topics.txt if no argument

QUESTION="${1:-}"

if [ -z "$QUESTION" ]; then
    # Rotate to next topic from the queue
    TOPICS="/app/scheduled/research-topics.txt"
    QUESTION=$(/app/scripts/rotate-topic.sh "$TOPICS")
fi

if [ -z "$QUESTION" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — No research question provided. Skipping."
    exit 0
fi

LOG_DIR="/app/logs"
mkdir -p "$LOG_DIR"

echo "[research-runner] START $(date '+%Y-%m-%d %H:%M:%S') — ${QUESTION}" >> "${LOG_DIR}/runtimes.log"

# Run the ai-eng-system research-runner with pi driver
cd /opt/ai-eng-system/agents/research-runner/pi

VAULT_PATH="${VAULT_PATH:-/app/data/vault}" \
npx tsx runner.ts "$QUESTION" \
    >> "${LOG_DIR}/research-runner-$(date '+%Y-%m-%d').log" 2>&1

EXIT=$?
echo "[research-runner] $( [ $EXIT -eq 0 ] && echo OK || echo FAIL exit=$EXIT ) at $(date '+%Y-%m-%d %H:%M:%S')" >> "${LOG_DIR}/runtimes.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Research runner: '${QUESTION}' ${MODEL:+(model: $MODEL)}"
exit $EXIT
