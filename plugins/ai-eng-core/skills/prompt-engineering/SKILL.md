---
name: prompt-engineering
description: Design reliable prompts and agent workflows with explicit contracts, examples, decomposition, tool rules, and verification.
metadata:
  category: model-invoked
  version: 2.0.0
  tags: prompting, agents, workflows, reliability
---

Default output: return the prompt or workflow definition. Keep commentary to unresolved tradeoffs.

# Prompt engineering

Treat prompts as executable contracts. Include only instructions that affect behavior.

## Prompt contract

Define:

1. Task and completion condition.
2. Inputs and authoritative context.
3. Constraints and non-goals.
4. Tool permissions and required tool use.
5. Output schema and length.
6. Verification and failure behavior.

Use examples for strict formatting, classification boundaries, or uncommon edge cases. Do not add examples that restate the rules.

## Workflow design

- Split work only at real dependency or ownership boundaries.
- Pass structured handoffs between steps.
- Keep one source of truth for state.
- Bound retries by count, time, or cost.
- Require observable completion signals.
- Report blockers instead of inventing missing data.

## Avoid

- Fictional expertise or company credentials.
- Emotional stakes, rewards, penalties, or challenge framing.
- "Think step by step," "be thorough," and similar default behavior.
- Confidence scores without measured evidence.
- Multiple overlapping output formats.
- Long background sections that do not change execution.

## Minimal template

```text
Task: <result>
Inputs: <data or files>
Constraints:
- <rule>
- Non-goal: <excluded scope>
Tools: <allowed or required tools>
Output: <schema and maximum length>
Verify: <observable checks>
On failure: <stop/report/retry rule>
```

Use `prompt-refinement` for TCRO conversion and `incentive-prompting` for compact prompt rewrites.
