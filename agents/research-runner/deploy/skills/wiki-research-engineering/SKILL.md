---
name: wiki-research-engineering
description: Daily research agent for #engineering queue items — searches web and writes wiki pages. Use when processing engineering topics from the research queue.
---

# Wiki Research: Engineering

Process #engineering items from the research queue and write wiki pages.

## Vault location
`/app/data/vault/`

## Step-by-step

1. Read `RESEARCH_QUEUE.md` in the vault root.
2. Find all unchecked items (`- [ ]`) under the `## #engineering` section. If there are none (or only the example placeholder), stop here — log nothing, do nothing.
3. For each real unchecked item:
   a. Use `intelli_research` to research the topic. Run 2–3 searches with focused prompts to get sufficient depth.
   b. Determine if a relevant wiki page already exists by reading `wiki/index.md`.
   c. If a matching wiki page exists: read it, then update it with new information. Mark any conflicts clearly.
   d. If no matching page exists: create `wiki/<slug>.md` using this format:
      ```
      ---
      tags: [#engineering]
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
   e. Update `wiki/index.md` — add or update the entry under Concepts or Entities as appropriate.
   f. In `RESEARCH_QUEUE.md`, mark the item done by changing `- [ ]` to `- [x]` and appending ` — researched YYYY-MM-DD`.
4. After processing all items, move all `[x]` items from `## #engineering` to the `## Archive` section at the bottom of `RESEARCH_QUEUE.md`.
5. Append one entry to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | research-queue #engineering | <list of topics researched> → <pages created/updated>
   ```

## Rules
- Never edit files in `raw/`, `Openclaw articles/`, or `personal stuff/` — those are read-only sources.
- Only write to `wiki/` and `RESEARCH_QUEUE.md`.
- If a topic is too vague to research meaningfully, mark it `[x]` with a note: `— skipped: too vague, clarify topic`.
- Keep wiki pages focused. If research reveals a topic is really two distinct concepts, create two pages.
- Today's date can be determined from your system context.
