---
title: Contributing
---

# Contributing

Contribute to ai-eng-system project.

---

## Development Setup

Clone repository

Install dependencies: `bun install`

Build project: `bun run build`

Run tests: `bun test`

---

## Code Style

Use TypeScript for source files

Follow existing naming conventions

Remove trailing semicolons in JS/TS

Apply text-cleanup to documentation

---

## Adding Agents

Create agent in content/agents/<name>.md

Include frontmatter with name, description, mode

Add to AGENTS.md documentation

Build and test: `bun run build && bun test`

---

## Adding Commands

Create command in content/commands/<name>.md

Follow command template format

Document usage in command file

Build and test: `bun run build && bun test`

---

## Submitting Changes

Create feature branch

Make commits with descriptive messages

Open pull request with description

Include tests for new features
