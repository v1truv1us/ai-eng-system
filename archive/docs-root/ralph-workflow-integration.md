# Integrating Ralph Wiggum with Spec-Driven Workflow

**How to make research → specify → plan → work → review flow together with iterative development**

---

## 🔄 Two Integration Approaches

### Approach 1: Ralph Wiggum as Phase Orchestrator (Recommended)

**Single command that manages entire workflow with iteration at each phase**

```bash
/ralph "Implement user authentication system using spec-driven workflow:

Phase 1: Research (iterate until complete)
- Research authentication patterns
- Analyze existing codebase patterns
- Document findings
- Continue until: <promise>RESEARCH_COMPLETE</promise>

Phase 2: Specify (iterate until complete)
- Create feature specification
- Gather user stories and requirements
- Define acceptance criteria
- Continue until: <promise>SPEC_COMPLETE</promise>

Phase 3: Plan (iterate until complete)
- Create implementation plan from spec
- Break down into tasks with dependencies
- Define quality gates
- Continue until: <promise>PLAN_COMPLETE</promise>

Phase 4: Work (iterate until complete)
- Execute plan using TDD cycle
- Implement features with automatic verification
- Run quality gates after each iteration
- Continue until: <promise>ALL_TESTS_PASSING</promise>
- Quality gates: bun run test, bun run lint

Phase 5: Review (iterate until complete)
- Run multi-agent code review
- Address findings iteratively
- Continue until: <promise>REVIEW_COMPLETE</promise>

Overall workflow completion: <promise>WORKFLOW_COMPLETE</promise>

Maximum iterations per phase: 50
Show progress after each phase completion"
```

**Key Benefits:**
- ✅ Single command to execute entire workflow
- ✅ Each phase iterates until it reaches completion
- ✅ Automatic progression to next phase
- ✅ Quality gates at implementation phase
- ✅ Progress tracking across all phases
- ✅ Handles failures at each phase appropriately

**Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│  Ralph Wiggum Orchestrator                                 │
│  (Manages entire workflow)                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1: Research     ──► <RESEARCH_COMPLETE>    │
│       (iterate until finding complete)                            │
│                                                               │
│  Phase 2: Specify      ──► <SPEC_COMPLETE>         │
│       (iterate until spec complete)                               │
│                                                               │
│  Phase 3: Plan          ──► <PLAN_COMPLETE>          │
│       (iterate until plan complete)                                │
│                                                               │
│  Phase 4: Work          ──► <ALL_TESTS_PASSING>    │
│       (iterate with TDD, quality gates)                           │
│                                                               │
│  Phase 5: Review        ──► <REVIEW_COMPLETE>       │
│       (iterate until review complete)                              │
│                                                               │
│  Overall Completion       ──► <WORKFLOW_COMPLETE>    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Approach 2: Ralph Wiggum Within Work Phase Only

**Keep existing workflow, add iteration only where it's most needed (work phase)**

```bash
# Step 1: Manual workflow for research/plan phases
/ai-eng/research "authentication patterns"
/ai-eng/specify "User authentication system"
/ai-eng/plan --from-spec=specs/auth/spec.md

# Step 2: Use Ralph Wiggum for work phase only
/ralph "Execute plan from: specs/auth/plan.md

Use Ralph Wiggum iteration pattern for implementation:

Process (TDD cycle):
1. Read next task from plan
2. Write failing test
3. Implement minimal code
4. Run tests
5. If failing, debug and fix
6. Refactor if needed
7. Repeat until all tasks complete

Quality gates:
- bun run test (after each iteration)
- bun run lint (after each iteration)
- bun run type-check (after each iteration)

Completion criteria:
- All tasks from plan completed
- All tests passing
- No linter errors
- No type errors

Output <promise>IMPLEMENTATION_COMPLETE</promise>

Maximum iterations: 50
Stop on quality gate failure: false (continue trying)"
```

**Key Benefits:**
- ✅ Minimal changes to existing workflow
- ✅ Ralph Wiggum focused on implementation (where iteration matters most)
- ✅ Research/Specify/Plan remain declarative (one-shot)
- ✅ Work phase gets iterative refinement

**Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│  Existing Workflow (Manual)                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /ai-eng/research     ──► Research Document          │
│                                                               │
│  /ai-eng/specify      ──► Specification Document      │
│                                                               │
│  /ai-eng/plan          ──► Implementation Plan         │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Ralph Wiggum (Only for Work Phase)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Read Plan ──► Write Test ──► Implement ──► Test │
│       ▲                                            │       │
│       └───────────────────────────────────────────────────────┘       │
│         Loop until: <IMPLEMENTATION_COMPLETE>                        │
│         Quality gates: test, lint, type-check                      │
│         Maximum iterations: 50                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparison of Approaches

| Aspect | Approach 1 (Orchestrator) | Approach 2 (Work Phase Only) |
|---------|---------------------------|------------------------------|
| **Automation** | Full workflow automation | Work phase only |
| **Complexity** | Higher (new concept) | Lower (extension) |
| **Flexibility** | Less manual control | More manual control |
| **Use Case** | Overnight automation | Day-to-day development |
| **Learning Curve** | Higher | Lower |
| **Integration** | Requires new patterns | Fits existing workflow |

---

## 🎯 Detailed Example: Approach 1 (Orchestrator)

### Complete Workflow Command

```bash
/ralph "Implement user authentication and authorization system using spec-driven workflow with Ralph Wiggum iterations:

**Phase 1: Research** (Maximum iterations: 20)
Research objectives:
- Authentication patterns and best practices
- Security considerations (OWASP)
- JWT vs Session tokens
- Password hashing (bcrypt/argon2)
- Rate limiting strategies
- Multi-factor authentication options

Completion signal: <promise>RESEARCH_COMPLETE</promise>
When complete, research document should include:
- Pattern analysis with pros/cons
- Security recommendations
- Implementation recommendations
- References and sources
- Risks and mitigation strategies

---

**Phase 2: Specify** (Maximum iterations: 15)
Create comprehensive feature specification:

User Stories:
- US-001: User registration with email verification
- US-002: User login with password
- US-003: Password reset flow
- US-004: JWT token refresh
- US-005: Logout and session invalidation

Non-Functional Requirements:
- Security: OWASP compliant, bcrypt hashing, secure JWT
- Performance: Login < 200ms, token generation < 50ms
- Scalability: Support 1000 concurrent logins/sec
- Availability: 99.9% uptime

Completion signal: <promise>SPEC_COMPLETE</promise>
When complete, specification should include:
- All user stories with acceptance criteria
- Non-functional requirements
- API contract definitions
- Security considerations
- Edge cases and error scenarios

---

**Phase 3: Plan** (Maximum iterations: 20)
Create detailed implementation plan:

Tasks (with dependencies):
1. TASK-001: Setup authentication infrastructure
   - Install dependencies (bcrypt, jsonwebtoken, express-rate-limit)
   - Configure JWT secrets and environment variables
   - Setup middleware pipeline

2. TASK-002: Implement User model and database schema
   - Depends: TASK-001
   - Create User entity with password hashing
   - Define indexes for email lookups

3. TASK-003: Implement authentication service
   - Depends: TASK-002
   - Password hashing and verification
   - JWT token generation and validation
   - Token refresh mechanism

4. TASK-004: Implement auth endpoints
   - Depends: TASK-003
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/refresh-token

5. TASK-005: Implement email verification flow
   - Depends: TASK-002
   - Email token generation
   - Verification endpoint
   - Token expiration handling

6. TASK-006: Implement password reset
   - Depends: TASK-003, TASK-005
   - Reset token generation
   - Password update endpoint
   - Token expiration

7. TASK-007: Add rate limiting
   - Depends: TASK-001
   - Implement rate limit middleware
   - Configure limits for auth endpoints

8. TASK-008: Write comprehensive tests
   - Depends: TASK-004, TASK-006, TASK-007
   - Unit tests for all services
   - Integration tests for endpoints
   - Security tests for auth flows

9. TASK-009: Quality gates validation
   - Depends: TASK-008
   - Run test suite: bun run test
   - Run linter: bun run lint
   - Run type-check: bun run type-check
   - Security scan: bun run security-scan

Quality Gates:
- Test coverage > 80%
- No linter errors
- No type errors
- Security scan passes

Completion signal: <promise>PLAN_COMPLETE</promise>
When complete, plan should include:
- All tasks with clear descriptions
- Dependency graph
- Time estimates for each task
- Quality gates defined
- Risk mitigation strategies

---

**Phase 4: Work** (Maximum iterations: 50)
Execute implementation plan using TDD cycle:

For each task in order:
1. Write failing test for next requirement
2. Implement minimal code to make test pass
3. Run tests
4. If any fail, debug and fix
5. Refactor if needed
6. Move to next requirement

Quality Gates (run after each task completion):
- bun run test (all tests must pass)
- bun run lint (no errors)
- bun run type-check (no errors)
- bun run coverage (must be > 80%)

If quality gate fails:
- Fix issues before continuing
- Re-run quality gate
- Continue until gate passes

Completion signals:
- Task complete: <promise>TASK_COMPLETE</promise>
- All tasks done: <promise>ALL_TASKS_COMPLETE</promise>

Progress tracking:
- Show which task is currently executing
- Show progress within task (test → implement → test)
- Show quality gate results
- Track overall completion percentage

---

**Phase 5: Review** (Maximum iterations: 10)
Multi-perspective code review:

Agents to invoke:
1. @code-reviewer - Comprehensive quality assessment
2. @security-scanner - Security vulnerability detection
3. @performance-engineer - Performance optimization
4. @frontend-reviewer - If frontend components

Review focus:
- Code quality and maintainability
- Security vulnerabilities
- Performance bottlenecks
- Test coverage and quality
- Documentation completeness

For each finding:
- Categorize severity (low/medium/high/critical)
- Provide actionable recommendations
- Agent must confirm fix is appropriate

Review completion when:
- All findings addressed or documented
- Quality score > 80/100
- No critical or high severity issues remain

Completion signal: <promise>REVIEW_COMPLETE</promise>

---

**Overall Workflow Completion**
Workflow is complete when:
- All 5 phases have completed
- Quality gates passed
- Multi-agent review passed
- All deliverables are in place:
  - Research document
  - Feature specification
  - Implementation plan
  - Working code with tests
  - Code review report

Final completion signal: <promise>WORKFLOW_COMPLETE</promise>

**Overall Progress Tracking**
- Show phase completion status
- Show overall workflow percentage (5 phases total)
- Summarize each phase's outcome
- Provide final summary of all deliverables

**Safety Measures**
- Maximum iterations per phase enforced
- If phase doesn't complete within iterations:
  - Document what was accomplished
  - Document blocking issues
  - Suggest next steps
  - Continue to next phase or stop (user choice)

Total maximum iterations: 115 (20+15+20+50+10)
Show progress after each phase completion
Report any failures or issues encountered"
```

---

## 🎯 Detailed Example: Approach 2 (Work Phase Only)

### Minimal Integration with Existing Workflow

```bash
# Step 1: Traditional workflow (unchanged)
/ai-eng/research "authentication patterns"
# Output: docs/research/auth-patterns.md

/ai-eng/specify "User authentication system" --from-research=docs/research/auth-patterns.md
# Output: specs/auth/spec.md

/ai-eng/plan --from-spec=specs/auth/spec.md
# Output: specs/auth/plan.md

# Step 2: Ralph Wiggum for work phase
/ralph "Execute implementation plan: specs/auth/plan.md

**Ralph Wiggum Iteration Setup:**

Process (TDD cycle):
1. Load plan: specs/auth/plan.md
2. For each task in dependency order:
   a. Mark task as in-progress
   b. Write failing test for next requirement
   c. Implement minimal code to pass test
   d. Run tests
   e. If tests fail, iterate (debug and fix)
   f. If tests pass, refactor if needed
   g. Move to next requirement
   h. Continue until all requirements complete
3. Mark task as complete
4. Move to next task
5. Continue until all tasks complete

**Quality Gates:**
After each task completion:
- bun run test (all tests must pass)
- bun run lint (no errors)
- bun run type-check (no errors)
- bun run coverage (must be > 80%)

**Safety Parameters:**
Maximum iterations: 50
Stop on quality gate failure: false (keep trying)
Show progress after each task completion
Log iterations to: ralph-work-phase.json

**Completion Signal:**
Output <promise>IMPLEMENTATION_COMPLETE</promise> when:
- All tasks from plan are completed
- All tests passing
- No linter errors
- No type errors
- Test coverage > 80%

**Progress Tracking:**
Show progress as:
- Task X/Y completed
- Overall percentage
- Quality gate results
- Iteration count

**If Stuck:**
After 5 consecutive iterations without progress:
- Document what's blocking progress
- Suggest alternative approaches
- Ask user: Continue, try different approach, or stop?"
```

---

## 🔧 Implementation Options

### Option A: Update Existing Commands (Minimal Change)

**Approach**: Add Ralph Wiggum iteration capability to existing `/work` command

**How**:
1. Update `.claude/commands/work.md` to include Ralph Wiggum iteration pattern
2. Add option `--ralph-mode` to `/work` command
3. When `--ralph-mode` is enabled, work command uses iterative TDD cycle

**Usage**:
```bash
/ai-eng/work "specs/auth/plan.md" --ralph-mode

# Work command executes using Ralph Wiggum iteration pattern
```

**Pros**:
- ✅ Minimal changes
- ✅ Works with existing workflow
- ✅ User familiar with `/work` command
- ✅ Can opt-in with flag

**Cons**:
- ❌ Not full workflow automation
- ❌ Requires manual invocation of research/plan phases

---

### Option B: Create New Command (New Capability)

**Approach**: Create `/ralph-workflow` command that orchestrates entire workflow

**How**:
1. Create `.claude/commands/ralph-workflow.md`
2. Command uses Ralph Wiggum pattern across all phases
3. Each phase iterates until completion

**Usage**:
```bash
/ralph-workflow "Implement user authentication system"

# Single command executes entire workflow with Ralph Wiggum iterations
```

**Pros**:
- ✅ Full workflow automation
- ✅ One command to do everything
- ✅ Consistent with Ralph Wiggum pattern
- ✅ Can run overnight

**Cons**:
- ❌ New command to learn
- ❌ Less control over individual phases
- ❌ Higher complexity

---

### Option C: Keep Existing, Add Skill (Guidance Only)

**Approach**: Don't implement new automation, just provide guidance

**How**:
1. Create `skills/workflow/ralph-workflow/SKILL.md`
2. Skill provides templates for orchestrating workflow manually
3. User manually invokes each command

**Usage**:
```bash
@skill ralf-workflow

# Then manually run each phase with guidance:
/ai-eng/research "auth patterns" [use skill's iteration guidance]
/ai-eng/specify "User authentication" [use skill's iteration guidance]
/ai-eng/plan [use skill's iteration guidance]
/ai-eng/work [use skill's iteration guidance]
/ai-eng/review [use skill's iteration guidance]
```

**Pros**:
- ✅ No implementation needed
- ✅ Maximum flexibility
- ✅ Works with existing workflow
- ✅ Easy to update

**Cons**:
- ❌ Still manual workflow
- ❌ Requires user to orchestrate
- ❌ Not full automation

---

## 📋 Recommendation

**Best Approach**: Start with Option A (Update `/work` command), then add Option B (new command) later

**Why**:
1. **Immediate value**: Ralph Wiggum iteration is most useful in work phase
2. **Minimal change**: Easy to implement and test
3. **User control**: Users can opt-in with `--ralph-mode`
4. **Future-proof**: Can add full orchestrator later if needed

**Implementation Priority**:
1. ✅ **High Priority**: Update `/work` command with `--ralph-mode` option
2. ⏸ **Medium Priority**: Create `/ralph-workflow` command for full automation
3. ⏸ **Low Priority**: Add Ralph Wiggum skill for workflow orchestration

---

## 🚀 Next Steps

### For Option A (Update `/work`):

1. Update `.claude/commands/work.md`:
   - Add `--ralph-mode` option
   - Add Ralph Wiggum iteration instructions
   - Add TDD cycle guidance

2. Create examples:
   - Show how to use with existing plans
   - Show quality gate configuration
   - Show progress tracking

3. Test with real workflow:
   - Run research → specify → plan → work --ralph-mode
   - Verify iteration works correctly
   - Verify quality gates run

### For Option B (Create `/ralph-workflow`):

1. Create `.claude/commands/ralph-workflow.md`:
   - Define phase orchestration
   - Define iteration strategy per phase
   - Define completion signals

2. Create integration examples:
   - Show complete workflow execution
   - Show error handling
   - Show progress tracking

3. Test end-to-end:
   - Run full workflow automation
   - Verify all phases complete
   - Verify quality gates work

---

## 📚 Summary

**Two clear integration paths:**

1. **Ralph Wiggum as Phase Orchestrator** (Full Automation)
   - Single command, entire workflow
   - Each phase iterates until complete
   - Best for overnight automation
   - Higher complexity, higher automation

2. **Ralph Wiggum Within Work Phase Only** (Incremental)
   - Keep existing workflow
   - Add iteration only where needed
   - Best for day-to-day development
   - Lower complexity, more control

**Recommendation**: Start with work phase integration (Option A), then add full orchestrator (Option B) as needed.

---

**Which approach would you like me to implement first?**
