# Marketplace

Distribution via npm and marketplace.

---

## Marketplace Package

plugins/ai-eng-system/ is canonical source

Bundled for npm publishing as ai-eng-system

---

## Package Contents

Commands and agents (Markdown)

Skills (SKILL.md files)

Hooks (Python + JSON configuration)

Plugin manifest files

---

## Installation Behavior

npm install triggers postinstall script

Hooks copied to consumer .claude/hooks/

Existing hooks backed up

---

## Verification

Check hooks installed: ls -la .claude/hooks/

Verify functionality with test prompts

Run integration tests: node scripts/integration-test.js

---

## Updating

npm update ai-eng-system

Rebuild: bun run build

New hooks installed with backup
