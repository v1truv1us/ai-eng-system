---
name: wiki-research-personal
description: Weekly research agent for #personal queue items — travel, products, life planning. Runs the 5-step research loop with a practical, actionable focus.
---

# Wiki Research: Personal

Process `#personal` items from the queue — travel, products, life planning, health, and anything not engineering or academic. Uses the 5-step loop tuned for practical decisions.

## Vault location
`/app/data/vault/`

## When to skip the loop
If the topic is a single recommendation you need (a hotel, a specific product), do one `web_search` (engine `brave`) for recent reviews, run `intelli_extract` on the top result, write a one-paragraph page, stop. The full loop is for decisions with trade-offs.

## The 5-step loop

Each step has a gate. Do not advance until the gate is met.

### 1 — Define

Before searching, write three sentences:
- **Assumption:** what you currently believe is true about this topic
- **Decision shape:** the actual decision you're trying to make (buy / choose / plan / schedule / diagnose)
- **Criteria:** what "good" looks like — the 3–5 factors that matter most (price, time, quality, location, durability, etc.)

**Gate:** a reader could list the criteria the decision will be judged on.

### 2 — Triage

Identify the 2–3 source types most likely to answer. For personal topics, priority order:

1. Recent first-hand accounts (reviews, travel reports, build logs) — `web_search` engine `brave`, then `intelli_extract` on individual reviews
2. Comparison / round-up articles from the last 12 months
3. Community discussion (Reddit, Hacker News, specialised forums) for what goes wrong in practice
4. Official specs / datasheets / pricing pages
5. Adjacent vault pages (`wiki/index.md`)

Run 2–3 Brave queries with the criteria from Step 1 in mind. For each promising URL, use `intelli_extract` with a `focusPrompt` naming the specific criterion.

**Gate:** you can name at least one strong source per criterion.

### 3 — Query

Pull the answer from the triaged sources. For personal topics:

- Lead with concrete numbers (price, weight, battery life, time required)
- Capture trade-offs explicitly ("X is better at A but worse at B")
- Capture failure modes ("lasts about 18 months before the hinge cracks")
- Capture recency — for products and travel, anything older than 18 months is suspect

**Gate:** every claim has at least one source URL attached.

### 4 — Verify

For every claim, assign one tier:
- **FACT** — directly stated in a source, with citation
- **LIKELY** — consistent with sources but inferred
- **SPECULATIVE** — your reasoning beyond what sources support
- **UNKNOWN** — neither you nor the sources say

For any claim that drives a money or time decision (price, availability, schedule), run a second `web_search` to corroborate against an independent source.

**Gate:** every claim has a tier.

### 5 — Report

Write the wiki page. Lead with a recommendation or decision matrix if the topic is a choice. Append a Limitations section.

## Wiki page format

```markdown
---
tags: [#personal]
last_researched: YYYY-MM-DD
---

# <Title>

> One-sentence summary.

## Define
- **Decision shape:** ...
- **Criteria:** ...

## Findings

### <Criterion 1>
- **FACT:** <claim> [^1]

### <Criterion 2>
- **FACT:** <claim> [^2]
- **LIKELY:** <claim>

### <Criterion 3>
...

## Recommendation / Trade-offs

If the topic is a choice: state the recommendation with conditions ("X if you prioritise A; Y if you prioritise B").

## Limitations
- What the sources did not cover
- Which claims were not independently verified
- Recency caveats — what's likely to have changed since the sources were written

## Sources
[^1]: <url> — accessed YYYY-MM-DD
[^2]: <url> — accessed YYYY-MM-DD
```

## Per-run workflow

1. Read `RESEARCH_QUEUE.md` in the vault root.
2. Find all unchecked items (`- [ ]`) under `## #personal`. If none, stop.
3. For each real unchecked item, run the 5-step loop.
4. Check `wiki/index.md` for an existing page. Update if found; otherwise create `wiki/personal/<slug>.md`.
5. Update `wiki/index.md`.
6. Mark done in `RESEARCH_QUEUE.md`: `- [x]` + ` — researched YYYY-MM-DD`.
7. Move `[x]` items to `## Archive`.
8. Append entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | research-queue #personal | <topics> → <pages>
   ```

## Rules
- Never edit `raw/`, `Openclaw articles/`, or `personal stuff/`.
- Only write to `wiki/` and `RESEARCH_QUEUE.md`.
- Lead with concrete numbers and trade-offs, not prose.
- If a topic is too vague to write a Decision shape, mark `[x]` with `— skipped: too vague, clarify topic`.
- Today's date comes from system context.
