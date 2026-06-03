#!/bin/bash
set -euo pipefail

VAULT_PATH="${VAULT_PATH:-/app/data/vault}"
WIKI_REPO_URL="${WIKI_REPO_URL:-}"
WIKI_REPO_BRANCH="${WIKI_REPO_BRANCH:-main}"
WIKI_COMMIT_MESSAGE="${WIKI_COMMIT_MESSAGE:-research queue wiki update}"

if [ -z "$WIKI_REPO_URL" ]; then
  echo "[sync-wiki] WIKI_REPO_URL not set; skipping git sync"
  exit 0
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[sync-wiki] git not found; cannot sync wiki repo" >&2
  exit 1
fi

mkdir -p "$(dirname "$VAULT_PATH")"

if [ ! -d "$VAULT_PATH/.git" ]; then
  if [ -e "$VAULT_PATH" ] && [ "$(find "$VAULT_PATH" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')" != "0" ]; then
    BACKUP="${VAULT_PATH}.volume-backup.$(date +%Y%m%d%H%M%S)"
    echo "[sync-wiki] $VAULT_PATH is not a git repo and is not empty; moving aside to $BACKUP"
    mv "$VAULT_PATH" "$BACKUP"
  fi
  echo "[sync-wiki] cloning wiki repo branch $WIKI_REPO_BRANCH into $VAULT_PATH"
  git clone --branch "$WIKI_REPO_BRANCH" "$WIKI_REPO_URL" "$VAULT_PATH"
fi

cd "$VAULT_PATH"
git config user.name "research-queue bot"
git config user.email "research-queue@v1truv1us.dev"

git fetch origin "$WIKI_REPO_BRANCH"
git checkout "$WIKI_REPO_BRANCH"
git pull --ff-only origin "$WIKI_REPO_BRANCH"

mkdir -p wiki
if [ ! -f wiki/index.md ]; then
  cat > wiki/index.md <<'EOF'
# Wiki Index

Auto-maintained by research-queue.
EOF
fi
if [ ! -f wiki/log.md ]; then
  cat > wiki/log.md <<'EOF'
# Wiki Log

EOF
fi

if git diff --quiet -- wiki RESEARCH_QUEUE.md && git diff --cached --quiet -- wiki RESEARCH_QUEUE.md; then
  echo "[sync-wiki] no wiki changes to commit"
  exit 0
fi

git add wiki RESEARCH_QUEUE.md 2>/dev/null || git add wiki
if git diff --cached --quiet; then
  echo "[sync-wiki] no staged wiki changes"
  exit 0
fi

git commit -m "$WIKI_COMMIT_MESSAGE"
git push origin "$WIKI_REPO_BRANCH"
echo "[sync-wiki] pushed wiki changes"
