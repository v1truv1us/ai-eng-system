# research-runner

Runs all 9 research query templates from `wiki/research-runner.md` in parallel against a single question, then writes a dated brief to `wiki/briefs/YYYY-MM-DD.md`.

Five variants — same template loop, different harness:

| Variant | Runtime | Harness |
|---------|---------|---------|
| `anthropic/` | Python 3.11+ or Node 20+ | `anthropic` SDK / `@anthropic-ai/claude-agent-sdk` |
| `codex/` | Node 20+ | `@openai/agents` (OpenAI Agents SDK) |
| `cursor/` | Node 20+ | `@cursor/sdk` |
| `opencode/` | Node 20+ | `@opencode-ai/sdk` |
| `pi/` | Node 20+ | `pi` CLI via `child_process` |

Shared code: `shared/templates.ts`, `shared/output.ts`, `shared/workflow-contract.ts` (target `WorkflowInput` / `WorkflowResult` for new workflows).

CLI surface:

```bash
ai-eng workflow list
ai-eng workflow run research --runtime pi "your research question"
ai-eng workflow run research --runtime cursor --agent reviewer --templates A1,M2 "targeted question"
```

`--agent` is passed as an additional instruction/persona to the runner. It is not a separate SDK object for every runtime.

Matching skills: `skills/claude-agent-sdk`, `openai-agents-sdk`, `cursor-sdk`, `opencode-sdk`, `pi-agent-sdk` (see `docs/reference/skills.md`).

---

## Setup

### Vault path

Templates and briefs are read/written from your Obsidian vault. The default path is:

```
~/Library/CloudStorage/ProtonDrive-john.ferguson@unfergettabledesigns.com-folder/Obsidian
```

Override with the `VAULT_PATH` env var if your vault is elsewhere.

### anthropic/

```bash
cd anthropic
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...
python runner.py "your research question"
```

TypeScript variant: `npx tsx runner.ts "your research question"`.

### codex/

```bash
cd codex
npm install
npx tsx runner.ts "your research question"
npx tsx runner.ts --templates A1,M2 "targeted question"
```

Uses OpenAI OAuth from `~/.pi/agent/auth.json` when `OPENAI_API_KEY` is unset.

### cursor/

```bash
cd cursor
npm install
export CURSOR_API_KEY=...   # or .env
npx tsx runner.ts "your research question"
```

### opencode/

Requires OpenCode installed: https://opencode.ai

```bash
cd opencode
npm install
npx tsx runner.ts "your research question"
```

### pi/

Requires Pi CLI on PATH: https://github.com/badlogic/lemmy

```bash
cd pi
npm install
npx tsx runner.ts "your research question"
```

All variants support `--templates A1,M2` to run a subset and `--agent <instruction>` to add an agent/persona instruction.

---

## Output

All variants write to:

```
$VAULT_PATH/wiki/briefs/YYYY-MM-DD.md
```

If today's brief already exists, the new run is appended.

---

## Synthesis (optional)

By default, results are concatenated with no extra API call. To add a "Key Takeaways" paragraph, implement `synthesize()` in `shared/output.py` or `shared/output.ts` (see TODO comments there).

---

## Template IDs

| ID | Category | Purpose |
|----|----------|---------|
| A1 | Agentic AI | Tool-use policy design |
| A2 | Agentic AI | Multi-agent coordination |
| A3 | Agentic AI | Failure / limits analysis |
| M1 | ML systems | Architecture decision |
| M2 | ML systems | Monitoring / drift detection |
| W1 | Web / dev tools | Search / recommendation / personalization |
| W2 | Web / dev tools | Dev-tool decision policy |
| X1 | Cross-cutting | Anchor-and-extend framework test |
| X2 | Cross-cutting | Theoretical floor analysis |

---

## Verification

```bash
cd opencode && npx tsx -e "
import { loadTemplates } from '../shared/templates.ts';
console.log(loadTemplates().templates.map(t => t.id));
"
```

Expected: `['A1', 'A2', 'A3', 'M1', 'M2', 'W1', 'W2', 'X1', 'X2']`
