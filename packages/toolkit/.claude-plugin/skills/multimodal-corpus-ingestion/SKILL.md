---
name: multimodal-corpus-ingestion
description: Normalize mixed inputs like code, docs, PDFs, screenshots, diagrams, audio, and transcripts into a structured corpus. Use when the task depends on combining multiple artifact types before analysis or retrieval.
---

# Multimodal Corpus Ingestion

## Overview

Mixed corpora break down when everything is treated like plain text. Ingest code, prose, visuals, and transcripts according to what each artifact can actually tell you, then normalize them into one corpus with provenance intact.

## When to Use

- A task spans code, docs, PDFs, screenshots, or diagrams
- You need one queryable corpus instead of scattered files
- The user gives a folder with mixed artifact types
- Architecture or product understanding depends on visuals and prose together
- Retrieval quality is poor because source types are inconsistent

## Source Classes

### Structural Sources

Use deterministic extraction first:
- Code: symbols, imports, calls, classes, comments
- SQL: tables, columns, foreign keys
- JSON or YAML: keys, references, configuration relationships

### Prose Sources

Extract concepts and claims:
- Markdown, docs, ADRs, tickets, papers, PDFs
- Preserve section headers and nearby evidence

### Visual Sources

Extract labeled structure, not generic captions:
- Screenshots
- Diagrams
- Whiteboard photos
- UI flows

### Audio and Video Sources

Transcribe first, then treat the transcript as prose:
- Meeting recordings
- Demo videos
- Screencasts

## Process

### Step 1: Inventory the Corpus

List inputs by type and extraction mode:
- Deterministic
- LLM-assisted
- Vision-assisted
- Transcription-first

Do not start with one giant prompt containing every artifact.

### Step 2: Normalize Records

Create one record format for every source:

```json
{
  "id": "doc:adr-001",
  "kind": "markdown",
  "path": "docs/decisions/2026-01-15-auth.md",
  "title": "Auth ADR",
  "summary": "Why session tokens were chosen",
  "entities": ["session token", "refresh token"],
  "evidence": ["section: Decision", "section: Tradeoffs"]
}
```

Always preserve:
- Source path or URL
- Artifact type
- Extraction method
- Evidence location

### Step 3: Extract the Right Signals

Favor the smallest correct extraction:
- Code: structure and relationships
- Docs: concepts, decisions, constraints
- Diagrams: nodes, labels, arrows, captions
- PDFs: headings, key entities, cited terms

Avoid turning every source into flat chunks with no type information.

### Step 4: Attach Provenance

Every normalized record should answer:
- Where did this come from?
- How was it extracted?
- What evidence supports it?
- How confident are we in the extraction?

### Step 5: Bound the Pipeline

Before large ingests, define limits:
- Maximum file size
- Maximum remote download size
- Timeout per artifact
- Skip rules for binaries and vendor folders

## Extraction Heuristics

| Source | First Pass | Second Pass |
|---|---|---|
| Code | AST or regex structure | semantic labeling |
| Markdown or docs | headings and sections | entity extraction |
| PDF | text extraction | concept extraction |
| Diagram | OCR and labels | relationship extraction |
| Audio or video | transcription | concept extraction |

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Just chunk everything" | Flattening loses structure, modality, and provenance. |
| "Images are optional context" | Architecture and intent often live only in screenshots or diagrams. |
| "One extraction pass is enough" | Different sources need different extraction methods. |

## Verification

- [ ] Every artifact type has an explicit extraction path
- [ ] Normalized records preserve provenance
- [ ] Source-specific structure is kept where possible
- [ ] Large or remote inputs are bounded by size and time
- [ ] The resulting corpus can be queried without rereading raw files
