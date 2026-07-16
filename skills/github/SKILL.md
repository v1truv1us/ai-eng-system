---
name: github
description: Operate GitHub repositories, workflows, and PRs efficiently. Use for Actions optimization, PR hygiene, repo maintenance, and team collaboration patterns.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# GitHub Operations

## Current Versions (Verify Before Use)

```bash
gh --version                      # GitHub CLI
act --version                     # Local Actions runner (optional)
```

Check [GitHub CLI releases](https://github.com/cli/cli/releases) and [GitHub Actions runner releases](https://github.com/actions/runner/releases).

## Core Principles

1. **PRs are the unit of review.** Every change goes through a PR. No direct pushes to main.
2. **Actions are code.** Workflows get the same review as application code.
3. **Branch protection is mandatory.** Main requires: PR, review, passing checks, up-to-date branch.
4. **gh CLI over web UI.** Scriptable, reproducible, faster.

## PR Hygiene Checklist

- [ ] PR title describes *what* and *why* (not just the ticket number)
- [ ] Description links to issue/ticket, summarizes changes, includes screenshots for UI
- [ ] Branch is up-to-date with main (rebased or merged)
- [ ] Checks are green before requesting review
- [ ] Reviewers assigned explicitly (not just "anyone")
- [ ] PR is small enough to review in < 20 minutes (~250 lines max)

## gh CLI Patterns

```bash
# Create PR from current branch
gh pr create --title "feat: add OAuth2 login" --body-file .github/PULL_REQUEST_TEMPLATE.md

# View checks
gh pr checks --watch --fail-fast

# Checkout a PR for local review
gh pr checkout 123

# View PR diff with comments
gh pr view 123 --comments

# Merge when green
gh pr merge --squash --delete-branch

# Review from CLI
gh pr review 123 --approve --body "LGTM"
```

## Actions Optimization

### Caching
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Matrix Strategy
```yaml
strategy:
  fail-fast: false
  matrix:
    node: [20, 22]
    os: [ubuntu-latest]
```

### Reusable Workflows
```yaml
jobs:
  ci:
    uses: ./.github/workflows/reusable-ci.yml
    with:
      node-version: 22
    secrets: inherit
```

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| `actions/checkout@v2` | Deprecated, security risks | Use `actions/checkout@v4` |
| `set-output` command | Deprecated | Use `GITHUB_OUTPUT` env file |
| `save-state` / `set-env` | Security vulnerability | Use `GITHUB_STATE` / `GITHUB_ENV` |
| No timeout on jobs | Runaway jobs burn minutes | `timeout-minutes: 10` |
| `pull_request_target` without care | Can expose secrets to forks | Use `pull_request` for untrusted code |
| Hardcoded secrets in workflows | Leaked in logs, not rotatable | Use GitHub Secrets + environments |
| `permissions: write-all` | Overprivileged workflows | Explicit `permissions` block |

## Validation Checklist

- [ ] `.github/workflows/` files pass `actionlint` or `yamllint`
- [ ] All `uses:` references are pinned to major version or SHA
- [ ] `permissions:` is explicitly defined (not default write-all)
- [ ] No secrets in workflow files (use `${{ secrets.XXX }}`)
- [ ] Jobs have `timeout-minutes`
- [ ] Reusable workflows are used for duplicated logic
- [ ] Branch protection rules enforce required checks

## Official Resources

- [GitHub Actions docs](https://docs.github.com/en/actions)
- [GitHub CLI manual](https://cli.github.com/manual/)
- [Security hardening for Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Reusable workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows)
