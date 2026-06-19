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
#   ./scripts/install-gtm-skills.sh        # install (copy skills-gtm → skills/gtm)
#   ./scripts/install-gtm-skills.sh remove # uninstall (remove skills/gtm)
#   ./scripts/install-gtm-skills.sh status # check current state
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

case "${1:-install}" in
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
    # Copy category dirs only (skip _prefixed helper files like _taxonomy.csv)
    for d in "$SOURCE"/*/; do
      [ -d "$d" ] && cp -R "$d" "$TARGET/"
    done
    date -u +%Y-%m-%dT%H:%M:%SZ > "$MARKER"
    # Normalize frontmatter so build.ts validation passes. The source in
    # skills-gtm/ is formatted; the copy may drift if the formatter spec
    # changes between vendor and install.
    (cd "$ROOT" && bun run format:skills:fix >/dev/null 2>&1 || true)
    count=$(find "$TARGET" -name SKILL.md | wc -l | tr -d ' ')
    echo "✓ Installed $count GTM skills into $TARGET"
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
    echo "Usage: $0 {install|remove|status}" >&2
    exit 2
    ;;
esac
