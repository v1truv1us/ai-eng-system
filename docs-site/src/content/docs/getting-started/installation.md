---
title: Installation
description: Install ai-eng-system for Claude Code or OpenCode platforms
---

# Installation

Install ai-eng-system for Claude Code or OpenCode platforms.

---

## Prerequisites

Node.js 18+ required. Python 3+ needed for hooks.

---

## npm Installation

Install globally: `npm install -g ai-eng-system`

Install locally: `npm install ai-eng-system`

---

## Build System

Build from source: `bun run build`

Watch mode: `bun run build:watch`

---

## Hook Installation

Run install script: `node scripts/install.js`

Hooks placed in `.claude/hooks/` automatically

Existing hooks backed up with timestamp

---

## Verification

Check build artifacts: `ls -la dist/`

Verify hooks: `ls -la .claude/hooks/`

Run tests: `node scripts/integration-test.js`
