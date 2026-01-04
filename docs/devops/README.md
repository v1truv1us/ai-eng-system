# DevOps Automation Quick-Start

A quick guide to the DevOps automation in ai-eng-system.

## What's Set Up?

✅ **Pre-commit Hook**: Automatically runs tests before allowing commits
✅ **Automated Changelog**: Generates changelog from conventional commits
✅ **Quality Gates**: Ensures code quality before commits

## Quick Reference

### Testing

```bash
# Run tests (pre-commit does this automatically)
bun test

# Run tests, stop on first failure
bun test --bail
```

### Committing

```bash
# Normal commit (tests run automatically)
git add .
git commit -m "feat: Add new feature"

# Emergency commit (skip tests - NOT recommended)
git commit --no-verify -m "feat: Something"
```

### Changelog

```bash
# Generate changelog with auto version bump
bun run changelog

# Force specific version bump
bun run changelog:patch   # 0.0.16 → 0.0.17
bun run changelog:minor   # 0.0.16 → 0.1.0
bun run changelog:major   # 0.0.16 → 1.0.0

# Preview changelog without changes
bun run changelog:dry-run
```

### Commit Message Format

```bash
feat: Add new feature
fix: Fix a bug
docs: Update documentation
refactor: Refactor code
perf: Improve performance
chore: Update dependencies
test: Add tests
style: Code style changes
```

## Complete Workflow

```bash
# 1. Make changes
# (edit files...)

# 2. Test (optional - pre-commit does this)
bun test

# 3. Commit (tests run automatically)
git add .
git commit -m "feat: Add new feature"

# 4. Push
git push origin main

# 5. Generate changelog (when ready for release)
bun run changelog
git push origin main --follow-tags

# 6. Publish
npm publish
```

## Troubleshooting

### Pre-commit hook not working?

```bash
# Make sure it's executable
chmod +x .husky/pre-commit

# Reinitialize Husky
npx husky install
```

### Tests failing?

```bash
# See what's failing
bun test

# Fix the issues, then commit
git add .
git commit -m "fix: Resolve test failures"
```

### Need to commit anyway (emergency only)?

```bash
# Skip pre-commit hook
git commit --no-verify -m "feat: Something"
# WARNING: This bypasses quality checks!
```

## Learn More

See [DevOps Automation Documentation](./automation.md) for detailed information.
