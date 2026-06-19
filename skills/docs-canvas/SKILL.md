---
name: docs-canvas
description: Render a documentation-style Cursor Canvas that organizes architecture notes, API references, walkthroughs, and how-tos into a navigable layout with sections, tables of contents, and cross-references. Use when the user asks for a docs canvas, documentation overview, architecture walkthrough, API reference page, or wants to render structured documentation as an interactive canvas.
metadata:
  category: model-invoked
  version: 1.0.0
  tags: cursor-import, docs-canvas
---

## Pi Context-Aware Execution

When this skill is invoked in Pi, treat the user's current request and any skill arguments as the task input. Do not treat this file as the task by itself.

Before applying the skill, establish only the context needed for the request:

1. Identify the current working directory and relevant project scope.
2. Read local guidance first when present: AGENTS.md, CLAUDE.md, TODO.md, or nearby task/spec files.
3. Inspect the current codebase with targeted searches (prefer rg) and read relevant files before making claims or proposing changes.
4. Ground findings and recommendations in project evidence: cite file paths, commands, tests, docs, or external sources as applicable.
5. Ask a concise clarification only when the arguments and codebase context are insufficient to proceed safely.

Operate conservatively: avoid broad scans, large reads, subagents, or parallel fanout unless the user's requested depth clearly requires them.
# Docs Canvas

Build a canvas that presents documentation — architecture notes, API references, design docs, runbooks, or codebase walkthroughs — as an interactive, navigable surface rather than as a flat markdown file.

> **Status:** placeholder. The skill structure is in place so the canvas
> welcome page can surface this plugin via the marketplace query, but the
> full skill body still needs to be written. Treat the steps below as a
> starting outline and refine as the docs canvas pattern matures.

## Prerequisites

Read `~/.cursor/skills-cursor/canvas/SKILL.md` first. It contains the generation policy, design guidance, slop rules, self-check, and file-path conventions you must follow. The full component and hook surface is declared in `~/.cursor/skills-cursor/canvas/sdk/index.d.ts` and its sibling `.d.ts` files — read them to discover exact exports and prop shapes rather than guessing.

## Gather the source material

Accept any of: a directory of markdown files, a single doc URL, an inline outline, or a question to answer from the codebase. Collect headings, code blocks, diagrams, and any cross-references between documents.

## Plan the canvas layout

Decide the top-level structure before writing any components. A docs canvas usually has:

1. **Overview** — A short summary card with the purpose of the doc, scope, and audience.
2. **Table of contents** — Navigable list of sections, ideally pinned or sticky so the reader can jump around.
3. **Body sections** — One section per logical unit (architecture, API, examples, gotchas). Each section can mix prose, code blocks, diagrams, and callouts.
4. **References** — Links to related docs, source files, RFCs, and external material.

## Render with canvas primitives

Prefer built-in canvas components over raw HTML:

- Use cards/sections to group related content visually.
- Use code blocks with syntax highlighting for snippets.
- Use diagrams (DAG layout, mermaid) for architecture.
- Use callouts for "Important", "Warning", "Note", "Deprecated".
- Use tables for API parameter lists and option matrices.

## Tone and content

Write reader-facing prose. Lead with the answer or the headline, then explain. Keep examples small and runnable. Cite source files with `code references` so readers can jump in.

## Be creative

The sections above are a floor, not a ceiling. The goal is the fastest possible path for the reader to understand the topic — so look at the source material in front of you and ask what representation would actually help. A diagram, a sequence chart, a side-by-side comparison, a decision tree, a glossary, a curated FAQ, a single large worked example — whatever fits.
