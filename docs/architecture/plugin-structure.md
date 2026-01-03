# Plugin Structure

Multi-platform plugin for Claude Code and OpenCode.

---

## Directory Layout

```
ai-eng-system/
├── content/          # Canonical commands/agents
├── skills/           # Skill definitions
├── .claude/hooks/    # Claude hooks (canonical)
├── src/              # Source code
└── plugins/ai-eng-system/  # Marketplace source
```

---

## Claude Code Plugin

Markdown files in content/commands/ and content/agents/

Hook scripts in .claude/hooks/

Skills in .claude/skills/ (flat structure)

---

## OpenCode Plugin

Commands in .opencode/command/ai-eng/

Agents in .opencode/agent/ai-eng/ (by category)

Tools in .opencode/tool/

Skills in .opencode/skill/ (flat structure)

---

## Marketplace Distribution

plugins/ai-eng-system/ contains committed artifacts

Published to npm as ai-eng-system package

Hooks automatically installed to consumer projects
