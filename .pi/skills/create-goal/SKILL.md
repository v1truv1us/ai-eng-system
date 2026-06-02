---
name: create-goal
description: "Transform a vague idea, request, or prompt into a concrete, actionable goal with clear success criteria, scope boundaries, and measurable outcomes. Use when the user has an intention but needs help defining what \"done\" looks like."
argument-hint: "<task or idea>"
metadata:
  version: 1.1.0
  tags: ai-eng-core, goal-setting, planning
---

# Create Goal

Turn any vague intention into a **completion contract** — a goal that an agent (or human) can execute against with evidence-based stopping conditions.

## When to Use

- User says "I want to..." but hasn't defined what success looks like
- A task feels too big, too vague, or has unclear boundaries
- Before starting `/plan` or `/work` — lock the target first
- Retrofitting: user already started work but the goal is drifting

## Rules

1. **Preserve the full intent.** Do not weaken broad acceptance criteria such as "all", "any", "complete", "no tech debt", "do it right", "fully", or "hard acceptance criteria" unless the user explicitly narrows them.
2. **One objective per goal.** If the user wants 3 things, create 3 goals or ask which is first.
3. **Criteria must be pass/fail.** "Improve performance" is bad. "Reduce p99 latency to <200ms" is good.
4. **Out of scope is mandatory.** Every goal must say what it's NOT doing.
5. **No hidden assumptions.** If the user assumes React and you know the repo is Vue, surface it.
6. **Concise imperative language.** Write what must be true, not how to get there.

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

**Verification Evidence:**
- (concrete evidence required before completion: tests, builds, lint, diffs, screenshots, generated artifacts, etc.)
- (if the repo has existing CI/validation, require it unless clearly irrelevant)

**Scope:**
- **In scope:** (bullet list)
- **Out of scope:** (bullet list — be explicit about what you're NOT doing)

**Constraints:**
- Preserve existing behavior unless the task explicitly changes it.
- Do not discard user changes.
- Do not leave unapproved shortcuts, compatibility shims, TODO placeholders, dead code, duplicated logic, hidden assumptions, or undocumented behavior changes.

**Boundaries:**
- Files/tools/data the agent may use
- Files/tools/data the agent must NOT touch

**Iteration Policy:**
- After each attempt, inspect evidence, update the plan, and keep taking the next low-risk useful step.
- Do not stop at a plan when implementation or verification remains.
- If validation fails, triage and fix the cause rather than reporting partial completion.

**Completion Audit:**
- Before marking the goal complete, map every explicit requirement to fresh evidence from files, commands, diffs, tests, screenshots, artifacts, or logs.
- The goal is not complete if any requirement is unverified, narrowed, deferred, or only probably satisfied.
- Phrases like "for the scope this is complete", "good enough", "out of scope", or "remaining tech debt" are not valid completion evidence unless the original user task explicitly allowed that limitation.

**Blocked Stop Condition:**
- If completion is impossible with current access, tools, budget, or missing decisions, stop without marking complete.
- Report attempted paths, evidence gathered, exact blockers, remaining unmet requirements, and what input would unblock progress.

**Token Budget:** (optional — only if user explicitly provides one)
```

### 4. Validate with the User

Present the draft goal. Ask: "Does this match your intent? Anything to adjust?"

Do not proceed to planning or execution until the user confirms or edits the goal.

### 5. Save (Optional)

If the user wants the goal persisted, save it to:
- `.goals/<slug>.md` (project-level, shareable)
- `~/.ai-eng/goals/<slug>.md` (personal goal library)

Use kebab-case slugs derived from the objective (first 3-5 words).

## Example

**User:** "I want to make the build faster"

**Clarifying questions:**
1. "What does 'faster' mean — total time, incremental time, or CI time?"
2. "What is the current time and what target are we aiming for?"
3. "Are we allowed to change the build tool, or must we optimize within the current setup?"

**Draft Goal:**
```markdown
## Goal

**Objective:** Reduce the GitHub Actions CI build time from 12 minutes to under 5 minutes without changing the primary build tool.

**Success Criteria:**
- [ ] CI build completes in <5 minutes on a clean run
- [ ] No regressions in test coverage or build artifacts
- [ ] Changes are documented in BUILD.md

**Verification Evidence:**
- GitHub Actions workflow run logs showing <5 minute completion
- Full test suite passes (no skips, no new failures)
- Build artifact sizes and contents match or improve baseline

**Scope:**
- **In scope:** CI workflow optimization, caching strategy, parallel job tuning
- **Out of scope:** Changing from Vite to another build tool, removing tests, modifying source code behavior

**Constraints:**
- Preserve existing behavior unless the task explicitly changes it.
- Do not leave TODO placeholders or undocumented changes.

**Boundaries:**
- May modify: `.github/workflows/`, `package.json` scripts, build config files
- Must NOT modify: source code, test logic, API contracts

**Iteration Policy:**
- After each change, run the CI workflow and record the time.
- If a change doesn't help, revert it before trying the next.
- If validation fails (tests break, artifacts change), fix the cause before proceeding.

**Completion Audit:**
- Map each success criterion to fresh evidence from CI logs, test output, and artifact comparison.
- The goal is not complete if any criterion is unverified or only "probably" satisfied.

**Blocked Stop Condition:**
- If the build tool has a hard floor >5 minutes due to inherent limitations, stop and report the blocker with evidence.
```
