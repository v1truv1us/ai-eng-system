---
name: verify
description: Run a standardized verification loop - lint, typecheck, test, build
agent: build
version: 1.0.0
---

# Verify Command

Run the full verification loop to ensure code quality before committing or merging.

Quality gate sequence (stop at first failure):
1. Lint
2. Type check
3. Unit tests
4. Build
5. Integration tests (if applicable)

$ARGUMENTS
