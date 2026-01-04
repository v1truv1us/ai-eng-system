# DevOps Automation

This document explains the automated DevOps workflows set up for the ai-eng-system project.

## Overview

The project uses automated DevOps tools to ensure code quality and maintain accurate documentation:

1. **Pre-commit Hook**: Automatically runs tests before allowing commits
2. **Automated Changelog**: Generates changelog entries from conventional commits
3. **Quality Gates**: Ensures tests pass before code changes are committed

## 1. Pre-commit Testing

### How It Works

Every time you run `git commit`, the pre-commit hook automatically:
1. Runs the complete test suite with `bun test --bail`
2. Stops on the first test failure
3. Blocks the commit if tests fail
4. Allows the commit only if all tests pass

### Usage

**Normal workflow:**
```bash
# Make your changes
git add .
git commit -m "feat: Add new feature"
# → Pre-commit hook runs tests automatically
# → If tests pass: Commit succeeds
# → If tests fail: Commit is blocked with error message
```

**Skipping the hook (not recommended):**
```bash
git commit --no-verify -m "feat: Add new feature"
```

⚠️ **Warning**: Only use `--no-verify` in emergency situations. Always fix failing tests before committing.

### Test Output Examples

**Success:**
```
🧪 Running pre-commit tests...

bun test v1.1.30
...
391 pass 0 fail

✅ All tests passed! Commit proceeding...
```

**Failure:**
```
🧪 Running pre-commit tests...

bun test v1.1.30
...
(fail) Some test failed...

❌ Tests failed! Commit blocked.

Please fix the failing tests before committing.
Run 'bun test' to see detailed test output.
```

## 2. Automated Changelog

### How It Works

The project uses `standard-version` to automatically generate changelog entries based on your conventional commits. When you run the changelog command, it:

1. Analyzes your git commit history
2. Categorizes commits by type (feat, fix, docs, etc.)
3. Generates a new changelog section following [Keep a Changelog](https://keepachangelog.com/) format
4. Updates the version in `package.json`
5. Commits the changes and creates a git tag

### Commit Message Format

Use conventional commits to get the best results:

```bash
# Features
git commit -m "feat: Add new user authentication"

# Bug fixes
git commit -m "fix: Resolve memory leak in agent execution"

# Documentation
git commit -m "docs: Update installation guide"

# Refactoring
git commit -m "refactor: Simplify configuration loading"

# Performance
git commit -m "perf: Improve build speed by 50%"

# Breaking changes
git commit -m "feat!: Change agent API interface"
```

### Available Commands

**Generate changelog with automatic version bump:**
```bash
bun run changelog
# or
npm run changelog
```

This will:
- Automatically determine version bump (patch/minor/major) based on commits
- Update `CHANGELOG.md`
- Update version in `package.json`
- Create git commit
- Create git tag

**Force specific version bump:**
```bash
bun run changelog:patch   # 0.0.16 → 0.0.17
bun run changelog:minor   # 0.0.16 → 0.1.0
bun run changelog:major   # 0.0.16 → 1.0.0
```

**Preview changelog without making changes:**
```bash
bun run changelog:dry-run
```

### Changelog Sections

The `.versionrc` configuration defines which commit types appear in which sections:

| Commit Type | Changelog Section |
|-------------|-------------------|
| feat | Added |
| fix | Fixed |
| docs | Documentation |
| refactor | Changed |
| perf | Performance |
| build, ci, chore | Infrastructure |
| style, test | Hidden (not shown) |

### Example Changelog Output

```markdown
## [0.0.17](https://github.com/v1truv1us/ai-eng-system/compare/v0.0.16...v0.0.17) (2026-01-04)

### Added
- Add new user authentication system
- Implement OAuth2 provider support

### Fixed
- Resolve memory leak in agent execution
- Fix timezone handling in scheduler

### Documentation
- Update installation guide with new examples

### Changed
- Refactor configuration loading for better performance
- Update dependency versions

### Performance
- Improve build speed by 50%
- Reduce memory usage in test suite
```

## 3. Complete Workflow Example

Here's a complete example of the development workflow:

```bash
# 1. Create a new feature branch
git checkout -b feat/new-authentication

# 2. Make your changes
# (edit files...)

# 3. Test locally (optional - pre-commit will do this anyway)
bun test

# 4. Stage and commit (pre-commit hook runs automatically)
git add .
git commit -m "feat: Add OAuth2 authentication provider"
# → Tests run automatically
# → If tests pass: Commit succeeds
# → If tests fail: Fix tests and try again

# 5. Make more changes
# (edit more files...)

# 6. Commit again
git add .
git commit -m "docs: Update auth examples in README"
# → Tests run automatically

# 7. Push to remote
git push origin feat/new-authentication

# 8. Create pull request (tests run again in CI)

# 9. After merge, prepare release
git checkout main
git pull origin main
git merge feat/new-authentication

# 10. Generate changelog and version bump
bun run changelog

# 11. Push changes and tags
git push origin main --follow-tags

# 12. Publish to npm
npm publish
```

## 4. Troubleshooting

### Pre-commit Hook Issues

**Hook not running:**
```bash
# Verify hook is executable
chmod +x .husky/pre-commit

# Reinitialize Husky
npx husky install
```

**Tests failing but you need to commit:**
```bash
# Option 1: Fix the tests (recommended)
bun test  # See what's failing
# Fix the issues
git add .
git commit -m "fix: Resolve test failures"

# Option 2: Skip the hook (emergency only)
git commit --no-verify -m "feat: Some feature"
# WARNING: This bypasses quality gates!
```

### Changelog Issues

**Changelog not generating:**
```bash
# Check your commits are in conventional format
git log --oneline -10

# Try dry run to debug
bun run changelog:dry-run

# Check .versionrc configuration
cat .versionrc
```

**Wrong version bump:**
```bash
# Force specific version
bun run changelog:patch   # or :minor or :major
```

**Need to regenerate changelog:**
```bash
# Delete last tag and commit
git reset --hard HEAD~1
git tag -d v0.0.17

# Try again
bun run changelog
```

## 5. Configuration Files

### `.versionrc`

Configuration for `standard-version`:
- Defines commit types and their sections
- Sets URL formats for GitHub
- Configures post-changelog scripts

### `.husky/pre-commit`

Pre-commit hook script that:
- Runs `bun test --bail`
- Blocks commit on test failures
- Provides clear error messages

## 6. Best Practices

### Commit Messages

✅ **Do:**
```bash
git commit -m "feat: Add OAuth2 support"
git commit -m "fix: Resolve null pointer exception"
git commit -m "docs: Update installation instructions"
git commit -m "feat!: Breaking change in agent API"
```

❌ **Don't:**
```bash
git commit -m "Updated stuff"
git commit -m "Fixed bug"
git commit -m "WIP"
git commit -m "Update"
```

### Testing

1. **Run tests before committing** (even though pre-commit does it):
   ```bash
   bun test
   ```

2. **Keep tests fast**: The pre-commit hook blocks commits, so slow tests are annoying

3. **Fix failing tests immediately**: Don't accumulate technical debt

4. **Write tests for new features**: Ensure test coverage grows with features

### Releases

1. **Use conventional commits**: Essential for automated changelog

2. **Review changelog before publishing**:
   ```bash
   bun run changelog:dry-run  # Preview first
   cat CHANGELOG.md          # Review manually
   bun run changelog         # Then commit
   ```

3. **Tag releases properly**:
   ```bash
   git push origin main --follow-tags  # Push tags too
   ```

4. **Keep releases meaningful**:
   - Don't release too often (unless patch releases)
   - Don't release too rarely (too many changes to review)
   - Follow semantic versioning

## 7. Quick Reference

| Command | Purpose |
|---------|---------|
| `bun test` | Run all tests |
| `bun test --bail` | Run tests, stop on first failure |
| `git commit -m "type: message"` | Commit with conventional format |
| `git commit --no-verify` | Commit without pre-commit hook (emergency) |
| `bun run changelog` | Generate changelog + version bump |
| `bun run changelog:patch` | Force patch version bump |
| `bun run changelog:minor` | Force minor version bump |
| `bun run changelog:major` | Force major version bump |
| `bun run changelog:dry-run` | Preview changelog without changes |

## 8. Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Standard Version](https://github.com/conventional-changelog/standard-version)
