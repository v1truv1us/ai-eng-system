#!/bin/bash
# Add a wiki queue item — wrapper for manage-research.sh
# Usage: ./add-research.sh <engineering|research|personal> "<topic>"

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/manage-research.sh" add "$@"
