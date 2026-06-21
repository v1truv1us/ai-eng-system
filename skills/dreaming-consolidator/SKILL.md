---
name: dreaming-consolidator
description: Read the auto-memory graph (~/.claude/projects/*/memory/*.md), find cross-session patterns, and write a digest. The skill never mutates memory — output goes to a fresh file the user reads. The cron-driven version is the daily-brief-sdk dream-digest workflow, which writes to a separate dedicated directory.
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Dreaming Consolidator

Read-only consolidator across the auto-memory graph. The agent walks every memory file under `~/.claude/projects/*/memory/`, identifies cross-session patterns (recurring frictions, repeated user corrections, project facts that span multiple sessions), and writes a digest naming at least three patterns with citations.

## When to Use

- You suspect there's signal in the auto-memory graph you haven't surfaced (recurring corrections, project-spanning preferences, drifting goals)
- A weekly review that doesn't need to be on a cron
- After a long stretch of work — the memory graph has accumulated and could use a synthesis pass

## When NOT to Use

- The cron-driven weekly digest — that's the `daily-brief-sdk` `dream-digest` workflow, which writes to `~/.claude/cook-and-brief/dream-digest/weekly-YYYY-MM-DD.html` and emails it. Don't duplicate that pipeline.
- Confidential synthesis intended to feed back into auto-memory — this skill **never** writes into `~/.claude/projects/*/memory/` (that path is reserved for factual auto-memory; speculative synthesis would poison every future session).

## How to Run

1. Create the marker file with the agent's PID:
   ```bash
   mkdir -p ~/.claude/cooking
   PID=$$
   START_EPOCH=$(ps -p $PID -o lstart= | sed 's/^ *//;s/ *$//')
   printf '{"start_epoch": "%s"}' "$START_EPOCH" > ~/.claude/cooking/active-$PID
   ```
2. Tell Claude: "Run dreaming-consolidator in cook mode. Output target: `<some-path-outside-memory>`."
3. The agent reads every `.md` file under `~/.claude/projects/*/memory/`, takes notes on patterns observed across files, and writes a digest naming at least 3 patterns.
4. The output file path **must not** be under `~/.claude/projects/*/memory/`. A safe default is `~/Documents/dreaming-digests/<YYYY-MM-DD>.md` or wherever the user nominated.
5. The skill **must** remove the marker file in a `finally`-equivalent path.

## Pattern requirements

A "pattern" is any observation that:

- Is supported by ≥2 memory entries from ≥2 different sessions/dates
- Names a concrete subject (a tool, a workflow, a frustration, a preference) — not "the user uses Claude a lot"
- Cites the supporting memory files inline (e.g., `feedback_hook_schema.md`, `project_settings_architecture.md`)

The digest should name **at least 3** patterns. If fewer than 3 emerge, write what you found and explicitly note "memory graph too sparse to find 3 cross-session patterns."

## TERMINATION

Stop when ALL of these are true:

- A digest file has been written outside the auto-memory directory tree
- The digest names ≥3 cross-session patterns OR explicitly notes that fewer than 3 were found
- Each pattern cites the memory files supporting it
- The marker file is removed

When termination triggers:

```bash
rm -f ~/.claude/cooking/active-$PID ~/.claude/cooking/iter-$PID
```

If iteration 10 hits without finishing, write a partial digest (what was found so far + which files weren't fully read) to the output path and exit. Do not loop past 10.

## Anti-patterns

- **Don't** write the digest into `~/.claude/projects/*/memory/`. Speculative synthesis must not poison factual auto-memory.
- **Don't** use the existing memory `MEMORY.md` index file as a write target. It's an index, not a deliverable.
- **Don't** invent patterns that aren't supported by ≥2 memory files. If you can only cite one, that's an observation, not a cross-session pattern.
- **Don't** copy memory contents verbatim into the digest. Synthesise, don't transcribe.

## Verification

The output file exists at the nominated path and is **not** under `~/.claude/projects/*/memory/`. The mtime of every file under `~/.claude/projects/*/memory/` is unchanged after the run (run `stat` before and after). The digest contains ≥3 patterns each with ≥2 file citations, OR an explicit "fewer than 3 patterns found" note.

## Cron-driven version

For a scheduled, emailed weekly digest, install the `daily-brief-sdk` `dream-digest` workflow. That workflow writes to `~/.claude/cook-and-brief/dream-digest/weekly-YYYY-MM-DD.html`, sends an email, appends a JSONL telemetry row, and is fully separate from this skill. Use this skill for ad-hoc consolidation; use the SDK workflow for the scheduled run.

## Related

- Stop hook: `hooks/cooking/stop-hook.sh`
- Status command: `/cook-status`
- Sibling skills: `test-fix-loop`, `investigation-loop`, `cross-repo-refactor`
- Cron-driven digest: `packages/daily-brief-sdk/src/workflows/dream-digest.ts`
