#!/bin/bash
set -euo pipefail

# Process wiki research queue for a given tag via the Research Queue API
# Usage: run-wiki-research.sh <engineering|research|personal>

TAG="${1:?Usage: run-wiki-research.sh <engineering|research|personal>}"
VAULT="${VAULT_PATH:-/app/data/vault}"
PI_DIR="${HOME}/.pi/agent"
LOG_DIR="/app/logs"
LOCK_DIR="/app/locks"
API_BASE="${QUEUE_API_URL:-http://research-queue:4321}"
API_KEY="${RUNNER_API_KEY:?RUNNER_API_KEY env var required}"

mkdir -p "$LOG_DIR" "$LOCK_DIR"
LOG_FILE="${LOG_DIR}/wiki-research-${TAG}.log"

cd "$VAULT" || { echo "Vault not found: $VAULT" >&2; exit 1; }

# Fetch next queued item from the API
RESPONSE=$(curl -sf -H "x-runner-key: $API_KEY" "${API_BASE}/api/queue/next?tag=${TAG}&limit=1" 2>>"$LOG_FILE") || {
    echo "$(date '+%Y-%m-%d %H:%M:%S') — API error fetching #${TAG} items. Skipping." | tee -a "$LOG_FILE"
    exit 0
}

# Check if there are items (empty array = nothing to do)
ITEM_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$ITEM_ID" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') — No queued #${TAG} items. Skipping." | tee -a "$LOG_FILE"
    exit 0
fi

ITEM_TITLE=$(echo "$RESPONSE" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
ITEM_BODY=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['items'][0].get('body','') if d.get('items') else '')" 2>/dev/null || echo "")

echo "$(date '+%Y-%m-%d %H:%M:%S') — Processing #${TAG}: ${ITEM_TITLE}" | tee -a "$LOG_FILE"

# Mark as running
curl -sf -X POST -H "x-runner-key: $API_KEY" "${API_BASE}/api/queue/${ITEM_ID}/start" >>"$LOG_FILE" 2>&1 || true

# Pick model
MODEL=$(/app/scripts/pick-model.sh --task-type research 2>>"$LOG_FILE" || echo "")
MODEL_FLAG=""
[ -n "$MODEL" ] && MODEL_FLAG="--model $MODEL"

START_EPOCH=$(date '+%s')

# Run the research
LOCK="${LOCK_DIR}/wiki-research-${TAG}.lock"
mkdir -p "$LOG_DIR"

RESEARCH_PROMPT="Research topic: ${ITEM_TITLE}"
if [ -n "$ITEM_BODY" ]; then
    RESEARCH_PROMPT="${RESEARCH_PROMPT}

Context:
${ITEM_BODY}"
fi

# Force web_search (Brave) by excluding the intelli_* tools that the model falls back to.
# intelli_* tools call zai (which has no web access) and hallucinate URLs.
# web_search via pi-browse calls the real Brave Search API with BRAVE_API_KEY.
pi -p $MODEL_FLAG \
    --exclude-tools intelli_search,intelli_research \
    --skill "/app/skills/wiki-research-${TAG}" \
    "$RESEARCH_PROMPT

Follow the wiki-research skill's 5-step loop (Define → Triage → Query → Verify → Report).

CRITICAL: For every web search, you MUST call web_search (engine brave). NEVER invent URLs. NEVER use intelli_search. For each URL you want to read in depth, call web_fetch to retrieve its content, then summarize. Every factual claim gets a tier (FACT / LIKELY / SPECULATIVE / UNKNOWN) with a source citation including access date. Create or update wiki pages in ${VAULT}/wiki/. Include a Limitations section.
Write a summary to wiki/log.md." \
    >>"${LOG_FILE}" 2>&1

EXIT=$?
END_EPOCH=$(date '+%s')
DURATION=$((END_EPOCH - START_EPOCH))

# Mark as complete or failed
if [ $EXIT -ne 0 ]; then
    curl -sf -X POST -H "x-runner-key: $API_KEY" -H "Content-Type: application/json" \
        -d "{\"success\":false,\"duration_seconds\":${DURATION},\"error_message\":\"pi exited with code ${EXIT}\",\"model\":\"${MODEL:-unknown}\"}" \
        "${API_BASE}/api/queue/${ITEM_ID}/complete" >>"$LOG_FILE" 2>&1 || true
    echo "[$TAG] FAIL exit=$EXIT duration=${DURATION}s" >> "${LOG_DIR}/runtimes.log"
else
    if [ -x /app/scripts/sync-wiki-repo.sh ]; then
        VAULT_PATH="$VAULT" WIKI_COMMIT_MESSAGE="research: ${ITEM_TITLE}" /app/scripts/sync-wiki-repo.sh >>"$LOG_FILE" 2>&1 || EXIT=$?
    fi
    if [ ${EXIT:-0} -ne 0 ]; then
        curl -sf -X POST -H "x-runner-key: $API_KEY" -H "Content-Type: application/json" \
            -d "{\"success\":false,\"duration_seconds\":${DURATION},\"error_message\":\"wiki sync exited with code ${EXIT}\",\"model\":\"${MODEL:-unknown}\"}" \
            "${API_BASE}/api/queue/${ITEM_ID}/complete" >>"$LOG_FILE" 2>&1 || true
        echo "[$TAG] FAIL wiki-sync exit=$EXIT duration=${DURATION}s" >> "${LOG_DIR}/runtimes.log"
    else
        curl -sf -X POST -H "x-runner-key: $API_KEY" -H "Content-Type: application/json" \
            -d "{\"success\":true,\"duration_seconds\":${DURATION},\"model\":\"${MODEL:-unknown}\"}" \
            "${API_BASE}/api/queue/${ITEM_ID}/complete" >>"$LOG_FILE" 2>&1 || true
        echo "[$TAG] OK item=${ITEM_ID} duration=${DURATION}s" >> "${LOG_DIR}/runtimes.log"
    fi
fi

exit $EXIT
