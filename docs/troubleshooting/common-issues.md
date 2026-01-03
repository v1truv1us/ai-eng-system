# Common Issues

Troubleshooting guide for common problems.

---

## Hooks Not Working

Verify .claude/hooks/ directory exists

Check hooks.json has UserPromptSubmit entry

Ensure Python 3 installed: `python3 --version`

---

## Build Failures

Check Node.js version: 18+ required

Clear dist/ directory: `bun run clean`

Verify build.ts has no syntax errors

---

## Install Issues

Run with verbose mode: `node scripts/install.js --verbose`

Check permissions on .claude/ directory

Verify npm global installation path

---

## Prompt Optimization Bypassed

Check config file: enabled must be true

Verify ! prefix only used when intended

Check session auto-approve setting

---

## OpenCode Tool Not Found

Verify tool in dist/.opencode/tool/

Check .opencode directory exists

Rebuild: `bun run build`
