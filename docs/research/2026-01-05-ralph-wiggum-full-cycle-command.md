---
date: 2026-01-05
researcher: Assistant
topic: 'Ralph Wiggum Full-Cycle Command - Research & Design'
tags: [research, automation, workflow, iteration, orchestration]
status: complete
confidence: 0.90
---

## Synopsis

Comprehensive research into creating a new `/ai-eng/ralph-wiggum` command that implements full-cycle continuous iteration through all spec-driven workflow phases (Research → Specify → Plan → Work → Review) until feature is complete. This command builds on existing Ralph Wiggum patterns while adding workflow orchestration and intelligent gap analysis.

## Summary

- **Current State**: Individual commands have `--ralph` flags for intra-phase iteration, but no command orchestrates full workflow
- **Core Innovation**: New command will orchestrate all 5 phases with intelligent phase transition based on review gap analysis
- **Safety Focus**: Max cycles, stuck detection, checkpointing, and token visibility are essential
- **User Experience**: Optional checkpoints, resume capability, and progress tracking balance autonomy with visibility
- **Integration Strategy**: Orchestrates existing commands rather than reimplementing them

## Detailed Findings

### Ralph Wiggum Pattern Analysis

#### Core Mechanism

The pattern is a simple while loop that repeatedly feeds an AI agent a prompt until a completion signal is received:

```bash
while :; do cat PROMPT.md | claude ; done
```

Key characteristics:
- **Continuous Iteration**: Agent keeps working on the same goal
- **Stop Hook**: Prevents agent from exiting until completion signal detected
- **Self-Correction**: Failures are treated as data for next iteration
- **Operator Skill**: Success depends on prompt quality, not model capability

#### Existing ai-eng-system Integration

**Individual Command Integration:**
- `/research` has `--ralph` flag for persistent research refinement
- `/specify` has `--ralph` flag for persistent specification refinement
- `/plan` has `--ralph` flag for persistent plan refinement
- `/work` has `--ralph` flag for TDD-driven implementation
- `/review` has `--ralph` flag for persistent review refinement

**Gaps Identified:**
- No command orchestrates multiple phases in sequence
- `--feed-into` flag documented but never implemented
- No automatic phase transitions based on findings
- No workflow-level safety measures

### Current Architecture

#### Existing Task Execution

**TaskExecutor** (`src/execution/task-executor.ts`):
- Executes plans with dependency resolution
- Has retry logic for failed shell commands (default: 1 attempt)
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

### Phase Orchestration Requirements

#### Workflow Flow

```
1. Create Feature Branch
   ├── git checkout -b feat/[feature-slug]

2. CYCLE START (max_cycles check)
   ├── 2.1. RESEARCH Phase
   │    └── /ai-eng/research --ralph --max-phase-iterations N
   ├── 2.2. SPECIFY Phase
   │    └── /ai-eng/specify --from-research=... --ralph --max-phase-iterations N
   ├── 2.3. PLAN Phase
   │    └── /ai-eng/plan --from-spec=... --ralph --max-phase-iterations N
   ├── 2.4. WORK Phase
   │    └── /ai-eng/work --from-plan=... --ralph --max-phase-iterations N
   ├── 2.5. REVIEW Phase
   │    └── /ai-eng/review --ralph --max-phase-iterations N
   └── 2.6. Gap Analysis
        ├── If APPROVE: GOTO 3 (Create PR)
        └── If CHANGES_REQUESTED:
             ├── Analyze findings (severity, type)
             ├── Return to SPECIFY (missing requirements)
             ├── Return to PLAN (architectural issues)
             └── Return to WORK (implementation bugs)
                  └── GOTO 2 (Next Cycle)

3. CREATE DRAFT PR
   ├── gh pr create --draft
   └── Include comprehensive summary

4. COMPLETE
```

#### Gap Analysis Logic

**Review Finding Types:**

| Finding Type | Example | Return To | Rationale |
|-------------|-----------|-----------|-----------|
| Missing requirements | "What happens when X?" | SPECIFY | Spec needs enhancement |
| Unclear acceptance criteria | "How is this tested?" | SPECIFY | Spec needs clarification |
| Architectural issues | "Tight coupling between modules" | PLAN | Plan needs restructuring |
| Missing dependencies | "Task A references undefined component" | PLAN | Plan incomplete |
| Implementation bugs | "Null reference in line 45" | WORK | Code needs fixing |
| Test coverage gaps | "Function X has no tests" | WORK | Tests need adding |
| Documentation gaps | "README doesn't mention API" | WORK | Docs need updating |
| Security vulnerabilities | "SQL injection possible" | WORK/PLAN | Depends on severity |
| Performance issues | "O(n²) complexity" | WORK/PLAN | Depends on root cause |

**Severity-Based Decision Tree:**

```
Critical Security → Return to PLAN (may need architectural change)
Critical Performance → Return to PLAN (may need architectural change)
Major Security → Return to WORK (implementation fix)
Major Performance → Return to WORK (optimization)
Any Requirement Missing → Return to SPECIFY
Any Implementation Bug → Return to WORK
Any Test Coverage Gap → Return to WORK
Minor Issues → Log and continue
```

### Safety Measures

#### Max Iterations Caps

- **Max Workflow Cycles**: 5 (default, configurable via `--max-cycles`)
  - Rationale: Most features complete within 3 cycles, 5 provides buffer
  - Each cycle typically refines one major gap

- **Max Phase Iterations**: 10 (default, configurable via `--max-phase-iterations`)
  - Rationale: Individual phases rarely need more than 10 iterations
  - Prevents infinite loops within a single phase

#### Stuck Detection

**Detection Criteria:**
- No progress in 3 consecutive cycles
- Same phase failing after 3 cycles without moving forward
- Quality gates failing identically after 2 cycles

**Action on Stuck Detection:**
- Alert user with detailed analysis
- Save checkpoint with stuck state
- Offer to pause for manual intervention
- Continue if `--continue-on-stuck` flag set

#### Token Usage Tracking

**Display Format:**
```
💰 Token Usage: 45,230 total
   Research: 8,450 (3 iterations)
   Specify: 5,230 (2 iterations)
   Plan: 12,100 (4 iterations)
   Work: 19,450 (6 iterations)
   This Cycle: 12,450
```

**No Budget Enforcement:**
- Platform differences (Claude Code vs OpenCode)
- Users track their own API limits
- Display-only for awareness

#### Checkpointing

**Checkpoint Structure:**
```json
{
  "feature": "user-authentication",
  "branch": "feat/user-authentication",
  "cycle": 2,
  "current_phase": "WORK",
  "completed_phases": ["RESEARCH", "SPECIFY", "PLAN"],
  "artifacts": {
    "research": "docs/research/2026-01-05-user-authentication.md",
    "spec": "specs/user-authentication/spec.md",
    "plan": "specs/user-authentication/plan.md"
  },
  "token_usage": {
    "total": 45230,
    "this_cycle": 12450
  },
  "last_review": {
    "status": "CHANGES_REQUESTED",
    "findings_count": 8,
    "critical": 2,
    "major": 5,
    "minor": 1
  },
  "checkpoint_time": "2026-01-05T14:23:45Z"
}
```

**Checkpoint Location:** `.ralph-wiggum/[feature]/checkpoint.json`
**Auto-ignore:** Add `.ralph-wiggum/` to `.gitignore` automatically

### User Experience Design

#### Optional Checkpoints

**Checkpoint Points:**
- `--checkpoint=all` - Pause after each phase (research, specify, plan, work, review)
- `--checkpoint=review` - Pause only after review phase
- `--checkpoint=none` - No checkpoints (fully autonomous, default)

**Checkpoint Interaction:**
```
🔶 Checkpoint reached: REVIEW phase complete

📊 Review Summary:
  Status: CHANGES_REQUESTED
  Findings: 8 total (2 critical, 5 major, 1 minor)
  
  Critical:
  - src/auth/auth.ts:45 - SQL injection vulnerability
  - src/auth/jwt.ts:12 - Hardcoded secret key

  Major:
  - src/auth/validation.ts:34 - No input sanitization
  - src/api/login.ts:67 - Missing error handling
  [5 more...]

🤔 Action Required:
  Analysis recommends returning to WORK phase (implementation bugs + security issues)

Options:
  [1] Continue to WORK phase (recommended)
  [2] Return to SPECIFY phase
  [3] Return to PLAN phase
  [4] Review findings manually
  [5] Abort build

Enter choice (1-5): _
```

#### Progress Display

**Levels of Verbosity:**

**Default (balanced):**
```
🔄 Ralph Wiggum Cycle 2/5 for "user authentication"

📊 Phase Status:
  ✅ Research: Complete (confidence: 0.9)
  ✅ Specify: Complete (5 user stories, 23 acceptance criteria)
  ✅ Plan: Complete (12 tasks, 8 hours estimated)
  🔄 Work: In Progress (8/12 tasks complete)
  ⏳ Review: Pending

📈 Quality Gates:
  ✅ Lint: Passing
  ✅ Types: Passing
  🔄 Tests: 15/20 passing (75%)
  ⏳ Build: Not run
  ⏳ Security: Not run

📋 Acceptance Criteria: 18/23 complete (78%)
🧪 Test Coverage: 72% (target: 80%)
💰 Token Usage: 45,230 total (this cycle: 12,450)
⏱️ Elapsed: 23m 45s
```

**Verbose:**
```
[includes all default output plus:]
📝 Phase Details:
  Research: 3 iterations, 8,450 tokens
  Specify: 2 iterations, 5,230 tokens
  Plan: 4 iterations, 12,100 tokens
  Work: 6 iterations (ongoing), 19,450 tokens
  Review: Not started

📊 Iteration History:
  Cycle 1: 32,400 tokens
    - Research: 2 iterations (5,230 tokens)
    - Specify: 1 iteration (2,100 tokens)
    - Plan: 3 iterations (10,150 tokens)
    - Work: 5 iterations (14,920 tokens)
  Cycle 2 (ongoing): 12,450 tokens
```

**Quiet:**
```
🔄 Cycle 2/5 | Work 8/12 | AC 78% | Tests 75%
```

#### Resume Capability

**Resume Process:**
1. Check for `.ralph-wiggum/[feature]/checkpoint.json`
2. If found:
   - Load checkpoint state
   - Restore branch
   - Resume from last completed phase
3. If not found:
   - Alert: "No checkpoint found, starting fresh"

**Resume Example:**
```bash
/ai-eng/ralph-wiggum "user authentication" --resume
```

Output:
```
✅ Checkpoint found: Cycle 2, WORK phase in progress
🔄 Resuming from cycle 2, phase 4 (WORK)
...
```

### Integration with Existing Commands

#### Artifact Passing

**Research → Specify:**
```bash
/ai-eng/research "user authentication" \
  --ralph \
  --ralph-max-iterations 5 \
  --ralph-completion-promise "Research is comprehensive"
```
Output: `docs/research/[date]-user-authentication.md`

Pass to Specify:
```bash
/ai-eng/specify "user authentication" \
  --from-research=docs/research/[date]-user-authentication.md \
  --ralph \
  --ralph-max-iterations 3 \
  --ralph-completion-promise "Specification is complete"
```

Output: `specs/user-authentication/spec.md`

**Specify → Plan:**
```bash
/ai-eng/plan \
  --from-spec=specs/user-authentication/spec.md \
  --ralph \
  --ralph-max-iterations 4 \
  --ralph-completion-promise "Plan is comprehensive"
```

Output: `specs/user-authentication/plan.md`

**Plan → Work:**
```bash
/ai-eng/work specs/user-authentication/plan.md \
  --ralph \
  --ralph-max-iterations 8 \
  --ralph-completion-promise "Implementation meets all acceptance criteria" \
  --ralph-quality-gate="npm test && npm run lint"
```

Output: Implementation files + tests

**Work → Review:**
```bash
/ai-eng/review . \
  --ralph \
  --ralph-max-iterations 3 \
  --ralph-completion-promise "Review is comprehensive"
```

Output: `code-review-report.json`

#### Draft PR Creation

**PR Generation:**
```bash
gh pr create \
  --title "[Feature] User Authentication" \
  --body "$(cat <<'EOF'
## Summary
Implemented complete user authentication system with JWT tokens, password hashing, and email verification.

## Cycle History
- Cycle 1: Initial implementation (32,400 tokens)
- Cycle 2: Security fixes and test improvements (12,450 tokens)

## Changes
- User registration with email verification
- JWT-based authentication
- Password reset flow
- Email validation and sanitization
- Comprehensive test coverage (80%)

## Testing
- [x] Unit tests added (18 tests)
- [x] Integration tests pass
- [x] Security scans pass (no vulnerabilities)
- [x] Lint passing
- [x] Type checking passing

## Quality Gates
- Lint: ✅ Passing
- Types: ✅ Passing
- Tests: ✅ 20/20 passing (100%)
- Test Coverage: ✅ 80%
- Security: ✅ No vulnerabilities

## Artifacts
- Specification: specs/user-authentication/spec.md
- Plan: specs/user-authentication/plan.md
- Research: docs/research/2026-01-05-user-authentication.md
- Review: code-review-report.json
EOF
)" \
  --draft
```

### Implementation Considerations

#### Parallelization Strategy

**Sequential by Default:**
- Clearer flow for understanding progress
- Easier debugging
- Lower complexity

**Parallel Option (`--parallel`):**
- Research and Specify can start simultaneously once context is loaded
- Review can analyze code while Work completes documentation
- Requires careful state management

**Recommended:** Sequential by default, parallel as advanced option

#### Starting from Existing Artifacts

**Skip Phases:**
```bash
# Skip research, start from existing spec
/ai-eng/ralph-wiggum "user authentication" --skip-research --from-spec=specs/auth/spec.md

# Skip research and specify, start from existing plan
/ai-eng/ralph-wiggum "user authentication" --from-plan=specs/auth/plan.md

# Start from existing research document
/ai-eng/ralph-wiggum "user authentication" --from-research=docs/research/auth.md
```

**Validation:**
- Check artifact exists before starting
- Validate artifact format
- Warn if artifact is incomplete (e.g., empty spec)

#### Dry Run Mode

**Purpose:** Show what would be done without executing

**Output:**
```markdown
🔍 DRY RUN: Plan for "user authentication"

## Workflow Phases:
1. RESEARCH (3 iterations estimated)
   - Command: /ai-eng/research --ralph --max-phase-iterations 5
   - Output: docs/research/[date]-user-authentication.md

2. SPECIFY (2 iterations estimated)
   - Command: /ai-eng/specify --from-research=... --ralph --max-phase-iterations 3
   - Output: specs/user-authentication/spec.md

3. PLAN (4 iterations estimated)
   - Command: /ai-eng/plan --from-spec=... --ralph --max-phase-iterations 4
   - Output: specs/user-authentication/plan.md

4. WORK (6 iterations estimated)
   - Command: /ai-eng/work specs/user-authentication/plan.md --ralph --max-phase-iterations 8
   - Quality gate: npm test && npm run lint
   - Output: Implementation + tests

5. REVIEW (3 iterations estimated)
   - Command: /ai-eng/review . --ralph --max-phase-iterations 3
   - Output: code-review-report.json

## Estimated Completion:
- Max cycles: 5
- Total iterations: 18
- Estimated tokens: ~75,000
- Estimated time: ~2 hours

Proceed with execution? (y/n)
```

### Code Architecture

#### Proposed File Structure

```
src/execution/
├── ralph-wiggum-orchestrator.ts  # Main orchestration logic
├── gap-analyzer.ts               # Review gap analysis
├── checkpoint-manager.ts           # Checkpoint save/load
└── progress-tracker.ts            # Progress display

src/cli/
└── ralph-wiggum.ts                 # CLI interface

content/commands/
└── ralph-wiggum.md               # Command specification
```

#### Key Classes/Functions

```typescript
// ralph-wiggum-orchestrator.ts
class RalphWiggumOrchestrator {
  constructor(options: RalphWiggumOptions)
  async execute(featureDescription: string): Promise<BuildResult>
  private async runCycle(cycleNumber: number): Promise<CycleResult>
  private async runPhase(phase: Phase, context: PhaseContext): Promise<PhaseResult>
  private async analyzeGaps(reviewResult: ReviewResult): Promise<GapAnalysis>
  private createPullRequest(summary: BuildSummary): Promise<PRResult>
}

// gap-analyzer.ts
class GapAnalyzer {
  analyze(reviewFindings: ReviewFinding[]): GapAnalysis
  private categorizeFinding(finding: ReviewFinding): FindingCategory
  private determineReturnPhase(findings: CategorizedFindings[]): Phase
}

// checkpoint-manager.ts
class CheckpointManager {
  save(state: BuildState): Promise<void>
  load(feature: string): Promise<BuildState | null>
  private getCheckpointPath(feature: string): string
}

// progress-tracker.ts
class ProgressTracker {
  updateCycle(cycle: number, phase: Phase, status: PhaseStatus): void
  displayProgress(): void
  private formatDefaultOutput(): string
  private formatVerboseOutput(): string
  private formatQuietOutput(): string
}
```

## Architecture Insights

### Integration Points

**Existing Commands:**
- Use `/ai-eng/research` with `--ralph` flag
- Use `/ai-eng/specify` with `--ralph` flag
- Use `/ai-eng/plan` with `--ralph` flag
- Use `/ai-eng/work` with `--ralph` flag
- Use `/ai-eng/review` with `--ralph` flag

**Existing Quality Gates:**
- Use `/ai-eng/work` quality gates (lint, types, tests, build, security)
- Run gates after each WORK phase

**Existing Review Perspectives:**
- Use `/ai-eng/review` multi-perspective analysis
- Gap analysis based on review findings

### Design Patterns

**Orchestrator Pattern:**
- Central coordinator manages workflow
- Delegates to existing commands
- Coordinates state and transitions

**Strategy Pattern:**
- Gap analysis strategies based on finding types
- Different return-to strategies per gap type

**Observer Pattern:**
- Progress tracker observes phase changes
- Updates display in real-time

**State Management:**
- Checkpoints serialize build state
- Resume capability restores state

## Recommendations

### Immediate Actions

1. **✅ Create Command Specification** (Priority: High) - **COMPLETE**
   - Location: `specs/ralph-wiggum-command/spec.md`
   - Defined user stories, acceptance criteria, and options
   - Documented phase orchestration logic
   - Specified safety measures

2. **✅ Create Implementation Plan** (Priority: High) - **COMPLETE**
   - Location: `specs/ralph-wiggum-command/plan.md`
   - **CORRECTED APPROACH**: Markdown command file (not TypeScript implementation)
   - Documents that AI agent follows workflow when invoked
   - Orchestrates existing commands via their --ralph flags
   - No new code files required

3. **✅ Create Command File** (Priority: High) - **COMPLETE**
   - Location: `content/commands/ralph-wiggum.md`
   - YAML frontmatter with name, description, agent, version
   - Complete 5-phase workflow documentation
   - Gap analysis rules defined
   - Checkpoint management documented
   - Safety measures specified
   - PR creation documented

4. **✅ Update Documentation** (Priority: Medium) - **COMPLETE**
   - Added `/ralph-wiggum` to AGENTS.md command table
   - Command appears in both dist/.claude-plugin/ and dist/.opencode/

5. **✅ Build and Validate** (Priority: Medium) - **COMPLETE**
   - Build completed successfully
   - Command file appears in correct locations
   - No build errors

### Implementation Complete

**All core tasks completed**:

| Task | Status | Notes |
|-------|--------|--------|
| Command specification | ✅ Complete | 9 user stories, 43 AC, 5 NFRs |
| Implementation plan | ✅ Complete | Corrected to markdown-only approach |
| Command file | ✅ Complete | Full 5-phase workflow documented |
| Documentation update | ✅ Complete | Added to AGENTS.md |
| Build validation | ✅ Complete | Successfully builds without errors |

### How It Works

When user invokes `/ai-eng/ralph-wiggum "feature description"`:

1. **AI reads** `content/commands/ralph-wiggum.md`
2. **AI follows** the documented workflow:
   - Creates feature branch
   - Runs Research phase (`/ai-eng/research --ralph`)
   - Runs Specify phase (`/ai-eng/specify --ralph`)
   - Runs Plan phase (`/ai-eng/plan --ralph`)
   - Runs Work phase (`/ai-eng/work --ralph`)
   - Runs Review phase (`/ai-eng/review --ralph`)
   - Analyzes gaps and determines next action
   - Loops or completes as appropriate
   - Creates draft PR when complete

3. **All orchestration logic** is in the markdown file - no TypeScript code needed

### Key Advantage

**No new TypeScript implementation required!** The command reuses existing:
- `/research` with its 3-phase orchestration
- `/specify` with specification generation
- `/plan` with task decomposition
- `/work` with TDD and quality gates
- `/review` with multi-perspective analysis
- Ralph Wiggum skill for intra-phase iteration (already in all commands)

This is **the simplest, most maintainable approach**.

### Long-term Considerations

1. **Intelligent Context Pruning**
   - Manage context window in long-running builds
   - Keep only relevant history between cycles
   - Prune outdated artifacts

2. **Multi-Agent Ralph Loops**
   - Different agents in different phases of loop
   - Example: `@architect-advisor` → `@full-stack-developer` → `@code-reviewer`
   - Use AgentCoordinator for orchestration

3. **Performance Optimization**
   - Cache analysis results
   - Parallel phase execution (optional)
   - Incremental quality gate checks

4. **Enhanced Visualization**
   - Web dashboard for monitoring long-running builds
   - Real-time iteration graph
   - Cost projection

## Risks & Limitations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Infinite workflow loops | High | Low | Max cycles limit + stuck detection |
| High API costs | Medium | Medium | Token tracking + cost display |
| Context overflow | Medium | Medium | Checkpoint pruning + resume |
| Incorrect gap analysis | Medium | Low | Conservative return-to logic |
| Long execution time | Low | High | Optional checkpoints + resume |
| Platform differences | Low | Low | Abstract command execution |
| Git conflicts | Low | Medium | Conflict detection + resolution |

## Open Questions

- [x] Command name: `/ai-eng/ralph-wiggum` (user preference confirmed)
- [x] Human checkpoints: Optional after each phase (user preference confirmed)
- [x] Git operations: Create branch + draft PR (user preference confirmed)
- [x] Verbosity: Moderate by default (user preference confirmed)
- [x] Quality gate strictness: Balanced (user preference confirmed)
- [x] Resume capability: Checkpointing (user preference confirmed)
- [x] Parallelization: Sequential default, optional parallel (user preference confirmed)
- [x] Auto-add `.ralph-wiggum/` to `.gitignore`: Yes (user preference confirmed)
- [x] Token budget tracking: Display only, no enforcement (user preference confirmed)
- [x] Draft vs ready PR: Draft PR (user preference confirmed)
- [x] Auto-merge: No auto-merge (user preference confirmed)
- [x] Checkpoint location: `.ralph-wiggum/[feature]/` (user preference confirmed)

**All open questions resolved.**

## Code References

- `content/commands/research.md` - Research command with --ralph flag
- `content/commands/specify.md` - Specify command with --ralph flag
- `content/commands/plan.md` - Plan command with --ralph flag
- `content/commands/work.md` - Work command with --ralph flag
- `content/commands/review.md` - Review command with --ralph flag
- `skills/workflow/ralph-wiggum/SKILL.md` - Ralph Wiggum skill definition
- `docs/research/2025-01-05-ralph-wiggum-loop-analysis.md` - Previous Ralph Wiggum research

## Architecture Insights

### Pattern: Orchestrator

The new command follows the **Orchestrator Pattern**:
- **Purpose**: Coordinate multiple existing components
- **Benefit**: Reuses existing commands without modification
- **Implementation**: Lightweight coordination logic

### Pattern: State Machine

Workflow cycles follow a **State Machine**:
- **States**: RESEARCH → SPECIFY → PLAN → WORK → REVIEW → (return to earlier state)
- **Transitions**: Based on review gap analysis
- **Termination**: APPROVE + all quality gates pass

### Pattern: Checkpoint/Restore

Enables **Recovery Pattern**:
- **Save**: After each cycle (durable state)
- **Restore**: On resume or failure
- **Benefit**: Supports long-running builds and interruptions

## Recommendations

### Immediate Actions

1. **Approve Specification** ✅
   - Review specification at: `specs/ralph-wiggum-command/spec.md`
   - Confirm user stories and acceptance criteria
   - Approve or request changes

2. **Create Implementation Plan** 📋
   - Use `/ai-eng/plan --from-spec=specs/ralph-wiggum-command/spec.md`
   - Define implementation tasks
   - Estimate effort and dependencies

3. **Implement Core Orchestrator** 💻
   - Start with `src/execution/ralph-wiggum-orchestrator.ts`
   - Implement basic cycle loop
   - Add phase orchestration
   - Integrate with existing commands

4. **Add Safety Measures** 🛡️
   - Implement max cycles limits
   - Implement stuck detection
   - Implement checkpointing
   - Implement token tracking

5. **Create CLI Interface** 🖥️
   - Add to `src/cli/ralph-wiggum.ts`
   - Implement command-line options
   - Add progress display

6. **Test with Simple Feature** 🧪
   - Run command on trivial feature
   - Verify all phases execute
   - Verify checkpoint/retry
   - Verify gap analysis

### Long-term Considerations

1. **Enhanced Gap Analysis**
   - Use AI for more intelligent categorization
   - Learn from past cycles
   - Recommend specific fixes

2. **Workflow Optimization**
   - Auto-skip phases based on feature complexity
   - Adaptive iteration limits per phase
   - Predict cycle completion time

3. **Integration with IDE**
   - Show progress in IDE sidebar
   - Highlight files being modified
   - Real-time review display

## Confidence Assessment

**Confidence: 0.90 (High)**

**Assumptions:**
- Existing commands (`--ralph` flags) work as documented
- Users can monitor their own API token usage
- Git operations (branch, PR) are available via `gh` CLI
- Checkpoint directory can be created safely

**Limitations:**
- No actual implementation yet (research and design only)
- Gap analysis logic needs real-world testing
- Stuck detection thresholds may need adjustment

**Evidence:**
- Thorough review of all 5 phase commands with `--ralph` flags
- Complete analysis of existing architecture
- Clear understanding of Ralph Wiggum pattern from skill documentation
- Real-world examples from research document (2025-01-05-ralph-wiggum-loop-analysis.md)

## Research References

### Primary Sources
- [Awesome Claude - Ralph Wiggum](https://awesomeclaude.ai/ralph-wiggum) - Official documentation
- [Geoffrey Huntley's Blog](https://ghuntley.com/ralph/) - Original technique creator
- [Ralph Orchestrator](https://github.com/mikeyobrien/ralph-orchestrator) - Community management tool

### ai-eng-system Sources
- `skills/workflow/ralph-wiggum/SKILL.md` - Ralph Wiggum skill definition
- `content/commands/research.md` - Research command specification
- `content/commands/specify.md` - Specify command specification
- `content/commands/plan.md` - Plan command specification
- `content/commands/work.md` - Work command specification
- `content/commands/review.md` - Review command specification
- `docs/research/2025-01-05-ralph-wiggum-loop-analysis.md` - Previous Ralph Wiggum analysis
- `src/execution/task-executor.ts` - Existing task execution infrastructure
- `src/cli/executor.ts` - Existing CLI infrastructure

### Key Code Locations
- Ralph Wiggum skill: `skills/workflow/ralph-wiggum/SKILL.md`
- Research command: `content/commands/research.md`
- Task executor: `src/execution/task-executor.ts:265-306` (retry logic)
- CLI executor: `src/cli/executor.ts` (command structure)
- Build system: `build.ts` (canonical to derived transformation)

---

**Research Complete**

This research provides comprehensive foundation for implementing `/ai-eng/ralph-wiggum` command. All key aspects documented: phase orchestration, gap analysis, safety measures, user experience, and integration strategy.
