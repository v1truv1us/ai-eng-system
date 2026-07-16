---
name: content-optimization
description: Improve prompts, code, queries, documentation, commit messages, and technical communication while preserving intent.
metadata:
  category: model-invoked
  version: 2.0.0
  tags: content, optimization, prompts, code, documentation
---

Default output: return the optimized content only. Add a short change note only when the user asks for rationale.

# Content optimization

Detect the content type, preserve its purpose, and make the smallest changes that improve correctness, clarity, or efficiency.

## Rules

- Preserve facts, constraints, behavior, and required terminology.
- Remove filler, repetition, fake urgency, personas, self-ratings, and generic reasoning instructions.
- Prefer concrete requirements over words such as "comprehensive," "robust," or "high quality."
- Keep the original format unless changing it improves usability.
- Do not expand content unless missing information blocks the objective.

## By content type

| Type | Optimize for |
|---|---|
| Prompt | Task, context, constraints, output, verification |
| Code | Correctness, readability, smaller control flow, project conventions |
| Query | Correctness, selectivity, index use, measured performance |
| Documentation | Task completion, accurate examples, scanability |
| Commit message | Imperative summary and necessary rationale |
| Communication | Decision, owner, action, deadline, blocker |

## Process

1. Identify the intended reader or executor.
2. Remove text that does not change understanding or behavior.
3. Resolve ambiguity with concrete inputs, limits, or acceptance checks.
4. Optimize for the requested medium.
5. Verify that meaning and required details remain intact.

For prompt-specific work, also apply `incentive-prompting`.
