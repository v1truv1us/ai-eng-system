#!/bin/bash
set -euo pipefail

# Process wiki research queue for a given tag
# Usage: run-wiki-research.sh <engineering|research|personal>

TAG="${1:?Usage: run-wiki-research.sh <engineering|research|personal>}"
# shellcheck source=paths.sh
. /app/scripts/paths.sh
VAULT="${VAULT_PATH:-/app/data/vault}"
PI_DIR="${HOME}/.pi/agent"
LOG_DIR="/app/logs"
LOCK_DIR="/app/locks"

mkdir -p "$LOG_DIR" "$LOCK_DIR"
LOG_FILE="${LOG_DIR}/wiki-research-${TAG}.log"

cd "$VAULT" || { echo "Vault not found: $VAULT" >&2; exit 1; }

# Check if there are unchecked items for this tag
if ! grep -q '^\- \[ \]' RESEARCH_QUEUE.md 2>/dev/null || ! grep -q "## #${TAG}" RESEARCH_QUEUE.md 2>/dev/null; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — No unchecked #${TAG} items. Skipping." | tee -a "$LOG_FILE"
    exit 0
fi

# Pick model via the model rotation system
MODEL=$(/app/scripts/pick-model.sh --task-type research 2>>"$LOG_FILE" || echo "")
MODEL_FLAG=""
[ -n "$MODEL" ] && MODEL_FLAG="--model $MODEL"

# Run with lock to prevent overlapping
LOCK="${LOCK_DIR}/wiki-research-${TAG}.lock"
START=$(date '+%Y-%m-%d %H:%M:%S')
echo "[$TAG] START $START" >> "${LOG_DIR}/runtimes.log"

mkdir -p "$OUTPUT_DIR"
OUT_DIR="$OUTPUT_DIR"

pi -p $MODEL_FLAG --skill "/app/skills/wiki-research-${TAG}" \
    "Process all unchecked #${TAG} items in RESEARCH_QUEUE.md using the 5-step research loop (Define → Triage → Query → Verify → Report). Use web_search with engine brave for sources, intelli_extract on fetched URLs, intelli_collate for synthesis. Every claim gets a tier (FACT / LIKELY / SPECULATIVE / UNKNOWN) with a source citation. Create or update wiki pages, include a Limitations section on each, mark items done, and move them to Archive. Append a log entry to wiki/log.md." \
    >"${OUT_DIR}/wiki-research-${TAG}-$(date '+%Y-%m-%d').md" 2>&1

EXIT=$?
END=$(date '+%Y-%m-%d %H:%M:%S')
if [ $EXIT -ne 0 ]; then
    echo "[$TAG] FAIL exit=$EXIT at $END" >> "${LOG_DIR}/runtimes.log"
else
    if [ -x /app/scripts/sync-wiki-repo.sh ]; then
        VAULT_PATH="$VAULT" WIKI_COMMIT_MESSAGE="research: scheduled ${TAG} $(date '+%Y-%m-%d')" /app/scripts/sync-wiki-repo.sh >>"$LOG_FILE" 2>&1 || EXIT=$?
    fi
    if [ $EXIT -ne 0 ]; then
        echo "[$TAG] FAIL wiki-sync exit=$EXIT at $END" >> "${LOG_DIR}/runtimes.log"
    else
        echo "[$TAG] OK at $END" >> "${LOG_DIR}/runtimes.log"
    fi
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') — ${TAG} queue processed.${MODEL:+ (model: $MODEL)}" | tee -a "$LOG_FILE"
exit $EXIT
