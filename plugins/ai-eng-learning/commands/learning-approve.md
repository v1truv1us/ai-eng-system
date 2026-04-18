---
name: ai-eng/learning-approve
description: OpenCode-only explicit approval to run the active learning recommendation
agent: build
version: 1.0.0
---

# Learning Approve

OpenCode runtime command. Explicitly approve the active learning recommendation and run its exact stored command.

- If there is no active recommendation, this is a safe no-op.
- If execution fails, the recommendation stays actionable so you can retry.
