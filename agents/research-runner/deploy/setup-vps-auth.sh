#!/bin/bash
# Copy host pi auth into the pi-runner Docker data volume (/app/data/auth.json).
# Run on the VPS after: npm i -g @earendil-works/pi-coding-agent && pi
#
# Usage: ./setup-vps-auth.sh

set -euo pipefail

BACKUP_DEST="/data/pi-runner/auth.json"

find_auth_src() {
  local f
  for f in \
    "${HOME}/.pi/agent/auth.json" \
    "/data/pi-runner/auth.json" \
    "/root/.pi/agent/auth.json"; do
    if [ -f "$f" ]; then
      echo "$f"
      return 0
    fi
  done
  return 1
}

AUTH_SRC=$(find_auth_src || true)
if [ -z "$AUTH_SRC" ]; then
  echo "Error: no auth.json found. Tried:"
  echo "  ${HOME}/.pi/agent/auth.json"
  echo "  /data/pi-runner/auth.json"
  echo "  /root/.pi/agent/auth.json"
  echo "Run 'pi' and sign in first (as the user that owns the login)."
  exit 1
fi

VOL_NAME=$(docker volume ls --format '{{.Name}}' 2>/dev/null | grep 'pi-runner-data' | head -1 || true)
if [ -z "$VOL_NAME" ]; then
  echo "Error: no pi-runner-data Docker volume found."
  echo "Deploy pi-runner once in Coolify, then run this script again."
  exit 1
fi

MOUNT=$(docker volume inspect -f '{{.Mountpoint}}' "$VOL_NAME")

echo "pi-runner VPS auth setup"
echo "  source: ${AUTH_SRC}"
echo "  volume: ${VOL_NAME}"
echo "  dest:   ${MOUNT}/auth.json"

sudo cp "$AUTH_SRC" "${MOUNT}/auth.json"
sudo chmod 600 "${MOUNT}/auth.json"

sudo mkdir -p "$(dirname "$BACKUP_DEST")"
sudo cp "$AUTH_SRC" "$BACKUP_DEST"
sudo chmod 600 "$BACKUP_DEST"

CID=$(docker ps -q --filter 'name=pi-runner' | head -1 || true)
if [ -n "$CID" ]; then
  echo "Restarting container ${CID}..."
  docker restart "$CID" >/dev/null
  sleep 4
  if docker exec "$CID" test -s /app/data/auth.json 2>/dev/null; then
    echo "OK: /app/data/auth.json visible in container"
  else
    echo "WARN: restart done but /app/data/auth.json not visible yet — check: ./verify-pi-runner.sh"
  fi
else
  echo "OK: auth installed (no running container to restart — redeploy in Coolify)"
fi

echo "Backup: ${BACKUP_DEST}"
