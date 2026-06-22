#!/usr/bin/env bash
# Vendor (or refresh) LeadMagic/gtm-skills into skills-gtm/.
#
# This is a one-time or refresh operation, NOT part of the default build.
# After vendoring, run scripts/install-gtm-skills.sh to expose them.
#
# Does:
#   1. Shallow-clone LeadMagic/gtm-skills to a temp dir
#   2. Replaces skills-gtm/ with the clone's skills/ tree + taxonomy.csv + references/
#   3. Remaps their metadata.category (domain like 'abm') → metadata.domain,
#      adds an `invocation` column to _taxonomy.csv, and applies the policy
#      via scripts/apply-gtm-invocation.py (150 user-invoked / 55 model-invoked).
#
# Usage:
#   ./scripts/vendor-gtm-skills.sh           # vendor at latest
#   ./scripts/vendor-gtm-skills.sh --ref v0.27.3  # vendor at a specific tag
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/skills-gtm"
REF="main"
if [ "${1:-}" = "--ref" ] && [ -n "${2:-}" ]; then
    REF="$2"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Cloning LeadMagic/gtm-skills@$REF..."
git clone --depth 1 --branch "$REF" https://github.com/LeadMagic/gtm-skills.git "$TMP/src" 2>&1 | tail -1

if [ ! -d "$TMP/src/skills" ]; then
  echo "✗ Clone has no skills/ directory" >&2
  exit 1
fi

echo "→ Replacing $DEST..."
rm -rf "$DEST"
mkdir -p "$DEST"
# skills/ → skills-gtm/<category>/<skill>
cp -R "$TMP/src/skills/." "$DEST/"
# keep taxonomy + references for discoverability, prefixed with _ so they don't
# look like skill categories
[ -f "$TMP/src/taxonomy.csv" ] && cp "$TMP/src/taxonomy.csv" "$DEST/_taxonomy.csv"
[ -d "$TMP/src/references" ] && cp -R "$TMP/src/references" "$DEST/_references"

echo "→ Remapping metadata.category → metadata.domain..."
python3 - "$DEST" <<'PY'
import glob, re, sys
dest = sys.argv[1]
changed = 0
for path in glob.glob(f'{dest}/**/SKILL.md', recursive=True):
    content = open(path).read()
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m: continue
    fm = m.group(1)
    cat = re.search(r'^  category:\s*(.+)$', fm, re.MULTILINE)
    if not cat: continue
    domain = cat.group(1).strip()
    if domain in ('user-invoked', 'model-invoked'): continue
    new_fm = fm[:cat.start()] + f"  domain: {domain}\n  category: model-invoked" + fm[cat.end():]
    open(path, 'w').write('---\n' + new_fm + '\n---' + content[m.end():])
    changed += 1
print(f"  remapped {changed} skills")
PY

echo "→ Writing invocation column to _taxonomy.csv..."
python3 - "$DEST" <<'PY'
import csv, sys
dest = sys.argv[1]
# All GTM skills are user-invoked: specialized B2B playbooks invoked deliberately,
# not mid-task routing candidates. Edit invocation per-skill to opt back into routing.
rows = []
with open(f'{dest}/_taxonomy.csv') as f:
    reader = csv.DictReader(f)
    fields = reader.fieldnames
    for r in reader:
        r['invocation'] = 'user'
        rows.append(r)
if 'invocation' not in fields:
    idx = fields.index('category') + 1
    fields = fields[:idx] + ['invocation'] + fields[idx:]
with open(f'{dest}/_taxonomy.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields, quoting=csv.QUOTE_MINIMAL)
    w.writeheader(); w.writerows(rows)
from collections import Counter
print(f"  invocation: {dict(Counter(r['invocation'] for r in rows))}")
PY

echo "→ Applying curated description rewrites (scripts/gtm-description-rewrites.tsv)..."
python3 - "$DEST" "$ROOT" <<'PY'
import glob, re, os, sys
dest, root = sys.argv[1], sys.argv[2]
rewrites_path = os.path.join(root, 'scripts', 'gtm-description-rewrites.tsv')
if not os.path.exists(rewrites_path):
    print("  (no rewrites file; skipping)")
else:
    rewrites = {}
    for line in open(rewrites_path).read().strip().split('\n'):
        slug, desc = line.split('|||', 1)
        rewrites[slug] = desc
    changed = 0
    for path in glob.glob(f'{dest}/**/SKILL.md', recursive=True):
        slug = os.path.basename(os.path.dirname(path))
        if slug not in rewrites: continue
        desc_val = rewrites[slug].replace('"', "'")
        if re.search(r'[:#\[\]{}&*!|>%@`]', desc_val):
            desc_val = f'"{desc_val}"'
        content = open(path).read()
        m = re.match(r'^(---\n)(.*?)(\n---)', content, re.DOTALL)
        fm = m.group(2)
        new_fm = re.sub(
            r'^description:\s*(?:[>|]-?\s*\n(?:[ \t]+[^\n]*\n)*|[^\n]+)\n?',
            f'description: {desc_val}\n',
            fm, count=1, flags=re.MULTILINE
        )
        if new_fm != fm:
            open(path, 'w').write('---\n' + new_fm + '\n---' + content[m.end():])
            changed += 1
    print(f"  rewrote {changed} descriptions")
PY

echo "→ Applying invocation policy to SKILL.md files..."
python3 "$ROOT/scripts/apply-gtm-invocation.py"

count=$(find "$DEST" -name SKILL.md | wc -l | tr -d ' ')
echo "✓ Vendored $count GTM skills into $DEST"
echo "  Run scripts/install-gtm-skills.sh to expose them to the build."
