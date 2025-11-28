#!/bin/bash
# Setup script for Ferg Engineering System - Global OpenCode Installation
# This script copies commands, agents, and skills to ~/.config/opencode/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_DIR="${HOME}/.config/opencode"

echo "🔧 Installing Ferg Engineering System globally to ~/.config/opencode/..."

# Create directories
mkdir -p "$GLOBAL_DIR"/{command,agent,skills/devops}

# Copy commands
if [ -d "$SCRIPT_DIR/.opencode/command" ]; then
  cp -v "$SCRIPT_DIR/.opencode/command"/*.md "$GLOBAL_DIR/command/" 2>/dev/null || true
  echo "✓ Commands installed to $GLOBAL_DIR/command/"
fi

# Copy agents
if [ -d "$SCRIPT_DIR/.opencode/agent" ]; then
  cp -v "$SCRIPT_DIR/.opencode/agent"/*.md "$GLOBAL_DIR/agent/" 2>/dev/null || true
  echo "✓ Agents installed to $GLOBAL_DIR/agent/"
fi

# Copy skills
if [ -d "$SCRIPT_DIR/skills/devops" ]; then
  cp -rv "$SCRIPT_DIR/skills/devops"/* "$GLOBAL_DIR/skills/devops/" 2>/dev/null || true
  echo "✓ Skills installed to $GLOBAL_DIR/skills/"
fi

echo "✅ Global installation complete!"
echo ""
echo "Available commands: plan, review, seo, work, compound, deploy"
echo "Available agents: plan, review, build"
echo "Available subagents: frontend-reviewer, seo-specialist, architect-advisor"
echo ""
echo "You can now use these commands and agents in any OpenCode project."
