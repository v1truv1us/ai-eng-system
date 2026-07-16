---
name: ai-eng/learning-snooze
description: OpenCode-only explicit snooze for the active learning recommendation
agent: build
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Learning Snooze

OpenCode runtime command. Snooze the active learning recommendation without executing anything.

Usage:

- `/ai-eng/learning-snooze`
- `/ai-eng/learning-snooze 60m`
- `/ai-eng/learning-snooze 2h`
- `/ai-eng/learning-snooze 1d`

If no duration is provided, OpenCode uses a safe default snooze window.
