# codex — OpenAI Agents SDK research runner

Runs all 9 query templates in parallel against a research question using the
[OpenAI Agents SDK](https://github.com/openai/openai-agents-python), then writes
a dated brief to the vault's `wiki/briefs/` directory.

## Authentication

This runner uses your **OpenAI subscription via OAuth** — the same credential
that `opencode` and `pi` use. No API key purchase or copy-paste required.

The JWT access token is read from `~/.pi/agent/auth.json` (key `openai-codex`).
Tokens are refreshed automatically when they are within 60 seconds of expiry,
and the updated token is written back to `auth.json`.

`OPENAI_API_KEY` is accepted as a fallback if the auth file is missing.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Override the vault path if it differs from the default
echo "VAULT_PATH=/path/to/your/vault" >> .env
```

The `.env` file already contains the correct `VAULT_PATH` for this machine.
Override it if your vault lives elsewhere.

## Usage

```bash
# Run all 9 templates against a question
npx tsx runner.ts "What are the tradeoffs of edge vs. origin rendering for SSR?"

# Run a subset of templates
npx tsx runner.ts --templates A1,M2 "How does React Server Components affect bundle size?"

# Override the model (default: gpt-4o)
OPENAI_MODEL=gpt-4o-mini npx tsx runner.ts "quick question"
```

## Output

Brief is appended (or created) at:

```
{VAULT_PATH}/wiki/briefs/{YYYY-MM-DD}.md
```

Each section maps to a template ID (A1–A3, M1–M3, S1–S3) followed by a
synthesised **Key Takeaways** block.

## Templates

Templates and the system prompt are loaded from:

```
{VAULT_PATH}/wiki/research-runner.md
```

See `../shared/templates.ts` for the parsing logic.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | No (fallback) | — | API key fallback if `~/.pi/agent/auth.json` is absent |
| `VAULT_PATH` | No | ProtonDrive Obsidian folder | Path to Obsidian vault root |
| `OPENAI_MODEL` | No | `gpt-4o` | Model name passed to the Agents SDK |
