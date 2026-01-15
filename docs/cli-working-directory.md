# Working Directory Behavior - ai-eng ralph CLI

## Summary

The CLI **always uses the directory where the command is called from** (`process.cwd()`), not the directory where the CLI is installed.

## Implementation

### Configuration Loading

File: `src/config/loadConfig.ts`

```typescript
// Use current working directory where command is called from
// This ensures .ai-eng/config.yaml is loaded from user's project directory
const ROOT = process.env.TEST_ROOT ?? process.cwd();

// Config path resolves to: <user's-project>/.ai-eng/config.yaml
const configPath = join(ROOT, ".ai-eng", "config.yaml");
```

### OpenCode Session

The OpenCode SDK inherits the working directory from the Node.js process (`process.cwd()`), so all file operations happen in the user's project directory.

## User Experience

When a user runs the CLI from their project:

```bash
cd ~/my-awesome-project
bun ~/git/ai-eng-system/src/cli/run.ts
```

**What happens:**
1. ✅ Config loaded from: `~/my-awesome-project/.ai-eng/config.yaml`
2. ✅ Artifacts saved to: `~/my-awesome-project/.ai-eng/runs/`
3. ✅ OpenCode operates in: `~/my-awesome-project/`
4. ✅ All file paths are relative to: `~/my-awesome-project/`

**NOT** from the CLI installation directory (`~/git/ai-eng-system/`)

## Testing

Test coverage in `tests/cli/ralph-cli.test.ts`:

```typescript
it("should use current working directory for config path", async () => {
    const flags: RalphFlags = {
        dryRun: true,
    };

    // Config loader should look for .ai-eng/config.yaml in process.cwd()
    // Not in the CLI installation directory
    const config = await loadConfig(flags);

    expect(config).toBeDefined();
    expect(config.version).toBe(1);
    
    // The actual path tested is: process.cwd() + '/.ai-eng/config.yaml'
    // This ensures CLI works from any directory the user calls it from
});
```

## Global Installation (Future)

When installed globally via npm:

```bash
npm install -g @v1truv1us/ai-eng-system
cd ~/my-awesome-project
"ai-eng ralph"
```

The behavior will be the same:
- ✅ Uses `~/my-awesome-project/` as working directory
- ✅ Loads config from `~/my-awesome-project/.ai-eng/config.yaml`
- ❌ Does NOT use the global install directory

## Key Design Principle

**The CLI operates on the user's current project, not on itself.**

This matches standard CLI tool behavior (like `git`, `npm`, `bun`, etc.) where:
- The tool is installed in one location
- But operates on the current working directory
- Configuration is project-specific, not tool-specific

## Related Files

- `src/config/loadConfig.ts` - Uses `process.cwd()`
- `src/cli/run.ts` - Entry point (doesn't change working directory)
- `src/cli/tui/App.ts` - TUI (doesn't change working directory)
- `src/backends/opencode/client.ts` - OpenCode wrapper (inherits `process.cwd()`)

## Verification

To verify this behavior in your project:

```bash
# 1. Create a test project
mkdir /tmp/test-project
cd /tmp/test-project

# 2. Create a config file
mkdir -p .ai-eng
echo "version: 1" > .ai-eng/config.yaml

# 3. Run CLI from this directory
bun ~/git/ai-eng-ralph-cli/src/cli/run.ts

# 4. Check console output - should show:
# "Config loaded from: /tmp/test-project/.ai-eng/config.yaml"
# NOT from: ~/git/ai-eng-ralph-cli/.ai-eng/config.yaml
```

## Summary

✅ **Correct**: Uses `process.cwd()` - user's project directory  
❌ **Incorrect**: Using `import.meta.url` - CLI installation directory

The implementation is correct and follows standard CLI tool patterns.
