---
name: auto-research
description: Premier research workflow for systematic investigation, synthesis, and verification. Use for literature reviews, competitive analysis, deep dives, market research, or any task requiring structured research with source attribution.
---

# Auto Research

Systematic research orchestration for pi. Replaces Claude CoWork research workflows with a native pi skill set.

## Workflow

```
Clarify → Investigate → Synthesize → Validate → Output
```

### 1. Clarify Scope

Before researching, confirm with the user:
- What questions need answering?
- What are the boundaries?
- What depth is needed?
- What format for output?

### 2. Investigate

Use the best tool for the source type:

| Source Type | Tool |
|-------------|------|
| Web docs, APIs, current info | `intelli_research` from intelli-search skill |
| Specific URLs | `web_fetch` from pi-browse |
| Local files | `read` |
| Multiple local files | Batch `read` or `rg` |
| GitHub repos | Clone and `read` |

Always use `intelli_research` with a `focusPrompt`. Without it, extractions are generic.

### 3. Synthesize

Organize findings:
- Group by theme or question
- Identify patterns, consensus, debates
- Note contradictions between sources
- Distinguish fact from interpretation

### 4. Validate

- Cross-reference key claims across multiple sources
- Assess source reliability (peer-reviewed > official > journalism > blog > forum)
- Flag uncertainty rather than guessing
- Mark speculative claims as such

### 5. Output

Choose the right output format based on depth needed.

## Output Formats

### Research Brief (Quick)

```markdown
## Research Brief: [Topic]
**Date**: [Date] | **Confidence**: [Level]

### Key Findings
1. [Finding with source]
2. [Finding with source]

### Sources
- [Source](url) - [Brief description]

### Next Steps
- [Follow-up recommendations]
```

### Comprehensive Report (Deep)

```markdown
## [Title]

### Executive Summary
[2-3 paragraph overview]

### Background
[Context and importance]

### Methodology
[How research was conducted]

### Findings
[Detailed with inline citations]

### Analysis
[Interpretation and synthesis]

### Limitations
[Acknowledged constraints]

### References
[Full citations]
```

### Verification Report (Fact-Check)

```markdown
## Verification: [Claim]

**Verdict**: [VERIFIED / PARTIALLY VERIFIED / UNVERIFIED / CONTRADICTED]

### Evidence
| Source | Claim | Confidence |
|--------|-------|------------|
| [Name] | [Quote] | H/M/L |

**Confidence**: [H/M/L with reasoning]
```

## Source Markers

Use inline markers to indicate source type:
- `[A]` Academic / peer-reviewed
- `[O]` Official / government / primary
- `[N]` News / journalism
- `[I]` Industry / technical docs
- `[E]` Expert opinion / blog

## Knowledge Types

Label every factual claim:
- `FACT`: Verifiable with direct source
- `LIKELY`: Consistent with multiple sources
- `SPECULATIVE`: Based on reasoning, not direct evidence
- `UNKNOWN`: Beyond current knowledge, stated clearly

## File Organization

For multi-session research, use this structure:

```
/Research/
└── [Project]/
    ├── 01-sources/      # PDFs, notes, source materials
    ├── 02-analysis/     # Analysis documents
    ├── 03-synthesis/    # Synthesized findings
    └── 04-output/       # Final reports
```

Naming conventions:
- Sources: `YYYY-MM-DD_[topic]_source.[ext]`
- Analysis: `YYYY-MM-DD_[topic]_analysis.md`
- Outputs: `[topic]_report_[version]_[date].md`

## Research Task Templates

### Literature Review
> Analyze all documents in this folder as a literature review on [topic]. For each source, extract: main thesis, methodology, key findings, and how it connects to other sources. Identify consensus and debates.

### Competitive Analysis
> Research [topic/competitor] using all available sources. Create a competitive analysis covering: market position, key offerings, strengths, weaknesses, and differentiation. Include source citations.

### Fact Verification
> Verify the following claims: [list claims]. For each, provide: verification status, supporting evidence, source quality assessment, and confidence level.

### Deep Research
> Conduct comprehensive research on [topic]. Include: executive summary, key findings with source attribution, analysis and implications, limitations and uncertainties, recommendations for further research. Cite all sources with URLs.
