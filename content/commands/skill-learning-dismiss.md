---
name: ai-eng/skill-learning-dismiss
description: Reject a pending skill_edit proposal so it is excluded from shadow evaluation
agent: build
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Skill Learning Dismiss

Reject a pending skill improvement proposal. The proposal record is kept for audit but never shadow-evaluated or promoted.

Usage: `/ai-eng/skill-learning-dismiss "<skill>:<proposal-id>"`

1. Run: `bun scripts/skill-proposal-decision.ts <skill>:<proposal-id> reject`
2. Report the resulting decision.
