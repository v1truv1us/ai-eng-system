---
title: Installation
description: Install ai-eng-system for Claude Code or OpenCode using the published CLI package
---

# Installation

Install ai-eng-system for Claude Code or OpenCode using the published CLI package.

## Prerequisites

- Node.js 20+
- Bun for local development from source
- Python 3 if you plan to use Claude hook helpers locally

## End-user Install

```bash
npm install -g @ai-eng-system/cli
```

Install packaged assets into the current project:

```bash
ai-eng install --scope project
```

Or install into your global OpenCode directory:

```bash
ai-eng install --scope global
```

## Claude Code Marketplace Install

```bash
/plugin marketplace add v1truv1us/ai-eng-system
/plugin install ai-eng-system@ai-eng-marketplace
```

## Build From Source

```bash
bun install
bun run build
```

## Verification

```bash
ai-eng --help
bun run build
```
