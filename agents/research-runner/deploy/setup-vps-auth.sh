#!/bin/bash
# One-time VPS setup: create host auth file for pi-runner bind-mount.
# Run on the VPS (SSH), after signing in with pi on the host.
#
# Usage: ./setup-vps-auth.sh

set -euo pipefail

AUTH_DEST="${PI_AUTH_HOST_FILE:-/data/pi-runner/auth.json}"
AUTH_SRC="${HOME}/.pi/agent/auth.json"

echo "pi-runner VPS auth setup"
echo "  source: ${AUTH_SRC}"
echo "  dest:   ${AUTH_DEST}"

if [ ! -f "$AUTH_SRC" ]; then
    echo "Error: ${AUTH_SRC} not found."
    echo "Install pi on this machine and sign in first:"
    echo "  npm install -g @earendil-works/pi-coding-agent"
    echo "  pi"
    exit 1
fi

sudo mkdir -p "$(dirname "$AUTH_DEST")"
sudo cp "$AUTH_SRC" "$AUTH_DEST"
sudo chmod 600 "$AUTH_DEST"
echo "OK: auth installed at ${AUTH_DEST}"
echo "Redeploy or restart pi-runner in Coolify."
