---
name: idea-refine
description: Structured divergent/convergent thinking to turn vague ideas into concrete proposals. Use when you have a rough concept that needs exploration before committing to a spec.
---

# Idea Refine

## Overview

Turn vague product ideas or technical concepts into concrete, evaluable proposals through structured divergent and convergent thinking. This skill runs before `spec-driven-development` when the problem space is still ambiguous.

## When to Use

- A feature request is vague or open-ended
- You have competing approaches and need to evaluate tradeoffs
- A stakeholder describes a problem without a clear solution
- You need to explore the design space before committing to a direction

## Process

### Step 1: Problem Framing

State the problem clearly:
- Who is affected
- What outcome they need
- What constraints exist
- What success looks like

### Step 2: Divergent Exploration

Generate multiple approaches without judgment:
- List at least three substantially different solutions
- Include at least one unconventional approach
- Note assumptions each approach depends on
- Identify risks unique to each approach

### Step 3: Convergent Evaluation

Score each approach against:
- User impact: how well it solves the stated problem
- Implementation cost: time, complexity, and dependencies
- Risk: what could go wrong and how recoverable it is
- Extensibility: how well it supports future related work

### Step 4: Proposal

Write a concise proposal covering:
- Recommended approach and why
- Key tradeoffs accepted
- Assumptions that need validation
- Open questions for the team

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The first idea is usually fine" | First ideas tend to be the most obvious, not the most effective. |
| "We can refine later" | Later refinement is more expensive than early exploration. |
| "This is too small for structured thinking" | Even small features benefit from a minute of structured evaluation. |

## Verification

- [ ] Problem is stated clearly with affected users
- [ ] At least three approaches were considered
- [ ] Each approach was scored against consistent criteria
- [ ] A clear recommendation exists with accepted tradeoffs documented

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "The first idea is usually fine" | First ideas tend to be the most obvious, not the most effective. |
| "We can refine later" | Later refinement is more expensive than early exploration. |
| "This is too small for structured thinking" | Even small features benefit from a minute of structured evaluation. |
| "Three approaches is too many for this" | Two approaches is the minimum for comparison. Three reveals non-obvious options. |
| "The stakeholder already knows what they want" | Stakeholders describe problems, not solutions. Explore the solution space. |
