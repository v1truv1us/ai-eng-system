# Verification

Verify installation and setup correctness.

---

## Build Verification

Run build: `bun run build`

Check dist/ directory exists

Verify all artifacts created

---

## Hook Verification

Check hooks exist: `ls -la .claude/hooks/`

Verify hooks.json content

Check prompt-optimizer-hook.py executable

---

## Integration Verification

Run integration tests: `node scripts/integration-test.js`

Check all tests pass

Verify hooks installed correctly

---

## Artifact Checklist

✓ dist/.claude-plugin/ exists with hooks

✓ dist/.opencode/tool/ contains prompt-optimize.ts

✓ .claude/hooks/ contains hooks.json and Python script

✓ plugins/ai-eng-system/hooks/ populated

---

## Platform-Specific Verification

Claude Code: Check .claude/ directory structure

OpenCode: Verify .opencode/ commands and agents

Marketplace: Verify plugins/ai-eng-system/ complete
