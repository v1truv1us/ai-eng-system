---
name: continuous-learning
description: Extract reusable patterns from sessions, score confidence, and promote high-confidence instincts into durable skills. Use after completing significant work.
metadata:
  category: model-invoked
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Continuous Learning

## Overview

Learn from sessions in two complementary ways:

1. **Instinct-based learning** — extract reusable patterns, score confidence, promote high-confidence instincts into skills.
2. **Workspace memory** — delegate durable preferences and facts to the `agents-memory-updater` subagent (orchestration only in this skill).

## When to Use

- After completing a significant feature or fix (instincts)
- When a session revealed a non-obvious solution worth remembering
- Before starting similar work to apply learned instincts
- When transcript deltas may update `AGENTS.md` (workspace memory)

## Instinct Lifecycle

### 1. Discovery

When a pattern is encountered during work:

```
Pattern: [What was discovered]
Context: [When this applies]
Confidence: [0.0-1.0 based on evidence]
Evidence: [What proves this works]
```

### 2. Validation

Before storing an instinct:

- [ ] Pattern has been verified in at least one successful outcome
- [ ] Context is specific enough to avoid false positives
- [ ] Confidence score is justified with evidence
- [ ] No conflicting instincts exist

### 3. Storage

Instincts are stored with:

```yaml
instinct:
  name: "descriptive-name"
  pattern: "what to do"
  context: "when to apply"
  confidence: 0.85
  evidence: "why this works"
  created: "2026-01-15"
  usage_count: 3
  success_rate: 0.95
```

### 4. Evolution

When an instinct reaches thresholds:

- Confidence > 0.9 AND usage_count > 5 AND success_rate > 0.9 → Promote to skill
- Confidence < 0.5 AND usage_count > 3 → Deprecate
- Confidence unchanged after 30 days → Review

## Confidence Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| 0.9-1.0 | Proven pattern, multiple successes | Promote to skill candidate |
| 0.7-0.9 | Strong pattern, some evidence | Use with confidence |
| 0.5-0.7 | Plausible pattern, limited evidence | Use cautiously, verify |
| 0.3-0.5 | Weak pattern, speculative | Note but don't rely on |
| 0.0-0.3 | Unproven, likely incorrect | Discard |

## Import and Export

### Export Instincts

Export all instincts to JSON: `[{name, pattern, context, confidence, evidence}]`

### Import Instincts

Import instincts from JSON. Merge with existing records and update confidence on duplicates.

## Workspace memory (AGENTS.md)

When transcript mining may produce durable updates—not one-off task context:

1. Call `agents-memory-updater`; return its result unchanged.
2. Do not mine transcripts or edit files in the parent flow.

The updater owns `AGENTS.md` sections (`## Learned User Preferences`, `## Learned Workspace Facts`), incremental transcript indexes under `~/.cursor/projects/<workspace-slug>/agent-transcripts/`, and deduplication (max 12 bullets per learned section).

If no meaningful updates: respond exactly `No high-signal memory updates.`

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll remember this pattern" | Human memory is unreliable. Document it now with context and evidence. |
| "This is too specific to be useful" | Specific patterns become general skills through evolution. Start specific, generalize later. |
| "I don't have time to document" | Two minutes now saves hours of rediscovery later. Use the instinct template. |
| "The confidence score is subjective" | Confidence is a starting point. Usage and success rates provide objective data over time. |
