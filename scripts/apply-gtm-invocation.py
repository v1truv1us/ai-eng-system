#!/usr/bin/env python3
"""
Apply invocation policy to vendored GTM skills.

Reads skills-gtm/_taxonomy.csv (which carries an `invocation` column with
values 'user' or 'model') and rewrites each SKILL.md frontmatter so that:
  - user-invoked skills get `disable-model-invocation: true`
  - model-invoked skills have that flag removed
  - metadata.category is set to 'user-invoked' or 'model-invoked'

This keeps the GTM catalog consistent with the repo's taxonomy invariants
(sync-skill-taxonomy) while excluding ~150 narrow playbook skills from
model routing context.

Usage:
  python3 scripts/apply-gtm-invocation.py            # apply to skills-gtm/
  python3 scripts/apply-gtm-invocation.py --check     # verify, exit 1 if drift

Idempotent: safe to run repeatedly.
"""
import argparse
import csv
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "skills-gtm")
TAXONOMY = os.path.join(SOURCE, "_taxonomy.csv")

# Domains that stay model-invoked (broad capabilities the model should
# auto-route to from task context). Everything else is user-invoked.
# Kept here as the fallback for regenerating the taxonomy column; the CSV
# is the source of truth once written.
MODEL_DOMAINS = {
    "outbound",
    "creative",
    "content-seo",
    "inbound",
    "foundation",
    "customer-success",
    "growth",
}


def load_invocation_map():
    """slug -> 'user' | 'model', from taxonomy CSV."""
    if not os.path.exists(TAXONOMY):
        print(f"✗ taxonomy not found: {TAXONOMY}", file=sys.stderr)
        sys.exit(1)
    mapping = {}
    with open(TAXONOMY) as f:
        for r in csv.DictReader(f):
            inv = r.get("invocation", "").strip()
            if inv not in ("user", "model"):
                inv = "model" if r.get("category") in MODEL_DOMAINS else "user"
            mapping[r["slug"]] = inv
    return mapping


def apply_to_skill(path, target, check_only=False):
    """Set/remove DMI + category on one SKILL.md. Returns (changed, drift)."""
    content = open(path).read()
    m = re.match(r"^(---\n)(.*?)(\n---)", content, re.DOTALL)
    if not m:
        return False, f"no frontmatter: {path}"
    fm = m.group(2)
    want_dmi = target == "user"
    has_dmi = bool(re.search(r"^disable-model-invocation:\s*true", fm, re.MULTILINE))
    want_cat = f"{target}-invoked"
    cat = re.search(r"^  category:\s*(.+)$", fm, re.MULTILINE)
    cur_cat = cat.group(1).strip() if cat else None

    drifts = []
    if has_dmi != want_dmi:
        drifts.append(f"DMI={'true' if has_dmi else 'false'} want={'true' if want_dmi else 'false'}")
    if cur_cat != want_cat:
        drifts.append(f"category={cur_cat} want={want_cat}")

    if not drifts:
        return False, None
    if check_only:
        return False, f"DRIFT {path}: {', '.join(drifts)}"

    new_fm = fm
    if want_dmi and not has_dmi:
        lines = new_fm.split("\n")
        out, i, inserted = [], 0, False
        while i < len(lines):
            out.append(lines[i])
            if lines[i].startswith("description:") and not inserted:
                if lines[i].rstrip().endswith((">-", "|")):
                    i += 1
                    while i < len(lines) and (lines[i].startswith("  ") or lines[i].startswith("\t")):
                        out.append(lines[i]); i += 1
                    out.append("disable-model-invocation: true")
                    inserted = True
                    continue
                else:
                    out.append("disable-model-invocation: true")
                    inserted = True
            i += 1
        new_fm = "\n".join(out)
    elif not want_dmi and has_dmi:
        new_fm = re.sub(r"^disable-model-invocation:\s*true\n", "", fm, count=1, flags=re.MULTILINE)

    if cur_cat != want_cat:
        cat_match = re.search(r"^  category:\s*(.+)$", new_fm, re.MULTILINE)
        if cat_match:
            new_fm = new_fm[:cat_match.start()] + f"  category: {want_cat}" + new_fm[cat_match.end():]

    open(path, "w").write("---\n" + new_fm + "\n---" + content[m.end():])
    return True, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify only; exit 1 on drift")
    args = ap.parse_args()

    invocation = load_invocation_map()
    changed = 0
    drifts = []
    for path in sorted(glob.glob(f"{SOURCE}/**/SKILL.md", recursive=True)):
        slug = os.path.basename(os.path.dirname(path))
        target = invocation.get(slug, "model")
        did, drift = apply_to_skill(path, target, check_only=args.check)
        if did:
            changed += 1
        if drift:
            drifts.append(drift)

    if args.check:
        if drifts:
            print(f"✗ {len(drifts)} skill(s) drifted from taxonomy:")
            for d in drifts[:10]:
                print(f"  {d}")
            sys.exit(1)
        print(f"✓ all {len(invocation)} GTM skills match taxonomy")
        return

    print(f"✓ applied invocation policy: {changed} changed, {len(drifts)} errors")
    for d in drifts[:5]:
        print(f"  {d}")


if __name__ == "__main__":
    main()
