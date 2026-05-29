# Shared paths — scheduled config on the data volume when seeded by entrypoint.
SCHEDULED_DIR="/app/data/scheduled"
if [ ! -f "${SCHEDULED_DIR}/research-topics.txt" ]; then
  SCHEDULED_DIR="/app/scheduled"
fi
OUTPUT_DIR="/app/data/output"
mkdir -p "$OUTPUT_DIR" "${SCHEDULED_DIR}" 2>/dev/null || true
