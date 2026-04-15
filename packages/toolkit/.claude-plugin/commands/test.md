---
name: test
description: Run TDD cycle - write failing test, implement, refactor
agent: build
version: 1.0.0
---

# Test (Lifecycle Alias)

This is a lifecycle alias for the Build phase TDD entrypoint.

Load the `test-driven-development` skill. Follow the Red-Green-Refactor cycle:

1. **Red**: Write a failing test that describes expected behavior
2. **Green**: Write the minimum implementation to pass the test
3. **Refactor**: Clean up while keeping all tests passing

Target 80%+ coverage. Critical paths need 100%.

$ARGUMENTS
