---
name: sync-skill-taxonomy
description: "Classify every skill in skills/ as user-invoked or model-invoked, ensure disable-model-invocation is set on user-invoked skills, and inject metadata.category on all. Run after adding or changing skills, or when token-cost/routing quality is being reviewed. Use for \"sync skill taxonomy\", \"classify skills\", \"fix disable-model-invocation\", or \"skill token audit\"."
metadata:
  category: user-invoked
  version: 1.0.0
  tags: maintenance, skills, taxonomy
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Sync skill taxonomy

Keeps the skill catalog consistent: every `skills/**/SKILL.md` carries a `metadata.category` (user-invoked or model-invoked), and every user-invoked skill carries `disable-model-invocation: true` so its description is excluded from model routing context.

## Why

Per the Agent Skills spec, every skill's `name` + `description` loads at startup for routing (~100 tokens each). `disable-model-invocation: true` (a Claude Code / Cursor / Pi extension, not part of the base spec) marks a skill as slash/manual-only — its description is NOT loaded for routing, saving tokens and preventing the model from auto-invoking skills meant for explicit triggers.

Drift happens: new skills land without the flag, descriptions get rewritten, trigger semantics shift. This skill re-applies the taxonomy deterministically.

## When to run

- After adding, renaming, or removing skills
- After rewriting a skill's `description`
- When reviewing token cost of the skill catalog at startup
- When routing quality degrades (model invoking skills it shouldn't)

## Classification rules

A skill is **user-invoked** if ANY of:
1. It already has `disable-model-invocation: true`.
2. Its `description` contains explicit-trigger language: "user explicitly", "explicitly types", "when the user says", "Use only when the user".
3. Its only trigger is a slash command AND it has no capability-based routing signal (the model would never reach for it from task context alone).

Otherwise it is **model-invoked** — the agent should be able to auto-invoke it based on task context.

**Bias toward model-invoked.** Flagging a skill user-only removes it from routing. Only flag when the description genuinely says "explicit/manual only". Capability skills that *also* mention a slash command (e.g. `grill-me`, `architect`, `comprehensive-research`) stay model-invoked — the model may legitimately reach for them.

## Workflow

### 1. Classify

For each `skills/**/SKILL.md`, read the frontmatter and `description`. Apply the rules above. Produce the full mapping before editing anything.

### 2. Flag disable-model-invocation

For every **user-invoked** skill that lacks `disable-model-invocation: true`, add it immediately after the `description:` line:

```yaml
---
name: some-skill
description: Use only when the user explicitly types `/some-skill`...
disable-model-invocation: true
metadata:
  ...
---
```

Do NOT remove the flag from skills that already have it.

### 3. Inject metadata.category

For every skill, ensure `metadata.category` is present. Two cases:

**Has a `metadata:` block** — add `category: <user-invoked|model-invoked>` as the first key:

```yaml
metadata:
  category: user-invoked
  version: 1.0.0
  tags: ...
```

**No `metadata:` block** — add one after `description:` (or after `disable-model-invocation:` if present):

```yaml
description: ...
metadata:
  category: model-invoked
```

Preserve all existing metadata keys (`version`, `tags`, `author`, etc.). Only add `category`.

### 4. Normalize and verify

Run the formatter — it merges legacy `version`/`tags` into `metadata` and preserves `category`:

```bash
bun run format:skills:fix
```

Then verify every skill has a category and the DMI set matches:

```bash
# Count by category
python3 -c "
import glob, re
for f in sorted(glob.glob('skills/**/SKILL.md', recursive=True)):
    fm = re.match(r'^---\n(.*?)\n---', open(f).read(), re.DOTALL).group(1)
    cat = re.search(r'category:\s*(\S+)', fm)
    dmi = bool(re.search(r'disable-model-invocation:\s*true', fm))
    print(f'{\"U\" if dmi else \"M\"} {cat.group(1) if cat else \"MISSING\":15s} {f}')
"
```

**Invariants after running:**
- Every skill has `metadata.category` ∈ {`user-invoked`, `model-invoked`}.
- Every `user-invoked` skill has `disable-model-invocation: true`.
- No `model-invoked` skill has `disable-model-invocation: true`.

### 5. Build and report

```bash
bun run build
```

Report:
- Counts: `N user-invoked / M model-invoked`
- Changes made: how many DMI flags added, how many categories injected/updated
- Estimated token savings at startup (sum of `description` chars for user-invoked skills ÷ 4 ≈ tokens excluded from routing)

## Token-cost note

The "63% reduction" figure that circulates for `disable-model-invocation` is only achievable in catalogs dominated by narrow slash-only tools. In a capability-rich catalog like this one, correct classification typically saves **~10–15%** of startup routing tokens. The bigger win is routing quality — the model stops auto-invoking skills meant for explicit triggers.

## Provenance

- Agent Skills spec: https://agentskills.io/specification (base format; `name`+`description` load at startup)
- `disable-model-invocation`: Claude Code / Cursor / Pi extension field, recognized by this repo's formatter (`scripts/lib/agent-skills.ts`, `EXTENSION_FRONTMATTER_FIELDS`)
- Classification heuristics derived from the 18 user-invoked skills in this catalog as of the initial taxonomy pass.
