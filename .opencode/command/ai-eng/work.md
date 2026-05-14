---
name: ai-eng/work
description: Execute a plan or task with systematic tracking, quality gates, and comprehensive validation.
agent: build
version: 2.0.0
inputs:
  - name: plan
    type: string
    required: false
    description: Plan file path or task ID
  - name: fromPlan
    type: string
    required: false
    description: Path to plan file to execute
outputs:
  - name: execution_report
    type: structured
    format: JSON
    description: Execution report with task results and quality gate outcomes
---

# Work Command

Execute a plan or task: $ARGUMENTS

> **Phase 4 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

Execute implementation systematically using TDD, run quality gates at each step, and ensure all acceptance criteria are met.

## Why This Matters

Code runs in production. Bugs cause outages. Security issues compromise data. Poor quality makes maintenance difficult. This implementation task is critical for delivering reliable, maintainable features.

## The Challenge

The challenge is maintaining development velocity without compromising on quality, testing, or documentation. Success means all tasks complete, all tests pass, all quality gates succeed, and code is ready for production.

## Phase 0: Prompt Refinement (CRITICAL - Do First)

## Quick Start

```bash
/ai-eng/work "specs/auth/plan.yaml"
/ai-eng/work --from-plan=plans/auth.yaml --continue
/ai-eng/work "FEAT-001" --dry-run

# Ralph Wiggum iteration for complex implementation
/ai-eng/work "implement feature" --ralph --ralph-show-progress

# Ralph Wiggum with custom quality gates
/ai-eng/work "auth system" --ralph --ralph-max-iterations 20 --ralph-quality-gate="npm test && npm run security-scan"
```

## Options

| Option | Description |
|--------|-------------|
| `--from-plan <path>` | Path to plan file to execute |
| `--continue` | Resume interrupted work |
| `--validate-only` | Run validation without implementation |
| `--dry-run` | Show what would be done without executing |
| `-v, --verbose` | Enable verbose output |
| `--ralph` | Enable Ralph Wiggum iteration mode for TDD-driven implementation |
| `--ralph-max-iterations <n>` | Maximum iterations for Ralph Wiggum mode [default: 10] |
| `--ralph-completion-promise <text>` | Custom completion promise text [default: "Implementation meets all acceptance criteria and passes quality gates"] |
| `--ralph-quality-gate <command>` | Command to run after each iteration for quality validation |
| `--ralph-stop-on-gate-fail` | Stop iterations when quality gate fails [default: continue] |
| `--ralph-show-progress` | Show detailed iteration progress |
| `--ralph-log-history <file>` | Log iteration history to JSON file |
| `--ralph-verbose` | Enable verbose Ralph Wiggum iteration output |

## Phase 0: Prompt Refinement (CRITICAL - Do First)

Load `skills/prompt-refinement/SKILL.md` and use phase: `work` to transform your prompt into structured TCRO format (Task, Context, Requirements, Output). If using `--ralph`, also load `skills/workflow/ralph-wiggum/SKILL.md` for iterative development cycles.

## Phase 1: Setup & Planning

### 1.1 Load Plan and Spec

**Load Plan:**
- If argument is a file path: Load from `specs/[feature]/plan.md`
- If argument is a task ID: Find in `specs/[feature]/plan.md` or recent plans
- If `--continue`: Resume from last incomplete task
- Extract all tasks with dependencies and time estimates

**Load Specification (if exists):**
- Check for `specs/[feature]/spec.md` alongside to plan
- Extract user stories and acceptance criteria from spec
- Extract non-functional requirements
- Cross-reference with tasks to ensure all spec requirements are covered

**Example paths:**
```
specs/auth/
├── spec.md          # Load for validation
└── plan.md          # Load for tasks
```

### 1.2 Create Feature Branch
```bash
git checkout -b feat/[feature-slug]
```

### 1.3 Optional: Create Git Worktree (for large features)
```bash
git worktree add --detach .worktrees/[feature-slug]
```
Use skill: `skills_devops_git_worktree`

### 1.4 Initialize Todo Tracking

Create a todo list from plan tasks:
- Map each task to a todo item
- Set status to `pending`
- Link to task ID and acceptance criteria
- Estimate total effort

**Example todo structure:**
```
[FEAT-001-A] Create SessionManager class
  Status: pending
  Priority: high
  Time: 30 min
  Depends: None
  Files: src/context/session.ts
```

---

## Phase 2: Task Execution Loop

For each task in dependency order:

### 2.1 Mark Task In Progress
```bash
# Update todo status
todo --mark-in-progress [TASK-ID]
```

### 2.2 Implement Changes
- Read existing code patterns from discovery phase
- Follow project conventions (naming, structure, style)
- Add inline comments for complex logic
- Keep changes focused on task scope

**Quality Checkpoints During Implementation:**
- [ ] Code follows project style guide
- [ ] No console.log or debug statements
- [ ] Error handling is comprehensive
- [ ] Types are explicit (no `any`)
- [ ] Comments explain "why", not "what"

### 2.3 Write/Update Tests

For each file modified:

**Unit Tests** (if applicable):
```typescript
// tests/[module].test.ts
describe('[Component]', () => {
  it('should [behavior]', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

**Integration Tests** (if applicable):
- Test interactions with other modules
- Mock external dependencies
- Verify error scenarios

**Test Coverage Requirements:**
- Minimum 80% line coverage for new code
- 100% coverage for critical paths
- All acceptance criteria have corresponding tests

### 2.4 Run Quality Gates (In Order)

#### Gate 1: Linting
```bash
bun run lint
```
**Must Pass**: No warnings or errors

If fails: Fix lint violations, re-commit

#### Gate 2: Type Checking
```bash
bun run type-check
```
**Must Pass**: No TypeScript errors

If fails: Fix type errors, re-commit

#### Gate 3: Unit Tests
```bash
bun run test:unit
```
**Must Pass**: All tests pass, coverage ≥80%

If fails: Fix tests or code, re-commit

#### Gate 4: Build
```bash
bun run build
```
**Must Pass**: No build errors or warnings

If fails: Fix build errors, re-commit

#### Gate 5: Integration Tests (if applicable)
```bash
bun run test:integration
```
**Must Pass**: All integration tests pass

If fails: Fix integration issues, re-commit

**NO TASK IS COMPLETE UNTIL ALL GATES PASS.**

### 2.5 Commit Changes
```bash
git add [files]
git commit -m "[TASK-ID] Brief description

- Detailed change 1
- Detailed change 2

Acceptance Criteria:
- [x] Criterion 1
- [x] Criterion 2
"
```

**Commit Message Format:**
- First line: `[TASK-ID] Action-oriented summary (50 chars max)`
- Blank line
- Body: Bullet points of what changed
- Blank line
- Acceptance Criteria: Checkboxes showing what's complete

### 2.6 Mark Task Complete
```bash
todo --mark-complete [TASK-ID]
```

---

## Phase 3: Validation & Quality Assurance

### 3.1 Run Full Test Suite
```bash
bun run test
```
- All unit tests pass
- All integration tests pass
- Coverage meets thresholds

### 3.2 Run Full Build
```bash
bun run build
```
- No errors
- No warnings
- Output size acceptable

### 3.3 Type Safety Check
```bash
bun run type-check
```
- No implicit `any`
- All types explicit
- No unused variables

### 3.4 Lint Full Codebase
```bash
bun run lint
```
- No style violations
- Consistent formatting
- No unused imports

### 3.5 Performance Check (if applicable)
```bash
bun run benchmark
```
- No performance regressions
- Bundle size within limits
- Load times acceptable

### 3.6 Security Check (if applicable)
```bash
bun run audit
```
- No known vulnerabilities
- Dependencies up to date
- No security warnings

### 3.7 Specification Validation (if spec exists)

**Cross-Reference with Specification:**

1. **Load spec**: Read `specs/[feature]/spec.md`
2. **Verify coverage**: For each completed task, check:
   - Are all task acceptance criteria met?
   - Are related spec acceptance criteria satisfied?
3. **Update spec**: Mark completed user stories/tasks in spec.md

**Validation Checklist:**
```markdown
## Spec Validation

### Task → Spec Acceptance Criteria Mapping

| Task ID | Task AC Met | Spec AC Met | Notes |
|----------|--------------|--------------|--------|
| TASK-001 | [x] | [x] | All criteria verified |
| TASK-002 | [x] | [ ] Missing AC-3, needs follow-up |


### User Story Status Update

Update spec.md to mark completed user stories:
```markdown
### US-001: User Registration
**Status**: ✅ COMPLETED (TASK-001, TASK-002, TASK-003 done)
```

4. **Identify Gaps**: If spec acceptance criteria are not met:
   - Note which criteria are missing
   - Create follow-up tasks to address gaps
   - Update plan with new tasks if needed

**If validation fails:**
- Note which acceptance criteria are not met
- Determine if existing task can be enhanced or new task needed
- Create follow-up task(s) to address gaps

---

## Phase 4: Documentation & Review

### 4.1 Update Documentation
- [ ] Update README if needed
- [ ] Update CHANGELOG
- [ ] Add JSDoc comments to public APIs
- [ ] Update type definitions if changed

### 4.2 Create Pull Request
```bash
git push origin feat/[feature-slug]
gh pr create --title "[Feature] Brief description" \
  --body "$(cat <<'EOF'
## Summary
[2-3 sentence summary of changes]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [x] Unit tests added
- [x] Integration tests pass
- [x] Manual testing completed

## Checklist
- [x] Code follows style guide
- [x] Tests pass
- [x] Build succeeds
- [x] Documentation updated
EOF
)"
```

### 4.3 Request Review
```bash
/review [pr-url]
```

---

## Quality Gates Summary

| Gate | Command | Must Pass | Failure Action |
|------|---------|-----------|-----------------|
| Lint | `bun run lint` | Yes | Fix violations, re-commit |
| Types | `bun run type-check` | Yes | Fix type errors, re-commit |
| Unit Tests | `bun run test:unit` | Yes | Fix tests or code, re-commit |
| Build | `bun run build` | Yes | Fix build errors, re-commit |
| Integration | `bun run test:integration` | Yes | Fix integration issues, re-commit |
| Full Suite | `bun run test` | Yes | Fix all failures, re-commit |

**NO TASK IS COMPLETE UNTIL ALL GATES PASS.**

---

## Handling Failures

### If Linting Fails
1. Review lint output
2. Fix violations (auto-fix where possible: `bun run lint --fix`)
3. Re-run lint
4. Commit fixes

### If Tests Fail
1. Review test output
2. Determine if code or test is wrong
3. Fix the issue
4. Re-run tests
5. Commit fixes

### If Build Fails
1. Review build output
2. Fix compilation errors
3. Re-run build
4. Commit fixes

### If Task Becomes Too Large
1. Stop and commit what's working
2. Break remaining work into new tasks
3. Update plan with new tasks
4. Continue with next task

---

## Tracking & Metrics

### During Execution
- Track actual time vs. estimated time
- Note any blockers or issues
- Record decisions made

### After Completion
- Calculate total effort (sum of task times)
- Identify tasks that took longer than estimated
- Note patterns for future planning

### Metrics to Track
| Metric | Purpose |
|--------|---------|
| Estimated vs. Actual Time | Improve future estimates |
| Test Coverage | Ensure quality |
| Build Time | Identify bottlenecks |
| Commit Count | Measure granularity |
| Review Feedback | Improve code quality |

---

## Resuming Interrupted Work

If work is interrupted:

```bash
/work --continue
```

This will:
1. Find the last incomplete task
2. Show its status and acceptance criteria
3. Resume from where you left off
4. Maintain all previous progress

---

## Validation-Only Mode

To validate without implementing:

```bash
/work [plan-file] --validate-only
```

This will:
1. Check all files exist
2. Verify dependencies are resolvable
3. Run type checking on existing code
4. Identify potential issues
5. Report without making changes

---

## Dry-Run Mode

To see what would be done:

```bash
/work [plan-file] --dry-run
```

This will:
1. Show all tasks in order
2. Show dependencies
3. Show files to be modified
4. Show estimated total time
5. Ask for confirmation before proceeding

---

## Best Practices

### During Implementation
- ✅ Commit frequently (after each task)
- ✅ Keep commits focused and atomic
- ✅ Write descriptive commit messages
- ✅ Test as you go
- ✅ Ask for help early if stuck

### Quality Gates
- ✅ Never skip a quality gate
- ✅ Fix issues immediately
- ✅ Don't accumulate technical debt
- ✅ Maintain test coverage
- ✅ Keep build times reasonable

### Communication
- ✅ Update todos regularly
- ✅ Note blockers immediately
- ✅ Ask clarifying questions
- ✅ Request review early
- ✅ Respond to feedback promptly

### Avoiding Common Pitfalls
- ❌ Don't skip tests
- ❌ Don't ignore lint warnings
- ❌ Don't commit broken code
- ❌ Don't make unrelated changes
- ❌ Don't ignore type errors

---

## Integration with Other Commands

| Command | Integration |
|---------|-------------|
| `/plan` | Load plan file as input |
| `/review` | Request code review on PR |
| `/optimize` | Run performance optimization |
| `git worktree` | Use for large features |
| `gh pr create` | Create PR automatically |

---

## Troubleshooting

### "Tests are failing"
1. Run tests with verbose output: `bun run test -- --verbose`
2. Check test output for specific failures
3. Fix code or test as appropriate
4. Re-run tests

### "Build is slow"
1. Check build output: `bun run build --verbose`
2. Identify slow steps
3. Consider code splitting or optimization
4. Use `/optimize` command if needed

### "Too many files to modify"
1. Stop and commit current progress
2. Break remaining work into smaller tasks
3. Update plan with new tasks
4. Continue with next task

### "Unclear acceptance criteria"
1. Stop and ask for clarification
2. Don't guess or assume
3. Update plan with clarified criteria
4. Resume implementation

---

## Success Criteria

A work session is successful when:
 - ✅ All tasks completed
 - ✅ All quality gates passed
 - ✅ All tests passing
 - ✅ Build succeeds
 - ✅ PR created and reviewed
 - ✅ Code merged to main
 
 ## Integration

- Reads from `/ai-eng/plan` output (plan.yaml)
- Validates against `/ai-eng/specify` output (spec.md)
- Feeds into `/ai-eng/review` for code review

## Ralph Wiggum Iteration Mode

When `--ralph` flag is enabled, the work execution follows a TDD-driven cycle:

### Ralph Wiggum Work Cycle

**Iteration Process:**
1. **Execute Work Phase 1-6** - Run complete work process
2. **Gap Analysis** - Review implementation for:
   - Failing tests or incomplete test coverage
   - Missing features or acceptance criteria
   - Quality gate failures
   - Insufficient implementation details
3. **Targeted Development** - Focus next iteration on identified gaps:
   - Fix failing tests
   - Complete missing features
   - Address quality gate failures
   - Strengthen implementation
4. **Quality Gate** - Run quality gate command if specified
5. **Progress Update** - Log iteration improvements and continue
6. **Completion Check** - Stop when:
   - Implementation meets acceptance criteria
   - Quality gates consistently pass
   - Maximum iterations reached

### Ralph Wiggum Quality Gates

**Work Quality Gate Examples:**
```bash
# Check test execution
npm test

# Check linting
npm run lint

# Run security scans
npm run security-scan

# Check type checking
bun tsc --noEmit
```

### Progress Tracking

**Iteration Metrics:**
- Iteration number and completion status
- Tasks completed per iteration
- Tests passing/total
- Quality gate pass/fail status
- Implementation progress
- Confidence score

**Example Progress Output:**
```
🔄 Ralph Wiggum Work Iteration 3/10
✅ Tasks completed: 5 total (+2 this iteration)
🧪 Tests passing: 18/20 (+3 this iteration)
✅ Quality gate: PASSED (npm test && npm run lint)
🎯 Implementation: 75% complete (+10% this iteration)
📊 Confidence: 0.8 (improving)
```

### Ralph Wiggum Implementation Notes

**Work-Specific Considerations:**

- **TDD Cycle**: Each iteration follows Write Test → Implement → Test → Fix pattern
- **Test Coverage**: Ensure all acceptance criteria have corresponding tests
- **Quality Standards**: Run full quality suite after each iteration
- **Progressive Development**: Each iteration should make measurable progress

**Default Settings:**
- **Max Iterations**: 10 (sufficient for most implementations)
- **Completion Promise**: "Implementation meets all acceptance criteria and passes quality gates"
- **Quality Gate**: Test execution + linting (recommended)
- **Progress Tracking**: Always enabled in Ralph mode

**Best Practices:**
- Write failing tests before implementing features
- Fix the immediate failing test, not hypothetical issues
- Run quality gates after each iteration, not just at end
- Track test coverage and improve it each iteration
- Document any workarounds or temporary solutions for later cleanup

$ARGUMENTS
