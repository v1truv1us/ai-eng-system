# OpenCode SDK Upgrade Guide

## Overview

This document provides guidance on upgrading the OpenCode SDK dependencies in the `ai-eng-ralph-cli` project.

## Problem Context

### The MessageID Validation Error

On **January 12, 2026**, we encountered a critical error when upgrading to OpenCode 1.1.13:

```
Invalid response from OpenCode: {"data":{"messageID":"ses_..."...},"error":[{"message":"Invalid string: must start with \"msg\""}],"success":false}
```

**Root Cause**: Version mismatch between OpenCode SDK client (1.0.218) and server (1.1.13)

**Impact**: CLI could not create or manage sessions, breaking the entire automation workflow

## Solution Implemented

### Version Upgrade

| Component | Previous | Updated | Reason |
|-----------|----------|---------|--------|
| @opencode-ai/plugin | 1.0.218 | 1.1.13 | Server compatibility |
| @opencode-ai/sdk | 1.0.218 | 1.1.13 | Client-server API alignment |

### API Changes

The OpenCode 1.1.x server introduced stricter API response validation:
- **messageID validation**: Must start with `"msg"` prefix
- **Response format**: More strict JSON schema validation
- **Error handling**: More detailed error messages

### Verification

After upgrade, all SDK functionality works correctly:
- ✅ Session creation successful
- ✅ Session closure successful
- ✅ No validation errors
- ✅ Extended session management works

## Future Upgrade Process

### Prerequisites

1. **Identify the need**: Monitor for SDK compatibility issues in error logs
2. **Check compatibility**: Review OpenCode release notes for breaking changes
3. **Plan the upgrade**: Consider CI/CD impact and rollback strategy

### Steps

#### 1. Update package.json

```bash
# Edit package.json
{
  "dependencies": {
    "@opencode-ai/plugin": "^X.Y.Z",  // Update to new version
    "@opencode-ai/sdk": "^X.Y.Z"      // If direct dependency
  }
}
```

Or use npm/bun:
```bash
bun add @opencode-ai/plugin@latest
```

#### 2. Clean Install

```bash
# Remove old dependencies
rm -rf node_modules bun.lock

# Fresh install
bun install
```

#### 3. Rebuild

```bash
bun run build
```

#### 4. Test

```bash
# Run dependency version tests
bun test tests/dependencies.test.ts

# Run full test suite
bun test

# Manual integration test
cd ~/git/fleettools
bun run ~/git/ai-eng-ralph-cli/dist/cli/run.js "test message" --ci
```

#### 5. Verify in CI

Push to feature branch and verify GitHub Actions passes all tests:
- Unit tests
- Integration tests
- Dependency version tests
- Build process

#### 6. Commit & Document

```bash
# Update package.json and bun.lock
git add package.json bun.lock

# Update CHANGELOG
# Add entry like:
# ## [X.Y.Z] - YYYY-MM-DD
# ### Fixed
# - OpenCode SDK compatibility: upgraded from 1.0.218 to X.Y.Z

git add CHANGELOG.md

git commit -m "upgrade: OpenCode SDK from A.B.C to X.Y.Z

- Updated @opencode-ai/plugin dependency
- Addresses [specific error/issue]
- Verified with test suite
- No breaking API changes"

git push
```

## Troubleshooting

### Common Issues

#### 1. MessageID Validation Error
```
Invalid string: must start with "msg"
```

**Solution**: Update SDK to 1.1.13 or higher

#### 2. Module Not Found
```
Cannot find module @opencode-ai/sdk
```

**Solution**: Run `bun install` to fetch peer dependencies

#### 3. API Method Doesn't Exist
```
TypeError: client.someMethod is not a function
```

**Solution**: Check SDK changelog for API changes; update client code

### Checking Current Versions

```bash
# View current versions in package.json
grep -A 2 "@opencode-ai" package.json

# Check installed versions
bun list @opencode-ai/plugin @opencode-ai/sdk

# Verify client can connect
bun run dist/cli/run.js "test: check SDK" --ci
```

## Testing Strategy

### Automated Tests

The project includes `tests/dependencies.test.ts` which validates:

1. **Version Compatibility**: SDK version >= 1.1.13
2. **No Regressions**: SDK version not reverted to 1.0.x
3. **API Validation**: messageID format compliance
4. **Import Success**: SDK modules load without errors

Run tests:
```bash
bun test tests/dependencies.test.ts
```

### Manual Testing

```bash
# Quick validation
bun run ~/git/ai-eng-ralph-cli/dist/cli/run.js "test: sdk validation" --ci --print-logs

# Extended session test (simulates longer workflows)
cd ~/git/fleettools
timeout 180 bun run ~/git/ai-eng-ralph-cli/dist/cli/run.js "test: comprehensive check" --ci
```

## Monitoring & Alerts

### In CI/CD

GitHub Actions automatically:
- Runs dependency version tests on every PR
- Validates package.json structure
- Checks for deprecated versions
- Reports compatibility issues

### In Development

Monitor for errors:
```bash
# Check recent error logs
grep -i "messageID\|Invalid string\|SDK" ~/.opencode/logs/*

# Validate version at startup
bun run dist/cli/run.js --version
```

## Prevention Strategies

1. **Regular Updates**: Check for new SDK versions monthly
2. **Pin Versions**: Use caret ranges (^1.1.13) not wildcards
3. **Test Suite**: Always run `bun test` before committing
4. **CI Gating**: Block merges if dependency tests fail
5. **Documentation**: Update this guide with each SDK upgrade

## Related Resources

- [OpenCode Release Notes](https://github.com/opencode-ai/opencode)
- [SDK Changelog](https://github.com/opencode-ai/sdk)
- [API Documentation](https://opencode.dev/docs)
- Project CHANGELOG: See `CHANGELOG.md` for upgrade history

## Timeline: January 2026 Upgrade

- **Jan 10**: Identified messageID validation error
- **Jan 11**: Analyzed SDK version mismatch
- **Jan 11**: Updated SDK from 1.0.218 to 1.1.13
- **Jan 11**: Verified with fleettools testing
- **Jan 12**: Created dependency version test suite
- **Jan 12**: Committed changes and documentation
- **Status**: ✅ Complete and production-ready

## Key Takeaways

1. **Always align SDK versions** with the OpenCode server version
2. **Run dependency tests in CI** to catch mismatches early
3. **Update documentation** when upgrading dependencies
4. **Test end-to-end** with real fleettools workflows
5. **Keep this guide updated** for future maintainers
