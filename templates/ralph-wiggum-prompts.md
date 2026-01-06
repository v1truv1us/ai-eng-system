# Ralph Wiggum Prompt Templates

## Template 1: TDD Implementation

```markdown
Implement [FEATURE] using Test-Driven Development.

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]

Process:
1. Write failing test for next requirement
2. Implement minimal code to make test pass
3. Run tests: npm test
4. If any tests fail, analyze and fix
5. Refactor if needed
6. Repeat for all requirements

Success Criteria:
- All requirements implemented
- All tests passing
- Test coverage > 80%
- Code follows project conventions from CLAUDE.md

Output <promise>DONE</promise> when all criteria met.

Keep iterating until all tests pass and requirements met.
```

## Template 2: Bug Fixing

```markdown
Fix this bug: [BUG DESCRIPTION]

Context:
[Relevant code context, error messages, reproduction steps]

Process:
1. Reproduce the bug to confirm issue
2. Identify root cause
3. Implement minimal fix
4. Add regression test
5. Verify fix resolves issue
6. Check no new problems introduced
7. Run full test suite

Success Criteria:
- Bug no longer reproducible
- Regression test added and passing
- No test failures in suite
- No new issues introduced

Output <promise>FIXED</promise> when resolved.

Keep iterating until bug is completely fixed.
```

## Template 3: Refactoring

```markdown
Refactor [COMPONENT] to [GOAL].

Context:
[Current state, pain points, desired outcome]

Constraints:
- All existing tests must pass
- No behavior changes
- Make incremental commits for each change
- Follow project coding standards from CLAUDE.md

Process:
1. Verify tests pass before starting: npm test
2. Apply next refactoring step
3. Run tests
4. If failing, revert and try different approach
5. Commit successful change
6. Repeat until refactoring complete

Success Criteria:
- All tests passing
- Code is cleaner/more maintainable
- No behavior changes
- Commits document each change clearly

Output <promise>REFACTORED</promise> when complete.

Keep iterating until refactoring is complete without breaking tests.
```

## Template 4: Feature Implementation

```markdown
Implement [FEATURE] for [SYSTEM].

Requirements:
- [Detailed requirement 1]
- [Detailed requirement 2]
- [Detailed requirement 3]

Architecture:
[Architectural decisions, patterns to follow]

Process:
1. Create feature branch
2. Write acceptance tests
3. Implement feature incrementally
4. Run tests after each increment
5. Fix failures and iterate
6. Update documentation
7. Run full test suite

Success Criteria:
- All requirements met
- All tests passing
- Code reviewed (if applicable)
- Documentation updated
- No breaking changes

Output <promise>COMPLETE</promise> when feature is production-ready.

Keep iterating until all acceptance criteria met.
```

## Template 5: Quality Gate Passing

```markdown
Get the codebase passing all quality gates.

Current Issues:
[List failing tests, linting errors, security issues]

Quality Gates:
- All unit tests passing
- All integration tests passing
- No linting errors
- No security vulnerabilities
- Test coverage > [X]%

Process:
1. Run tests and capture failures
2. Fix highest priority issue
3. Re-run tests
4. If passing, move to next issue
5. Repeat until all gates pass

Priority Order:
1. Test failures
2. Security vulnerabilities
3. Linting errors
4. Coverage improvements

Output <promise>ALL_GATES_PASSING</promise> when complete.

Keep iterating until all quality gates are green.
```
