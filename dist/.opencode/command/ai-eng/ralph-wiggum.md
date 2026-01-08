---
name: ai-eng/ralph-wiggum
description: Full-cycle feature development with continuous iteration through all spec-driven workflow phases (Research → Specify → Plan → Work → Review) until feature is complete.
agent: build
version: 1.0.0
inputs:
  - name: feature
    type: string
    required: true
    description: Feature description or requirement to implement
  - name: fromResearch
    type: string
    required: false
    description: Path to existing research document to start from
  - name: fromSpec
    type: string
    required: false
    description: Path to existing specification to start from
  - name: fromPlan
    type: string
    required: false
    description: Path to existing plan to start from
outputs:
  - name: build_report
    type: structured
    format: JSON
    description: Complete build report with all phase outputs, cycle history, and final summary
---

# Ralph Wiggum Full-Cycle Command

Execute complete feature development cycle: $ARGUMENTS

> **Phase 0-5 of Spec-Driven Workflow**: Orchestrates Research → Specify → Plan → Work → Review in continuous loop

Take a deep breath and orchestrate this complex multi-phase workflow systematically. Manage iteration cycles, track progress across all phases, and ensure comprehensive quality at each stage.

## Why This Matters

This workflow handles complete feature development from research to review. Poor orchestration leads to wasted cycles, incomplete phases, and features that fail quality gates. This orchestration task is critical for ensuring features are developed thoroughly and meet all requirements.

## The Challenge

I bet you can't manage continuous iteration across all workflow phases without getting stuck in loops. The challenge is knowing when to advance to next phase versus when to return for refinement, balancing persistence with efficiency. Success means feature completes all requirements, passes all quality gates, and doesn't exceed reasonable iteration limits.

## Quick Start

```bash
# Full-cycle feature development
/ai-eng/ralph-wiggum "implement user authentication with JWT tokens"

# Start from existing specification
/ai-eng/ralph-wiggum "user authentication" --from-spec=specs/auth/spec.md

# Start from existing plan (skip research and specify)
/ai-eng/ralph-wiggum "user authentication" --from-plan=specs/auth/plan.md

# With checkpoints for manual review
/ai-eng/ralph-wiggum "user authentication" --checkpoint=all

# Resume interrupted build
/ai-eng/ralph-wiggum "user authentication" --resume

# Dry run to see execution plan
/ai-eng/ralph-wiggum "user authentication" --dry-run
```

## Options

| Option | Type | Default | Description |
|--------|-------|---------|-------------|
| `--max-cycles <n>` | number | 5 | Maximum full workflow cycles |
| `--max-phase-iterations <n>` | number | 10 | Max iterations per phase |
| `--checkpoint` | string | none | Pause points: `all`, `review`, or `none` |
| `--from-research <path>` | path | - | Start from existing research document |
| `--from-spec <path>` | path | - | Start from existing specification |
| `--from-plan <path>` | path | - | Start from existing plan |
| `--skip-research` | boolean | false | Skip research phase entirely |
| `--quality-gate <command>` | command | - | Custom quality gate command |
| `--completion-promise <text>` | string | (see below) | Custom completion criteria |
| `--show-progress` | boolean | true | Show detailed cycle progress |
| `--log-history <file>` | path | - | Log all iterations to JSON |
| `--verbose` | boolean | false | Enable verbose output |
| `--quiet` | boolean | false | Minimal output (milestones only) |
| `--dry-run` | boolean | false | Show plan without executing |
| `--resume` | boolean | false | Resume from last checkpoint |
| `--parallel` | boolean | false | Run phases in parallel where safe |
| `--refine-each-phase` | boolean | false | Re-invoke prompt-refinement at each phase (interactive mode) |

**Default Completion Promise:**
```
"Feature is complete: all acceptance criteria met, quality gates passing, review approved, documentation updated"
```

## Phase 0: Prompt Refinement (CRITICAL - Do First)

Load `skills/prompt-refinement/SKILL.md` and use phase: `plan` to transform your prompt into structured TCRO format (Task, Context, Requirements, Output). Ask clarifying questions if feature description, acceptance criteria, technical approach, or quality gates are unclear.

**Store the refined output as `$REFINED_CONTEXT`** - this will be used for ALL subsequent phases without re-invoking prompt-refinement.

### Autonomous Execution Model

After Phase 0 completes:
1. **Context is locked**: The refined TCRO applies to ALL subsequent phases
2. **No re-refinement**: Do NOT invoke prompt-refinement again (unless `--refine-each-phase` is set)
3. **Continuous execution**: Proceed through phases without pausing for user input
4. **Checkpoints are optional**: Only pause if `--checkpoint` flag is explicitly set

This enables overnight/unattended execution as intended by the Ralph Wiggum pattern.

## Phase 1: Git Setup

### 1.1 Create Feature Branch

**Action**: Create and checkout feature branch
```bash
git checkout -b feat/[feature-slug]
```

**Feature Slug Generation**:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Max 50 characters

**Example**: "user authentication with JWT" → `feat/user-authentication-jwt`

**Acceptance**:
- [ ] Branch created successfully
- [ ] Branch starts from current branch
- [ ] Branch name is valid Git reference

## Phase 2: Main Cycle Loop

This is the core Ralph Wiggum pattern - continuous iteration until completion.

### 2.1 Cycle Start Check

**Before starting each cycle, verify**:
1. **Max cycles not exceeded**: If `cycle > maxCycles`, stop and report completion status
2. **Checkpoint load** (if `--resume`): Load from `.ralph-wiggum/[feature]/checkpoint.json`
3. **Stuck detection**: If 3 consecutive cycles without progress, alert user

**Cycle Start Output**:
```
🔄 Ralph Wiggum Cycle 1/5 for "user authentication"
```

### 2.2 Research Phase (if not skipped)

**Goal**: Gather context, patterns, and technical guidance

**Context**: Use `$REFINED_CONTEXT` from Phase 0. Do NOT re-invoke prompt-refinement unless `--refine-each-phase` is set.

**Execute**:
```bash
/ai-eng/research "$FEATURE_DESCRIPTION" \
  --ralph \
  --ralph-max-iterations $MAX_PHASE_ITERATIONS \
  --ralph-completion-promise "Research is comprehensive and complete" \
  --show-progress
```

**If `--from-research` provided**: Skip this phase, use existing document

**Acceptance**:
- [ ] Research phase completes
- [ ] Output: `docs/research/[date]-[feature].md`
- [ ] Research report has high confidence (≥ 0.7)

**Checkpoint** (if `--checkpoint=all`): Pause and ask for approval before proceeding

**→ CONTINUE**: Immediately proceed to Phase 2.3 (Specify) without waiting for user input.

### 2.3 Specify Phase (if not skipped)

**Goal**: Create detailed specification with user stories and acceptance criteria

**Context**: Use `$REFINED_CONTEXT` from Phase 0. Do NOT re-invoke prompt-refinement unless `--refine-each-phase` is set.

**Execute**:
```bash
# If research was generated
/ai-eng/specify "$FEATURE_DESCRIPTION" \
  --from-research=$RESEARCH_OUTPUT \
  --ralph \
  --ralph-max-iterations $MAX_PHASE_ITERATIONS \
  --ralph-completion-promise "Specification is complete and ready for implementation" \
  --show-progress

# If starting from existing spec, skip
```

**If `--from-spec` provided**: Skip this phase, use existing document

**Acceptance**:
- [ ] Specify phase completes
- [ ] Output: `specs/[feature]/spec.md`
- [ ] Spec has user stories with acceptance criteria
- [ ] No `[NEEDS CLARIFICATION]` markers (or marked as resolved)

**Checkpoint** (if `--checkpoint=all`): Pause and ask for approval

**→ CONTINUE**: Immediately proceed to Phase 2.4 (Plan) without waiting for user input.

### 2.4 Plan Phase (if not skipped)

**Goal**: Create implementation plan with tasks and dependencies

**Context**: Use `$REFINED_CONTEXT` from Phase 0. Do NOT re-invoke prompt-refinement unless `--refine-each-phase` is set.

**Execute**:
```bash
# If spec was generated
/ai-eng/plan \
  --from-spec=$SPEC_OUTPUT \
  --ralph \
  --ralph-max-iterations $MAX_PHASE_ITERATIONS \
  --ralph-completion-promise "Plan is comprehensive and ready for execution" \
  --show-progress

# If starting from existing plan, skip
```

**If `--from-plan` provided**: Skip this phase, use existing document

**Acceptance**:
- [ ] Plan phase completes
- [ ] Output: `specs/[feature]/plan.md`
- [ ] Plan has tasks with dependencies
- [ ] Plan includes testing strategy

**Checkpoint** (if `--checkpoint=all`): Pause and ask for approval

**→ CONTINUE**: Immediately proceed to Phase 2.5 (Work) without waiting for user input.

### 2.5 Work Phase

**Goal**: Implement feature with TDD, quality gates, and iterative refinement

**Context**: Use `$REFINED_CONTEXT` from Phase 0. Do NOT re-invoke prompt-refinement unless `--refine-each-phase` is set.

**Execute**:
```bash
/ai-eng/work $PLAN_OUTPUT \
  --ralph \
  --ralph-max-iterations $MAX_PHASE_ITERATIONS \
  --ralph-completion-promise "$COMPLETION_PROMISE" \
  --ralph-quality-gate="$QUALITY_GATE" \
  --ralph-show-progress \
  --show-progress
```

**Quality Gates** (default):
```bash
npm test && npm run lint && npm run build
```

**Custom Quality Gate**: If `--quality-gate` provided, use that command

**Acceptance**:
- [ ] Work phase completes
- [ ] Implementation files created/modified
- [ ] Tests passing
- [ ] Quality gates passing
- [ ] Test coverage ≥ 80%

**Checkpoint** (if `--checkpoint=all` or `--checkpoint=review`): Pause and ask for approval

**→ CONTINUE**: Immediately proceed to Phase 2.6 (Review) without waiting for user input.

### 2.6 Review Phase

**Goal**: Comprehensive multi-perspective code review

**Context**: Use `$REFINED_CONTEXT` from Phase 0. Do NOT re-invoke prompt-refinement unless `--refine-each-phase` is set.

**Execute**:
```bash
/ai-eng/review . \
  --ralph \
  --ralph-max-iterations $MAX_PHASE_ITERATIONS \
  --ralph-completion-promise "Review is comprehensive and complete" \
  --show-progress
```

**Acceptance**:
- [ ] Review phase completes
- [ ] Output: `code-review-report.json` (or similar)
- [ ] Review includes findings with severity levels (critical, major, minor)
- [ ] All perspectives covered (security, performance, architecture, etc.)

**Checkpoint** (if `--checkpoint=all` or `--checkpoint=review`): Pause and ask for approval

**→ CONTINUE**: Immediately proceed to Phase 3 (Gap Analysis) without waiting for user input.

## Phase 3: Gap Analysis

### 3.1 Analyze Review Findings

**After review phase completes**, analyze findings to determine next action:

**Read** the review report output from phase 2.6

**Categorize findings**:

| Review Finding Type | Severity | Return To | Rationale |
|---------------------|----------|-----------|-----------|
| Missing requirements | Any | SPECIFY | Spec needs enhancement |
| Unclear acceptance criteria | Any | SPECIFY | Spec needs clarification |
| Architectural issues | Major/Critical | PLAN | Plan needs restructuring |
| Missing dependencies | Any | PLAN | Plan incomplete |
| Implementation bugs | Any | WORK | Code needs fixing |
| Test coverage gaps | Any | WORK | Tests need adding |
| Documentation gaps | Minor | WORK | Docs need updating |
| Security vulnerabilities | Critical | PLAN | May need architectural change |
| Security vulnerabilities | Major/Minor | WORK | Implementation fix |
| Performance issues | Critical | PLAN | May need architectural change |
| Performance issues | Major/Minor | WORK | Implementation optimization |

### 3.2 Determine Completion Status

**Check if completion criteria met**:
1. **Review Status**: APPROVE (no critical or major findings)
2. **Quality Gates**: All pass
3. **Spec Coverage**: All acceptance criteria marked complete
4. **Test Coverage**: ≥ 80%
5. **Documentation**: Updated and complete

**If ALL criteria met**: Proceed to Phase 5 (Create PR)

**If NOT all criteria met**: Continue to next cycle (Phase 2.1)

### 3.3 Determine Return-To Phase

**If continuing to next cycle, identify which phase to return to**:

Based on gap analysis from 3.1:
- **SPECIFY gaps**: Return to Phase 2.3
- **PLAN gaps**: Return to Phase 2.4
- **WORK gaps**: Return to Phase 2.5

**Decision**:
```
┌─────────────────────────────────────────┐
│ Gap Analysis: SPECIFY gaps found   │
└─────────────────────────────────────────┘
                 │
                 ▼
         Return to SPECIFY phase
```

**Log decision** for visibility:
```
📊 Gap Analysis:
  - 3 SPECIFY gaps found (missing requirements)
  - 0 PLAN gaps
  - 2 WORK gaps (test coverage)
  Decision: Return to SPECIFY phase
```

## Phase 4: Checkpoint Management

### 4.1 Save Checkpoint (After Each Cycle)

**Action**: Save current build state to checkpoint file

**Checkpoint File**: `.ralph-wiggum/[feature]/checkpoint.json`

**Checkpoint Structure**:
```json
{
  "feature": "user-authentication",
  "feature_slug": "user-authentication",
  "branch": "feat/user-authentication",
  "cycle": 2,
  "max_cycles": 5,
  "current_phase": "WORK",
  "completed_phases": ["RESEARCH", "SPECIFY", "PLAN"],
  "refined_context": {
    "task": "Specific, actionable task statement",
    "context": "Broader system, goals, constraints from CLAUDE.md",
    "requirements": ["Must-have requirement 1", "Must-have requirement 2"],
    "output": "What should be delivered (working code, tests, docs, PR)"
  },
  "artifacts": {
    "research": "docs/research/2026-01-05-user-authentication.md",
    "spec": "specs/user-authentication/spec.md",
    "plan": "specs/user-authentication/plan.md"
  },
  "token_usage": {
    "total": 45230,
    "this_cycle": 12450,
    "by_phase": {
      "research": 8450,
      "specify": 5230,
      "plan": 12100,
      "work": 19450
    }
  },
  "last_review": {
    "status": "CHANGES_REQUESTED",
    "findings_count": 8,
    "critical": 2,
    "major": 5,
    "minor": 1
  },
  "checkpoint_time": "2026-01-05T14:23:45Z",
  "gap_analysis": {
    "return_to_phase": "WORK",
    "reason": "2 test coverage gaps identified"
  }
}
```

**Git Ignore**:
- **Auto-add** `.ralph-wiggum/` to `.gitignore`
- This prevents checkpoints from being committed

**Acceptance**:
- [ ] Checkpoint saved successfully
- [ ] `.ralph-wiggum/` added to `.gitignore` (if not already present)

### 4.2 Load Checkpoint (If `--resume`)

**Action**: Load checkpoint and continue from last state

**Validate checkpoint**:
- Check file exists
- Validate JSON structure
- Verify branch matches checkpoint.branch

**Resume Process**:
1. Switch to checkpointed branch: `git checkout <branch>`
2. Load artifacts from checkpoint.artifacts
3. Set cycle number to checkpoint.cycle
4. Set current phase to checkpoint.current_phase
5. Restore token usage from checkpoint.token_usage
6. Display resume summary

**Resume Output**:
```
✅ Checkpoint found: Cycle 2, WORK phase in progress
🔄 Resuming from cycle 2, phase 4 (WORK)
📋 Last gap analysis: Return to WORK phase
💰 Token usage: 45,230 total
```

**Acceptance**:
- [ ] Checkpoint loaded successfully
- [ ] State restored correctly
- [ ] Build continues from appropriate phase

## Phase 5: Pull Request Creation

### 5.1 Create Draft PR

**Action**: Create draft pull request with comprehensive summary

**Execute**:
```bash
gh pr create \
  --title "[Feature] $FEATURE_DESCRIPTION" \
  --body "$PR_BODY" \
  --draft
```

**PR Body Template**:
```markdown
## Summary
$FEATURE_SUMMARY

## Cycle History
- Cycle 1: Research + Specify + Plan + Work (32,400 tokens)
  - Research: Complete (confidence: 0.9)
  - Specify: Complete (5 user stories, 23 AC)
  - Plan: Complete (12 tasks, 8 hours)
  - Work: 8/12 tasks complete
  - Review: CHANGES_REQUESTED (8 findings)
  - Gap Analysis: Return to WORK phase

- Cycle 2: Work refinement (12,450 tokens)
  - Work: 12/12 tasks complete
  - Review: APPROVE
  - Gap Analysis: None

## Changes
- [Bullet list of major changes]
- [New files added]
- [Existing files modified]

## Testing
- [x] Unit tests added (N tests)
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
- Build: ✅ Passing

## Artifacts
- Specification: specs/[feature]/spec.md
- Plan: specs/[feature]/plan.md
- Research: docs/research/[date]-[feature].md
- Review: code-review-report.json
- Checkpoint: .ralph-wiggum/[feature]/checkpoint.json

## Completion Status
✅ Feature complete: All acceptance criteria met, quality gates passing, review approved
```

**Acceptance**:
- [ ] PR created successfully
- [ ] PR is in draft status
- [ ] PR includes comprehensive summary
- [ ] PR includes cycle history
- [ ] PR links to all artifacts

## Progress Output

### Default Display (balanced verbosity)

**After each phase**:
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

### Verbose Display

**Adds per-phase iteration details**:
```
📝 Phase Details:
  Research: 3 iterations, 8,450 tokens
  Specify: 2 iterations, 5,230 tokens
  Plan: 4 iterations, 12,100 tokens
  Work: 6 iterations (ongoing), 19,450 tokens
```

### Quiet Display

**Minimal output**:
```
🔄 Cycle 2/5 | Work 8/12 | AC 78% | Tests 75%
```

## Safety Measures

### Max Cycles Limit

**Enforcement**: Stop execution when `cycle > maxCycles`

**Behavior**:
- If max cycles reached without completion:
  - Display completion summary
  - List remaining gaps
  - Suggest manual intervention
  - Exit with clear status

### Stuck Detection

**Trigger**: No progress in 3 consecutive cycles

**Definition of "Progress"**:
- Completion status didn't improve
- Same phase failing repeatedly
- Same quality gate results

**Action on Stuck Detection**:
- Alert user with detailed analysis
- Save checkpoint with stuck state
- Offer to pause for manual intervention
- Continue if `--continue-on-stuck` flag set

### Token Usage Tracking

**Display**: Always show cumulative and per-cycle token usage

**No Enforcement**: Track only, users manage their own API budgets

**Output**:
```
💰 Token Usage: 45,230 total (this cycle: 12,450)
   Research: 8,450 (3 iterations)
   Specify: 5,230 (2 iterations)
   Plan: 12,100 (4 iterations)
   Work: 19,450 (6 iterations)
```

## Optional Checkpoints

### Checkpoint Interaction (if `--checkpoint` is set)

**After each phase** (or after review if `--checkpoint=review`):

```
🔶 Checkpoint reached: [PHASE_NAME] phase complete

📊 Phase Summary:
  Status: Complete
  Artifacts Generated: [list]
  Token Usage: [N tokens]

  [Phase-specific findings/results]

🤔 Action Required:
  [Analysis and recommendation]

Options:
  [1] Continue to next phase
  [2] Return to [EARLIER PHASE]
  [3] Review phase findings
  [4] Modify artifacts
  [5] Abort build

Enter choice (1-5): _
```

**User Response Handling**:
- **1**: Proceed to next phase
- **2**: Set `current_phase` to specified earlier phase, continue
- **3**: Display detailed findings, prompt again
- **4**: Open editor for user to modify artifacts, then continue
- **5**: Stop build, save final checkpoint

## Dry Run Mode

**Purpose**: Show execution plan without actually running phases

**Output**:
```markdown
🔍 DRY RUN: Plan for "$FEATURE_DESCRIPTION"

## Workflow Phases:
1. RESEARCH (3 iterations estimated)
   - Command: /ai-eng/research --ralph --max-phase-iterations 5
   - Output: docs/research/[date]-[feature].md

2. SPECIFY (2 iterations estimated)
   - Command: /ai-eng/specify --from-research=... --ralph --max-phase-iterations 3
   - Output: specs/[feature]/spec.md

3. PLAN (4 iterations estimated)
   - Command: /ai-eng/plan --from-spec=... --ralph --max-phase-iterations 4
   - Output: specs/[feature]/plan.md

4. WORK (6 iterations estimated)
   - Command: /ai-eng/work specs/[feature]/plan.md --ralph --max-phase-iterations 8
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

## Completion Report

**When build completes successfully** (all criteria met or max cycles reached):

```markdown
## Build Complete

**Feature**: $FEATURE_DESCRIPTION
**Status**: ✅ COMPLETE / ⚠️ INCOMPLETE (max cycles reached)

**Final Summary**:
- Total cycles: N
- Total tokens: N
- Total time: N
- Phases completed: Research, Specify, Plan, Work, Review

**Acceptance Criteria**: M / N complete (X%)
**Quality Gates**: All passing
**Review Status**: APPROVE / CHANGES_REQUESTED

**Artifacts Generated**:
- docs/research/[date]-[feature].md
- specs/[feature]/spec.md
- specs/[feature]/plan.md
- [Implementation files]
- code-review-report.json
- .ralph-wiggum/[feature]/checkpoint.json

**Pull Request**:
- Draft PR created: https://github.com/user/repo/pull/N
- Ready for review

**Next Steps**:
- Review draft PR
- Merge when ready
- Delete feature branch after merge
```

## Integration with Existing Commands

This command orchestrates existing ai-eng-system commands:

### Research Phase
```bash
/ai-eng/research "$FEATURE" --ralph --ralph-max-iterations $MAX
```

### Specify Phase
```bash
/ai-eng/specify "$FEATURE" --from-research=$RESEARCH_OUTPUT --ralph --ralph-max-iterations $MAX
```

### Plan Phase
```bash
/ai-eng/plan --from-spec=$SPEC_OUTPUT --ralph --ralph-max-iterations $MAX
```

### Work Phase
```bash
/ai-eng/work $PLAN_OUTPUT --ralph --ralph-max-iterations $MAX --ralph-quality-gate="$QUALITY_GATE"
```

### Review Phase
```bash
/ai-eng/review . --ralph --ralph-max-iterations $MAX
```

## Best Practices & Troubleshooting

See `docs/ralph-wiggum-guide.md` for comprehensive guidance on:
- Best practices for effective builds
- When to use Ralph Wiggum (ideal vs. non-ideal scenarios)
- Troubleshooting common issues (stuck loops, token usage, quality gates, resume failures, etc.)

## Success Criteria

Successful build achieves:
- ✅ All phases executed sequentially or with appropriate returns
- ✅ Gap analysis correctly determines return-to phase
- ✅ Checkpoints saved and can be loaded
- ✅ Progress displayed at appropriate verbosity
- ✅ Safety limits enforced (max cycles, stuck detection)
- ✅ Token usage tracked and displayed
- ✅ Draft PR created with comprehensive summary
- ✅ Build report generated with all artifacts and metrics

---

## Execution

After creating this command, the agent can invoke it with:

```bash
bun run scripts/run-command.ts ralph-wiggum "feature description" [options]
```

Examples:
- `bun run scripts/run-command.ts ralph-wiggum "implement user auth" --checkpoint=all --verbose`
- `bun run scripts/run-command.ts ralph-wiggum "API caching" --from-spec=specs/cache/spec.md --resume`

After completing the full cycle, rate your confidence in feature completeness and quality (0.0-1.0). Identify any uncertainties about phase transitions, iterations that were inefficient, or areas where quality gates may have been too lenient or strict. Note any workflow improvements that could enhance future cycles.
