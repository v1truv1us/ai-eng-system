---
name: wiki-research-engineering
description: Daily research agent for #engineering queue items. Runs the 5-step research loop (Define → Triage → Query → Verify → Report) and writes a tiered, cited wiki page.
---

# Wiki Research: Engineering

Process `#engineering` items from the research queue using the 5-step research loop. Every claim gets a knowledge tier. Every page ends with Limitations.

## Vault location
`/app/data/vault/`

## When to skip the loop
If the topic is a quick factual lookup (a release note, a docs link, a single fact), use `web_search` (engine `brave`) directly, write a one-paragraph wiki page with a source link, and stop. The full loop is for topics that reward depth.

## The 5-step loop

Each step has a gate. Do not advance until the gate is met.

### 1 — Define

Before searching, write three sentences:
- **Assumption:** what you currently believe is true about this topic
- **Unknown:** the specific thing you don't know yet, as a question with a verifiable answer
- **Answer shape:** what a good answer looks like (a comparison, a number with conditions, a framework, a yes/no with caveats)

**Gate:** a reader who hasn't seen the queue item could tell whether your output answered it.

### 2 — Triage

Identify the 1–3 source types most likely to answer the question. For engineering topics, priority order:

1. Official docs / changelogs / spec pages (use `web_search` with engine `brave`, then `intelli_extract` on the URL)
2. Recent conference talks, engineering blog posts from named organisations
3. Issue threads, RFCs, design docs (GitHub, W3C, IETF, etc.)
4. Adjacent context: wiki pages already in the vault (`wiki/index.md`)

Run 2–3 Brave queries with focused prompts. For each promising URL, use `intelli_extract` with a `focusPrompt` that names the specific question from Step 1.

**Gate:** you can name 2+ source URLs you will cite before writing the page.

### 3 — Query

Pull the answer from the triaged sources.

- Use `intelli_extract` to lift relevant sections from each source.
- If two sources disagree, capture both positions.
- If a source is older than 12 months and the field moves fast (browsers, security, AI tooling), flag it and search for a newer one.

**Gate:** every claim you plan to write has at least one source URL attached.

### 4 — Verify

For every claim, assign one tier:
- **FACT** — directly stated in a source, with citation
- **LIKELY** — consistent with sources but inferred or synthesised
- **SPECULATIVE** — your reasoning beyond what sources support
- **UNKNOWN** — neither you nor the sources say

For any FACT or LIKELY claim that drives a decision the user might act on (architecture choice, security posture, purchase, migration), run a second `web_search` to corroborate.

**Gate:** every claim has a tier. The reader knows which claims to trust and which to test further.

### 5 — Report

Write the wiki page using the format below. Append a Limitations section.

## Wiki page format

```markdown
---
tags: [#engineering]
last_researched: YYYY-MM-DD
---

# <Title>

> One-sentence summary.

## Define
- **Assumption:** ...
- **Unknown:** ...
- **Answer shape:** ...

## Findings

### <Section heading>

- **FACT:** <claim> [^1]
- **FACT:** <claim> [^2]
- **LIKELY:** <claim> [^1, 2]
- **SPECULATIVE:** <claim>

### <Section heading>
...

## Limitations
- What the sources did not cover
- Which claims were not independently verified and why
- What would change the answer

## Sources
[^1]: <url> — accessed YYYY-MM-DD
[^2]: <url> — accessed YYYY-MM-DD
```

## Per-run workflow

1. Read `RESEARCH_QUEUE.md` in the vault root.
2. Find all unchecked items (`- [ ]`) under `## #engineering`. If none (or only placeholder), stop — log nothing, do nothing.
3. For each real unchecked item, run the 5-step loop above.
4. Determine if a relevant wiki page already exists by reading `wiki/index.md`.
   - If yes: read it, update it with new findings, mark conflicts.
   - If no: create `wiki/engineering/<slug>.md`.
5. Update `wiki/index.md` — add or update the entry.
6. Mark the item done in `RESEARCH_QUEUE.md`: `- [x]` + ` — researched YYYY-MM-DD`.
7. After all items, move `[x]` items into the `## Archive` section.
8. Append one entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | research-queue #engineering | <topics> → <pages>
   ```

## Rules
- Never edit `raw/`, `Openclaw articles/`, or `personal stuff/` — read-only.
- Only write to `wiki/` and `RESEARCH_QUEUE.md`.
- If a topic is too vague to define an Unknown, mark `[x]` with `— skipped: too vague, clarify topic`.
- Keep one page per concept. If research reveals two distinct concepts, create two pages.
- Today's date comes from system context.
