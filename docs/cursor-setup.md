# Cursor IDE Setup

## Overview

This guide explains how to set up ai-eng-system skills, agents, and commands in Cursor IDE.

## Installation

### Option 1: Copy Skills to Cursor Rules

1. Create `.cursor/rules/` directory in your project root
2. Copy skill contents from `skills/*/SKILL.md` into `.cursor/rules/`:

```bash
# Copy all skills
for skill in skills/*/; do
  name=$(basename "$skill")
  cp "$skill/SKILL.md" ".cursor/rules/${name}.md"
done
```

### Option 2: Use Cursor's Custom Instructions

1. Open Cursor Settings → Custom Instructions
2. Paste the contents of `CLAUDE.md` as your base instructions
3. Add references to key skills in your custom instructions

## Available Skills

After installation, the following skills are available:

- `spec-driven-development` — Write specs before coding
- `test-driven-development` — Red-Green-Refactor workflow
- `incremental-implementation` — Thin vertical slices
- `code-review-and-quality` — Multi-axis review
- `code-simplification` — Behavior-preserving simplification
- `debugging-and-error-recovery` — Root-cause debugging
- `security-and-hardening` — OWASP Top 10 prevention
- `performance-optimization` — Measure-first optimization
- `git-workflow-and-versioning` — Trunk-based development
- `ci-cd-and-automation` — Shift Left, quality gates
- And 28 more...

## Using Agents

Cursor doesn't support subagents natively. Instead:

1. Use Cursor's Chat with system prompts from `.opencode/agent/ai-eng/`
2. For code review, paste the agent's instructions into Chat
3. For specialized tasks, use the relevant skill's instructions

## Best Practices

1. **Use skills as context**: When working on a task, open the relevant skill's `.md` file in Cursor's editor to provide context
2. **Follow the workflow**: research → specify → plan → work → review
3. **Verify after every change**: Run tests, lint, and typecheck
4. **Keep changes small**: ~100 lines per commit
