# Multi-Agent Orchestration Contract

## Overview

This document defines the standard contract for multi-agent orchestration in ai-eng-system. All orchestration commands follow this contract to ensure consistent handoffs, deterministic outputs, and reliable coordination.

## Handoff Envelope

When delegating work to a specialist agent, include:

```
<CONTEXT_HANDOFF_V1>
Goal: (one sentence describing what to accomplish)
Scope: (files, modules, or domain to focus on)
Constraints: (what must be preserved or avoided)
Deliverable: (expected output format and content)
Known context: (what has already been checked or decided)
Output format: RESULT_V1
</CONTEXT_HANDOFF_V1>
```

## Result Format

All specialists must return results in this format:

```
<RESULT_V1>
RESULT: (pass/fail/partial with summary)
EVIDENCE: (file:line references, metrics, or concrete output)
OPEN_QUESTIONS: (unresolved items)
NEXT_STEPS: (recommended follow-up actions)
CONFIDENCE: (0.0-1.0)
</RESULT_V1>
```

## Delegation Rules

### Sequential vs Parallel

**Parallel safe** (can run concurrently):
- Independent file analysis (e.g., frontend review + backend review)
- Independent domain checks (e.g., security scan + performance audit)
- Discovery tasks (e.g., codebase locator + research locator)

**Sequential required** (must run in order):
- Planning before implementation
- Implementation before testing
- Testing before review
- Review before deployment

### Specialist Selection

Route tasks to the most specific agent available:

| Task | Primary Agent | Fallback |
|------|--------------|----------|
| Architecture decision | `architect-advisor` | `backend-architect` |
| Backend implementation | `backend-architect` | `full-stack-developer` |
| Frontend implementation | `frontend-reviewer` | `full-stack-developer` |
| API design | `api-builder-enhanced` | `backend-architect` |
| Security review | `security-scanner` | `code-reviewer` |
| Performance review | `performance-engineer` | `code-reviewer` |
| Code quality review | `code-reviewer` | `full-stack-developer` |
| Test generation | `test-generator` | `tdd-guide` |
| Build error fix | `build-error-resolver` | `full-stack-developer` |
| E2E testing | `e2e-runner` | `test-generator` |
| Documentation lookup | `docs-lookup` | `documentation-specialist` |
| Deployment | `deployment-engineer` | `full-stack-developer` |
| Cost optimization | `cost-optimizer` | `infrastructure-builder` |
| Monitoring setup | `monitoring-expert` | `deployment-engineer` |
| Planning | `planner` | `architect-advisor` |
| Harness tuning | `harness-optimizer` | `full-stack-developer` |

### Result Merge

When multiple agents return results:
1. Combine findings, removing duplicates
2. Resolve conflicts by preferring the more specific agent
3. Sort by severity: critical > required > optional
4. Produce a single merged result with overall confidence = min(agent confidences)

## Orchestration Patterns

### Pattern 1: Fan-Out/Fan-In

```
Coordinator → [Agent A, Agent B, Agent C] (parallel)
Coordinator ← merge results
```

Use for: multi-axis reviews, multi-domain analysis

### Pattern 2: Pipeline

```
Coordinator → Agent A → Agent B → Agent C → Coordinator
```

Use for: spec → plan → implement → test → review

### Pattern 3: Fan-Out with Dependencies

```
Phase 1: [Agent A, Agent B] (parallel)
Phase 2: [Agent C] (depends on Phase 1 results)
Phase 3: [Agent D, Agent E] (parallel, depends on Phase 2)
```

Use for: complex multi-stage features

## Error Handling

- If an agent fails, log the failure and continue with remaining agents
- If a sequential dependency fails, stop the pipeline and report
- If all agents in a parallel phase fail, report overall failure
- Include agent failure details in the final result

## Quality Gates

After orchestration completes:
- All specialist results must include confidence ratings
- Overall confidence = minimum of specialist confidences
- Any specialist confidence below 0.5 should be flagged for review
- Critical findings from any specialist block the workflow
