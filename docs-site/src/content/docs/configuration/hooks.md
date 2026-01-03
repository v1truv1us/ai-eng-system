---
title: Hooks
---

# Hooks

Claude Code hooks for prompt optimization.

---

## Hook Location

Canonical source: `.claude/hooks/`

Contains hooks.json and Python scripts

Copied to marketplace plugin automatically

---

## Hook Types

SessionStart: Initialize system on session start

UserPromptSubmit: Optimize prompts automatically

---

## Hook Behavior

SessionStart: Shows loaded commands

UserPromptSubmit: Applies optimization techniques

Respects escape prefix `!`

---

## Marketplace Distribution

Hooks bundled in `plugins/ai-eng-system/hooks/`

Install script copies to `.claude/hooks/`

Existing hooks backed up with timestamp

See HOOK-INSTALLATION.md for details
