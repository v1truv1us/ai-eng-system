---
name: knowledge-capture
description: Document solved problems to build cumulative team knowledge. Systematically capture solutions with context, code examples, gotchas, and related links. Use after completing workflows to ensure learnings compound for future team members.
version: 1.0.0
tags: [documentation, knowledge-management, team-learning, problem-solving]
---

# Knowledge Capture Skill

## Purpose

Transform solved problems into reusable team knowledge. This skill ensures every problem your team solves makes future similar problems easier to solve. Used in the **Compound** phase of the spec-driven workflow (Phase 6) and can be called independently after completing any project or solving any significant issue.

## Core Philosophy

**Compounding Engineering**: Each unit of work should make future work easier. When you solve a problem, document it. When the next person encounters a similar problem, they solve it 10x faster. Over time, your knowledge base becomes your competitive advantage.

## When to Use

- **After workflows complete** (recommend after `/ai-eng/review`)
- **After solving production incidents**
- **After implementing complex features**
- **When discovering unintuitive patterns**
- **When fixing the same type of bug twice**

## The Problem We're Solving

Without systematic knowledge capture:
- Team solves same problems repeatedly
- New team members reinvent solutions
- Institutional knowledge lives in someone's head
- Each project starts from zero

With this skill:
- Solutions are documented and searchable
- New members learn from past experience
- Onboarding accelerates
- Team velocity increases over time

## Process

### Phase 1: Gather Context (5-10 minutes)

Before writing, collect:

1. **The Problem** (what was hard?)
   - What did we encounter?
   - Why was it difficult?
   - What made it not obvious?

2. **The Solution** (what did we do?)
   - What worked?
   - Why does this solution work?
   - What alternatives did we consider?

3. **Evidence** (what's the proof?)
   - Code changes/examples
   - Test coverage
   - Performance metrics
   - Before/after comparison

4. **Gotchas** (what could trip people up?)
   - Common mistakes
   - Edge cases we discovered
   - Performance traps
   - Version-specific issues

5. **Reach** (who needs to know?)
   - Frontend engineers?
   - Backend engineers?
   - DevOps/infrastructure?
   - Everyone?

### Phase 2: Create Documentation (15-30 minutes)

**File structure**:
```
docs/solutions/
├── category/
│   ├── README.md (category index)
│   └── [topic].md
├── performance/
│   ├── redis-query-optimization.md
│   ├── database-indexing-strategy.md
│   └── bundle-size-reduction.md
├── security/
│   ├── csrf-protection-in-forms.md
│   └── secrets-management.md
├── deployment/
│   ├── zero-downtime-migrations.md
│   └── canary-releases.md
└── debugging/
    ├── memory-leak-investigation.md
    └── race-condition-detection.md
```

**Minimum content per solution**:

```markdown
# [Problem Title]

**Date Added**: 2026-02-08  
**Category**: [performance|security|deployment|debugging|architecture]  
**Audience**: [frontend|backend|devops|all]  
**Complexity**: [easy|medium|hard]  
**Time to Implement**: [estimate, e.g., "2 hours"]

## Problem

[What was the issue? Why was it hard? What made it non-obvious?]

### Example

[Show the problem in action - code, screenshot, error message]

## Solution

[What did we do to fix it? Why does this work?]

### Implementation

[Step-by-step walkthrough or code example]

### Why This Works

[Explain the underlying principle]

## Gotchas

- **Gotcha 1**: What could trip people up?
  - How to avoid: [specific advice]
  
- **Gotcha 2**: Common mistake
  - How to avoid: [specific advice]

## Alternatives Considered

- **Approach A**: Why we didn't use it
- **Approach B**: Why we didn't use it
- **Our Choice (C)**: Why this one is best

## Verification

How to know if you've solved it correctly:
- [ ] Test case passes
- [ ] Performance metric achieved
- [ ] No regressions in related areas
- [ ] Code review approval

## Related Solutions

- [Sibling solution](./related.md)
- [Related pattern](./pattern.md)
- External: [Link to article/docs](url)

## Questions for Future Readers

If you're implementing this, ask:
- Do you have [X setup]?
- Are you on [specific version]?
- Is [config] set to [value]?

**Confidence in this solution**: 0.9/1.0  
**Missing/Uncertain**: Minor edge cases for version < 2.0  
**Last Updated**: 2026-02-08  
**Updated By**: [name]
```

### Phase 3: Update Knowledge Index

After creating a solution, update:

1. **Category index** (`docs/solutions/[category]/README.md`):
   ```markdown
   ## [Category] Solutions

   - [Problem Title](./problem-title.md) - Brief description
   - [Another Problem](./another.md) - Brief description
   ```

2. **Global index** (`docs/solutions/README.md`):
   ```markdown
   ## All Solutions

   ### [Category]
   - [Solution](./category/solution.md)
   ```

3. **Git commit** with clear message:
   ```bash
   git commit -m "docs: add solution for [problem] in [category]"
   ```

## Integration Points

### After `/ai-eng/review`

```bash
/ai-eng/compound "database query optimization breakthrough"
```

### After Solving Incidents

```bash
# In chat after incident resolution
Use knowledge-capture skill to document: API timeout under load and fix
```

### During Project Retrospectives

```bash
# Team retrospective - capture learnings
Capture: What we learned about microservices deployment
```

### From OpenCode

```python
# In OpenCode, call knowledge-capture when appropriate
capture_knowledge(
  problem="N+1 queries in user profile endpoint",
  solution="Implemented DataLoader pattern",
  category="performance"
)
```

## Quality Checklist

Before publishing a solution document, verify:

- [ ] **Problem is clear** - Someone unfamiliar can understand what was hard
- [ ] **Solution is actionable** - Someone could implement it following your guide
- [ ] **Code examples work** - Copy-paste should mostly work
- [ ] **Gotchas are real** - You've tested the edge cases mentioned
- [ ] **Category is right** - Easy to find related solutions
- [ ] **No proprietary info** - Safe to share with team/public
- [ ] **Links are current** - External references still valid
- [ ] **Confidence is honest** - 0.8 = "90% sure", 0.5 = "might have better way"

## Examples of Good Solutions

### ✅ Good: Specific, Actionable, Honest

```markdown
# Redis Connection Pooling for High Throughput

**Problem**: Our API was exhausting Redis connections under 1k concurrent users, causing timeouts.

**Solution**: Implemented connection pooling with these specific settings: [settings] and switched from individual connections to pool pattern.

**Code Example**: 
[Real code that worked]

**Gotchas**:
- Setting max_idle too low caused connection churn
- Connection timeout needs to be 2x higher than request timeout
- Must enable keep-alive or connections drop after 5 minutes

**Confidence**: 0.95 - Tested with load up to 5k concurrent

**Uncertainty**: Behavior under 10k+ concurrent unknown, might need sharding
```

### ❌ Bad: Vague, Not Actionable

```markdown
# Performance Improvements

We made our system faster by optimizing things.

Confidence: ???
```

## Knowledge Base Growth

After 6 months of using this skill:
- 50+ solutions documented
- Onboarding time -40%
- "I think we solved this before" → 10-minute lookup vs 3-day re-solving
- Team velocity increases as knowledge reuses compound

## Metrics That Matter

Track:
- **Knowledge Base Size**: Number of solutions documented
- **Reuse Rate**: How many new solutions reference old solutions
- **Time to Solve**: Average time to solve known-category problems
- **Onboarding Velocity**: Time for new team members to be productive
- **Confidence Scores**: Average confidence across all solutions (should trend 0.85+)

## Common Mistakes

**❌ Too Broad**: "How to debug" → ✅ "Race condition detection in Goroutines"  
**❌ Too Deep**: 50 paragraphs → ✅ 5-10 paragraphs + code example  
**❌ No Context**: "Do this" → ✅ "Do this because X, which solves Y"  
**❌ Untested**: "Should work" → ✅ "Tested in production with Z"  
**❌ No Updates**: Created once, never touched → ✅ Updated yearly  

## Making This a Team Habit

- **After incidents**: "Can you doc this?" → Knowledge capture
- **After features**: Code review comment: "Great implementation! Capture as knowledge?"
- **Monthly review**: Read 1-2 random solutions, update if stale
- **Onboarding**: New team members read 10 solutions first day

## Success Metrics (First Year)

| Metric | Target | Value |
|--------|--------|-------|
| Solutions documented | 50+ | [Check] |
| Average confidence | 0.85+ | [Check] |
| Reuse rate | 30%+ | [Check] |
| Onboarding time | -30% | [Check] |
| Time to solve known problems | -50% | [Check] |

## Integration with `/ai-eng/compound`

In Claude Code, the `/ai-eng/compound` command uses this skill automatically:

```bash
/ai-eng/compound "redis connection pooling breakthrough"
# Automatically:
# 1. Gathers context about the solution
# 2. Creates docs/solutions/[category]/[topic].md
# 3. Updates category index
# 4. Updates global index
# 5. Creates git commit
```

## Your Turn

After completing any meaningful work:
1. Use this skill to capture what you learned
2. Write it down so the next person goes 10x faster
3. Watch your team become more productive over time

Compounding engineering isn't about working harder—it's about working smarter by capturing and reusing knowledge.

