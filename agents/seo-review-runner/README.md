# seo-review-runner

Reviews a URL for SEO, performance, accessibility, structured data, and technical SEO issues.

Five variants — same SEO prompt, different harness:

| Variant | Runtime | Harness |
|---------|---------|---------|
| `anthropic/` | Node 20+ | `@anthropic-ai/claude-agent-sdk` |
| `codex/` | Node 20+ | `@openai/agents` (OpenAI Agents SDK) |
| `cursor/` | Node 20+ | `@cursor/sdk` |
| `opencode/` | Node 20+ | `@opencode-ai/sdk` |
| `pi/` | Node 20+ | `pi` CLI via `child_process` |

Shared code: `shared/prompt.ts` — `buildPrompt`, `parseArgs`, and `writeReport` used by all runners.

CLI surface:

```bash
ai-eng workflow list
ai-eng workflow run seo-review --runtime anthropic "https://example.com"
ai-eng workflow run seo-review --runtime pi --agent technical-seo "https://example.com"
```

`--agent` is passed as an additional instruction/persona. It is not a separate SDK object.

Matching skills: `skills/seo-audit` (Lighthouse-style audit), `skills/claude-agent-sdk`, `openai-agents-sdk`, `cursor-sdk`, `opencode-sdk`, `pi-agent-sdk`.

---

## Output

Each variant writes a markdown report to:

```
.ai-eng/reports/seo-review-<host>-YYYY-MM-DD-<runtime>.md
```

The report includes:
1. Summary
2. Evidence gathered (what could and could not be fetched)
3. Critical issues
4. Warnings
5. Suggestions
6. Prioritized recommendations
7. Confidence score (0.0–1.0)

Runners that cannot browse the live URL (e.g. `anthropic` with `allowedTools: []`) report a low confidence score and provide stack-based inference rather than inventing measurements.

---

## Setup

### anthropic/

```bash
cd anthropic
npm install
export ANTHROPIC_API_KEY=sk-...
npx tsx runner.ts "https://example.com"
```

### codex/

```bash
cd codex
npm install
npx tsx runner.ts "https://example.com"
```

Uses OpenAI OAuth from `~/.pi/agent/auth.json` when `OPENAI_API_KEY` is unset.

### cursor/

```bash
cd cursor
npm install
export CURSOR_API_KEY=...   # or .env
npx tsx runner.ts "https://example.com"
```

### opencode/

Requires OpenCode installed: https://opencode.ai

```bash
cd opencode
npm install
npx tsx runner.ts "https://example.com"
```

### pi/

Requires Pi CLI on PATH.

```bash
cd pi
npx tsx runner.ts "https://example.com"
```

All variants support `--agent <instruction>` to add a reviewer persona (e.g. `--agent technical-seo`).

---

## Notes

- Runners do not install Lighthouse or crawl with a browser themselves.
- For deterministic Lighthouse scores, run `npx lighthouse <url>` before the runner and pass the results as context.
- The `pi` runtime has live browsing available via Pi's built-in tools; other runtimes use knowledge-only analysis unless extended with tools.
