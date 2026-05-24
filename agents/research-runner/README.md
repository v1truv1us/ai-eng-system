# research-runner

Runs all 9 research query templates from `wiki/research-runner.md` in parallel against a single question, then writes a dated brief to `wiki/briefs/YYYY-MM-DD.md`.

Three variants — same logic, different SDK:

| Variant | Runtime | SDK |
|---------|---------|-----|
| `anthropic/` | Python 3.11+ | `anthropic` (AsyncAnthropic) |
| `opencode/` | Node 20+ | `@opencode-ai/sdk` |
| `pi/` | Node 20+ | `pi` CLI via child_process |

---

## Setup

### Vault path

Templates and briefs are read/written from your Obsidian vault. The default path is:

```
~/Library/CloudStorage/ProtonDrive-john.ferguson@unfergettabledesigns.com-folder/Obsidian
```

Override with the `VAULT_PATH` env var if your vault is elsewhere.

### Variant 1 — anthropic/

```bash
cd anthropic
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...
python runner.py "your research question"
```

Run only specific templates (saves tokens during development):

```bash
python runner.py --templates A1,M2 "your research question"
```

### Variant 2 — opencode/

Requires OpenCode to be installed: https://opencode.ai

```bash
cd opencode
npm install          # or: bun install
npx tsx runner.ts "your research question"
npx tsx runner.ts --templates A1,M2 "targeted question"
```

### Variant 3 — pi/

Requires Pi CLI installed and on PATH: https://github.com/badlogic/lemmy

```bash
cd pi
npm install          # or: bun install
npx tsx runner.ts "your research question"
npx tsx runner.ts --templates A1 "quick targeted question"
```

---

## Output

All three variants write to the same location:

```
$VAULT_PATH/wiki/briefs/YYYY-MM-DD.md
```

If today's brief already exists, the new run is appended rather than overwriting.

---

## Synthesis (optional)

By default, results from the 9 templates are concatenated with no additional API call.
To add a "Key Takeaways" synthesis paragraph, implement the `synthesize()` function in:

- `shared/output.py` — Python variant
- `shared/output.ts` — TypeScript variants

Both files have a `TODO` comment with a copy-paste Option B implementation using the
respective SDK.

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

Check template parsing without making API calls:

```bash
# TypeScript
cd opencode && node --input-type=module --loader=tsx <<'EOF'
import { loadTemplates } from "../shared/templates.ts";
const d = loadTemplates();
console.log(d.templates.map(t => t.id));
EOF

# Python
cd anthropic && python -c "
import sys; sys.path.insert(0, '../shared')
from templates import load_templates
d = load_templates()
print([t.id for t in d.templates])
"
```

Expected output: `['A1', 'A2', 'A3', 'M1', 'M2', 'W1', 'W2', 'X1', 'X2']`
