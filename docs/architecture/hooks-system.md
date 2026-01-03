# Hooks System

Prompt optimization via Claude Code hooks.

---

## Hook Implementation

Python script intercepts user prompts

Applies research-backed optimization techniques

Rewrites prompt before model receives it

---

## Optimization Flow

Detect prompt complexity and domain

Select appropriate techniques

Persona, reasoning, stakes, self-evaluation

Return optimized prompt

---

## Escape Hatch

Prefix with `!` to bypass optimization

Handled at hook level

Original prompt used unchanged

---

## Configuration

Reads from `.claude/ai-eng-config.json`

Respects enabled flag

Honors verbosity and auto-approve settings

---

## Marketplace Integration

Hooks bundled in plugin package

Install script places in consumer projects

Backup existing hooks automatically
