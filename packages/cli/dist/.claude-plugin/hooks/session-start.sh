#!/bin/bash
# Session start hook for ai-eng-system plugin
# This script calls the Python version reader

# Get the directory where this script is located
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call the Python script
python3 "$HOOK_DIR/session-start.py"