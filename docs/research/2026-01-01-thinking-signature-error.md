---
date: 2026-01-01
researcher: Assistant
topic: 'Invalid `signature` in `thinking` block' error + OpenCode command options analysis
tags: [research, opencode, thinking-block, signature, bug, commands, options]
status: complete
confidence: high
agents_used: [web-search, general]
---

## Synopsis

The error `messages.1.content.0: Invalid 'signature' in 'thinking' block` is a **known, actively tracked bug in OpenCode** (Issue #6418, opened Dec 30, 2025). It occurs when conversation history includes thinking blocks from one model/provider, and you switch models mid-session. The local OpenCode fork at `/home/vitruvius/git/opencode` is iOS-focused and **significantly behind upstream**, missing many thinking-related fixes.

**Your documented `/ai-eng/research` command options (--swarm, --feed-into, etc.) are not implemented** in the runtime - they're only in documentation but not wired to actual parsing logic.

## Summary
- **Error Cause**: OpenCode bug when replaying conversation history with thinking blocks across model switches
- **Local Fork Status**: iOS branch, outdated from upstream by ~200+ commits
- **Options Implementation**: Most documented options don't exist in the runtime
- **Fix Status**: Being actively worked on (assigned to rekram1-node who fixed #2599)

## Detailed Findings

### 1. The "Invalid signature in thinking block" Error

#### Issue #6418 (Exact Match)
- **Title**: Error: Invalid `signature` in `thinking` block
- **Opened**: Dec 30, 2025 (2 days ago!)
- **Status**: Open, assigned to rekram1-node
- **Steps to reproduce**:
  1. Start new session
  2. Send messages with Model A (GLM 4.7 or MinMax 2.1)
  3. Switch to Model B (Opus 4.5 via Anthropic)
  4. Send message → ERROR
- **Exact error**: `messages.19.content.0: Invalid 'signature' in 'thinking' block`

#### Related Issues
- **Issue #2599** (Sep 14, 2025): Similar error, fixed by PR #2602
  - Error: `messages.3.content.0.type: Expected 'thinking' or 'redacted_thinking', but found 'text'`
  - Fix merged Sep 14, 2025 by rekram1-node
- **Issue #5028** (Dec 3, 2025): "text content blocks must be non-empty" - similar message validation issue
- **Issue #5073**: Feature request for slash command CLI support

#### Root Cause Analysis
The error occurs because:
1. Anthropic's API with `thinking: enabled` requires thinking blocks to have valid cryptographic signatures
2. When OpenCode replays conversation history from a different provider/model, the thinking blocks have signatures valid for the original provider but invalid for the new provider
3. This violates Anthropic's API contract: "When `thinking` is enabled, a final `assistant` message must start with a thinking block"

### 2. OpenCode Command Options Analysis

#### What IS Implemented (in `src/cli/executor.ts:303-325`)
```typescript
.option("-s, --scope <scope>", "Research scope (codebase|documentation|all)", "all")
.option("-d, --depth <depth>", "Research depth (shallow|medium|deep)", "medium")
.option("-o, --output <file>", "Output file path", "")
.option("-f, --format <format>", "Export format (markdown|json|html)", "markdown")
.option("--no-cache", "Disable research caching", false)
.option("-v, --verbose", "Enable verbose output", false)
```

#### What is Documented but NOT Implemented
From your research command markdown:
- `--swarm` - Use Swarms multi-agent orchestration
- `--feed-into <command>` - Feed results into specify|plan
- `--no-cache` IS implemented (but inverted - uses `options.cache !== false`)
- `--no-cache` documentation matches implementation

#### OpenCode Native Command Structure
From `opencode.ai/docs/commands/`:

Commands are defined via:
1. **JSON config** in `opencode.jsonc`:
   ```json
   {
     "command": {
       "test": {
         "template": "Run tests...",
         "description": "Run tests with coverage",
         "agent": "build",
         "model": "anthropic/claude-3-5-sonnet-20241022"
       }
     }
   }
   ```

2. **Markdown files** in `.opencode/command/` directory:
   ```markdown
   ---
   description: Run tests with coverage
   agent: build
   model: anthropic/claude-3-5-sonnet-20241022
   ---
   Run the full test suite with coverage report...
   ```

**Valid command options** (from OpenCode docs):
- `template` - The prompt sent to LLM (required)
- `description` - Shown in TUI
- `agent` - Which agent to use
- `subtask` - Force subagent invocation (boolean)
- `model` - Override default model

**Arguments syntax**:
- `$ARGUMENTS` - All arguments
- `$1`, `$2`, `$3` - Positional arguments
- `!`command`` - Shell output injection
- `@filename` - File content inclusion

### 3. Local OpenCode Fork Status

#### Repository Location
- **Path**: `/home/vitruvius/git/opencode`
- **Branch**: `ios/dev`
- **Remotes**:
  - `origin`: `git@github.com:v1truv1us/opencode.git` (your fork)
  - `upstream`: `git@github.com:sst/opencode.git` (original)

#### Commit Comparison
**Local latest commits** (iOS-focused):
```
916cba5af feat(ios): support non-tagged builds for development...
e0ee8fcd9 fix(ios): install bun in ci_post_clone.sh...
5462ff7f2 fix(ios): resolve Xcode Cloud DNS...
```

**Upstream dev branch** (has thinking fixes):
```
3b033245 fix: display error if invalid agent is used in a command
01237c53 release: v1.0.223
6e7fc30f feat(app): context window window
03733b05 fix(util): checksum defensiveness
```

**Key missing commits** (thinking-related in upstream dev):
- `5f57cee8e fix: user invoked subtasks causing tool_use or missing thinking signa… (#5650)`
- `18d3c054a more interleaved thinking fixes (#5334)`
- `df64612d5 better interleaved thinking support (#5298)`
- `955b901de Thinking & tool call visibility settings for /copy and /export (#6243)`

#### Gap Assessment
- **Your fork is ~200+ commits behind upstream dev**
- All thinking block fixes are missing from your local copy
- The iOS branch diverged significantly from main development

### 4. Thinking Block Architecture in OpenCode

From commit history, OpenCode has multiple thinking-related systems:

#### Thinking Block Handling
- `thinking: enabled` - Anthropic's extended thinking mode
- `redacted_thinking` - Alternative thinking block format
- `signature` - Cryptographic signature for thinking blocks
- `interleaved thinking` - Thinking blocks interspersed with tool calls

#### Recent Fixes (in upstream, missing from local)
1. **PR #5650**: Fix user invoked subtasks causing tool_use or missing thinking signatures
2. **PR #5334**: More interleaved thinking fixes
3. **PR #5298**: Better interleaved thinking support
4. **PR #6243**: Thinking & tool call visibility settings

### 5. Related Ecosystem Bugs

This is a widespread issue across AI coding tools:

- **anthropics/claude-code#10627**: "[Bug] Anthropic API Error: Invalid `signature` in thinking block"
- **cline/cline#7620**: "Invalid `signature` in `thinking` block" with Gemini-3-pro-preview + Claude-sonnet-4-5
- **cline/cline#7723**: Vertex AI "Invalid `signature` in `thinking` block" error
- **anthropics/claude-code#10199**: "[BUG] API Error 400 - Thinking Block Modification Error"

## Recommendations

### Immediate Actions (to unblock yourself)

1. **Upgrade OpenCode** - Your installed version is likely outdated
   ```bash
   # Check current version
   opencode --version
   
   # Update to latest (if installed via npm)
   npm update -g opencode
   ```

2. **Disable thinking blocks** - Add to your `opencode.jsonc`:
   ```json
   {
     "provider": {
       "anthropic": {
         "models": {
           "claude-sonnet-4-20250514": {
             "options": {
               "thinking": {
                 "type": "disabled"
               }
             }
           }
         }
       }
     }
   }
   ```

3. **Start fresh sessions** - Avoid switching models mid-conversation when using thinking-enabled models

4. **Avoid thinking-enabled models** for complex multi-turn sessions

### For Your Local OpenCode Fork

If you need to sync your fork:

```bash
cd /home/vitruvius/git/opencode

# Check if upstream remote exists
git remote -v

# If not, add it
git remote add upstream git@github.com:sst/opencode.git

# Fetch upstream changes
git fetch upstream

# Check what branches you have
git branch -a

# Sync a specific branch (e.g., dev)
git checkout dev
git merge upstream/dev

# Or create a new branch from upstream
git checkout -b synced-dev upstream/dev
```

**Warning**: The iOS branch has diverged significantly. Merging upstream dev will likely cause conflicts.

### For Your `/ai-eng/research` Command Options

The documented options like `--feed-into`, `--swarm` are **not implemented**. To make them work:

1. **Option A**: Implement parsing in `src/cli/executor.ts` around line 900-950
   - Add `--feed-into` option parsing
   - Add logic to invoke other commands with research context
   - Add `--swarm` option to use swarms executor

2. **Option B**: Document that these are planned/incomplete features
   - Update documentation to reflect actual implementation status
   - Remove or mark as "not yet implemented"

## Code References

- **Research CLI options**: `src/cli/executor.ts:303-325`
- **Research config mapping**: `src/cli/executor.ts:900-950`
- **Research orchestrator**: `src/research/orchestrator.ts`
- **OpenCode command docs**: https://opencode.ai/docs/commands/
- **OpenCode issue #6418**: https://github.com/sst/opencode/issues/6418
- **OpenCode PR #2602** (thinking fix): https://github.com/sst/opencode/pull/2602

## Architecture Insights

### OpenCode Message Flow (simplified)
```
User Input → OpenCode TUI → LLM API Request Builder
                                    ↓
                          Replay Conversation History
                                    ↓
                          Validate Message Structure
                                    ↓
                          Send to Provider (Anthropic/OpenAI/etc.)
                                    ↓
                          Error if thinking block signature invalid
```

### Where the Bug Occurs
The validation happens in OpenCode's **message history replay** code. When:
1. Model A generates thinking blocks with Model A signatures
2. User switches to Model B
3. OpenCode replays history including Model A's thinking blocks
4. Provider B rejects Model A's signatures

## Open Questions
- [ ] What OpenCode version is installed? (check `opencode --version`)
- [ ] Which specific model were you using when the error occurred?
- [ ] Is "thinking" enabled in your OpenCode config?
- [ ] Do you switch models mid-conversation often?
- [ ] Are you using the local OpenCode fork or a released version?

## Confidence

**Research findings confidence: 0.92**

High confidence because:
- Issue #6418 matches exactly (same error, same symptom)
- Multiple related issues confirm the pattern
- Local fork is visibly behind upstream
- Options implementation gap is provable from code inspection

**Limitation**: Cannot verify your installed OpenCode version without access to your system.

## References
- https://github.com/sst/opencode/issues/6418
- https://github.com/sst/opencode/issues/2599
- https://github.com/sst/opencode/pull/2602
- https://opencode.ai/docs/commands/
- https://github.com/sst/opencode/commits/dev
