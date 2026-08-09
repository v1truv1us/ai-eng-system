---
name: ai-eng/skill-learning-approve
description: Approve a pending skill_edit proposal so it becomes eligible for shadow evaluation
agent: build
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Skill Learning Approve

Approve a pending skill improvement proposal. Approval does NOT edit any `SKILL.md`; it only marks the proposal eligible for the shadow evaluation gate (`scripts/skill-candidate-eval.ts`). Promotion to the canonical skill happens only via the human-merged `chore/skill-improve` PR.

Usage: `/ai-eng/skill-learning-approve "<skill>:<proposal-id>"`

1. Run: `bun scripts/skill-proposal-decision.ts <skill>:<proposal-id> approve`
2. Report the resulting decision and the proposal's failure signature.
