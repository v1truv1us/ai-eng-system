---
name: agents-sdk-dev
description: "Unified agent application scaffolding across 5 harnesses: Anthropic, Cursor, OpenAI, OpenCode, and Pi. Interactive project generator with live SDK docs, per-harness code patterns, and built-in verification. Use when someone says \"create an agent app\", \"new SDK project\", \"build with [harness] SDK\", \"scaffold agent\", or wants to verify an existing agent setup."
metadata:
  category: user-invoked
  version: 1.0.0
  tags: agent-sdk, scaffold, anthropic, cursor, openai, opencode, pi, verification
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Agents SDK Dev

Unified agent scaffolding and verification. One interactive flow, per-harness SDK
detail, built-in verification.

## Supported Harnesses

| Harness | SDK Package | Languages | Runtime |
|---------|------------|-----------|---------|
| Anthropic | `@anthropic-ai/claude-agent-sdk` / `claude-agent-sdk` | TS, Python | API |
| Cursor | `@cursor/sdk` | TS | Local + Cloud |
| OpenAI | `@openai/agents` / `openai-agents` | TS, Python | API |
| OpenCode | `opencode` | TS | Local |
| Pi | CLI bridge (`pi -p`) | Any | Local subprocess |

## Flow

```
Gather Requirements → Load SDK Reference → Setup Plan → Implement → Verify
```

---

## Step 1: Gather Requirements

Ask these questions **one at a time**. Wait for the answer before asking the next.
Skip any the user already provided via arguments.

### 1. Harness (ask first)

"Which harness are you targeting?"

- Anthropic (Claude Agent SDK)
- Cursor SDK
- OpenAI (Agents SDK)
- OpenCode
- Pi (CLI bridge)

If the user's request implies a harness ("build with claude", "cursor agent"),
infer it and confirm.

### 2. Language (ask second)

"TypeScript or Python?"

- Skip if harness only supports one language (Cursor = TS, OpenCode = TS, Pi = any)
- Anthropic and OpenAI support both

### 3. Project name (ask third)

"What would you like to name your project?"

- Use as directory name and package name
- If provided via argument, skip

### 4. Agent type (ask fourth)

"What kind of agent are you building?"

- **Coding agent**: code review, security scan, SRE, debugging
- **Business agent**: customer support, content generation, data processing
- **Research agent**: multi-step investigation, synthesis, competitive analysis
- **Custom**: describe your use case

### 5. Starting point (ask fifth)

"Would you like:"

- **Minimal**: Hello World, single agent, no tools
- **Basic**: Agent with tools, error handling, streaming
- **Full**: Multi-agent with handoffs, verification loop, state persistence

### 6. Tooling (confirm)

Confirm the package manager:

- TS: npm / yarn / pnpm / bun (prefer bun if `bun.lock` exists)
- Python: pip / poetry / uv (prefer uv if `uv.lock` exists)
- Respect existing lockfiles in the target directory

---

## Step 2: Load SDK Reference

Based on the harness choice, read the appropriate reference file from this
skill's `references/` directory:

| Harness | Reference File | Official Docs |
|---------|---------------|---------------|
| Anthropic | `references/anthropic-sdk.md` | https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk |
| Cursor | `references/cursor-sdk.md` | https://docs.cursor.com/tools/sdk |
| OpenAI | `references/openai-agents-sdk.md` | https://openai.github.io/openai-agents-python/ |
| OpenCode | `references/opencode-sdk.md` | Package types / README |
| Pi | `references/pi-cli-bridge.md` | `pi --help` / local examples |

**Always fetch the latest live docs** via WebFetch or WebSearch before generating
code. SDK surfaces evolve; the reference file is a baseline, not a substitute for
current documentation.

**Check for latest versions** before installing. Check the package registry
(npm, PyPI) and verify the version installs without errors.

---

## Step 3: Setup Plan

Present a concise plan covering:

1. **Project init**: directory, package manager, config files
2. **SDK install**: exact install command with latest version
3. **Starter files**: entry point with basic agent setup matching agent type
4. **Environment**: `.env.example`, `.gitignore`, API key instructions
5. **Optional**: harness-specific directory structure, example tools, README

Get user confirmation before proceeding.

---

## Step 4: Implementation

Execute the confirmed plan:

1. Check for latest package versions (WebSearch if needed)
2. Create project directory and initialize package manager
3. Install SDK and dependencies at latest stable versions
4. Create starter files based on agent type and starting point
5. Add environment config (`.env.example`, `.gitignore`)
6. Verify installed version matches expectation
7. Add a README with setup and run instructions

### Code requirements

- Proper imports from the correct SDK package
- Type safety (TS: strict mode, Python: type hints)
- Error handling around API calls (rate limits, auth, transient errors)
- No hardcoded secrets — all keys via env vars
- Modern syntax compatible with latest SDK version
- Comments explaining the SDK-specific parts
- The shared workflow contract where applicable (see below)

---

## Step 5: Verification

After all files are created and dependencies installed:

### TypeScript projects

```bash
npx tsc --noEmit
```

Fix ALL type errors. Do not consider setup complete until this passes cleanly.

### Python projects

```bash
python -c "import <sdk_package>"
```

Verify imports resolve and no syntax errors exist.

### Universal verification checklist

Run through these checks regardless of harness:

- [ ] SDK installed and importable at the correct version
- [ ] Package manifest has correct entries (name, type, scripts)
- [ ] Config files match SDK requirements (ESM, tsconfig, pyproject, etc.)
- [ ] API key setup documented (`.env.example` exists, `.env` in `.gitignore`)
- [ ] No hardcoded secrets in any source file
- [ ] Agent initialization follows SDK-documented patterns
- [ ] Error handling covers: rate limits, auth failures, network errors
- [ ] README includes: setup steps, how to run, key concepts link
- [ ] Project compiles/runs without errors

### Verification report format

```
**Status**: PASS | PASS WITH WARNINGS | FAIL

**Critical Issues**: (blockers, runtime failures, type errors)
**Warnings**: (suboptimal patterns, missing features)
**Passed**: (what's correct)
**Recommendations**: (specific improvements with SDK doc links)
```

---

## Post-setup Guide

Provide the user:

1. **How to set their API key** (copy from `.env.example`)
2. **How to run the agent** (exact command)
3. **Key concepts** (system prompts, tools, permissions, MCP, handoffs)
4. **SDK reference link** (official docs URL)
5. **Common next steps**:
   - Customize the system prompt
   - Add custom tools
   - Configure permissions
   - Add MCP server integration
   - Implement handoffs (multi-agent)
   - Add streaming output

---

## Harness Quick Reference

### Anthropic

- **npm**: `@anthropic-ai/claude-agent-sdk`
- **pip**: `claude-agent-sdk`
- **Docs**: https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk
- **Key APIs**: Agent, Session, Tool, MCP Server, Streaming
- **Local example**: `agents/research-runner/anthropic/runner.ts`
- **Reference**: `references/anthropic-sdk.md`

### Cursor

- **npm**: `@cursor/sdk`
- **Docs**: https://docs.cursor.com/tools/sdk
- **Key APIs**: `Agent.create()`, `Agent.prompt()`, `Agent.resume()`, streaming
- **Local example**: `agents/research-runner/cursor/runner.ts`
- **Reference**: `references/cursor-sdk.md`

### OpenAI

- **npm**: `@openai/agents`
- **pip**: `openai-agents`
- **Docs**: https://openai.github.io/openai-agents-python/
- **Key APIs**: Agent, Runner, Handoff, Tool, Guard, Tracing
- **Local example**: `agents/research-runner/codex/runner.ts`
- **Reference**: `references/openai-agents-sdk.md`

### OpenCode

- **npm**: `opencode` (local SDK)
- **Key APIs**: Prompt sessions, local execution, skill loading
- **Local example**: `agents/research-runner/opencode/runner.ts`
- **Reference**: `references/opencode-sdk.md`

### Pi

- **No SDK package**: CLI bridge via `pi -p "prompt"`
- **Subprocess**: Spawn `pi` with arguments, capture stdout/stderr
- **MCP**: In-session subagent tools (Agent, crew_agent)
- **Local example**: `agents/research-runner/pi/runner.ts`
- **Reference**: `references/pi-cli-bridge.md`

---

## Shared Workflow Contract

All scaffolded agents that integrate with the ai-eng-system runner framework
should expose this contract:

```ts
type WorkflowInput = {
  goal: string;
  cwd?: string;
  model?: string;
  maxIterations?: number;
  statePath?: string;
};

type WorkflowResult = {
  status: "success" | "blocked" | "failed";
  summary: string;
  artifacts: string[];
  nextSteps?: string[];
};
```

Shared types: `agents/research-runner/shared/workflow-contract.ts`

---

## Reference Files

| File | Content |
|------|---------|
| `references/anthropic-sdk.md` | Anthropic Agent SDK API surface, patterns, code examples |
| `references/cursor-sdk.md` | Cursor TypeScript SDK API surface, patterns, traps |
| `references/openai-agents-sdk.md` | OpenAI Agents SDK API surface, handoffs, tracing |
| `references/opencode-sdk.md` | OpenCode local SDK patterns and session management |
| `references/pi-cli-bridge.md` | Pi CLI bridge, subprocess patterns, MCP subagent tools |

---

## Voice and Posture

This skill helps the user **build** agent applications. It is not the place to
validate, congratulate, or sell any SDK as a choice. The user's intent is the
input; your job is execution.

Ask questions one at a time. Do not batch questions. Respect the user's time.

When the user specifies a harness, load the reference file and follow its
patterns. When the user asks to verify, run the verification checklist. When
the user asks for help with an existing project, skip to the relevant step.
