#!/bin/bash
# Session Start Hook
# Loads project context and available skills when a new session begins

echo "🚀 AI Eng System Session Started"
echo ""

# Show project context
if [ -f "CLAUDE.md" ]; then
  echo "📋 Project constitution loaded (CLAUDE.md)"
fi

if [ -f "AGENTS.md" ]; then
  echo "🤖 Agent registry loaded (AGENTS.md)"
fi

# Count available skills
SKILL_COUNT=$(find skills/ -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
echo "📚 Available skills: $SKILL_COUNT"

# Count available commands
COMMAND_COUNT=$(find .claude/commands/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "⚡ Available commands: $COMMAND_COUNT"

# Count available agents
AGENT_COUNT=$(find .opencode/agent/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "🎯 Available agents: $AGENT_COUNT"

# Show references if they exist
if [ -d "references/" ]; then
  REF_COUNT=$(find references/ -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  echo "📖 Reference files: $REF_COUNT"
fi

echo ""
echo "💡 Tip: Use /ai-eng/research to investigate, /ai-eng/specify to plan,"
echo "   /ai-eng/plan to break down, /ai-eng/work to execute, /ai-eng/review to validate"
echo ""
