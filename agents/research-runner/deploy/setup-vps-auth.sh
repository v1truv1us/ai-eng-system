#!/bin/bash
# Copy host pi auth into the pi-runner Docker data volume (/app/data/auth.json).
# Run on the VPS after: npm i -g @earendil-works/pi-coding-agent && pi
#
# Usage: ./setup-vps-auth.sh

set -euo pipefail

AUTH_SRC="${HOME}/.pi/agent/auth.json"
BACKUP_DEST="/data/pi-runner/auth.json"

echo "pi-runner VPS auth setup"
echo "  source: ${AUTH_SRC}"

if [ ! -f "$AUTH_SRC" ]; then
    echo "Error: ${AUTH_SRC} not found. Run 'pi' and sign in first."
    exit 1
fi

VOL_NAME=$(docker volume ls --format '{{.Name}}' 2>/dev/null | grep 'pi-runner-data' | head -1 || true)
if [ -z "$VOL_NAME" ]; then
    echo "Error: no pi-runner-data Docker volume found."
    echo "Deploy pi-runner once in Coolify, then run this script again."
    exit 1
fi

MOUNT=$(docker volume inspect -f '{{.Mountpoint}}' "$VOL_NAME")
echo "  volume: ${VOL_NAME}"
echo "  mount:  ${MOUNT}/auth.json"

sudo cp "$AUTH_SRC" "${MOUNT}/auth.json"
sudo chmod 600 "${MOUNT}/auth.json"

sudo mkdir -p "$(dirname "$BACKUP_DEST")"
sudo cp "$AUTH_SRC" "$BACKUP_DEST"
sudo chmod 600 "$BACKUP_DEST"

echo "OK: auth installed in container volume and backed up to ${BACKUP_DEST}"
echo "Restart pi-runner in Coolify (or: docker restart \$(docker ps -qf name=pi-runner))"
