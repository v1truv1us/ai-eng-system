---
name: continuous-learning-v2
description: Instinct-based learning system with confidence scoring, import/export, and evolution into skills. The system learns patterns from sessions and promotes high-confidence instincts into durable skills. Use when extracting patterns from completed work.
---

# Continuous Learning v2

## Overview

A learning system that extracts patterns from completed sessions, scores them by confidence, and evolves high-confidence instincts into durable skills. Unlike v1's stop-hook pattern, v2 uses instinct-based learning with confidence scoring and evolution.

## When to Use

- After completing a significant feature or fix
- When you've discovered a pattern worth remembering
- When a session revealed a non-obvious solution
- Before starting similar work to apply learned instincts

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

## Import/Export

### Export Instincts
```bash
# Export all instincts to JSON
# Format: [{name, pattern, context, confidence, evidence}]
```

### Import Instincts
```bash
# Import instincts from JSON
# Merge with existing, update confidence on duplicates
```

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll remember this pattern" | Human memory is unreliable. Document it now with context and evidence. |
| "This is too specific to be useful" | Specific patterns become general skills through evolution. Start specific, generalize later. |
| "I don't have time to document" | 2 minutes now saves 2 hours of rediscovery later. Use the instinct template. |
| "The confidence score is subjective" | Confidence is a starting point. Usage and success rates provide objective data over time. |
