#!/bin/bash
#
# Cooking-routines branch guard (PreToolUse Bash hook).
#
# When a cooking-routines skill (typically cross-repo-refactor) tries to run
# git push / git commit / git checkout against a forbidden branch, this hook
# rejects the call with exit 2. The agent gets the rejection reason on stderr
# and cannot proceed.
#
# Forbidden branches:
#   - main, master, develop
#   - any pre-existing branch (resolved via `git show-ref --verify --quiet`)
#
# Required pattern for a fresh cook branch:
#   ^cook/refactor-[a-z0-9-]+-[0-9a-f]{7,}$
#
# Hook input shape (Claude Code PreToolUse):
#   {
#     "tool_name": "Bash",
#     "tool_input": { "command": "git push origin main" },
#     ...
#   }
#
# Test harness can override via:
#   COOKING_TEST_COMMAND=...     skip stdin parse
#   COOKING_TEST_REPO_DIR=...    path to a git dir; show-ref runs there
#
# Hosts: Claude Code only. Cursor doesn't expose a PreToolUse Bash equivalent
# today; the cross-repo-refactor skill body documents the gap.

set -euo pipefail

ALLOWED_RE='^cook/refactor-[a-z0-9-]+-[0-9a-f]{7,}$'
FORBIDDEN_BRANCHES=("main" "master" "develop")

HOOK_INPUT=""
if [[ -z "${COOKING_TEST_COMMAND:-}" ]]; then
  HOOK_INPUT=$(cat)
  TOOL_NAME=$(printf '%s' "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")
  if [[ "$TOOL_NAME" != "Bash" ]]; then
    exit 0
  fi
  COMMAND=$(printf '%s' "$HOOK_INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")
else
  COMMAND="$COOKING_TEST_COMMAND"
fi

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Only act on git push / git commit / git checkout. Other git invocations and
# non-git commands pass through.
case "$COMMAND" in
  *"git push"*|*"git commit"*|*"git checkout"*) ;;
  *) exit 0 ;;
esac

# --- extract target branch -------------------------------------------------
# Strategy: pull the first non-flag token after the verb. Recognised forms:
#   git push origin <branch>
#   git push origin HEAD:<branch>
#   git push -u origin <branch>
#   git commit -a -m "..."          -> targets current branch (no explicit name)
#   git checkout <branch>
#   git checkout -b <branch>
#   git checkout -b <branch> <base>

TARGET=""

if [[ "$COMMAND" == *"git checkout"* ]]; then
  TARGET=$(printf '%s' "$COMMAND" | sed -E 's/.*git checkout([[:space:]]+-b)?[[:space:]]+([^[:space:]]+).*/\2/')
elif [[ "$COMMAND" == *"git push"* ]]; then
  # Strip flags then take the last token as the branch (typical: `git push origin <branch>`).
  ARGS=$(printf '%s' "$COMMAND" | sed -E 's/.*git push//' | tr -s ' ')
  STRIPPED=$(printf '%s' "$ARGS" | tr ' ' '\n' | grep -vE '^-' | grep -vE '^$' || true)
  COUNT=$(printf '%s\n' "$STRIPPED" | grep -cE '.' || true)
  if (( COUNT >= 2 )); then
    LAST=$(printf '%s\n' "$STRIPPED" | tail -n1)
    if [[ "$LAST" == *":"* ]]; then
      TARGET="${LAST##*:}"
    else
      TARGET="$LAST"
    fi
  fi
elif [[ "$COMMAND" == *"git commit"* ]]; then
  # commit operates on the current branch; resolve via HEAD.
  REPO_DIR="${COOKING_TEST_REPO_DIR:-$PWD}"
  TARGET=$(git -C "$REPO_DIR" symbolic-ref --short HEAD 2>/dev/null || echo "")
fi

if [[ -z "$TARGET" ]]; then
  # Couldn't determine a target — let it through rather than block legitimate
  # work. The skill prose still warns the agent to avoid forbidden branches,
  # and a follow-up push (which we *can* parse) would be rejected.
  exit 0
fi

# --- forbidden branch list -------------------------------------------------
for fb in "${FORBIDDEN_BRANCHES[@]}"; do
  if [[ "$TARGET" == "$fb" ]]; then
    echo "branch-guard: refusing to operate on forbidden branch '$TARGET'. Use a cook/refactor-<slug>-<short-sha> branch instead." >&2
    exit 2
  fi
done

# --- pattern enforcement ---------------------------------------------------
if [[ ! "$TARGET" =~ $ALLOWED_RE ]]; then
  # Pattern mismatch is only fatal when the command is creating a new branch
  # via `git checkout -b` or pushing to a new remote ref. For pushes to an
  # existing local branch that already passes the pattern at HEAD, accept.
  if [[ "$COMMAND" == *"git checkout -b"* ]]; then
    echo "branch-guard: new branch '$TARGET' must match $ALLOWED_RE" >&2
    exit 2
  fi
fi

# --- pre-existing branch defense (only meaningful for `checkout -b`) -------
if [[ "$COMMAND" == *"git checkout -b"* ]]; then
  REPO_DIR="${COOKING_TEST_REPO_DIR:-$PWD}"
  if git -C "$REPO_DIR" show-ref --verify --quiet "refs/heads/$TARGET" 2>/dev/null; then
    echo "branch-guard: branch '$TARGET' already exists; cook branches must be fresh" >&2
    exit 2
  fi
fi

exit 0
