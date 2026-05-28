#!/bin/bash
set -euo pipefail

# Rotate to the next active (non-comment, non-empty) line in a topic file.
# Usage: rotate-topic.sh <topic-file>
# Returns the selected topic and rotates the file.

FILE="$1"
TMP="${FILE}.tmp"

touch "$FILE"

# Extract active lines (non-empty, non-comment)
mapfile -t lines < <(grep -v '^\s*#' "$FILE" | grep -v '^\s*$')

if [ ${#lines[@]} -eq 0 ]; then
    echo ""
    exit 0
fi

# Pick the first active line
selection="${lines[0]}"

# Rotate: move first active line to end of file
awk '
    /^\s*#/ || /^\s*$/ { print; next }
    !picked { picked=1; save=$0; next }
    { print }
    END { if (save) print save }
' "$FILE" > "$TMP" && mv "$TMP" "$FILE"

echo "$selection"
