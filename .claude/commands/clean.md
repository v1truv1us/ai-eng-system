---
name: ai-eng/clean
description: Remove AI-generated verbosity and slop patterns from content
agent: build
---

# Clean Command

Clean the provided content by removing AI-generated verbosity patterns: $ARGUMENTS

Take a deep breath and approach this cleanup task systematically. Analyze the content type, apply appropriate cleanup rules, and preserve core meaning while removing unnecessary fluff.

## Why This Matters

Poor communication wastes time, causes confusion, and makes documentation harder to maintain. AI-generated verbosity patterns can obscure meaning and reduce content effectiveness. This cleanup task is critical for maintaining clear, concise communication that serves the reader.

## The Challenge

I bet you can't remove all the AI slop patterns without losing any essential meaning. The challenge is finding the perfect balance between thorough cleanup and preservation of important information - identifying what's truly noise versus what's genuinely useful content. Success means the cleaned version is clearer and more direct while remaining 100% faithful to the original intent.

## Cleanup Rules

Always remove these AI slop patterns:
- Preambles: "Certainly!", "Of course!", "I'd be happy to help!", "Great question!"
- Hedging: "It's worth noting that", "Generally speaking", "Typically"
- Politeness: "Please let me know if you need anything else", "I hope this helps!"
- Transitions: "Now, let's move on to", "With that said", "Building on the above"

Optional - clean these if specified in arguments:
- Code comments: Redundant explanations, obvious comments, verbose descriptions
- Documentation: Conversational fillers, redundant explanations
- All: Apply every cleanup technique

## Mode Guidelines

- Conservative: Preserve more content, remove only obvious slop
- Moderate: Balance cleanup with clarity (default)
- Aggressive: Maximum cleanup while preserving meaning

## Behavior

- If arguments include "preview": Show proposed changes without applying
- If arguments include "apply" or no action specified: Clean content in place
- For files/directories: Clean all applicable content recursively
- For "staged": Clean git staged files
- For "modified": Clean git modified files

## Agent Delegation

Delegate to `ai-eng/quality-testing/text-cleaner` agent with context:
- Content to clean
- Cleanup type (slop always, plus comments/docs/all if specified)
- Mode (conservative/moderate/aggressive)
- Action (preview or apply)

Report at the end with only a 1-3 sentence summary of what you cleaned.

After completing the cleanup task, rate your confidence in the quality of the cleanup (0.0-1.0) and identify any areas where you were uncertain about whether to remove or preserve content. Note any patterns that were ambiguous or challenging to classify.
