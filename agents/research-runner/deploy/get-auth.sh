#!/bin/bash
# Helper: extract cursor-agent auth for the VPS env var
# Usage: ./get-auth.sh
#
# Output the PI_AUTH_JSON value to paste into Coolify's environment variables.
# Mark it as LOCKED in Coolify.

set -euo pipefail

AUTH_FILE="${HOME}/.pi/agent/auth.json"

if [ ! -f "$AUTH_FILE" ]; then
    echo "Error: $AUTH_FILE not found. Run 'pi' and sign in first."
    exit 1
fi

# Extract only the providers needed by the VPS (cursor-agent for models)
python3 -c "
import json, sys

with open('$AUTH_FILE') as f:
    auth = json.load(f)

# We only need cursor-agent for the VPS (models.json uses cursor-agent provider)
needed = ['cursor-agent']
result = {}
for key in needed:
    if key in auth:
        result[key] = auth[key]
    else:
        print(f'WARNING: {key} not found in auth.json', file=sys.stderr)

if not result:
    print('ERROR: No matching auth entries found', file=sys.stderr)
    sys.exit(1)

# Output as single-line JSON (for env var)
print(json.dumps(result, separators=(',', ':')))
"
