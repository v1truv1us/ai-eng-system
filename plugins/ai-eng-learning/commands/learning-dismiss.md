---
name: ai-eng/learning-dismiss
description: OpenCode-only explicit dismissal for the active learning recommendation
agent: build
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Learning Dismiss

OpenCode runtime command. Dismiss the active learning recommendation without executing anything.

- Clears the active recommendation.
- Updates local learning state only.
