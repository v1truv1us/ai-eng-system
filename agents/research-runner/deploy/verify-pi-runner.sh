#!/bin/bash
# Diagnose pi-runner auth and container state on the VPS.
# Usage: ./verify-pi-runner.sh

set -uo pipefail

ok() { echo "OK   $*"; }
warn() { echo "WARN $*"; }
miss() { echo "MISS $*"; }

echo "=== pi-runner verify ==="
echo

AUTH_SRC=""
for candidate in \
  "${HOME}/.pi/agent/auth.json" \
  "/data/pi-runner/auth.json" \
  "/root/.pi/agent/auth.json"; do
  if [ -f "$candidate" ]; then
    AUTH_SRC="$candidate"
    ok "host auth: $candidate"
    break
  fi
done
[ -z "$AUTH_SRC" ] && miss "host auth — run: pi  (then ./setup-vps-auth.sh)"

CID=$(docker ps -q --filter 'name=pi-runner' 2>/dev/null | head -1)
if [ -z "$CID" ]; then
  miss "running pi-runner container — redeploy in Coolify"
else
  ok "container: $CID ($(docker ps --filter id="$CID" --format '{{.Status}}'))"
fi

VOL=$(docker volume ls --format '{{.Name}}' 2>/dev/null | grep 'pi-runner-data' | head -1 || true)
if [ -z "$VOL" ]; then
  miss "pi-runner-data volume — deploy once in Coolify"
else
  MNT=$(docker volume inspect -f '{{.Mountpoint}}' "$VOL" 2>/dev/null)
  ok "volume: $VOL"
  if sudo test -s "$MNT/auth.json" 2>/dev/null; then
    ok "volume auth.json ($(sudo stat -c '%s bytes' "$MNT/auth.json"))"
  else
    miss "volume auth.json at $MNT/auth.json"
    if [ -n "$AUTH_SRC" ]; then
      echo "      fix: ./setup-vps-auth.sh"
    fi
  fi
fi

if [ -n "${CID:-}" ]; then
  for f in /app/data/auth.json /root/.pi/agent/auth.json; do
    if docker exec "$CID" test -s "$f" 2>/dev/null; then
      ok "in container: $f"
    else
      miss "in container: $f"
    fi
  done
  echo
  echo "--- startup log ---"
  docker logs "$CID" 2>&1 | grep -E '\[init\]|Auth|WARN|fatal|ready' | tail -15 || warn "no init lines in docker logs"
fi

echo
echo "=== done ==="
if [ -n "${CID:-}" ] && docker exec "$CID" test -s /app/data/auth.json 2>/dev/null; then
  echo "Auth is wired. Scheduled jobs can run when cron fires."
else
  echo "Auth not wired. Run: ./setup-vps-auth.sh"
fi
