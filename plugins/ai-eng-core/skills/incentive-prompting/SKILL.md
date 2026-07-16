---
name: incentive-prompting
description: Tighten prompts with explicit tasks, constraints, output contracts, examples, and verification. Use when optimizing prompts or agent instructions.
metadata:
  category: model-invoked
  version: 2.0.0
  tags: prompting, optimization, contracts, token-efficiency
---

Default output: return only the revised prompt. Add notes only for unresolved ambiguity.

# Prompt optimization

Improve prompts by adding information that changes execution. Do not add personas, fictional credentials, emotional stakes, monetary incentives, challenge language, generic reasoning instructions, or confidence-score requests.

## Contract

A useful prompt defines:

1. **Task**: the observable result.
2. **Context**: only facts needed to do the task.
3. **Constraints**: scope, compatibility, safety, and non-goals.
4. **Output**: exact artifact, schema, or length limit.
5. **Verification**: checks that prove completion.

Add examples only when format or edge-case behavior would otherwise be ambiguous.

## Process

1. Preserve the user's intent.
2. Remove filler, duplicated context, and instructions the model already follows by default.
3. Convert vague quality words into testable constraints.
4. Set the shortest output that still carries the required result and evidence.
5. Ask one blocking question only when different answers would materially change the result.

## Rewrite pattern

```text
Task: <observable result>
Context: <required facts only>
Constraints:
- <scope or behavior constraint>
- <explicit non-goal>
Output: <artifact/schema/length>
Verify: <command, test, or acceptance check>
```

## Examples

Weak:

```text
Act as a world-class engineer. Think step by step and give me a comprehensive answer.
```

Better:

```text
Find the cause of the failing checkout test. Do not modify code. Return the root cause, file:line evidence, and the smallest viable fix in at most five bullets.
```

Weak:

```text
Write detailed documentation for this API.
```

Better:

```text
Document the public endpoints in src/api/. Include request fields, response variants, authentication, and one runnable example per endpoint. Write docs/api.md. Omit internal helpers.
```
