---
name: teach
description: Teach the user a topic through a stateful learning workspace — mission-driven lessons, retrieval practice, cited resources, and durable learning records. Use when the user says teach me, /teach, wants interactive lessons, or is learning something over multiple sessions.
compatibility: Works across Claude Code, Cursor, OpenCode, Pi, and Gemini CLI. Uses file-backed workspace state; web search tools required for resource gathering.
metadata:
  category: user-invoked
  version: 1.0.0
  tags: teaching, learning, productivity, education
  attribution: Adapted from mattpocock/skills teach skill (MIT)
argument-hint: What would you like to learn about?
disable-model-invocation: true
---

# Teach

The user wants to learn something. This is a **stateful, multi-session** request — progress persists in the workspace directory.

**Related skills (do not conflate):**
- `create-learning-path` — week-by-week roadmap and milestones without a lesson workspace
- `knowledge-architecture` — team knowledge base for a product/domain, not personal tutoring
- `knowledge-capture` — document a solved problem after the fact

## First session checklist

1. Confirm the **teaching workspace directory** (default: current working directory). All artifacts below are relative to it.
2. Read existing state if present: `MISSION.md`, `RESOURCES.md`, `GLOSSARY.md`, `NOTES.md`, `learning-records/`, `lessons/`, `reference/`.
3. If `MISSION.md` is missing or empty, interview the user on **why** they want to learn this before teaching content. Use [MISSION-FORMAT.md](./MISSION-FORMAT.md).
4. If `RESOURCES.md` is thin, **search the web** before teaching — do not rely on parametric knowledge alone (see Research below).

## Teaching workspace

State lives in the workspace directory:

| Path | Purpose |
|------|---------|
| `MISSION.md` | Why the user is learning; grounds every decision. [MISSION-FORMAT.md](./MISSION-FORMAT.md) |
| `RESOURCES.md` | Curated high-trust sources. [RESOURCES-FORMAT.md](./RESOURCES-FORMAT.md) |
| `GLOSSARY.md` | Canonical terminology. [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md) |
| `NOTES.md` | User teaching preferences and scratch notes |
| `learning-records/*.md` | Durable insights and prior knowledge (like ADRs). [LEARNING-RECORD-FORMAT.md](./LEARNING-RECORD-FORMAT.md) |
| `lessons/*` | Self-contained lessons (primary deliverable) |
| `reference/*` | Compressed cheat sheets and quick-reference docs |

Create directories lazily when first needed.

## Philosophy

Deep learning needs three things:

- **Knowledge** — from high-quality, high-trust resources
- **Skills** — through interactive lessons you design from that knowledge
- **Wisdom** — from real-world practice and communities

Before `RESOURCES.md` is well-populated, prioritize finding trustworthy resources. **Never trust parametric knowledge as the primary source.**

Some topics are knowledge-heavy (theoretical physics); others are skill-heavy (yoga, programming). Calibrate lesson design accordingly.

### Fluency vs storage strength

- **Fluency strength** — in-the-moment retrieval (can feel like mastery)
- **Storage strength** — long-term retention (the real goal)

Design for storage strength via desirable difficulty:

- Retrieval practice (recall from memory, not re-reading)
- Spacing (distribute practice across sessions)
- Interleaving (mix related topics in skill practice only)

## Research (all models)

Ground teaching in external sources. Use whichever search tools the harness exposes:

- `web_search`, `web_research`, `intelli_research`, `WebSearch`, `WebFetch`, or MCP search tools

Workflow:

1. Search for primary sources, recognized experts, and well-moderated communities.
2. Add findings to `RESOURCES.md` with annotations (what it covers, when to use it).
3. Cite resources in every lesson — link claims to sources.
4. If no good source exists for a mission-critical area, add a `## Gaps` section in `RESOURCES.md`.

Do not present unsourced factual claims as settled when teaching a new topic.

## Lessons

The main deliverable. One self-contained file per lesson, numbered sequentially:

- `lessons/0001-<dash-case-name>.html` (preferred)
- `lessons/0001-<dash-case-name>.md` (acceptable when HTML is impractical)

### HTML lessons (preferred)

Beautiful, readable, print-friendly layout (Tufte-inspired). Include:

- Scoped content tied to `MISSION.md` and zone of proximal development
- One tangible win per lesson; stay within working-memory limits
- Links (HTML anchors) to other lessons and `reference/` docs
- A **primary source** link for deeper reading
- A reminder to ask follow-up questions — you are the teacher
- Interactive elements when useful: quizzes, short exercises, guided steps

Self-contained HTML with embedded CSS is fine (no build step required).

### Markdown lessons (fallback)

Use when the harness or environment makes HTML awkward. Same content requirements; use relative links to other lessons and references.

### After creating a lesson

1. Write a learning record if the user demonstrated understanding (see [LEARNING-RECORD-FORMAT.md](./LEARNING-RECORD-FORMAT.md)).
2. Update `GLOSSARY.md` when the user can use a term correctly.
3. Open the lesson for the user when possible:

```bash
# macOS
open "lessons/0001-example.html"
# Linux
xdg-open "lessons/0001-example.html" 2>/dev/null || true
```

If open fails, tell the user the path.

## Mission

Every lesson traces to `MISSION.md`. If the mission is vague, interview before teaching.

Mission changes are normal. Update `MISSION.md`, add a learning record, and **confirm with the user** before changing direction.

## Zone of proximal development

Each lesson should challenge the user *just enough*.

If they name a specific topic, teach that (if mission-aligned). Otherwise:

1. Read `learning-records/` and `GLOSSARY.md`
2. Infer the next step from `MISSION.md`
3. Teach the most relevant thing in their ZPD

## Knowledge in lessons

Lessons center on a **skill** the user will practice. Include only knowledge required for that skill — teach knowledge first, then practice via a tight feedback loop.

For knowledge acquisition, **lower difficulty** — working memory is scarce.

## Skills in lessons

For skill acquisition, **use difficulty** — effortful retrieval builds storage strength.

Interactive patterns (pick what fits the harness):

- In-lesson quizzes with immediate feedback
- Chat-based retrieval ("explain X without looking at the lesson")
- Guided real-world steps (poses, CLI commands, etc.)

**Feedback loop:** as tight as possible; immediate and specific.

**Quizzes:** when using multiple choice, keep answer options the same length (words and characters if possible) so formatting does not leak the answer.

When the harness has no browser, run quizzes and exercises in the conversation and score answers explicitly.

## Acquiring wisdom

Wisdom comes from practice outside the lesson. When questions need lived experience:

1. Attempt a grounded answer from `RESOURCES.md`
2. Point the user to a **community** (forum, subreddit, class, local group) from `RESOURCES.md`
3. Respect if the user opts out of communities — note that in `RESOURCES.md`

## Reference documents

While teaching, build `reference/` artifacts — compressed units reused across lessons:

- Syntax and snippets (programming)
- Algorithms and flowcharts (processes)
- Glossaries (any specialized nomenclature)
- Pose sequences, exercise routines, etc.

Lessons are visited once; references are revisited often. Keep references scannable.

Once `GLOSSARY.md` exists, use its terms consistently in all lessons.

## NOTES.md

Record user preferences here: pacing, format (HTML vs markdown), depth, topics to avoid, community preferences. Read before designing new lessons.

## Session continuity

At the start of each session:

1. Re-read `MISSION.md`, latest learning records, and `NOTES.md`
2. Summarize where the learner left off in one or two sentences
3. Propose the next lesson or ask what they want to focus on

At the end of a session, state what was covered and what file(s) were created or updated.
