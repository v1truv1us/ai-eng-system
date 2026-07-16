---
name: verify
description: Run a standardized verification loop - lint, typecheck, test, build
agent: build
version: 1.0.0
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Verify Command

Run the full verification loop to ensure code quality before review.

> **Phase 5 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Verify → Review

Quality gate sequence (stop at first failure):
1. Lint
2. Type check
3. Unit tests
4. Build
5. Integration tests (if applicable)

## Integration

- Reads from: `/ai-eng/work` output (implemented features)
- Feeds into: `/ai-eng/review`

$ARGUMENTS
