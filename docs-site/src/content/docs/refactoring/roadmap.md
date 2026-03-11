---
title: "Future Roadmap: Top 3 Priorities"
description: "Next major features for ai-eng-system. Workflow orchestration, result caching, and team collaboration."
---

# Workflow Enhancement Roadmap

After the command refactoring, here are the top 3 features to implement for **10x workflow value**.

---

## Priority 1: Workflow Orchestration Engine (3-5 days)

**Current Problem**: Users must run 6 commands manually to complete workflow

```bash
/ai-eng/research ...
/ai-eng/specify --from-research=...
/ai-eng/plan --from-spec=...
/ai-eng/work ...
/ai-eng/review
/ai-eng/compound ...
```

**Solution**: Single command that auto-links phases

```bash
/ai-eng/workflow "implement user authentication" \
  --phases=research,specify,plan,work,review \
  --auto-handoff \
  --approval=product-manager,architect
```

**What It Does**:
1. Runs research phase
2. Feeds research output to specify phase
3. Feeds spec to plan phase
4. Feeds plan to work phase
5. Runs review on output
6. Requires approvals if specified
7. Tracks progress and metrics

**Impact**:
- 6 commands → 1 command (6x easier)
- Automatic hand-offs with output injection
- Progress tracking
- Approval workflows

**Implementation**:
- Create `workflow-orchestration` skill
- New `/ai-eng/workflow` command
- Phase sequencing engine
- Progress tracking system

---

## Priority 2: Result Caching & Context Memory (2-3 days)

**Current Problem**: Each phase re-analyzes previous findings, wasting tokens

```
/research phase
  → Finds patterns A, B, C
  → Cost: 5,000 tokens

/specify phase
  → Re-reads research findings
  → Re-analyzes patterns
  → Cost: 3,000 tokens (duplicate work)

/plan phase
  → Re-analyzes patterns again
  → Cost: 2,000 tokens (more duplication)

Total: 10,000 tokens (40% waste)
```

**Solution**: Vector store for research findings

```
/research phase
  → Finds patterns A, B, C
  → Embeds and caches findings
  → Cost: 5,000 tokens

/specify phase
  → Queries cache for patterns
  → Reuses findings
  → Cost: 1,000 tokens (no duplication)

/plan phase
  → Queries cache
  → References cached findings
  → Cost: 1,000 tokens (no re-analysis)

Total: 7,000 tokens (30% savings)
```

**Impact**:
- 40-60% token reduction per workflow
- Faster execution (no re-analysis)
- Better context reuse
- Decision history tracking

**Implementation**:
- Vector store integration (Pinecone/Qdrant or local)
- Embedding function for findings
- Cache query interface
- Agent prompt injection of cache
- Invalidation strategy

---

## Priority 3: Team Collaboration Framework (4-6 days)

**Current Problem**: System is single-user, no approval workflows

**Solution**: Metadata + approval gates

```markdown
# specs/auth/spec.md
---
reviewers:
  - product_manager: john@example.com
  - lead_architect: jane@example.com
status: pending_approval
approved_by: []
---

## User Stories
[12 stories with acceptance criteria]

## Comments
- **john** (2026-02-08 09:00): "Need to support legacy browsers"
  - **jane**: "Good point, I'll add to acceptance criteria"
```

**What It Does**:
1. Specify required reviewers for each phase
2. Prevent phase advancement without approval
3. Enable comment threads on artifacts
4. Track who approved what and when
5. Email/Slack notifications for reviews

**Impact**:
- Enables team adoption (solo → 5+ people)
- Prevents misaligned work
- Audit trail for compliance
- Better visibility

**Implementation**:
- YAML frontmatter for metadata
- Approval enforcement in phase commands
- Comment storage and retrieval
- Notification system (email/Slack)
- GitHub/email integration

---

## Implementation Timeline

### Week 1: Orchestration Engine
- Design orchestration engine architecture
- Implement phase sequencing
- Create workflow command
- Full testing and documentation

### Week 2: Result Caching
- Vector store setup (Pinecone or local)
- Embedding integration
- Cache query interface
- Agent prompt injection
- Performance optimization

### Week 3: Team Collaboration
- Frontmatter + approval system
- Comment threads + storage
- Notification system
- GitHub integration
- Testing and docs

**Total**: 2-3 weeks for all three features

---

## Expected Impact

### Before Implementation
```
Manual orchestration:    6 commands per workflow
Token efficiency:        ~100,000 per workflow
Team adoption:           Solo only
Workflow visibility:     None
```

### After Implementation
```
Manual orchestration:    1 command per workflow (6x easier)
Token efficiency:        ~40,000 per workflow (60% savings)
Team adoption:           5+ person teams
Workflow visibility:     Complete tracking & metrics
```

### ROI
- **Developer time**: 6x reduction in workflow setup
- **API costs**: 60% reduction in token usage
- **Team velocity**: Faster iterations with approvals
- **Visibility**: Complete observability

---

## Architecture Overview

### Orchestration Engine
```
User Command: /ai-eng/workflow "feature"
    ↓
Orchestration Engine
├─ Phase 1: Research
│  ├─ Run command
│  ├─ Extract outputs
│  └─ Store in context
├─ Phase 2: Specify
│  ├─ Inject research
│  ├─ Run command
│  └─ Store results
├─ Phase 3: Plan
│  ├─ Inject spec
│  ├─ Run command
│  └─ Store results
├─ Phase 4: Work
│  ├─ Inject plan
│  ├─ Run with quality gates
│  └─ Store output
├─ Phase 5: Review
│  ├─ Inject results
│  ├─ Multi-agent review
│  └─ Store feedback
└─ Reporting
   └─ Complete workflow metrics
```

### Caching System
```
Research Phase
  ↓
Embed + Vector Store
  ↓
Specify Phase (query cache)
  ↓
Plan Phase (query cache)
  ↓
Work Phase (reference cache)
  ↓
Review Phase (query cache if needed)
```

### Collaboration Framework
```
Artifact Metadata:
├─ Reviewers required
├─ Approval status
├─ Comments thread
└─ Change history

Approval Gate:
├─ Check if approvals required
├─ If yes: get approvals or pause
├─ If no: proceed automatically
└─ Track who approved and when
```

---

## Success Metrics

After implementing all three:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Commands per workflow | 6 | 1 | 1 ✅ |
| Tokens per workflow | 100,000 | 40,000 | <50k ✅ |
| Time per workflow | 45 min | 25 min | <30m ✅ |
| Team adoption | 1 person | 5+ people | Scalable |
| Workflow reliability | ~80% | ~95% | >95% ✅ |

---

## Quick Wins (Lower Effort)

If you want smaller improvements while waiting for full priorities:

| Feature | Effort | Impact | Value |
|---------|--------|--------|-------|
| Command history | 2h | 4/10 | Quick |
| Auto-resume from last phase | 4h | 6/10 | Useful |
| Progress indicators | 4h | 4/10 | Polish |
| Default arguments | 2h | 5/10 | Good |
| Command aliases | 1h | 3/10 | Nice |

---

## Next Steps

1. **Review this roadmap** - Does priority order make sense?
2. **Estimate scope** - Confirm 2-3 week estimate
3. **Assign ownership** - Who builds each piece?
4. **Create tracking** - GitHub issues or project board
5. **Design phase** - Detailed design before coding

The three priorities together create a **10x improvement** in developer experience and cost efficiency. Worth the investment.

---

See [Refactoring Overview](/refactoring/overview) or [Command Migration](/refactoring/migration) for current state.

