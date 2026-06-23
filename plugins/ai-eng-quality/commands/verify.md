---
name: verify
description: Run a standardized verification loop - lint, typecheck, test, build
agent: build
version: 1.0.0
---

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
