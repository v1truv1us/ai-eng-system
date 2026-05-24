# research-runner/pi

Runs research templates using the `pi` CLI coding agent.

## Prerequisites

The `pi` binary must be installed globally and available on your `PATH`.  
Install from: https://github.com/badlogic/lemmy

```bash
# Check it's available:
which pi
pi --version
```

## Setup

```bash
# Install JS dependencies (tsx, typescript)
npm install

# Copy and fill in env vars
cp .env.example .env  # or edit .env directly
```

`.env` needs:
- `VAULT_PATH` — path to your Obsidian vault (already set)
- `ANTHROPIC_API_KEY` — only needed if you want the synthesize() fallback via API rather than claude CLI; leave empty to use the claude CLI

## Usage

```bash
npx tsx runner.ts "your research question"
npx tsx runner.ts --templates A1,M2 "targeted question"
```
