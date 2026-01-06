# Ralph Wiggum - Hybrid Mode Design

**Default: Full Orchestrator** with **Optional: Phase-Only Mode**

---

## 🎯 Design Overview

**Single command with two modes:**

```bash
# Default: Full Orchestrator (all 5 phases automated)
/ralph "Implement authentication system"

# Phase-Only: Work phase iteration only (existing workflow for other phases)
/ralph "Execute plan: specs/auth/plan.md" --phase-only
```

---

## 📊 Mode Comparison

| Aspect | Default (No Flag) | Phase-Only (`--phase-only`) |
|---------|-------------------|-----------------------------|
| **Research** | Automated iteration | Manual (run `/ai-eng/research`) |
| **Specify** | Automated iteration | Manual (run `/ai-eng/specify`) |
| **Plan** | Automated iteration | Manual (run `/ai-eng/plan`) |
| **Work** | Automated iteration (TDD) | Automated iteration (TDD) |
| **Review** | Automated iteration | Manual (run `/ai-eng/review`) |
| **Workflow** | All 5 phases automated | Only work phase automated |
| **Automation** | Complete workflow | Implementation only |
| **Control** | Less manual control | More manual control |
| **Complexity** | Higher (new concept) | Lower (fits existing) |
| **Learning Curve** | Higher | Lower |
| **Use Case** | Overnight automation | Day-to-day dev |

---

## 🚀 Usage Patterns

### Pattern 1: Pure Default Mode

**Scenario**: New feature from scratch, want full automation

```bash
/ralph "Implement user authentication system"

# Automatically executes:
# ✅ Phase 1: Research (iterate until <RESEARCH_COMPLETE>)
# ✅ Phase 2: Specify (iterate until <SPEC_COMPLETE>)
# ✅ Phase 3: Plan (iterate until <PLAN_COMPLETE>)
# ✅ Phase 4: Work (iterate until <ALL_TESTS_PASSING>)
# ✅ Phase 5: Review (iterate until <REVIEW_COMPLETE>)
# ✅ Overall: <WORKFLOW_COMPLETE>

# User just waits, agent does everything
```

**Best for:**
- ✅ New features with no existing documents
- ✅ Complete workflow end-to-end
- ✅ Overnight automation
- ✅ Minimal manual intervention

---

### Pattern 2: Pure Phase-Only Mode

**Scenario**: Have existing plan, only need implementation iteration

```bash
# Step 1: Manual workflow for research/plan phases
/ai-eng/research "authentication patterns"
# Output: docs/research/auth-patterns.md

/ai-eng/specify "User authentication system" --from-research=docs/research/auth-patterns.md
# Output: specs/auth/spec.md

/ai-eng/plan --from-spec=specs/auth/spec.md
# Output: specs/auth/plan.md

# Step 2: Ralph Wiggum for work phase only
/ralph "Execute plan: specs/auth/plan.md" --phase-only

# Only work phase uses Ralph Wiggum iteration:
# ✅ Load plan → Write test → Implement → Test → Repeat
# ✅ Quality gates: bun run test, lint, type-check
# ✅ Continue until <IMPLEMENTATION_COMPLETE>

# User runs research/plan manually, only work is automated
```

**Best for:**
- ✅ You have existing research/plan documents
- ✅ Want manual control over research/plan phases
- ✅ Only need iteration during implementation
- ✅ Familiar with existing workflow

---

### Pattern 3: Hybrid (Best of Both)

**Scenario**: Manual research, automated rest

```bash
# Step 1: Run research manually for exploration
/ai-eng/research "authentication patterns"
# Output: docs/research/auth-patterns.md

# Step 2: Let orchestrator handle specify/plan/work/review
/ralph "Complete authentication system using research from: docs/research/auth-patterns.md

# Automatically executes remaining phases:
# ✅ Phase 2: Specify (use research as context)
# ✅ Phase 3: Plan (use spec as input)
# ✅ Phase 4: Work (iterate with TDD)
# ✅ Phase 5: Review (multi-agent)

# User gets manual control over research, automation for rest
```

**Best for:**
- ✅ Want manual control over initial exploration
- ✅ Let automation handle specification → implementation
- ✅ Flexibility in approach
- ✅ Balance of control and automation

---

### Pattern 4: Iterative Development

**Scenario**: Start with phase-only, switch to default for new features

```bash
# Initial: Phase-only mode (existing feature)
/ralph "Fix auth bug using plan: specs/auth/plan.md" --phase-only

# Later: Default mode (new feature)
/ralph "Add MFA to authentication system"

# Seamlessly switch between modes based on situation
```

---

## 🔧 Default Mode Details

### Phase Flow (Default)

```
┌─────────────────────────────────────────────────────────────┐
│  Ralph Wiggum Orchestrator (Default Mode)              │
│  No --phase-only flag specified                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Input: "Implement user authentication"                   │
│                                                               │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Phase 1: Research                          │       │
│  │ - Iterate until complete                   │       │
│  │ - Output: Research document                 │       │
│  │ - Stop at: <promise>RESEARCH_COMPLETE</>│       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Phase 2: Specify                          │       │
│  │ - Iterate until complete                   │       │
│  │ - Output: Specification document            │       │
│  │ - Stop at: <promise>SPEC_COMPLETE</>      │       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Phase 3: Plan                             │       │
│  │ - Iterate until complete                   │       │
│  │ - Output: Implementation plan              │       │
│  │ - Stop at: <promise>PLAN_COMPLETE</>     │       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Phase 4: Work                              │       │
│  │ - Iterate with TDD cycle                │       │
│  │ - Quality gates: test, lint, type-check  │       │
│  │ - Stop at: <promise>ALL_TESTS_PASSING</>│      │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Phase 5: Review                            │       │
│  │ - Iterate until complete                   │       │
│  │ - Multi-agent review                     │       │
│  │ - Stop at: <promise>REVIEW_COMPLETE</>      │       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  Output: <promise>WORKFLOW_COMPLETE</>                  │
│                                                               │
│  Deliverables:                                                │
│  ✅ Research document                                             │
│  ✅ Feature specification                                          │
│  ✅ Implementation plan                                           │
│  ✅ Working code with tests                                       │
│  ✅ Code review report                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Default Max Iterations

| Phase | Default Max | Rationale |
|--------|--------------|-----------|
| Research | 20 | Enough for deep exploration, prevents infinite research |
| Specify | 15 | Specification converges faster than implementation |
| Plan | 20 | Planning requires iteration but not as much as work |
| Work | 50 | Implementation is most iterative phase |
| Review | 10 | Review cycles, not indefinite iterations |
| **Total** | **115** | Safe upper bound for complete workflow |

---

## 🔧 Phase-Only Mode Details

### Phase Flow (Phase-Only)

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
│  Ralph Wiggum (Phase-Only Mode for Work Phase)           │
│  --phase-only flag specified                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Input: "Execute plan: specs/auth/plan.md"             │
│                                                               │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Load Plan                                │       │
│  │ - Read specs/auth/plan.md               │       │
│  │ - Extract tasks and dependencies          │       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │ For Each Task (TDD Cycle):               │       │
│  │ 1. Write failing test                   │       │
│  │ 2. Implement minimal code               │       │
│  │ 3. Run tests                          │       │
│  │ 4. If failing, debug and fix           │       │
│  │ 5. Refactor if needed                 │       │
│  │ 6. Repeat until task complete          │       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Quality Gates (After Each Task)           │       │
│  │ - bun run test (all must pass)       │       │
│  │ - bun run lint (no errors)           │       │
│  │ - bun run type-check (no errors)      │       │
│  │ - bun run coverage (>80%)             │       │
│  └─────────────────────────────────────────────────┘       │
│                         ▼                                 │
│  Output: <promise>IMPLEMENTATION_COMPLETE</>              │
│                                                               │
│  Deliverables:                                                │
│  ✅ Working code from plan                                    │
│  ✅ All tests passing                                         │
│  ✅ No linter errors                                         │
│  ✅ No type errors                                           │
│  ✅ Test coverage > 80%                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Phase-Only Max Iterations

| Phase | Default Max | Rationale |
|--------|--------------|-----------|
| Work | 50 | Sufficient for TDD cycles, prevents infinite loops |
| **Total** | **50** | Only work phase uses iteration |

---

## 🎯 Decision Matrix

| Situation | Mode | Reason |
|-----------|-------|---------|
| New feature, no existing docs | **Default** | No manual work to leverage, full automation optimal |
| Existing research/plan docs | **Phase-Only** | Leverage existing manual work, automate only what's needed |
| Overnight/weekend automation | **Default** | Full workflow maximizes use of time away |
| Day-to-day development | **Phase-Only** | Granular control preferred over full automation |
| Quick bug fix | **Phase-Only** | Only implementation iteration needed |
| New product feature | **Default** | Complete workflow from idea to reviewed code |
| Learning ai-eng-system | **Phase-Only** | Less complexity, easier to understand |
| Production feature | **Default** | End-to-end quality through all phases |
| Experimental feature | **Phase-Only** | More manual control, easier to adjust |

---

## 📖 Command Reference

### Default Mode

```bash
/ralph "Implement user authentication system"

# Optional safety parameters:
/ralph "Implement user authentication system

Max iterations per phase:
- Research: 30
- Specify: 20
- Plan: 25
- Work: 60
- Review: 15

Show progress after each phase.
Log iterations to: ralf-full-workflow.json"
```

### Phase-Only Mode

```bash
/ralph "Execute plan: specs/auth/plan.md" --phase-only

# Optional safety parameters:
/ralph "Execute plan: specs/auth/plan.md" --phase-only

Max iterations: 75
Quality gates: bun run test
Stop on gate failure: false
Show progress after each task completion
Log iterations to: ralph-phase-only.json"
```

---

## 🚀 Quick Start

### First Time Users

```bash
# Start with phase-only mode (simpler, familiar workflow)
/ai-eng/research "authentication patterns"

/ai-eng/specify "User authentication system" --from-research=docs/research/auth-patterns.md

/ai-eng/plan --from-spec=specs/auth/spec.md

/ralph "Execute plan: specs/auth/plan.md" --phase-only
```

### Experienced Users

```bash
# Use default mode for full automation (overnight work)
/ralph "Implement authentication system"

# Agent handles entire workflow, you just check progress
# Wake up to: working, tested, reviewed code ready for merge
```

---

## 💡 Pro Tips

### Tip 1: Start Simple, Go Complex

```bash
# First: Use phase-only to learn pattern
/ralph "Execute plan: specs/simple/plan.md" --phase-only

# Later: Use default mode for automation
/ralph "Implement complex feature"
```

### Tip 2: Customize Max Iterations

```bash
# Default: 50 iterations for work phase
/ralph "Execute plan" --phase-only

# Override for known long tasks:
/ralph "Execute plan

Max iterations: 100 (this is complex, need more)
Quality gates: bun run test"
```

### Tip 3: Monitor Quality Gates

```bash
# Default: Stop on gate failure: false (keep trying)
/ralph "Execute plan" --phase-only

# Override for strict quality:
/ralph "Execute plan

Stop on quality gate failure: true
Quality gates: bun run test && bun run lint && bun run security-scan"
```

### Tip 4: Hybrid for Best Results

```bash
# Manual research (exploration freedom)
/ai-eng/research "explore authentication patterns broadly"

# Automated rest (consistency and quality)
/ralph "Complete auth system" --from-research=docs/research/auth-patterns.md

# You control exploration, automation ensures quality
```

---

## ✅ Implementation Checklist

### Default Mode Features

- [x] Single command invocation
- [x] All 5 phases automated
- [x] Each phase iterates until completion
- [x] Automatic phase progression
- [x] Quality gates at work phase
- [x] Progress tracking across phases
- [x] Default max iterations per phase
- [x] Overall workflow completion signal

### Phase-Only Mode Features

- [x] Requires `--phase-only` flag
- [x] Work phase only automated
- [x] Existing workflow for other phases
- [x] TDD cycle iteration
- [x] Quality gates integration
- [x] Default max iterations for work
- [x] Implementation completion signal

---

## 📊 Summary

**Hybrid Design Benefits:**

1. ✅ **Best of Both Worlds**: Full automation available, but not forced
2. ✅ **Flexible**: Choose mode based on situation
3. ✅ **Familiar**: Phase-only fits existing workflow
4. ✅ **Powerful**: Default mode provides end-to-end automation
5. ✅ **Safe**: Both modes have safety measures
6. ✅ **Clear**: Easy to understand which mode to use

**Default (No Flag)**: Full orchestrator, complete workflow automation
**With --phase-only**: Work phase iteration, keep existing workflow

---

**Status**: ✅ Design Complete (Simple/Default approach replaced with Ralph flag integration)
**Documentation**: Updated `.claude/commands/work.md` (and other commands if implemented)
**Summary**: This design document

---

**Questions:**
- Should I add `--max-iterations-per-phase` option for granular control?
- Should phase-only mode support specifying which phase(s) to automate?
- Any other flags or options needed?
