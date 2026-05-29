#!/bin/bash
set -euo pipefail

# Entrypoint for pi-runner container
# Sets up auth, settings, initializes vault, starts ofelia cron scheduler

echo "========================================"
echo "  pi-runner starting"
echo "========================================"

export HOME="${HOME:-/root}"
PI_DIR="${HOME}/.pi/agent"

# ── 1. Set up settings.json (packages, model config) ──
mkdir -p "$PI_DIR"
if [ ! -f "${PI_DIR}/settings.json" ]; then
    cp /app/config/settings.json "${PI_DIR}/settings.json"
    echo "[init] Settings installed (packages: pi-intelli-search)"
else
    echo "[init] Settings already exist"
fi

# ── 2. Auth (priority: host bind-mount → volume copy → PI_AUTH_JSON env) ──
AUTH_FILE="${PI_DIR}/auth.json"
if [ -f /app/data/auth.json ] && [ -s /app/data/auth.json ]; then
    cp /app/data/auth.json "$AUTH_FILE"
    echo "[init] Auth configured from /app/data/auth.json"
elif [ -f "$AUTH_FILE" ] && [ -s "$AUTH_FILE" ]; then
    echo "[init] Auth present at ${AUTH_FILE}"
elif [ -n "${PI_AUTH_JSON:-}" ]; then
    echo "$PI_AUTH_JSON" > "$AUTH_FILE"
    echo "[init] Auth configured from PI_AUTH_JSON env var"
else
    echo "[WARN] No auth configured."
    echo "[WARN] On the VPS run: ./setup-vps-auth.sh  (copies into the pi-runner data volume)"
    echo "[WARN] Scheduled jobs will fail until auth exists."
fi

# Backup to volume when auth is writable (skip when auth.json is a read-only bind-mount)
if [ -f "$AUTH_FILE" ] && [ -w "$AUTH_FILE" ] && [ ! -f /app/data/auth.json ]; then
    cp "$AUTH_FILE" /app/data/auth.json
    echo "[init] Auth backed up to /app/data/auth.json"
fi

# ── 3. Initialize vault if empty ──
VAULT="/app/data/vault"
mkdir -p "$VAULT/wiki"

if [ ! -f "$VAULT/RESEARCH_QUEUE.md" ]; then
    cat > "$VAULT/RESEARCH_QUEUE.md" << 'QUEUE'
# Research Queue

Add items below under the relevant section. Check them off when done.
The runner processes unchecked items and archives completed ones.

## #engineering
- [ ] <!-- Example: How does WebAssembly garbage collection work? -->

## #research
- [ ] <!-- Example: What are the latest advances in agentic web browsing? -->

## #personal
- [ ] <!-- Example: Best travel routers for digital nomads 2026 -->

## Archive
<!-- Completed items are moved here by the wiki research jobs -->
QUEUE
    echo "[init] Research queue initialized"
fi

if [ ! -f "$VAULT/wiki/index.md" ]; then
    cat > "$VAULT/wiki/index.md" << 'INDEX'
# Wiki Index

Auto-maintained by pi-runner. Updated after each research session.
INDEX
    echo "[init] Wiki index initialized"
fi

# ── 4. Scheduled config on persistent volume (editable without redeploy) ──
mkdir -p /app/data/scheduled /app/data/output
for f in competitors.txt research-topics.txt models.json; do
    if [ ! -f "/app/data/scheduled/$f" ] && [ -f "/app/scheduled/$f" ]; then
        cp "/app/scheduled/$f" "/app/data/scheduled/$f"
    fi
done
if [ ! -f /app/data/scheduled/usage.json ]; then
    echo '{"days":{},"last_picked":{}}' > /app/data/scheduled/usage.json
fi

# ── 5. Verify pi works ──
echo ""
echo "=== Verification ==="
echo "Node: $(node --version)"
echo "pi: $(which pi)"
echo "crond: $(which crond)"
echo "Vault: $VAULT"
echo ""

# ── 6. Start queue web UI (background, auto-restarts if it crashes) ──
if [ -z "${QUEUE_UI_DISABLE:-}" ]; then
    echo "[init] Starting queue UI server on :${QUEUE_UI_PORT:-8080}"
    (
        while true; do
            node /app/queue-server.js || true
            echo "[queue-ui] crashed, restarting in 5s..."
            sleep 5
        done
    ) &
else
    echo "[init] Queue UI disabled (QUEUE_UI_DISABLE set)"
fi

# ── 7. Start cron ──
mkdir -p /app/logs
touch /app/logs/cron.log
echo "=== Starting cron scheduler (dcron) ==="
grep -E '^[0-9*]' /etc/crontabs/root | sed 's/^/  /' || true
echo ""
echo "========================================"
echo "  pi-runner ready"
echo "========================================"
echo ""

# dcron daemon (background). Keep PID 1 alive for Docker healthcheck.
crond -l 6
sleep 2
if ! pgrep crond >/dev/null 2>&1; then
    echo "[fatal] crond failed to start" >&2
    exit 1
fi
echo "[init] crond running (pid $(pgrep crond | head -1))"
exec tail -f /dev/null
