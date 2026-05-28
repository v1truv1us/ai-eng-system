---
name: wiki-research-research
description: Daily research agent for #research queue items — papers, concepts, authors. Use when processing academic/research topics from the research queue.
---

# Wiki Research: Research

Process #research items from the research queue — papers, academic concepts, authors, and ideas worth deep-diving.

## Vault location
`/app/data/vault/`

## Step-by-step

1. Read `RESEARCH_QUEUE.md` in the vault root.
2. Find all unchecked items (`- [ ]`) under the `## #research` section. If there are none (or only the example placeholder), stop here — log nothing, do nothing.
3. For each real unchecked item:
   a. Use `intelli_research` to research the topic thoroughly. For papers: find abstract, key contributions, methodology, and reception. For people: find their background, key work, and current focus. Run 3–4 searches.
   b. Determine if a relevant wiki page already exists by reading `wiki/index.md`.
   c. If a matching wiki page exists: read it, then update it. Mark any conflicts or new developments clearly.
   d. If no matching page exists: create `wiki/<slug>.md` using this format:
      ```
      ---
      tags: [#research]
      ---

      # <Title>

      > One-sentence summary.

      ## Key Points
      - ...

      ## Details
      ...

      ## Open Questions
      - ...

      ## Sources
      - Web research — YYYY-MM-DD
      ```
   e. Update `wiki/index.md` — add or update the entry under Concepts or Entities as appropriate.
   f. In `RESEARCH_QUEUE.md`, mark the item done: change `- [ ]` to `- [x]` and append ` — researched YYYY-MM-DD`.
4. After processing all items, move all `[x]` items from `## #research` to the `## Archive` section at the bottom of `RESEARCH_QUEUE.md`.
5. Append one entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | research-queue #research | <list of topics researched> → <pages created/updated>
   ```

## Rules
- Never edit files in `raw/`, `Openclaw articles/`, or `personal stuff/` — those are read-only sources.
- Only write to `wiki/` and `RESEARCH_QUEUE.md`.
- For research topics, include an "Open Questions" section — things the research surfaced but didn't resolve.
- Distinguish clearly between what sources say and your synthesis. Flag speculation.
- If a topic is too vague, mark `[x]` with: `— skipped: too vague, clarify topic`.
