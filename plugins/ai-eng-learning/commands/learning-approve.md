---
name: ai-eng/learning-approve
description: OpenCode-only explicit approval to run the active learning recommendation
agent: build
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Learning Approve

OpenCode runtime command. Explicitly approve the active learning recommendation and run its exact stored command.

- If there is no active recommendation, this is a safe no-op.
- If execution fails, the recommendation stays actionable so you can retry.
