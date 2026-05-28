#!/bin/bash
set -euo pipefail

# Smart model picker for scheduled pi agents.
# Rotates through available models based on task type, cost, recency, and usage limits.
#
# Usage: pick-model.sh --task-type <research|brief|scan|review>
# Outputs: model identifier ready for pi --model

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEDULED_DIR="${SCRIPT_DIR}/../scheduled"
MODELS_FILE="${SCHEDULED_DIR}/models.json"
USAGE_FILE="${SCHEDULED_DIR}/usage.json"

# Default task type
TASK_TYPE=""

# Parse args
while [[ $# -gt 0 ]]; do
    case "$1" in
        --task-type)
            TASK_TYPE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [[ -z "$TASK_TYPE" ]]; then
    echo "Usage: pick-model.sh --task-type <research|brief|scan|review>" >&2
    exit 1
fi

TODAY=$(date '+%Y-%m-%d')
NOW_EPOCH=$(date +%s)

python3 - "$MODELS_FILE" "$USAGE_FILE" "$TASK_TYPE" "$TODAY" "$NOW_EPOCH" << 'PYEOF'
import json, sys, random, math

models_file, usage_file, task_type, today, now_epoch = sys.argv[1:]
now_epoch = int(now_epoch)

with open(models_file) as f:
    registry = json.load(f)

with open(usage_file) as f:
    usage = json.load(f)

# Ensure today's entry exists
if today not in usage.get("days", {}):
    usage.setdefault("days", {})[today] = {}

day_usage = usage["days"][today]
scoring = registry.get("scoring", {})
cost_w = scoring.get("cost_weight", 0.4)
recency_w = scoring.get("recency_weight", 0.4)
random_w = scoring.get("random_weight", 0.2)
max_recency_hours = scoring.get("max_recency_hours", 72)
max_recency_seconds = max_recency_hours * 3600

candidates = []
for m in registry.get("models", []):
    if not m.get("enabled", True):
        continue
    if task_type not in m.get("tasks", []):
        continue

    model_key = f"{m['provider']}/{m['id']}"
    used_today = day_usage.get(model_key, 0)
    limit = m.get("daily_limit", 9999)
    if used_today >= limit:
        continue

    last_picked = usage.get("last_picked", {}).get(model_key, 0)
    hours_since = (now_epoch - last_picked) / 3600 if last_picked else max_recency_hours + 1
    recency_score = min(hours_since / max_recency_hours, 1.0)

    max_cost = max(mm.get("cost_score", 1) for mm in registry["models"] if mm.get("enabled"))
    cost_score = 1.0 - (m.get("cost_score", 1) / max_cost) if max_cost > 0 else 1.0

    random_score = random.random()

    total_score = (cost_w * cost_score) + (recency_w * recency_score) + (random_w * random_score)

    remaining = limit - used_today
    if remaining <= 2:
        total_score *= 0.3
    elif remaining <= 5:
        total_score *= 0.6

    candidates.append({
        "model": m,
        "key": model_key,
        "score": total_score,
        "used_today": used_today,
        "limit": limit,
        "remaining": remaining,
    })

if not candidates:
    print("")
    sys.exit(0)

candidates.sort(key=lambda x: x["score"], reverse=True)
picked = candidates[0]
m = picked["model"]

model_key = picked["key"]
day_usage[model_key] = day_usage.get(model_key, 0) + 1
usage.setdefault("last_picked", {})[model_key] = now_epoch

with open(usage_file, "w") as f:
    json.dump(usage, f, indent=2)

default_provider = registry.get("default_provider", "cursor-agent")
if m["provider"] == default_provider:
    print(m["id"])
else:
    print(f"{m['provider']}/{m['id']}")

sys.stderr.write(
    f"[pick-model] task={task_type} picked={m.get('name', m['id'])} "
    f"score={picked['score']:.3f} "
    f"used_today={picked['used_today']+1}/{picked['limit']} "
    f"candidates={len(candidates)}\n"
)
PYEOF
