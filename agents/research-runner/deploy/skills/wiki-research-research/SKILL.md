---
name: wiki-research-research
description: Daily research agent for #research queue items — papers, concepts, authors. Runs the 5-step research loop with deeper source-finding and an Open Questions section.
---

# Wiki Research: Research

Process `#research` items from the queue — papers, academic concepts, authors, ideas worth deep-diving. Uses the 5-step loop with stricter source-finding than engineering.

## Vault location
`/app/data/vault/`

## When to skip the loop
If the topic is a single paper you only need to summarise, do one `web_search` (engine `brave`) for the paper, run `intelli_extract` on the abstract page, write a one-paragraph page with citation, stop. The full loop is for concepts, debates, bodies of work.

## The 5-step loop

Each step has a gate. Do not advance until the gate is met.

### 1 — Define

Before searching, write three sentences:
- **Assumption:** what you currently believe is true about this concept / paper / author
- **Unknown:** the specific thing you don't know yet, as a question with a verifiable answer
- **Answer shape:** what a good answer looks like (a summary, a comparison with prior work, a critique, a position in a debate)

**Gate:** a reader could tell whether your output answered it.

### 2 — Triage

Identify the 2–4 source types most likely to answer. For research topics, priority order:

1. The paper itself (arXiv, publisher page, author PDF) — use `web_search` to find it, then `intelli_extract` on the abstract / introduction / results
2. Author's own page, lab page, talks, blog
3. Peer papers — critiques, extensions, follow-on work (search `<paper title>` + "follow-up" / "critique" / "reply")
4. Surveys / textbooks that cite it (search `<concept>` + "survey" or "lecture notes")
5. Adjacent vault pages (`wiki/index.md`)

Run 3–4 Brave queries. For each promising URL, use `intelli_extract` with a `focusPrompt` naming the specific Unknown.

**Gate:** you can name 3+ source URLs you will cite before writing the page.

### 3 — Query

Pull the answer from the triaged sources. For research topics specifically:

- For a paper: capture abstract, key contributions, methodology, results, reception (citations, awards), criticisms
- For an author: capture background, key work, current focus, collaborators, intellectual lineage
- For a concept: capture definition, origin, formal statement, what it solves, what it doesn't solve, related concepts

**Gate:** every claim has at least one source URL attached.

### 4 — Verify

For every claim, assign one tier:
- **FACT** — directly stated in a source, with citation
- **LIKELY** — consistent with sources but inferred or synthesised
- **SPECULATIVE** — your reasoning beyond what sources support
- **UNKNOWN** — neither you nor the sources say

For any claim about the paper's reception or impact, run a second `web_search` to corroborate. Citation counts, awards, and critiques are easy to get wrong.

**Gate:** every claim has a tier.

### 5 — Report

Write the wiki page. Append a Limitations section and an Open Questions section.

## Wiki page format

```markdown
---
tags: [#research]
last_researched: YYYY-MM-DD
---

# <Title>

> One-sentence summary.

## Define
- **Assumption:** ...
- **Unknown:** ...
- **Answer shape:** ...

## Findings

### Background
- **FACT:** <claim> [^1]

### Key contributions
- **FACT:** <claim> [^1]
- **FACT:** <claim> [^2]

### Reception / critiques
- **LIKELY:** <claim> [^2, 3]

### Current status
- **LIKELY:** <claim>

## Open Questions
- Things the research surfaced but did not resolve
- Productive follow-up directions

## Limitations
- What the sources did not cover
- Which claims were not independently verified
- What would change the answer

## Sources
[^1]: <url> — accessed YYYY-MM-DD
[^2]: <url> — accessed YYYY-MM-DD
```

## Per-run workflow

1. Read `RESEARCH_QUEUE.md` in the vault root.
2. Find all unchecked items (`- [ ]`) under `## #research`. If none (or only placeholder), stop.
3. For each real unchecked item, run the 5-step loop.
4. Check `wiki/index.md` for an existing page. Update if found; otherwise create `wiki/research/<slug>.md`.
5. Update `wiki/index.md`.
6. Mark done in `RESEARCH_QUEUE.md`: `- [x]` + ` — researched YYYY-MM-DD`.
7. Move `[x]` items to `## Archive`.
8. Append entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | research-queue #research | <topics> → <pages>
   ```

## Rules
- Never edit `raw/`, `Openclaw articles/`, or `personal stuff/`.
- Only write to `wiki/` and `RESEARCH_QUEUE.md`.
- Include an Open Questions section — what the research surfaced but didn't resolve.
- If a topic is too vague, mark `[x]` with `— skipped: too vague, clarify topic`.
- Today's date comes from system context.
