---
name: text-cleanup
description: Remove AI-generated filler, repetition, inflated language, and redundant comments while preserving meaning.
metadata:
  version: 2.0.0
  tags: text-cleanup, slop-removal, content-optimization
---

Default output: return the cleaned text only. For file edits, report changed files and verification in at most three bullets.

# Text cleanup

Cut words that do not add facts, constraints, decisions, or useful context.

## Remove

- Conversational openers and closers.
- Fake urgency, rewards, penalties, challenges, and fictional credentials.
- Generic instructions such as "be thorough," "think step by step," or "work systematically."
- Confidence self-ratings unless backed by a defined metric.
- Repeated conclusions, transitions, and restated headings.
- Self-evident comments that repeat code.
- Vague claims such as "experts say" without a source.
- Inflated words when a plain word is accurate.

## Preserve

- Technical constraints, numbers, formulas, and acceptance criteria.
- Error cases, security warnings, and compatibility limits.
- Decisions and their rationale.
- Examples that clarify format or edge behavior.
- Required schemas and domain terminology.

## Rewrite rules

- Lead with the result.
- Prefer active voice and concrete nouns.
- Replace vague quality words with measurable requirements.
- Keep one idea per sentence.
- Use the minimum headings and bullets needed for scanning.
- Do not shorten text when brevity would remove necessary precision.

## Code cleanup

When cleaning branch code, limit edits to introduced slop: redundant comments, unnecessary wrappers, abnormal defensive handling, type escapes, and avoidable nesting. Preserve behavior and run affected checks.
