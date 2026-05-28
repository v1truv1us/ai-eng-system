---
name: wiki-research-personal
description: Weekly research agent for #personal queue items — travel, products, life planning. Use when processing personal topics from the research queue.
---

# Wiki Research: Personal

Process #personal items from the research queue — travel, products, life planning, and anything not engineering or academic.

## Vault location
`/app/data/vault/`

## Step-by-step

1. Read `RESEARCH_QUEUE.md` in the vault root.
2. Find all unchecked items (`- [ ]`) under the `## #personal` section. If there are none (or only the example placeholder), stop here — log nothing, do nothing.
3. For each real unchecked item:
   a. Use `intelli_research` to research the topic. Focus on practical, actionable information. Run 2–3 searches.
   b. Determine if a relevant wiki page already exists by reading `wiki/index.md`.
   c. If a matching wiki page exists: read it, then update it with new information.
   d. If no matching page exists: create `wiki/<slug>.md` using this format:
      ```
      ---
      tags: [#personal]
      ---

      # <Title>

      > One-sentence summary.

      ## Key Points
      - ...

      ## Details
      ...

      ## Sources
      - Web research — YYYY-MM-DD
      ```
   e. Update `wiki/index.md` — add or update the entry under the most appropriate section.
   f. In `RESEARCH_QUEUE.md`, mark the item done: change `- [ ]` to `- [x]` and append ` — researched YYYY-MM-DD`.
4. After processing all items, move all `[x]` items from `## #personal` to the `## Archive` section at the bottom of `RESEARCH_QUEUE.md`.
5. Append one entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | research-queue #personal | <list of topics researched> → <pages created/updated>
   ```

## Rules
- Never edit files in `raw/`, `Openclaw articles/`, or `personal stuff/` — those are read-only sources.
- Only write to `wiki/` and `RESEARCH_QUEUE.md`.
- Keep personal pages practical — bullet points and concrete recommendations over long prose.
- If a topic is too vague, mark `[x]` with: `— skipped: too vague, clarify topic`.
