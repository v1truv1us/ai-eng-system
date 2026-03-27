# Ralph Wiggum Prompt Templates

Use these templates when invoking Ralph Wiggum loops. Copy the relevant template and customize the `[bracketed]` sections.

---

## Template 1: TDD Implementation

### Prompt

```
[description of what to implement]

Process:
1. Write failing tests for [feature/behavior]
2. Run tests — confirm they fail
3. Implement the feature to make tests pass
4. Run tests — confirm they pass
5. Refactor if needed (tests stay green)
6. If any test fails, debug and fix
7. Repeat until all tests pass

Requirements:
- All tests passing
- Test coverage for [scope]
- Code follows project conventions in CLAUDE.md

Output: <promise>COMPLETE</promise> when all tests pass and code is clean.
```

### Success Criteria
- [ ] All new tests written and passing
- [ ] All existing tests still passing
- [ ] No lint or type errors
- [ ] Code follows project style

### Completion Promise
`<promise>COMPLETE</promise>`

---

## Template 2: Bug Fixing

### Prompt

```
Fix the bug: [bug description]

Current behavior: [what happens]
Expected behavior: [what should happen]
Reproduction: [steps or failing test]

Process:
1. Write a test that reproduces the bug (should fail)
2. Analyze the root cause
3. Implement the fix
4. Run the reproduction test — confirm it passes
5. Run full test suite — confirm no regressions
6. If fix doesn't work, try a different approach

Requirements:
- Bug is fixed (reproduction test passes)
- No regressions (all existing tests pass)
- Root cause documented

Output: <promise>FIXED</promise> when bug is resolved and verified.
```

### Success Criteria
- [ ] Reproduction test passes
- [ ] All existing tests pass
- [ ] Root cause identified
- [ ] No regressions introduced

### Completion Promise
`<promise>FIXED</promise>`

---

## Template 3: Refactoring

### Prompt

```
Refactor: [what to refactor]

Current state: [description of current code]
Desired state: [description of target state]
Scope: [files/modules affected]

Process:
1. Run existing tests — confirm they all pass (baseline)
2. Make the refactoring change
3. Run tests — confirm they still pass
4. If tests fail, fix the refactoring (don't change tests unless they tested implementation details)
5. Run linter and type checker
6. Repeat until refactoring is complete and all checks pass

Requirements:
- All tests pass (behavior preserved)
- Linter passes
- Type checker passes
- Code is more [readable/maintainable/performant] than before

Output: <promise>REFACTORED</promise> when refactoring is complete and verified.
```

### Success Criteria
- [ ] All tests pass (behavior preserved)
- [ ] Linter passes
- [ ] Type checker passes
- [ ] Code quality improved measurably
- [ ] No public API changes

### Completion Promise
`<promise>REFACTORED</promise>`

---

## Template 4: Feature Implementation

### Prompt

```
Implement: [feature description]

Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]

Process:
1. Plan the implementation
2. Write tests for each requirement
3. Implement the feature
4. Run tests — confirm all pass
5. If any test fails, debug and fix
6. Run linter and type checker
7. Repeat until everything is green

Additional constraints:
- Follow existing patterns in [directory]
- Use [libraries/frameworks] already in the project
- Document any new public APIs

Output: <promise>COMPLETE</promise> when all requirements are met and verified.
```

### Success Criteria
- [ ] All requirements implemented
- [ ] Tests for each requirement passing
- [ ] Linter and type checker pass
- [ ] Follows project conventions
- [ ] Documentation updated if needed

### Completion Promise
`<promise>COMPLETE</promise>`

---

## Template 5: Quality Gate Passing

### Prompt

```
Pass quality gate: [gate description — lint, type check, security scan, etc.]

Current failures:
- [failure 1]
- [failure 2]
- [failure 3]

Process:
1. Run the quality gate command: `[command]`
2. Analyze each failure
3. Fix failures one at a time
4. Re-run quality gate after each fix
5. If a fix introduces new failures, address those too
6. Repeat until quality gate passes cleanly

Requirements:
- Quality gate command exits with 0
- No new issues introduced
- Fixes are minimal and targeted

Output: <promise>GATE_PASSING</promise> when quality gate passes.
```

### Success Criteria
- [ ] Quality gate command passes (exit code 0)
- [ ] No new issues introduced
- [ ] Fixes are minimal and targeted
- [ ] All existing tests still pass

### Completion Promise
`<promise>GATE_PASSING</promise>`

---

## Usage Notes

1. **Choose the right template** based on the task type
2. **Customize bracketed sections** with actual values
3. **Set max iterations** appropriate to complexity (10-50)
4. **Monitor progress** — check outputs every 5-10 iterations
5. **Detect stuck loops** — if no progress after 5 iterations, output `<promise>STUCK_REPORT</promise>` with details

### Combining Templates

For complex tasks, chain templates:

```
Phase 1: Feature Implementation (Template 4)
Phase 2: Quality Gate Passing (Template 5)
Phase 3: Refactoring (Template 3)
```

Each phase uses its own completion promise, and the overall workflow completes when all phases finish.
