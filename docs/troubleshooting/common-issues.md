# Common Issues

Troubleshooting guide for common installation and build problems.

## Install Issues

If installation fails:

```bash
ai-eng install --scope project
```

Check:
- the CLI is installed: `ai-eng --help`
- your target directory permissions
- that you are not relying on old `node scripts/install.js` flows

## Build Failures

Check your local toolchain:

- Node.js 20+
- Bun installed

Then retry:

```bash
bun install
bun run build
```

## Claude Hook Issues

Check:
- `.claude/hooks/` exists when expected
- Python 3 is installed
- your Claude/plugin installation is current

## OpenCode Issues

Check:
- `.opencode/` exists for project installs
- OpenCode plugin config includes `ai-eng-system`
- generated assets exist after `bun run build`
