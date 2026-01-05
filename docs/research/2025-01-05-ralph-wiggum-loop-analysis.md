---
date: 2025-01-05
researcher: Assistant
topic: 'Ralph Wiggum Loop Pattern - Research & Integration Analysis'
tags: [research, automation, workflow, iteration]
status: complete
confidence: high
---

## Synopsis

Research into the Ralph Wiggum loop pattern from Claude Code, an automated while-loop technique for continuous AI iteration. This analysis explores the pattern's mechanics, use cases, and potential integration opportunities within the ai-eng-system architecture.

## Summary

- Ralph Wiggum is a Bash loop that repeatedly feeds an AI agent a prompt until a completion signal is received
- Designed for well-defined, objectively checkable tasks (tests, feature implementation, refactoring)
- Uses completion promises (e.g., "DONE") or max-iteration caps as stop conditions
- Currently **not implemented** in ai-eng-system, which requires manual phase transitions
- Two integration approaches identified: (1) as a task execution strategy, or (2) as phase automation

## Detailed Findings

### Ralph Wiggum Loop Pattern

#### Core Mechanism
The pattern is a simple while loop:

```bash
while :; do cat PROMPT.md | claude ; done
```

Key characteristics:
- **Continuous Iteration**: Agent keeps working on the same goal
- **Stop Hook**: Prevents agent from exiting until completion signal detected
- **Self-Correction**: Failures are treated as data for next iteration
- **Operator Skill**: Success depends on prompt quality, not model capability

#### Official Plugin Commands
```bash
/ralph-wiggum:ralph-loop "<prompt>" --completion-promise "DONE" --max-iterations 10
/ralph-wiggum:cancel-ralph
/ralph-wiggum:help
```

**Options**:
- `--max-iterations <n>`: Safety net, default unlimited (recommended: always set)
- `--completion-promise "<text>"`: Exact match phrase signaling completion

#### Philosophical Principles
1. **Iteration > Perfection**: Don't aim for perfect on first try
2. **Failures Are Data**: Deterministically bad = predictably informative
3. **Operator Skill Matters**: Prompt writing is the critical skill
4. **Persistence Wins**: Let the loop handle retry logic automatically

#### Best Practices for Prompt Writing

**Clear Completion Criteria**:
```markdown
Good:
Build a REST API for todos.

When complete:
- All CRUD endpoints working
- Input validation in place
- Tests passing (coverage > 80%)
- README with API docs
- Output: <promise>COMPLETE</promise>

Bad:
Build a todo API and make it good.
```

**Incremental Goals**:
```markdown
Good:
Phase 1: User authentication (JWT, tests)
Phase 2: Product catalog (list/search, tests)
Phase 3: Shopping cart (add/remove, tests)

Output <promise>COMPLETE</promise> when all phases done.

Bad:
Create a complete e-commerce platform.
```

**Self-Correction Pattern**:
```markdown
Good:
Implement feature X following TDD:
1. Write failing tests
2. Implement feature
3. Run tests
4. If any fail, debug and fix
5. Refactor if needed
6. Repeat until all green
7. Output: <promise>COMPLETE</promise>

Bad:
Write code for feature X.
```

### When to Use Ralph

#### Good For ✅
- Well-defined tasks with clear success criteria
- Tasks requiring iteration and refinement (e.g., getting tests to pass)
- Greenfield projects where you can walk away
- Tasks with automatic verification (tests, linters)
- Overnight/weekend automated development

#### Not Good For ❌
- Tasks requiring human judgment or design decisions
- One-shot operations needing immediate results
- Tasks with unclear or subjective success criteria
- Production debugging (use targeted debugging instead)
- Tasks requiring external approvals or human-in-the-loop

### Real-World Results

- **Y Combinator Hackathon**: Generated 6 repositories overnight
- **Contract Delivery**: $50k contract completed for $297 in API costs
- **CURSED Language**: Entire programming language created over 3 months

### Advanced Patterns

#### Multi-Phase Development
```bash
# Phase 1: Core implementation
/ralph-wiggum:ralph-loop "Phase 1: Build core data models..." --max-iterations 20

# Phase 2: API layer (explicit invocation)
/ralph-wiggum:ralph-loop "Phase 2: Build API endpoints..." --max-iterations 25

# Phase 3: Frontend (explicit invocation)
/ralph-wiggum:ralph-loop "Phase 3: Build UI components..." --max-iterations 30
```

#### Combining with Git Worktrees
```bash
git worktree add ../project-feature1 -b feature/auth
git worktree add ../project-feature2 -b feature/api

# Parallel Ralph loops
cd ../project-feature1
/ralph-wiggum:ralph-loop "Implement authentication..." --max-iterations 30

cd ../project-feature2
/ralph-wiggum:ralph-loop "Build REST API..." --max-iterations 30
```

### ai-eng-system Current State

#### Manual Workflow
The spec-driven workflow requires explicit invocation at each phase:

```bash
Phase 1: /ai-eng/research "authentication patterns"
Phase 2: /ai-eng/specify "user authentication" --from-research=...
Phase 3: /ai-eng/plan --from-spec=...
Phase 4: /ai-eng/work specs/[feature]/plan.md
Phase 5: /ai-eng/review
```

#### Existing Retry Logic
The `TaskExecutor` has `executeWithRetry` (lines 265-306):
```typescript
const maxAttempts = shellTask.retry?.maxAttempts || 1;
const baseDelay = shellTask.retry?.delay || 0;
const backoffMultiplier = shellTask.retry?.backoffMultiplier || 1;
```

However, this is **only for retrying failed commands**, not for continuous iteration toward completion.

#### Existing Continue Logic
The system has `continueOnError` option (line 34 in task-executor.ts):
```typescript
continueOnError: false,
```

This allows execution to continue past failed tasks within a plan, but **does not** automate phase transitions.

#### Documented but Not Implemented: `--feed-into` Flag
The `/ai-eng/research` command documents a `--feed-into` option for chaining phases:

```bash
/ai-eng/research "authentication patterns" --feed-into=specify
```

**Status**: Not implemented in runtime
- No matches for "feed-into" in `src/**/*.ts` or `src/**/*.js`
- Confirmed unimplemented in docs: `docs/research/2026-01-01-thinking-signature-error.md:239`

#### Multi-Phase Execution (Internal Only)
The `/ai-eng/research` command has internal phase orchestration (skills/comprehensive-research/SKILL.md:12-67):
- Phase 1: Context & Scope Definition
- Phase 2: Parallel Discovery
- Phase 3: Sequential Deep Analysis
- Phase 4: Synthesis & Documentation

**However**: This is internal to research only - it doesn't automatically proceed to `/ai-eng/specify`.

### Architecture Analysis

#### Current Execution Architecture

**TaskExecutor** (`src/execution/task-executor.ts`):
- Executes plans with dependency resolution
- Has retry logic for failed shell commands
- Has `continueOnError` for continuing past failures
- No continuous iteration mechanism
- No while loops

**ExecutorCLI** (`src/cli/executor.ts`):
- Plan execution command (`ai-exec plan <file>`)
- Quality gates command (`ai-exec gates`)
- Code review command (`ai-exec code-review`)
- Research command (`ai-exec research`)
- No loop or continuous execution command

**AgentCoordinator**:
- Orchestrates agent tasks
- Has retry logic (default: 2 attempts, 1000ms delay)
- No continuous iteration capability

### Comparison: Ralph Wiggum vs ai-eng-system

| Feature | Ralph Wiggum | ai-eng-system |
|---------|-------------|---------------|
| **Iteration** | Continuous while loop until completion | Single-pass execution |
| **Stop Condition** | Completion promise or max-iterations | Task completion/failure |
| **Retry Logic** | Implicit in loop | Explicit retry (maxAttempts) |
| **Self-Correction** | Built into loop pattern | Manual intervention required |
| **Phase Transitions** | Manual (multiple loops) | Manual (explicit commands) |
| **Task Granularity** | Single well-defined task | Multi-task plans |
| **Error Handling** | Keep trying until success or cap | Stop or continue based on flag |
| **Success Criteria** | Clear, objective promise | Task exit code |

## Architecture Insights

### Potential Integration Points

#### Option 1: Ralph Wiggum as Task Execution Strategy
**Location**: Add to `TaskExecutor` or create new `RalphLoopExecutor`

**Mechanism**:
```typescript
interface RalphLoopTask extends ExecutableTask {
    type: 'ralph-loop';
    prompt: string;
    completionPromise?: string;
    maxIterations?: number;
}

async executeRalphLoop(task: RalphLoopTask): Promise<TaskResult> {
    let iterations = 0;
    const max = task.maxIterations || 10;
    const promise = task.completionPromise || "DONE";

    while (iterations < max) {
        const result = await executeTask(task);
        iterations++;

        if (result.stdout.includes(promise)) {
            return result; // Completion detected
        }

        // Feed result back as context for next iteration
        task.input = { previousResult: result };
    }

    return result; // Max iterations reached
}
```

**Use Case**: Within a plan, iterate on a single task until completion
```yaml
tasks:
  - id: ralph-task-1
    type: ralph-loop
    prompt: "Get all tests passing in src/auth"
    max-iterations: 20
    completion-promise: "ALL_TESTS_PASSING"
```

#### Option 2: Ralph Wiggum for Phase Automation
**Location**: Add to CLI commands (`/research`, `/work`, etc.)

**Mechanism**: Implement the documented `--feed-into` flag
```typescript
// In ExecutorCLI
this.program
    .command("research")
    .option("--feed-into <command>", "Chain to next command")
    .action(async (query, options) => {
        const result = await executeResearch(query);

        if (options.feedInto === "specify") {
            await executeSpecify(result);
        }
    });
```

**Use Case**: Automated multi-phase workflow
```bash
/ai-eng/research "authentication" --feed-into=specify --feed-into=plan --feed-into=work
```

#### Option 3: Standalone Ralph Wiggum Command
**Location**: New command in `.claude/commands/`

**Mechanism**: Create `/ralph` command that wraps task execution in loop
```typescript
export class RalphLoopCommand {
    async execute(prompt: string, options: RalphOptions) {
        const iterations = [];
        for (let i = 0; i < options.maxIterations; i++) {
            const result = await executeTask(prompt, iterations);
            if (result.includes(options.completionPromise)) {
                return result;
            }
            iterations.push(result);
        }
        return iterations;
    }
}
```

**Use Case**: Direct Ralph Wiggum pattern for ai-eng-system
```bash
/ralph "Fix all failing tests" --max-iterations 20 --completion-promise "TESTS_PASS"
```

### Design Considerations

#### Advantages of Integration
1. **Reduced Manual Intervention**: Agents can self-correct without human input
2. **Overnight Automation**: Run large tasks while away
3. **Better for TDD**: Write failing tests, loop until all pass
4. **Consistent with Philosophy**: ai-eng-system emphasizes agent autonomy

#### Risks & Limitations
1. **Infinite Loops**: Without proper safety checks, loops could run forever
2. **API Costs**: Continuous iteration increases token consumption
3. **Quality Degradation**: Bad prompts lead to wasted iterations
4. **Context Window**: Each iteration may need to carry forward all previous context
5. **Human Judgment**: Not suitable for all tasks (design, architecture decisions)

#### Recommended Safety Measures
1. **Always require `--max-iterations`**: No unlimited loops by default
2. **Monitor token usage**: Alert on excessive consumption
3. **Progress tracking**: Show iteration count and results
4. **Cancellation**: Ability to stop active loop (`/ralph:cancel`)
5. **Logging**: Save all iterations for debugging

## Recommendations

### Immediate Actions

1. **Implement `--feed-into` Flag** (Priority: Medium)
   - Already documented but not implemented
   - Enables phase automation without new concepts
   - Clear use case: research → specify → plan → work
   - Location: `src/cli/executor.ts` and corresponding command handlers

2. **Create Ralph Wiggum as a Skill** (Priority: Medium)
   - Document best practices for looping in ai-eng-system
   - Include prompt templates for Ralph-style tasks
   - Location: `skills/workflow/ralph-wiggum/`

3. **Add Loop Task Type** (Priority: Low)
   - New task type for plan-based execution
   - Use existing TaskExecutor infrastructure
   - Location: `src/execution/task-executor.ts`

### Long-term Considerations

1. **Integration with Quality Gates**
   - Ralph loops should check quality gates at each iteration
   - Stop when gates pass, not just completion promise
   - Enables: "Loop until code review passes"

2. **Multi-Agent Ralph Loops**
   - Different agents in different phases of loop
   - Example: `@full-stack-developer` → `@code-reviewer` → `@test-generator`
   - Use AgentCoordinator for orchestration

3. **Context Window Management**
   - Intelligent context pruning between iterations
   - Keep only relevant history
   - Prevent context overflow in long loops

4. **Progress Visualization**
   - Show iteration history in CLI
   - Rate of convergence tracking
   - "Stuck" detection (no progress after N iterations)

## Open Questions

- [ ] Should Ralph Wiggum be a command, skill, or task type?
- [ ] What is the optimal default for `--max-iterations`?
- [ ] Should completion promises use exact match or fuzzy matching?
- [ ] How should costs be controlled in long-running loops?
- [ ] Should loops include quality gates automatically?
- [ ] How to handle context overflow in multi-iteration scenarios?

## Research References

### Primary Sources
- [Awesome Claude - Ralph Wiggum](https://awesomeclaude.ai/ralph-wiggum) - Official documentation
- [Geoffrey Huntley's Blog](https://ghuntley.com/ralph/) - Original technique creator
- [Ralph Orchestrator](https://github.com/mikeyobrien/ralph-orchestrator) - Community management tool

### ai-eng-system Sources
- `src/cli/executor.ts` - CLI command structure
- `src/execution/task-executor.ts` - Task execution with retry logic
- `src/agents/coordinator.ts` - Agent orchestration
- `skills/comprehensive-research/SKILL.md` - Multi-phase research pattern
- `docs/spec-driven-workflow.md` - Spec-driven workflow documentation

### Key Code Locations
- Retry logic: `src/execution/task-executor.ts:265-306`
- ContinueOnError: `src/execution/task-executor.ts:34,63-70`
- Feed-into (unimplemented): `.claude/commands/research.md:51`
- Research internal phases: `skills/comprehensive-research/SKILL.md:12-67`

## Appendix: Sample Prompt Templates

### TDD Implementation
```markdown
/ralph-wiggum:ralph-loop "Implement [FEATURE] using TDD.

Process:
1. Write failing test for next requirement
2. Implement minimal code to pass
3. Run tests
4. If failing, fix and retry
5. Refactor if needed
6. Repeat for all requirements

Requirements: [LIST]

Output <promise>DONE</promise> when all tests green." --max-iterations 50 --completion-promise "DONE"
```

### Bug Fixing
```markdown
/ralph-wiggum:ralph-loop "Fix bug: [DESCRIPTION]

Steps:
1. Reproduce the bug
2. Identify root cause
3. Implement fix
4. Write regression test
5. Verify fix works
6. Check no new issues introduced

After 15 iterations if not fixed:
- Document blocking issues
- List attempted approaches
- Suggest alternatives

Output <promise>FIXED</promise> when resolved." --max-iterations 20 --completion-promise "FIXED"
```

### Refactoring
```markdown
/ralph-wiggum:ralph-loop "Refactor [COMPONENT] for [GOAL].

Constraints:
- All existing tests must pass
- No behavior changes
- Incremental commits

Checklist:
- [ ] Tests passing before start
- [ ] Apply refactoring step
- [ ] Tests still passing
- [ ] Repeat until done

Output <promise>REFACTORED</promise> when complete." --max-iterations 25 --completion-promise "REFACTORED"
```

---

**Confidence Assessment**:
- Codebase coverage: 0.9 (thorough review of executor, CLI, and task systems)
- External coverage: 0.8 (primary sources from Awesome Claude, limited community sources)
- Architecture insights: 0.85 (strong understanding of current state and integration points)

**Overall Confidence: 0.85 (High)**
