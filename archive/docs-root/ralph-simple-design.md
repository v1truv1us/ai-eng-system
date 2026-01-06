# Ralph Wiggum Integration Design

**Add `--ralph` flag to existing phase commands**

---

## 🎯 Simple Design

**Instead of new `/ralph` command, add Ralph Wiggum iteration to existing commands:**

```bash
# Research with Ralph Wiggum iteration
/ai-eng/research "auth patterns" --ralph

# Specify with Ralph Wiggum iteration
/ai-eng/specify "User authentication" --ralph

# Plan with Ralph Wiggum iteration
/ai-eng/plan --from-spec=specs/auth/spec.md --ralph

# Work with Ralph Wiggum iteration (TDD)
/ai-eng/work "specs/auth/plan.md" --ralph

# Review with Ralph Wiggum iteration
/ai-eng/review "src/auth/" --ralph
```

---

## 📊 Flag Behavior by Command

| Command | `--ralph` Effect | Default Max | Override Flag | Completion Promise |
|---------|-------------------|--------------|---------------|-------------------|
| `/ai-eng/research` | Research iteratively until findings complete | 10 | `--ralph-max-iterations <n>` | `<promise>RESEARCH_COMPLETE</promise>` |
| `/ai-eng/specify` | Create spec iteratively, refine until complete | 10 | `--ralph-max-iterations <n>` | `<promise>SPEC_COMPLETE</promise>` |
| `/ai-eng/plan` | Create plan iteratively until all tasks defined | 10 | `--ralph-max-iterations <n>` | `<promise>PLAN_COMPLETE</promise>` |
| `/ai-eng/work` | Execute with TDD cycle until all tests pass | 10 | `--ralph-max-iterations <n>` | `<promise>ALL_TESTS_PASSING</promise>` |
| `/ai-eng/review` | Review iteratively, address findings until complete | 10 | `--ralph-max-iterations <n>` | `<promise>REVIEW_COMPLETE</promise>` |

**Note**: All commands use default of **10 iterations** when `--ralph` is set. Override with `--ralph-max-iterations` for tasks needing more.

---

## 🚀 Usage Patterns

### Pattern 1: Single Phase with Ralph

```bash
# Just research with iteration
/ai-eng/research "authentication patterns" --ralph

# Agent will:
# 1. Research authentication patterns
# 2. Document findings
# 3. Check if complete
# 4. If not complete, iterate and refine
# 5. Continue until <RESEARCH_COMPLETE>
```

### Pattern 2: Multiple Phases with Ralph

```bash
# Each phase uses Ralph Wiggum iteration
/ai-eng/research "auth patterns" --ralph
# Output: docs/research/auth-patterns.md

/ai-eng/specify "User authentication" --ralph
# Output: specs/auth/spec.md

/ai-eng/plan --from-spec=specs/auth/spec.md --ralph
# Output: specs/auth/plan.md

/ai-eng/work "specs/auth/plan.md" --ralph
# Output: Implemented code, passing tests

/ai-eng/review "src/auth/" --ralph
# Output: Code review report, findings addressed
```

### Pattern 3: Mix and Match

```bash
# Research with iteration (complex topic)
/ai-eng/research "complex authentication patterns" --ralph

# Specify without iteration (straightforward feature)
/ai-eng/specify "User registration" # No --ralph

# Plan without iteration (based on spec)
/ai-eng/plan --from-spec=specs/reg/spec.md # No --ralph

# Work with iteration (implementation needs TDD)
/ai-eng/work "specs/reg/plan.md" --ralph

# Review with iteration (thorough review needed)
/ai-eng/review "src/reg/" --ralph
```

---

## 🔧 Flag Options

### Basic `--ralph`

```bash
/ai-eng/work "plan.md" --ralph

# Uses default Ralph Wiggum settings:
# - Max iterations: 10 (default for all phases)
# - Completion promise: phase-specific default
# - Quality gates: defined by phase command
```

### `--ralph-max-iterations <n>` (Override Default)

```bash
/ai-eng/work "plan.md" --ralph --ralph-max-iterations 50

# Override default max iterations to 50
```

### `--ralph-completion-promise <text>`

```bash
/ai-eng/work "plan.md" --ralph --ralph-completion-promise "DONE"

# Custom completion promise
```

### `--ralph-quality-gate <command>`

```bash
/ai-eng/work "plan.md" --ralph --ralph-quality-gate "bun run test"

# Custom quality gate command (work phase only)
```

### `--ralph` with Parameters

```bash
/ai-eng/work "plan.md" --ralph --max-iterations 100

# Override default max iterations
```

```bash
/ai-eng/work "plan.md" --ralph --completion-promise "DONE"

# Custom completion promise
```

```bash
/ai-eng/work "plan.md" --ralph --quality-gate "bun run test"

# Custom quality gate command
```

---

## 📋 Default Settings by Command

| Command | Default Max Iterations | Override Flag | Default Completion Promise | Quality Gates |
|---------|----------------------|---------------|-------------------------|---------------|
| `/ai-eng/research` | 10 | `--ralph-max-iterations <n>` | `<promise>RESEARCH_COMPLETE</promise>` | N/A |
| `/ai-eng/specify` | 10 | `--ralph-max-iterations <n>` | `<promise>SPEC_COMPLETE</promise>` | N/A |
| `/ai-eng/plan` | 10 | `--ralph-max-iterations <n>` | `<promise>PLAN_COMPLETE</promise>` | N/A |
| `/ai-eng/work` | 10 | `--ralph-max-iterations <n>` | `<promise>ALL_TESTS_PASSING</promise>` | `bun run test` |
| `/ai-eng/review` | 10 | `--ralph-max-iterations <n>` | `<promise>REVIEW_COMPLETE</promise>` | Multi-agent review |

**Note**: Default of 10 iterations applies to ALL phases when `--ralph` is used.

**Rationale**: Conservative default prevents excessive token usage while still allowing meaningful iteration. Override with `--ralph-max-iterations` for tasks that need more iterations.

---

## 🎯 When to Use `--ralph`

### Research (`--ralph`)

✅ **Use When:**
- Complex topic needing deep exploration
- Multiple approaches to evaluate
- Need comprehensive findings
- Research may take multiple passes

❌ **Skip When:**
- Simple, well-defined question
- Quick lookup needed
- One-shot research sufficient

### Specify (`--ralph`)

✅ **Use When:**
- Complex feature with many requirements
- User stories need refinement
- Edge cases to discover
- Specification needs iteration

❌ **Skip When:**
- Simple feature with clear requirements
- Straightforward spec based on research
- One-pass specification sufficient

### Plan (`--ralph`)

✅ **Use When:**
- Large feature with many tasks
- Complex dependencies to resolve
- Multiple planning approaches to evaluate
- Plan needs refinement

❌ **Skip When:**
- Simple plan from clear spec
- Straightforward task breakdown
- One-pass planning sufficient

### Work (`--ralph`) - **MOST COMMON**

✅ **Use When:**
- Implementing complex features
- Test-driven development needed
- Quality gates (test, lint, type-check)
- Multiple iteration cycles expected
- **DEFAULT: Almost always use for work**

❌ **Skip When:**
- Simple implementation, one-shot
- No tests to write
- Quick code change needed

### Review (`--ralph`)

✅ **Use When:**
- Large codebase review
- Multiple agents involved
- Findings need addressing
- Review requires iteration

❌ **Skip When:**
- Small code review
- Quick check needed
- One-pass review sufficient

---

## 🚀 Example: Complete Workflow with Ralph

```bash
# Phase 1: Research (iterate until complete)
/ai-eng/research "authentication best practices and patterns" \
  --ralph

# Default: 10 iterations (override with --ralph-max-iterations)
# Agent iterates research until findings comprehensive

# Phase 2: Specify (iterate until complete)
/ai-eng/specify "User authentication system" \
  --ralph \
  --from-research=docs/research/auth-patterns.md

# Default: 10 iterations (override with --ralph-max-iterations)
# Agent iterates specification until all requirements defined

# Phase 3: Plan (iterate until complete)
/ai-eng/plan --from-spec=specs/auth/spec.md \
  --ralph

# Default: 10 iterations (override with --ralph-max-iterations)
# Agent iterates plan until all tasks defined with dependencies

# Phase 4: Work (iterate with TDD) - MOST IMPORTANT
/ai-eng/work "specs/auth/plan.md" \
  --ralph \
  --ralph-max-iterations 50 \
  --ralph-quality-gate "bun run test && bun run lint" \
  --ralph-stop-on-gate-fail

# Default: 10 iterations (overridden to 50 for complex implementation)
# Agent uses TDD cycle until all quality gates pass

# Phase 5: Review (iterate until complete)
/ai-eng/review "src/auth/" \
  --ralph

# Default: 10 iterations (override with --ralph-max-iterations)
# Agent iterates review until all findings resolved
```

---

## 📊 Benefits of This Design

### ✅ Simplicity
- No new command to learn
- Uses familiar existing commands
- Clear: `--ralph` flag means "use iteration"

### ✅ Flexibility
- Choose which phases need iteration per command
- Mix and match as needed
- Override settings per command

### ✅ Familiarity
- Existing workflow unchanged
- Just add flag when needed
- No new concepts or patterns

### ✅ Granularity
- Individual control over each phase
- Don't have to automate everything
- Can use iteration only where helpful

### ✅ Power
- All power of Ralph Wiggum pattern
- Integration with quality gates
- TDD cycles in work phase

---

## 🔧 Implementation Requirements

### For Each Command File

**Add to command file:**

```markdown
## Options

| Option | Description |
|--------|-------------|
| `--ralph` | Use Ralph Wiggum iteration pattern |
| `--ralph-max-iterations <n>` | Override max iterations (default: 10) |
| `--ralph-completion-promise <text>` | Custom completion promise (default varies by phase) |
| `--ralph-quality-gate <command>` | Quality gate command (work phase only) |
| `--ralph-stop-on-gate-fail` | Stop if quality gate fails (work phase only) |
| `--ralph-show-progress` | Show iteration progress (default: true) |
| `--ralph-log-history <file>` | Save iteration history (default: ralph-[phase].json) |
| `--ralph-verbose` | Show detailed output from each iteration |
```

**Important**: Default max iterations is **10** for ALL phases when `--ralph` is used. Override with `--ralph-max-iterations` if needed.

**Add to command instructions:**

```markdown
### Ralph Wiggum Iteration Mode

When `--ralph` flag is set:

1. **Iterate on the phase task** until:
   - Completion promise detected in output
   - Max iterations reached
   - User cancels

2. **Default behavior by phase:**

**Research**: Deep exploration, iterate until findings comprehensive
**Specify**: Refine user stories and requirements iteratively
**Plan**: Break down tasks, resolve dependencies, iterate until complete
**Work**: Execute with TDD cycle, quality gates after each iteration
**Review**: Run multi-agent review, address findings iteratively

3. **Iteration logic:**

For each iteration:
- Execute phase task
- Check for completion promise in output
- If not found, refine approach and iterate
- Track iteration count
- Enforce max iterations limit

4. **Quality gates (work phase):**

After each iteration:
- Run quality gate command (if specified)
- Check if gate passes
- If `--ralph-stop-on-gate-fail` and gate fails, stop
- Otherwise, continue iterating

5. **Progress tracking:**

- Show iteration count (if `--ralph-show-progress`)
- Log iterations to history file (if `--ralph-log-history`)
- Show final summary when complete
```

---

## 📖 Example Workflows

### Example 1: Full Workflow Automation

```bash
# All phases use Ralph Wiggum iteration
/ai-eng/research "auth patterns" --ralph
/ai-eng/specify "User authentication" --ralph --from-research=docs/research/auth-patterns.md
/ai-eng/plan --from-spec=specs/auth/spec.md --ralph
/ai-eng/work "specs/auth/plan.md" --ralph --ralph-max-iterations 100
/ai-eng/review "src/auth/" --ralph
```

**Result**: Each phase iterates until complete with appropriate completion signals

---

### Example 2: Research Only

```bash
# Only research phase needs iteration
/ai-eng/research "auth patterns" --ralph
# Default: 10 iterations (override with --ralph-max-iterations)
# Output: docs/research/auth-patterns.md

/ai-eng/specify "User authentication system" --ralph --from-research=docs/research/auth-patterns.md
# Default: 10 iterations (override with --ralph-max-iterations)
# Output: specs/auth/spec.md

/ai-eng/plan --from-spec=specs/auth/spec.md --ralph
# Default: 10 iterations (override with --ralph-max-iterations)
# Output: specs/auth/plan.md

# Step 2: Ralph Wiggum for work phase only
/ai-eng/work "specs/auth/plan.md" --ralph --ralph-max-iterations 50
# Default: 10 iterations (overridden to 50 for complex implementation)
# Only work phase uses Ralph Wiggum iteration:
# Read plan → Write test → Implement → Test → Repeat
# Quality gates: bun run test
# → <promise>IMPLEMENTATION_COMPLETE</promise>"
```

---

### Example 3: Work Phase Only (Most Common)

```bash
# You've already done research/plan phases
/ai-eng/work "specs/auth/plan.md" --ralph --ralph-max-iterations 50

**Ralph Wiggum Iteration for Work Phase:**

Process (TDD cycle):
1. Load plan from: specs/auth/plan.md
2. For each task in order:
   a. Write failing test for next requirement
   b. Implement minimal code to pass test
   c. Run tests
   d. If tests fail, debug and fix
   e. Refactor if needed
   f. Repeat until all requirements complete
   g. Mark task as complete
3. Move to next task
4. Continue until all tasks complete

**Quality Gates** (run after each task):
- bun run test (all tests must pass)
- bun run lint (no errors)
- bun run type-check (no errors)

**Completion Criteria:**
- All tasks from plan completed
- All tests passing
- No linter errors
- No type errors
- Test coverage > 80%

Output <promise>IMPLEMENTATION_COMPLETE</promise> when done.

Default: 10 iterations (overridden to 50)
Stop on quality gate failure: false (keep trying)
Show progress after each task completion
Log iterations to: ralph-work-only.json"
```

---

## ✅ Implementation Checklist

### Phase 1: Update Command Files

- [ ] Update `/ai-eng/research` command file with `--ralph` support
- [ ] Update `/ai-eng/specify` command file with `--ralph` support
- [ ] Update `/ai-eng/plan` command file with `--ralph` support
- [ ] Update `/ai-eng/work` command file with `--ralph` support
- [ ] Update `/ai-eng/review` command file with `--ralph` support

### Phase 2: Add Option Documentation

- [ ] Add `--ralph` option to each command's Options table
- [ ] Add `--ralph-max-iterations` option
- [ ] Add `--ralph-completion-promise` option
- [ ] Add `--ralph-quality-gate` option (work phase)
- [ ] Add `--ralph-stop-on-gate-fail` option (work phase)
- [ ] Add `--ralph-show-progress` option
- [ ] Add `--ralph-log-history` option
- [ ] Add `--ralph-verbose` option

### Phase 3: Add Instructions

- [ ] Add "Ralph Wiggum Iteration Mode" section to each command
- [ ] Document default behavior per phase
- [ ] Document iteration logic
- [ ] Document quality gate behavior (work phase)
- [ ] Document progress tracking

### Phase 4: Add Examples

- [ ] Add example with `--ralph` flag for each command
- [ ] Add example showing multiple phases with `--ralph`
- [ ] Add example mixing `--ralph` and non-ralph phases

---

## 📊 Summary

**Design: Add `--ralph` flag to existing phase commands**

**Benefits:**
- ✅ Simple - no new command
- ✅ Familiar - uses existing workflow
- ✅ Flexible - choose which phases need iteration
- ✅ Powerful - full Ralph Wiggum pattern per phase
- ✅ Clear - `--ralph` flag meaning is obvious
- ✅ Safe - Conservative default of 10 iterations

**Usage:**
```bash
# Basic: Use default (10 iterations)
/ai-eng/research "topic" --ralph
/ai-eng/specify "feature" --ralph
/ai-eng/plan --from-spec=spec.md --ralph
/ai-eng/work "plan.md" --ralph
/ai-eng/review "path" --ralph

# Override: Use custom max iterations
/ai-eng/work "plan.md" --ralph --ralph-max-iterations 50
```

**Philosophy**: "Iteration > Perfection" - add flag to phases that need it.

**Key Design Decision**: Default of 10 iterations is conservative to prevent excessive token usage while still allowing meaningful iteration. Override with `--ralph-max-iterations` when tasks genuinely need more iterations.

---

**Questions:**
1. Which command should I update first?
2. Any other `--ralph-*` options needed?
3. Should all commands support `--ralph` or just work?
