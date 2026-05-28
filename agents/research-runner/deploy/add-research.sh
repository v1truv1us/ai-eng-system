#!/bin/bash
# Helper: Add a research item to the queue on a running pi-runner container
# Usage: ./add-research.sh <tag> "<topic>"
#   tag: engineering, research, personal
#   topic: the research question or topic
#
# Example:
#   ./add-research.sh engineering "How does WebAssembly GC work?"
#   ./add-research.sh research "Latest advances in agentic web browsing"
#   ./add-research.sh personal "Best travel routers 2026"

set -euo pipefail

TAG="${1:?Usage: add-research.sh <engineering|research|personal> \"<topic>\"}"
TOPIC="${2:?Usage: add-research.sh <engineering|research|personal> \"<topic>\"}"

# Try docker exec (works if you have docker access to the VPS)
CONTAINER="${PI_RUNNER_CONTAINER:-pi-runner}"

if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER}$"; then
    echo "Adding '#${TAG}' item to running container: ${CONTAINER}"
    docker exec "$CONTAINER" python3 -c "
import sys

vault = '/app/data/vault'
queue_file = f'{vault}/RESEARCH_QUEUE.md'

with open(queue_file, 'r') as f:
    content = f.read()

# Find the section
section_marker = f'## #${TAG}'
if section_marker not in content:
    print(f'ERROR: Section {section_marker} not found in queue', file=sys.stderr)
    sys.exit(1)

# Add the item right after the section header
parts = content.split(section_marker, 1)
after = parts[1]

# Find the end of the first line (the section header line)
newline_idx = after.index('\n')
item_line = '\n- [ ] ${TOPIC}'

parts[1] = after[:newline_idx + 1] + item_line + after[newline_idx + 1:]
new_content = section_marker.join(parts)

with open(queue_file, 'w') as f:
    f.write(new_content)

print('Added: - [ ] ${TOPIC}')
print(f'Section: #${TAG}')
"
else
    echo "Container '${CONTAINER}' not found locally."
    echo ""
    echo "Options:"
    echo "  1. SSH to VPS and run: docker exec pi-runner bash"
    echo "     Then edit: /app/data/vault/RESEARCH_QUEUE.md"
    echo ""
    echo "  2. Use Coolify's terminal to edit RESEARCH_QUEUE.md"
    echo ""
    echo "  3. Set PI_RUNNER_CONTAINER env var if using remote docker:"
    echo "     DOCKER_HOST=ssh://user@vps ./add-research.sh ${TAG} \"${TOPIC}\""
    exit 1
fi
