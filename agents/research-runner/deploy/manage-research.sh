#!/bin/bash
# Manage pi-runner research queues from the VPS (or anywhere with docker access).
#
# Usage:
#   ./manage-research.sh list
#   ./manage-research.sh add <engineering|research|personal> "Topic question"
#   ./manage-research.sh edit
#   ./manage-research.sh topics
#   ./manage-research.sh topics-add "Deep research question"
#   ./manage-research.sh competitors
#   ./manage-research.sh competitors-add "Company name"
#
# Env: PI_RUNNER_CONTAINER — container name filter (default: pi-runner)

set -euo pipefail

CONTAINER_FILTER="${PI_RUNNER_CONTAINER:-pi-runner}"
CID=$(docker ps -q --filter "name=${CONTAINER_FILTER}" 2>/dev/null | head -1 || true)

usage() {
  sed -n '3,14p' "$0" | sed 's/^# \?//'
  exit "${1:-0}"
}

require_container() {
  if [ -z "$CID" ]; then
    echo "Error: no running container matching name=${CONTAINER_FILTER}" >&2
    exit 1
  fi
}

cmd="${1:-help}"
shift || true

case "$cmd" in
  help|-h|--help) usage 0 ;;

  list|ls)
    require_container
    docker exec "$CID" cat /app/data/vault/RESEARCH_QUEUE.md
    ;;

  add)
    TAG="${1:?Usage: manage-research.sh add <engineering|research|personal> \"topic\"}"
    TOPIC="${2:?Usage: manage-research.sh add <engineering|research|personal> \"topic\"}"
    case "$TAG" in engineering|research|personal) ;; *)
      echo "Error: tag must be engineering, research, or personal" >&2
      exit 1
      ;;
    esac
    require_container
    docker exec -e TAG="$TAG" -e TOPIC="$TOPIC" "$CID" python3 <<'PY'
import os

tag = os.environ["TAG"]
topic = os.environ["TOPIC"]
queue_file = "/app/data/vault/RESEARCH_QUEUE.md"
section_marker = f"## #{tag}"

with open(queue_file, encoding="utf-8") as f:
    content = f.read()

if section_marker not in content:
    raise SystemExit(f"ERROR: section {section_marker} not found")

before, after = content.split(section_marker, 1)
newline_idx = after.index("\n")
item_line = f"\n- [ ] {topic}"
new_content = before + section_marker + after[: newline_idx + 1] + item_line + after[newline_idx + 1 :]

with open(queue_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Added to #{tag}: {topic}")
PY
    ;;

  edit)
    require_container
    exec docker exec -it "$CID" vi /app/data/vault/RESEARCH_QUEUE.md
    ;;

  topics)
    require_container
    docker exec "$CID" sh -c 'f=/app/data/scheduled/research-topics.txt; [ -f "$f" ] || f=/app/scheduled/research-topics.txt; cat "$f"'
    ;;

  topics-add)
    LINE="${1:?Usage: manage-research.sh topics-add \"question\"}"
    require_container
    docker exec -e LINE="$LINE" "$CID" sh -c '
      f=/app/data/scheduled/research-topics.txt
      [ -f "$f" ] || f=/app/scheduled/research-topics.txt
      printf "%s\n" "$LINE" >> "$f"
      echo "Appended to $f"
    '
    ;;

  competitors|comps)
    require_container
    docker exec "$CID" sh -c 'f=/app/data/scheduled/competitors.txt; [ -f "$f" ] || f=/app/scheduled/competitors.txt; cat "$f"'
    ;;

  competitors-add|comps-add)
    LINE="${1:?Usage: manage-research.sh competitors-add \"name\"}"
    require_container
    docker exec -e LINE="$LINE" "$CID" sh -c '
      f=/app/data/scheduled/competitors.txt
      [ -f "$f" ] || f=/app/scheduled/competitors.txt
      printf "%s\n" "$LINE" >> "$f"
      echo "Appended to $f"
    '
    ;;

  *)
    echo "Unknown command: $cmd" >&2
    usage 1
    ;;
esac
