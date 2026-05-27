#!/bin/bash
#
# Test harness for hooks/cooking/branch-guard.sh.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
HOOK="$REPO_ROOT/hooks/cooking/branch-guard.sh"

if [[ ! -x "$HOOK" ]]; then
  chmod +x "$HOOK"
fi

PASS=0
FAIL=0
FAIL_MSGS=()

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    PASS=$((PASS + 1))
    echo "  ok  $label"
  else
    FAIL=$((FAIL + 1))
    FAIL_MSGS+=("$label: expected '$expected', got '$actual'")
    echo "  FAIL $label  expected='$expected' got='$actual'"
  fi
}

run_hook() {
  local cmd="$1" repo_dir="${2:-}"
  set +e
  COOKING_TEST_COMMAND="$cmd" \
    COOKING_TEST_REPO_DIR="$repo_dir" \
    bash "$HOOK" </dev/null >/dev/null 2>&1
  rc=$?
  set -e
  echo "$rc"
}

# Set up a temp git repo to satisfy the show-ref check.
SCRATCH_REPO=$(mktemp -d)
git -C "$SCRATCH_REPO" init -q -b main
git -C "$SCRATCH_REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
git -C "$SCRATCH_REPO" branch cook/refactor-bar-1234567 2>/dev/null || true

echo "Case 1: git push origin main -> exit 2"
assert_eq "case1.exit" "2" "$(run_hook 'git push origin main')"

echo "Case 2: git push origin master -> exit 2"
assert_eq "case2.exit" "2" "$(run_hook 'git push origin master')"

echo "Case 3: git push origin develop -> exit 2"
assert_eq "case3.exit" "2" "$(run_hook 'git push origin develop')"

echo "Case 4: git push origin cook/refactor-foo-abcdef1 -> exit 0"
assert_eq "case4.exit" "0" "$(run_hook 'git push origin cook/refactor-foo-abcdef1')"

echo "Case 5: git checkout -b main -> exit 2"
assert_eq "case5.exit" "2" "$(run_hook 'git checkout -b main' "$SCRATCH_REPO")"

SCRATCH_REPO_FRESH=$(mktemp -d)
git -C "$SCRATCH_REPO_FRESH" init -q -b main
git -C "$SCRATCH_REPO_FRESH" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
echo "Case 6: git checkout -b cook/refactor-bar-1234567 (fresh repo) -> exit 0"
assert_eq "case6.exit" "0" "$(run_hook 'git checkout -b cook/refactor-bar-1234567' "$SCRATCH_REPO_FRESH")"
rm -rf "$SCRATCH_REPO_FRESH"

echo "Case 7: git checkout -b cook/refactor-bar-1234567 (exists) -> exit 2"
assert_eq "case7.exit" "2" "$(run_hook 'git checkout -b cook/refactor-bar-1234567' "$SCRATCH_REPO")"

echo "Case 8: git checkout -b not-cook-named -> exit 2 (pattern mismatch)"
assert_eq "case8.exit" "2" "$(run_hook 'git checkout -b not-cook-named' "$SCRATCH_REPO")"

echo "Case 9: git push origin HEAD:main -> exit 2"
assert_eq "case9.exit" "2" "$(run_hook 'git push origin HEAD:main')"

echo "Case 10: ls -la (non-git) -> exit 0"
assert_eq "case10.exit" "0" "$(run_hook 'ls -la')"

echo "Case 11: git status (not push/commit/checkout) -> exit 0"
assert_eq "case11.exit" "0" "$(run_hook 'git status')"

rm -rf "$SCRATCH_REPO"

echo
echo "Summary: $PASS pass, $FAIL fail"
if (( FAIL > 0 )); then
  for m in "${FAIL_MSGS[@]}"; do
    echo "  - $m"
  done
  exit 1
fi
