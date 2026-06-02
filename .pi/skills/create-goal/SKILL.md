---
name: create-goal
description: >
  Transform a vague idea, request, or prompt into a concrete, actionable goal
  with clear success criteria, scope boundaries, and measurable outcomes. Use
  when the user has an intention but needs help defining what "done" looks like.
disable-model-invocation: false
metadata:
  version: 1.0.0
  tags: ai-eng-core, goal-setting, planning
---

# Create Goal

Turn any vague intention into a goal that an agent (or human) can execute against.

## When to Use

- User says "I want to..." but hasn't defined what success looks like
- A task feels too big, too vague, or has unclear boundaries
- Before starting `/plan` or `/work` — lock the target first
- Retrofitting: user already started work but the goal is drifting

## Process

### 1. Capture the Raw Intention

Restate what the user wants in one sentence. If they gave a multi-sentence ramble, compress it.

### 2. Ask Up to 3 Clarifying Questions

Choose from this menu based on what's missing:

| Gap | Question |
|-----|----------|
| Scope unclear | "What is explicitly out of scope?" |
| Success undefined | "How will you know this is done? What does 'working' look like?" |
| Constraints unknown | "What are the hard constraints: time, budget, tech stack, dependencies?" |
| Audience unclear | "Who is the consumer of this work? What do they need?" |
| Priority unclear | "If you could only deliver one thing, what must not be cut?" |
| Existing work | "What already exists that this builds on or replaces?" |

Do NOT ask all 6. Pick the 1-3 that would most change the shape of the goal.

### 3. Draft the Goal

Output in this exact format:

```markdown
## Goal

**Objective:** (one sentence, specific and measurable)

**Success Criteria:**
- [ ] Criterion 1 (verifiable, not vague)
- [ ] Criterion 2
- [ ] Criterion 3 (minimum viable: at least 2, ideally 3-5)

**Scope:**
- **In scope:** (bullet list)
- **Out of scope:** (bullet list — be explicit about what you're NOT doing)

**Constraints:**
- Time: (e.g., "2 hours", "this sprint", "no deadline")
- Budget: (e.g., "$0", "use existing infra only")
- Tech: (e.g., "TypeScript + existing stack", "any language")
- Dependencies: (e.g., "waiting on PR #123", "needs design review")

**Risks:**
- (what could make this fail, and the mitigation)
```

### 4. Validate with the User

Present the draft goal. Ask: "Does this match your intent? Anything to adjust?"

Do not proceed to planning or execution until the user confirms or edits the goal.

### 5. Save (Optional)

If the user wants the goal persisted, save it to:
- `.goals/<slug>.md` (project-level, shareable)
- `~/.ai-eng/goals/<slug>.md` (personal goal library)

Use kebab-case slugs derived from the objective (first 3-5 words).

## Rules

1. **One objective per goal.** If the user wants 3 things, create 3 goals or ask which is first.
2. **Criteria must be pass/fail.** "Improve performance" is bad. "Reduce p99 latency to <200ms" is good.
3. **Out of scope is mandatory.** Every goal must say what it's NOT doing.
4. **No hidden assumptions.** If the user assumes React and you know the repo is Vue, surface it.
5. **Timebox by default.** If no deadline given, suggest one based on the scope.

## Example

**User:** "I want to make the build faster"

**Clarifying questions:**
1. "What does 'faster' mean — total time, incremental time, or CI time?"
2. "What is the current time and what target are we aiming for?"
3. "Are we allowed to change the build tool, or must we optimize within the current setup?"

**Draft Goal:**
```markdown
## Goal: Reduce CI Build Time

**Objective:** Reduce the GitHub Actions CI build time from 12 minutes to under 5 minutes without changing the primary build tool.

**Success Criteria:**
- [ ] CI build completes in <5 minutes on a clean run
- [ ] No regressions in test coverage or build artifacts
- [ ] Changes are documented in BUILD.md

**Scope:**
- **In scope:** CI workflow optimization, caching strategy, parallel job tuning
- **Out of scope:** Changing from Vite to another build tool, removing tests

**Constraints:**
- Time: This week
- Tech: GitHub Actions, Vite, existing test suite
- Dependencies: None

**Risks:**
- Caching might introduce stale artifact bugs — mitigate with cache key versioning
```
