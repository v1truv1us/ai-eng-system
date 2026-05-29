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

# ── 2. Initialize auth.json from environment variable ──
AUTH_FILE="${PI_DIR}/auth.json"

if [ -n "${PI_AUTH_JSON:-}" ]; then
    echo "$PI_AUTH_JSON" > "$AUTH_FILE"
    echo "[init] Auth configured from PI_AUTH_JSON env var"
elif [ -f /app/data/auth.json ]; then
    cp /app/data/auth.json "$AUTH_FILE"
    echo "[init] Auth configured from persistent volume"
else
    echo "[WARN] No auth configured. Set PI_AUTH_JSON env var or mount auth.json."
    echo "[WARN] Jobs will fail until auth is configured."
fi

# Persist auth to volume so it survives restarts without the env var
if [ -f "$AUTH_FILE" ] && [ ! -f /app/data/auth.json ]; then
    cp "$AUTH_FILE" /app/data/auth.json
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

# ── 4. Initialize usage tracking ──
if [ ! -f /app/scheduled/usage.json ]; then
    echo '{"days":{},"last_picked":{}}' > /app/scheduled/usage.json
fi

# ── 5. Verify pi works ──
echo ""
echo "=== Verification ==="
echo "Node: $(node --version)"
echo "pi: $(which pi)"
echo "ofelia: $(which ofelia)"
echo "Vault: $VAULT"
echo ""

# ── 6. Start ofelia ──
echo "=== Starting cron scheduler ==="
echo "Scheduled jobs:"
grep -E '^\[job-' /app/ofelia.ini 2>/dev/null | sed 's/\[job-local "\([^"]*\)"\]/  • \1/' | while read line; do
    echo "$line"
done
echo ""
echo "========================================"
echo "  pi-runner ready"
echo "========================================"
echo ""

exec ofelia daemon --config /app/ofelia.ini
