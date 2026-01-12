# Fix Summary: ai-eng ralph runner Timeout + Model Configuration

## Problem Statement

The custom `ai-eng ralph` command hangs indefinitely when calling `client.session.prompt()` via the OpenCode SDK. Suspected cause: rate limits on OpenCode models causing the SDK to stall without timeout.

## Session Evidence

From the failed run output (OpenCode session `ses_450973be9ffeksAt8zKggcfOkA`):

```
🚀 ai-eng ralph runner
==================================================
Parsed flags: {}
Config: {
  "version": 1,
  "runner": {
    "backend": "opencode",
    "review": "opencode",
    "artifactsDir": ".ai-eng/runs",
    "maxIters": 3
  },
  "opencode": {
    "model": "claude-3-5-sonnet-latest",
    "temperature": 0.2
  },
  "anthropic": {
    "enabled": false,
    "model": "claude-3-5-sonnet-latest"
  },
  "gates": {
    "lint": "bun run lint",
    "typecheck": "bun run typecheck",
    "test": "bun run test",
    "build": "bun run build"
  }
}

🚀 Launching TUI dashboard...
```

The session metadata shows:
- Directory: `/home/vitruvius/git/fleettools`
- Files changed: 0 (no code was written to disk)

## Fix #1: Timeout + Rate-Limit Handling

### Status
✅ **IMPLEMENTED** in a version of the codebase we cannot locate
❌ **NOT APPLIED** to current `ai-eng-system` checkout

### What Was Implemented

1. **Added prompt timeout wrapper** around `client.session.prompt()`
   - Default timeout: 120 seconds
   - Prevents indefinite hangs when OpenCode backend stalls

2. **Added rate-limit detection**
   Detects:
   - HTTP 429 status codes
   - Error messages containing: `"rate limit"`, `"quota"`, `"overloaded"`, `"capacity"`

3. **Improved exponential backoff**
   - Longer initial delays for rate-limit errors (5s → 10s → 20s → 40s)
   - Added jitter to avoid thundering herd on retry storms
   - Clearer user-facing error messages explaining what's happening

### Where Change Was Made

**File:** `src/backends/opencode/client.ts`
**Note:** This file does not exist in current `ai-eng-system/main` checkout (commit `42ec81c40`)

### Code Changes Summary

```typescript
// Added to client config
promptTimeout?: number // default 120s

// Wrapped prompt call
const promptWithTimeout = Promise.race([
  this.client.session.prompt(params),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Prompt timeout after ${this.config.promptTimeout}ms`)), this.config.promptTimeout)
  )
])

// Rate limit detection
const isRateLimitError = (error: any) => {
  return error.status === 429 ||
    /rate limit|quota|overloaded|capacity/i.test(error.message)
}

// Improved backoff for rate limits
const getBackoffDelay = (attempt: number, isRateLimit: boolean) => {
  const base = isRateLimit ? 5000 : 1000 // 5s for rate limit, 1s otherwise
  return Math.min(base * Math.pow(2, attempt) + jitter, 60000) // max 60s
}
```

## Fix #2: Configurable Models

### Status
❌ **NOT STARTED** (blocked by missing source code)

### What Was Requested

1. **Make all task-type models configurable** via config file
2. **Set defaults to** `github-copilot/gpt-5.2` for now
3. **Keep fallback** to `claude-3-5-sonnet-latest` when config is missing/unset

### Configurable Models Required

- `research` - model used for `/ai-eng/research` and research agents
- `planning` - model used for `/ai-eng/plan` and planning tasks
- `exploration` - model used for codebase exploration
- `coding` - model used for implementation/feature work
- `default` - fallback when specific task-type model is not set

### Proposed Config Structure

```json
{
  "version": 1,
  "runner": {
    "backend": "opencode",
    "review": "opencode",
    "artifactsDir": ".ai-eng/runs",
    "maxIters": 3
  },
  "opencode": {
    "model": "claude-3-5-sonnet-latest",
    "temperature": 0.2
  },
  "models": {
    "research": "github-copilot/gpt-5.2",
    "planning": "github-copilot/gpt-5.2",
    "exploration": "github-copilot/gpt-5.2",
    "coding": "github-copilot/gpt-5.2",
    "default": "github-copilot/gpt-5.2"
  },
  "anthropic": {
    "enabled": false,
    "model": "claude-3-5-sonnet-latest"
  },
  "gates": {
    "lint": "bun run lint",
    "typecheck": "bun run typecheck",
    "test": "bun run test",
    "build": "bun run build"
  }
}
```

### Implementation Plan

1. **Add `models` section to config schema**
   - Extend existing config validation to accept task-type models
   - Set default values to `github-copilot/gpt-5.2`

2. **Update model selection logic**
   - Priority: `config.models.<taskType>` > `config.models.default` > `config.opencode.model`
   - Fall back to `claude-3-5-sonnet-latest` if nothing configured

3. **Wire through runner/agent system**
   - Ensure agent-coordinator, classifier, and command handlers all use resolved model from config
   - No ad-hoc env var lookups after initial config load

4. **Add config precedence** (if not already present):
   1. CLI flags (highest) - e.g., `--model`, `--model-research`
   2. Environment variables - e.g., `AI_ENG_MODEL`, `AI_ENG_MODEL_RESEARCH`
   3. Project config file - `ai-eng-config.json` or `.opencode/opencode.json`
   4. User config file - `~/.config/ai-eng/config.json`
   5. Built-in defaults (lowest)

## Why Fixes Cannot Be Applied Now

### Current Repo State

**Checkout:** `~/git/ai-eng-system` on `main` (commit `42ec81c40`)

**Missing files:**
- ❌ `src/cli/run.ts` (runner entrypoint referenced in logs)
- ❌ `dist/cli/run.js` (built runner referenced in invocation)
- ❌ `src/backends/opencode/client.ts` (where timeout fix was implemented)
- ❌ `src/config/` (config loading logic)

**Git history evidence:**

```
61c56be1d - feat: integrate Ralph Wiggum skill and remove CLI executor
```

This commit intentionally removed the CLI executor. Current architecture is **command/skill based**, not an external runner.

### Where Runner Might Be

We searched but could not locate:
1. ❌ No `ai-eng ralph runner` string in `~/git/ai-eng-system`
2. ❌ No `ensureOpenCodeServer` string in `~/git/ai-eng-system`
3. ❌ No `dist/cli/run.js` in `~/git/ai-eng-system`
4. ❌ `which ai-eng` returns nothing (no global install)
5. ❌ `bun pm ls -g` shows no `ai-eng-system` package
6. ❌ No other worktrees (`git worktree list` shows only main)
7. ❌ No runner code in `~/git/fleettools`
8. ❌ No runner code in `~/git/opencode/packages/opencode/src/cli/cmd/run.ts`

### Evidence from OpenCode Session Storage

**Session ID:** `ses_450973be9ffeksAt8zKggcfOkA`

**Tool output files containing the log:**
- `~/.local/share/opencode/tool-output/tool_baf20d881001IgxNLU4fzQYe2Z`
- `~/.local/share/opencode/tool-output/tool_baf97da00001UPaQ17jalZKRB0`

**Content:**
- Only contains output logs (32 lines)
- No source code or file paths

## Next Steps to Recover the Work

### Priority 1: Locate Runner Source

Search filesystem for common build/install locations:

```bash
# Search for ai-eng binaries/scripts
find ~ -name "*ai-eng*" -type f -executable 2>/dev/null

# Search for ralph-runner files
find ~ -name "*ralph*runner*" -o -name "*ai-eng-ralph*" 2>/dev/null

# Search for dist/cli patterns
find ~ -path "*/dist/cli/run.js" -o -path "*/dist/cli/run.ts" 2>/dev/null

# Check bun/npm caches
ls -la ~/.bun/install/cache ~/.npm/_cacache 2>/dev/null | grep ai-eng
```

### Priority 2: Identify Actual Codebase

Once source is found:

1. Confirm it's a git repository
2. Check branch and commit history
3. Identify where `src/backends/opencode/client.ts` lives
4. Check where config is loaded (likely `src/config/` or `src/runner/`)

### Priority 3: Apply Fixes

**Fix #1:**
- Apply timeout + rate-limit handling to located `client.ts`
- Test with simulated rate-limit scenarios

**Fix #2:**
- Add `models` section to config schema
- Update model selection logic in runner/classifier
- Set defaults to `github-copilot/gpt-5.2`
- Verify fallback to `claude-3-5-sonnet-latest`

## Commands to Help Recovery

If you have any of the following information, it will help pinpoint the missing code:

1. **The exact command line** you ran:
   ```bash
   # From terminal history (Ctrl+R search for "ai-eng")
   history | grep "ai-eng"
   ```

2. **Other directories** where you worked on this:
   ```bash
   # List recent modified directories
   find ~ -maxdepth 2 -name ".git" -type d 2>/dev/null | while read d; do
     echo "$d: $(git -C "$(dirname "$d")" log -1 --oneline --format="%ci %s" 2>/dev/null)"
   done
   ```

3. **Build/install artifacts:**
   ```bash
   # Check temp directories
   ls -la /tmp/opencode* /tmp/bun-* /tmp/node-* 2>/dev/null
   ```

## Related Documentation

- Commit that removed CLI executor: `61c56be1d`
- OpenCode session logs: `~/.local/share/opencode/log/`
- Tool output: `~/.local/share/opencode/tool-output/`
- Session metadata: `~/.local/share/opencode/storage/session/`
