#!/usr/bin/env bash
# Install or uninstall the vendored GTM skills (LeadMagic/gtm-skills) into the
# default build. GTM skills live in skills-gtm/ (gitignored, not built by
# default) and are exposed to the build by copying them into skills/gtm/.
#
# Note: we copy rather than symlink because build.ts uses Node's
# readdir({withFileTypes}), whose Dirent.isDirectory() returns false for
# symlinks (it reflects lstat, not stat). Copying keeps the build untouched.
#
# Usage:
#   ./scripts/install-gtm-skills.sh            # install all (copy skills-gtm → skills/gtm)
#   ./scripts/install-gtm-skills.sh install --only reports/skills-gtm-keeplist.txt
#                                               # install only the KEEP core (tool-specific)
#   ./scripts/install-gtm-skills.sh remove     # uninstall (remove skills/gtm)
#   ./scripts/install-gtm-skills.sh status     # check current state
#
# After installing, run `bun run build` to emit GTM skills into all build
# targets (.claude/skills, dist/.pi/skills, plugins, etc.) alongside the
# core catalog. Removing the symlink drops them from the next build.
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/skills-gtm"
TARGET="$ROOT/skills/gtm"
MARKER="$TARGET/.gtm-installed"  # tracks that WE created it (vs a real dir)

# Parse an optional --only <keeplist> for selective install.
ONLY_LIST=""
BASE_CMD="${1:-install}"
if [[ "$BASE_CMD" == "install" ]]; then
  shift || true
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --only)
        ONLY_LIST="${2:-}"
        [[ -z "$ONLY_LIST" ]] && { echo "✗ --only requires a keeplist file path" >&2; exit 2; }
        shift 2
        ;;
      *)
        echo "✗ Unknown option: $1" >&2; exit 2
        ;;
    esac
  done
fi

case "${BASE_CMD:-install}" in
  install)
    if [ ! -d "$SOURCE" ]; then
      echo "✗ Source not found: $SOURCE" >&2
      echo "  Run scripts/vendor-gtm-skills.sh first to populate it." >&2
      exit 1
    fi
    if [ -e "$TARGET" ] || [ -L "$TARGET" ]; then
      if [ -f "$MARKER" ]; then
        echo "→ GTM skills already installed at $TARGET"
        echo "  Run '$0 remove' first to refresh."
        exit 0
      else
        echo "✗ $TARGET exists and was not created by this script." >&2
        echo "  Refusing to overwrite. Remove it manually if intended." >&2
        exit 1
      fi
    fi
    mkdir -p "$TARGET"
    if [[ -n "$ONLY_LIST" ]]; then
      # Selective install: copy only skills listed in the keeplist (<dir>/<skill> per line).
      KEEPLIST_PATH="$ROOT/$ONLY_LIST"
      [[ -f "$KEEPLIST_PATH" ]] || KEEPLIST_PATH="$ONLY_LIST"
      if [[ ! -f "$KEEPLIST_PATH" ]]; then
        echo "✗ Keeplist not found: $ONLY_LIST" >&2; rm -rf "$TARGET"; exit 1
      fi
      while IFS= read -r line; do
        # Skip blanks and comments.
        line="${line%%#*}"
        line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
        [[ -z "$line" ]] && continue
        src="$SOURCE/$line"
        if [[ -d "$src" ]]; then
          mkdir -p "$TARGET/$(dirname "$line")"
          cp -R "$src" "$TARGET/$(dirname "$line")/"
        else
          echo "  ⚠ not found, skipping: $line" >&2
        fi
      done < "$KEEPLIST_PATH"
      mode="selective (keeplist: $ONLY_LIST)"
    else
      # Full install: copy category dirs only (skip _prefixed helper files).
      for d in "$SOURCE"/*/; do
        [ -d "$d" ] && cp -R "$d" "$TARGET/"
      done
      mode="full"
    fi
    date -u +%Y-%m-%dT%H:%M:%SZ > "$MARKER"
    # Normalize frontmatter so build.ts validation passes. The source in
    # skills-gtm/ is formatted; the copy may drift if the formatter spec
    # changes between vendor and install.
    (cd "$ROOT" && bun run format:skills:fix >/dev/null 2>&1 || true)
    count=$(find "$TARGET" -name SKILL.md | wc -l | tr -d ' ')
    echo "✓ Installed $count GTM skills into $TARGET ($mode)"
    echo "  Run 'bun run build' to emit them into all build targets."
    ;;

  remove|uninstall)
    if [ -f "$MARKER" ]; then
      rm -rf "$TARGET"
      echo "✓ Uninstalled GTM skills (removed $TARGET)"
      echo "  Run 'bun run build' to rebuild without them."
    elif [ -e "$TARGET" ]; then
      echo "✗ $TARGET exists but lacks the install marker." >&2
      echo "  Not removing (manual cleanup required)."
      exit 1
    else
      echo "→ GTM skills not installed (no $TARGET)"
    fi
    ;;

  status)
    if [ -f "$MARKER" ]; then
      count=$(find "$TARGET" -name SKILL.md | wc -l | tr -d ' ')
      echo "installed: $TARGET ($count skills, installed $(cat "$MARKER"))"
    elif [ -d "$TARGET" ]; then
      echo "unexpected: $TARGET exists without install marker"
    else
      echo "not installed"
      if [ -d "$SOURCE" ]; then
        echo "  (source available: $SOURCE with $(find "$SOURCE" -name SKILL.md | wc -l | tr -d ' ') skills)"
      else
        echo "  (source missing: $SOURCE — run scripts/vendor-gtm-skills.sh)"
      fi
    fi
    ;;

  *)
    echo "Usage: $0 {install [--only <keeplist>]|remove|status}" >&2
    exit 2
    ;;
esac
