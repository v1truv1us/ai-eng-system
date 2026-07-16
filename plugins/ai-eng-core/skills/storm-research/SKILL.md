---
name: storm-research
description: "Stanford STORM multi-perspective research method. Runs four sequential phases (multi-perspective scan, contradiction map, synthesis, peer review) in one thread to produce a PhD-level briefing on any topic. Use for \"storm research X\", \"multi-perspective research\", \"STORM method\", or any topic where a single-prompt answer is too shallow."
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# STORM Research

Stanford OVAL's STORM method (Synthesis of Topic Outlines through Retrieval and Multi-perspective Question Asking, NAACL 2024), distilled into four sequential prompts run in one thread.

Peer-reviewed result: articles built from multiple perspectives were **25% more organized** and **10% broader** than single-prompt research. The breakthrough is multi-perspective questioning — it catches blind spots a single framing never sees.

## When to use

- A single-prompt answer feels shallow or one-sided
- You need to understand a topic the way a PhD student would, not the way a search box would
- Before a decision, investment, negotiation, article, interview, or presentation
- When you suspect the mainstream framing is missing incentives, skeptics, or history

Do **not** use for: a quick factual lookup (use `intelli_search`), or exhaustive multi-source web research with citations (use the `auto-research` or `deep-web-research` skill).

## Inputs

Before starting, get from the user:
- **TOPIC** — the subject to research
- **ROLE** *(optional)* — whose action the synthesis should land on (e.g. "engineering manager", "founder", "investor"). Defaults to "a curious expert" if omitted.

If either is missing, ask once. Do not guess.

## How it runs

This skill runs **four phases sequentially in one thread**. Each phase's output becomes the input context for the next. Do not skip phases, do not reorder, do not collapse them into one prompt — the method's value comes from each phase seeing the prior phase's output.

You may write each phase to a file if the user wants a durable artifact (see Output below). Otherwise keep everything in the thread.

At the start, tell the user: *"Running STORM on [TOPIC]. Four phases: scan → contradictions → synthesis → peer review. I'll pause briefly between phases."*

---

## Phase 1 — Multi-Perspective Scan

Goal: surface five different expert reads of the same topic.

Use the persona definitions below. Replace `[TOPIC]`. For each perspective produce: **core position (2 sentences)**, **strongest supporting evidence**, and **the one thing only this perspective would say**.

```
I need to research [TOPIC].
Simulate 5 different expert perspectives on this topic:

1. THE PRACTITIONER: works with this daily.
   What do they know that academics miss?
   What practical realities are usually ignored?
2. THE ACADEMIC: has studied this for years.
   What does the peer reviewed evidence actually say?
   Where does the evidence contradict popular belief?
3. THE SKEPTIC: thinks the mainstream view is wrong.
   What is the strongest counterargument?
   What evidence do proponents conveniently ignore?
4. THE ECONOMIST: follows the money.
   Who profits from the current narrative?
   What financial incentives shape the research?
5. THE HISTORIAN: has seen similar patterns before.
   What historical parallels exist?
   What can we learn from how those played out?

For each perspective give me:
- Their core position in 2 sentences
- The strongest evidence supporting their view
- The one thing they would tell me that no other perspective would
```

When done, label the section **## Phase 1: Multi-Perspective Scan** and move to Phase 2.

---

## Phase 2 — Contradiction Map

Goal: find where the five voices fight, where they agree, and where none of them looked. The fights and the blind spots are where real understanding lives.

Run against the Phase 1 output:

```
Based on the 5 perspectives above, map the contradictions:
1. Where do two or more perspectives directly contradict
   each other? List each conflict with the specific claims
   that clash.
2. Which perspective has the strongest evidence?
   Which has the weakest? Why?
3. What is the one question that, if answered, would
   resolve the biggest contradiction?
4. What does EVERY perspective agree on?
   (This is likely true. Even opponents confirm it.)
5. What topic did NONE of the perspectives address?
   (This is the blind spot in the whole field.
   Often the most valuable finding.)
```

Rules of thumb to apply while mapping:
- **Unanimous agreement** across adversarial perspectives → likely true. Mark it.
- **A topic nobody addressed** → the field's blind spot. Flag it as the highest-value finding.

Label the section **## Phase 2: Contradiction Map** and move to Phase 3.

---

## Phase 3 — Synthesis

Goal: pull everything into a single briefing. Replace `[ROLE]`.

```
Synthesize everything from the 5 perspectives and the
contradiction map into a research briefing:
1. THE ONE PARAGRAPH SUMMARY: explain this topic as if
   briefing a CEO who has 60 seconds and needs nuance,
   not just the headline.
2. THE 5 KEY FINDINGS: most important things I now know,
   ranked by reliability. For each, note which perspectives
   support it and which challenge it.
3. THE HIDDEN CONNECTION: one non obvious link between
   findings that only shows up when you look at all 5
   perspectives together.
4. THE ACTIONABLE INSIGHT: based on all the evidence,
   what should someone in [ROLE] actually DO
   differently? Be specific.
5. THE FRONTIER QUESTION: the one question that, if
   answered, would change everything about how we
   understand this topic.
```

Label the section **## Phase 3: Synthesis** and move to Phase 4.

---

## Phase 4 — Peer Review

Goal: STORM's known weakness (flagged by Stanford itself) is that it doesn't self-critique — source bias and fact misassociation sneak in. This phase makes the agent grade its own work.

```
Now peer review your own research briefing:
1. CONFIDENCE SCORES: rate each of the 5 key findings
   on a 1 to 10 scale for reliability. Explain each score.
2. WEAKEST LINK: which claim are you least confident in?
   What specific info would you need to verify it?
3. BIAS CHECK: which perspective might be overrepresented
   in your synthesis? Did one voice dominate?
4. MISSING PERSPECTIVE: is there a 6th angle I should
   have included that would change the conclusions?
5. OVERALL GRADE: if a Stanford professor reviewed this
   briefing, what grade would they give and why?
   What would they tell me to fix?
```

Label the section **## Phase 4: Peer Review**.

---

## Output

At the end, the thread contains all four phases. Offer the user:

- A **summary line**: topic, role, overall grade from Phase 4.
- If they want a durable artifact, write all four phases to a single file at `Research/STORM/[topic]-[YYYY-MM-DD].md` (create dirs as needed). Use the naming convention from `auto-research`.

Do not present the briefing as definitive fact. Carry forward the confidence scores and bias notes from Phase 4 — they are part of the output, not a footnote.

## Variants

- **With live sources** — before Phase 1, run `intelli_research` on the topic to ground the five perspectives in current sources. Slower, more accurate, citations available. Use when the topic moves fast (markets, recent events, versioned software).
- **Parallel personas** — instead of running the five perspectives in one thread, fan them out as five subagents (one per persona) and collate. Heavier, but each persona gets full context budget. Use only when the topic is large and a single thread is running thin.

## Provenance

- **Source**: "The Stanford STORM Method — How to Make Claude Research Like a PhD in Minutes" (Obsidian note).
- **Paper**: STORM, Stanford OVAL, NAACL 2024.
- **Code**: github.com/stanford-oval/storm (MIT).
- **Live**: storm.genie.stanford.edu (free).
- **Reported gains**: +25% organization, +10% breadth vs single-prompt research (per the note; treat as the article's summary of the paper, not independently verified here).
