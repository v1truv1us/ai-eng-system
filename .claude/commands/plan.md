---
name: ai-eng/plan
description: Create detailed implementation plans from specifications
agent: plan
version: 2.0.0
inputs:
  - name: description
    type: string
    required: false
    description: Natural language description of what to implement
  - name: fromSpec
    type: string
    required: false
    description: Path to specification file (alternative to description)
  - name: fromResearch
    type: string
    required: false
    description: Path to research document (for research-backed planning)
outputs:
  - name: plan_file
    type: file
    format: YAML
    description: Implementation plan saved to plans/ directory
---

# Plan Command

Create a detailed implementation plan for: $ARGUMENTS

> **Phase 3 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

## Quick Start

```bash
# From description
/ai-eng/plan "implement user authentication with JWT"

# From specification
/ai-eng/plan --from-spec=specs/auth/spec.md

# From research
/ai-eng/plan --from-research=docs/research/2026-01-01-auth-patterns.md

# Ralph Wiggum iteration for complex plans
/ai-eng/plan "microservices migration" --ralph --ralph-show-progress

# Ralph Wiggum with custom iterations and quality gate
/ai-eng/plan --from-spec=specs/auth/spec.md --ralph --ralph-max-iterations 8 --ralph-quality-gate="rg 'Depends On:' specs/*/plan.md"
```

## Options

| Option | Description |
|--------|-------------|
| `--swarm` | Use Swarms multi-agent orchestration |
| `-s, --scope <scope>` | Plan scope (architecture\|implementation\|review\|full) [default: full] |
| `-r, --requirements <reqs...>` | List of requirements |
| `-c, --constraints <constraints...>` | List of constraints |
| `-o, --output <file>` | Output plan file [default: generated-plan.yaml] |
| `--from-spec <file>` | Create plan from specification file |
| `--from-research <file>` | Create plan from research document |
| `-v, --verbose` | Enable verbose output |
| `--ralph` | Enable Ralph Wiggum iteration mode for persistent plan refinement |
| `--ralph-max-iterations <n>` | Maximum iterations for Ralph Wiggum mode [default: 10] |
| `--ralph-completion-promise <text>` | Custom completion promise text [default: "Plan is comprehensive and ready for execution"] |
| `--ralph-quality-gate <command>` | Command to run after each iteration for quality validation |
| `--ralph-stop-on-gate-fail` | Stop iterations when quality gate fails [default: continue] |
| `--ralph-show-progress` | Show detailed iteration progress |
| `--ralph-log-history <file>` | Log iteration history to JSON file |
| `--ralph-verbose` | Enable verbose Ralph Wiggum iteration output |

## Phase 0: Prompt Refinement (CRITICAL - Do First)

Load `skills/prompt-refinement/SKILL.md` and use phase: `plan` to transform your prompt into structured TCRO format (Task, Context, Requirements, Output). If using `--from-spec`, extract user stories and non-functional requirements from the specification. See `templates/plan.md` for output structure.

### Phase 2: Discovery (Research Mode)

#### Subagent Communication Protocol (Minimal)

If you delegate discovery to subagents (recommended for large codebases), include a small Context Handoff Envelope in each Task prompt.

Use:

```text
<CONTEXT_HANDOFF_V1>
Goal: (1 sentence)
Scope: (codebase|docs|external|all)
Known constraints: (bullets; optional)
What I already checked: (bullets; optional)
Files/paths to prioritize: (bullets; optional)
Deliverable: (what you must return)
Output format: RESULT_V1
</CONTEXT_HANDOFF_V1>
```

And require:

```text
<RESULT_V1>
RESULT:
EVIDENCE:
OPEN_QUESTIONS:
NEXT_STEPS:
CONFIDENCE: 0.0-1.0
</RESULT_V1>
```

1. **Codebase Analysis**
   - Search for similar patterns and implementations
   - Identify existing conventions and styles
   - Map related files and dependencies
   - Document findings with file paths and line numbers

2. **Tech Stack Detection**
   - Identify frameworks, libraries, and tools in use
   - Check package.json/requirements/go.mod for dependencies
   - Note version constraints and compatibility requirements

3. **Scope Definition**
   - List all files that will be modified
   - List all new files to be created
   - Identify integration points with existing code
   - Flag potential breaking changes

### Phase 3: Technical Planning

#### From Specification (if exists)

For each user story in spec:
1. **Map to technical tasks**: Break user story into implementation tasks
2. **Define acceptance criteria**: Derive from spec acceptance criteria
3. **Apply technical constraints**: From spec's non-functional requirements

Example mapping:
```markdown
**User Story**: US-001 User Registration
→ Task REG-001: Create User database model
→ Task REG-002: Implement registration API endpoint
→ Task REG-003: Add email validation
→ Task REG-004: Implement password hashing
```

#### Inline Requirements (if no spec)

If proceeding without specification:
- Use clarifying questions to gather requirements
- Define technical approach
- Document assumptions and constraints

### Phase 4: Task Decomposition

Break the feature into **atomic tasks** using this hierarchy:

```
Epic (the full feature)
└── Phase (logical grouping, ~1 day)
    └── Task (atomic unit, ~30 min)
        └── Subtask (if task is still too large)
```

**Each atomic task MUST include:**

| Field | Description | Example |
|-------|-------------|---------|
| ID | Unique identifier | `FEAT-001-A` |
| Title | Action-oriented name | "Create SessionManager class" |
| Depends On | Blocking task IDs | `FEAT-001-B` (or "None") |
| Files | Exact files to modify/create | `src/context/session.ts` |
| Acceptance Criteria | Checkboxes that define "done" | `[ ] Class exports correctly` |
| Spec Reference | Links to user story/acceptance criteria | `US-001: AC-2` |
| Estimated Time | Time box | `30 min` |
| Complexity | Low / Medium / High | `Medium` |

### Phase 5: Generate Supporting Artifacts

Based on feature type and technical approach, generate:

#### data-model.md (if database involved)

```markdown
# Data Model

## Entities

### User
```typescript
{
  id: string (UUID, primary key)
  email: string (unique, indexed)
  password_hash: string (bcrypt)
  created_at: timestamp
  updated_at: timestamp
}
```

## Relationships

- User has many Sessions
- Session belongs to User

## Indexes

- `users_email_unique` on (email) for uniqueness
- `users_created_at` for sorting
```

#### contracts/ (if API involved)

```markdown
# API Contracts

## POST /api/auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user_id": "uuid-here"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid email format"
}
```
```

#### research.md (if technical decisions needed)

Document decisions made during planning:
- Technology choices with rationale
- Trade-offs considered
- Alternatives evaluated

### Phase 6: Risk Assessment

For each phase, identify:

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| (risk description) | High/Med/Low | High/Med/Low | (strategy) |

### Phase 7: Testing Strategy

Define testing approach for each phase:

- **Unit Tests**: What functions/classes need tests?
- **Integration Tests**: What interactions need verification?
- **Manual Testing**: What scenarios to validate?
- **Regression Checks**: What existing functionality could break?

**Spec-driven validation**: Ensure all spec acceptance criteria have corresponding tests

## Output Format

### Directory: `specs/[feature-name]/`

```
specs/[feature-name]/
├── spec.md              # From /ai-eng/specify (if exists)
├── plan.md              # Implementation plan (this file)
├── tasks.md             # Task breakdown (optional separate file)
├── data-model.md         # Data schemas (if applicable)
├── research.md           # Technical research (if applicable)
└── contracts/            # API contracts (if applicable)
    ├── api-spec.json
    └── signalr-spec.md
```

### File: `specs/[feature-name]/plan.md`

```markdown
# [Feature Name] Implementation Plan

**Status**: Draft | In Progress | Complete
**Created**: [date]
**Specification**: specs/[feature-name]/spec.md (if exists)
**Estimated Effort**: [hours/days]
**Complexity**: Low | Medium | High

## Overview
[2-3 sentence summary of technical approach]

## Specification Reference

[If spec exists, summarize user stories and their technical mapping]

### User Stories → Tasks Mapping

| User Story | Tasks | Status |
|-------------|--------|--------|
| US-001 | TASK-001, TASK-002 | Pending |
| US-002 | TASK-003 | Pending |

## Architecture
[Diagram or description of component relationships]

## Phase 1: [Phase Name]

**Goal**: [What this phase accomplishes]
**Duration**: [Estimated time]

### Task 1.1: [Task Title]
- **ID**: FEAT-001-A
- **Depends On**: None
- **User Story**: US-001 (if from spec)
- **Files**:
  - `path/to/file.ts` (modify)
  - `path/to/new-file.ts` (create)
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Spec AC: [Link to spec acceptance criteria]
  - [ ] Tests pass
- **Time**: 30 min
- **Complexity**: Low

### Task 1.2: [Task Title]
[...]

## Phase 2: [Phase Name]
[...]

## Dependencies
- [External dependency 1]
- [Internal dependency 1]

## Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|

## Testing Plan
### Unit Tests
- [ ] Test for [component]

### Integration Tests
- [ ] Test [interaction]

### Spec Validation
- [ ] All user stories have corresponding tasks
- [ ] All spec acceptance criteria are covered by task acceptance criteria
- [ ] Non-functional requirements are implemented

## Rollback Plan
[How to revert if something goes wrong]

## References
- [Link to specification] (if exists)
- [Link to research findings]
- [Link to similar implementations]
```

### Optional: Separate tasks.md

If tasks.md is generated separately:

```markdown
# [Feature Name] Tasks

## Task List

### PRIORITY TRACK - Can execute in parallel
- [ ] TASK-001
- [ ] TASK-002

### TRACK - After PRIORITY TRACK completes
- [ ] TASK-003
- [ ] TASK-004

## Task Details

### TASK-001: [Task Title]
**ID**: TASK-001
**User Story**: US-001
**Depends On**: None
**Estimated**: 30 min
**Status**: Pending | In Progress | Complete

#### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

#### Files
- `file1.ts` (create)
- `file2.ts` (modify)
```

## Post-Planning Actions

After generating the plan:

1. **Review with user** - Confirm scope and priorities
2. **Create GitHub issue** (optional) - Link to plan file
3. **Estimate total effort** - Sum of all task estimates
4. **Identify parallel tracks** - Tasks without dependencies that can run concurrently
5. **Validate spec coverage** (if spec exists) - Ensure all spec requirements are covered

## Tips for Effective Plans

- **Timeboxing**: If a task exceeds 60 minutes, break it down further
- **Dependencies**: Minimize cross-task dependencies to enable parallel work
- **Checkpoints**: Each phase should end with a working (possibly incomplete) state
- **Escape hatches**: Note where you could stop and still have value
- **Evidence-based**: Include file paths and code snippets from discovery
- **Spec-driven**: Ensure all spec acceptance criteria have corresponding task acceptance criteria

## Integration

### Feeds Into
- `/ai-eng/work` - Reads plan.md for task execution
- Validates task completion against spec.md acceptance criteria

### Reads From
- `specs/[feature]/spec.md` - User stories, acceptance criteria, NFRs
- `CLAUDE.md` - Project philosophy and constraints
- `docs/research/*.md` - Optional research context

## Example Usage

### Example 1: Plan from Existing Spec

```bash
# User provides feature name (spec already exists)
/ai-eng/plan --from-spec=specs/auth

# Step 0: Prompt refinement skill asks planning-specific questions
# Step 1: Loads spec from specs/auth/spec.md
# Step 2: Maps user stories to technical tasks
# Step 3: Generates plan.md, data-model.md, contracts/
# Step 4: Validates spec coverage
```

### Example 2: Plan Without Spec (Inline)

```bash
# User provides description without spec
/ai-eng/plan "implement JWT-based authentication"

# Step 0: Prompt refinement asks planning questions
# Step 1: Warns about missing spec, offers to proceed
# Step 2: Gathers requirements through clarification
# Step 3: Generates plan.md
```

## Best Practices

### Spec-Driven Planning

When specification exists:
1. **Map each user story to tasks**: Don't miss any requirements
2. **Trace acceptance criteria**: Each spec AC should have task AC
3. **Document decisions**: Why specific tech choices were made
4. **Mark dependencies**: Which tasks must come before others

### Cross-Reference

Always cross-reference between artifacts:
- Tasks reference user stories (US-001)
- Acceptance criteria reference spec acceptance criteria (AC-2)
- Data models reference user story requirements

### Task Independence

Ensure tasks are truly atomic:
- Can you complete it without touching unfinished sibling tasks?
- Is it testable in isolation?
- Does it have clear start and end states?

## Success Criteria

Successful planning achieves:
- ✅ All tasks are atomic and independently completable
- ✅ Dependencies are clearly documented
- ✅ All spec acceptance criteria are covered (if spec exists)
- ✅ Supporting artifacts generated (data-model, contracts)
- ✅ Risk assessment completed
- ✅ Testing strategy defined
- ✅ Ready to feed into `/ai-eng/work`

## Execution

After planning, execute the plan using:

```bash
bun run scripts/run-command.ts plan "$ARGUMENTS" [options]
```

For example:
- `bun run scripts/run-command.ts plan "implement auth" --from-spec=specs/auth/spec.md --output=plans/auth.yaml`
- `bun run scripts/run-command.ts plan --from-research=docs/research/auth.md --scope=implementation`

## Ralph Wiggum Iteration Mode

When `--ralph` flag is enabled, the planning process follows a persistent refinement cycle:

### Ralph Wiggum Planning Cycle

**Iteration Process:**
1. **Execute Planning Phases 1-7** - Run complete planning process
2. **Gap Analysis** - Review plan for:
   - Missing tasks or incomplete task definitions
   - Unclear dependencies or integration points
   - Insufficient testing coverage
   - Incomplete risk assessment
3. **Targeted Enhancement** - Focus next iteration on identified gaps:
   - Add missing tasks or subtasks
   - Strengthen dependency mapping
   - Enhance testing strategy
   - Improve risk mitigation strategies
4. **Quality Gate** - Run quality gate command if specified
5. **Progress Update** - Log iteration improvements and continue
6. **Completion Check** - Stop when:
   - Plan comprehensiveness promise is met
   - Quality gates consistently pass
   - Maximum iterations reached

### Ralph Wiggum Quality Gates

**Planning Quality Gate Examples:**
```bash
# Check task completeness
rg "Acceptance Criteria:" specs/*/plan.md | wc -l

# Validate dependencies mapping
rg "Depends On:" specs/*/plan.md

# Check risk assessment completeness
rg "Impact.*Likelihood.*Mitigation" specs/*/plan.md
```

### Progress Tracking

**Iteration Metrics:**
- Iteration number and completion status
- Tasks added or refined
- Dependencies mapped or clarified
- Risk mitigations added
- Quality gate pass/fail status
- Plan completeness score

**Example Progress Output:**
```
🔄 Ralph Wiggum Planning Iteration 3/10
📝 Tasks: 12 total (+2 this iteration)
🔗 Dependencies: 8 mapped (+1 clarified this iteration)
🛡️ Risk mitigations: 5 complete (+2 this iteration)
🧪 Test coverage: 85% (+5% this iteration)
✅ Quality gate: PASSED
🎯 Plan completeness: 90% (improving)
```

### Ralph Wiggum Implementation Notes

**Planning-Specific Considerations:**

- **Task Atomicity**: Each iteration should ensure tasks are truly atomic
- **Dependency Clarity**: Focus on making dependencies explicit and minimal
- **Testing Integration**: Ensure comprehensive test coverage for all tasks
- **Risk Coverage**: Each iteration should strengthen risk mitigation strategies

**Default Settings:**
- **Max Iterations**: 10 (sufficient for comprehensive planning refinement)
- **Completion Promise**: "Plan is comprehensive and ready for execution"
- **Quality Gate**: Check task completeness and dependency mapping
- **Progress Tracking**: Always enabled in Ralph mode

**Best Practices:**
- Focus on making tasks more atomic each iteration
- Strengthen dependency mapping to enable parallel execution
- Enhance risk assessment with specific mitigations
- Validate spec coverage (if spec exists) each iteration
- Ensure all supporting artifacts are generated

$ARGUMENTS
