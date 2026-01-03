# OpenCode Integration - Final Implementation

## Summary

The `ai-eng-system` package now has **TWO** ways to install files:

### 1. Plugin Initialization (Primary)
When OpenCode loads the plugin, it automatically installs files to the project directory.

### 2. npm postinstall Script (Fallback)
When `npm install ai-eng-system` runs in a project with `opencode.jsonc`, it installs files automatically.

## How It Works

### Plugin Initialization

**File**: `src/index.ts`

When OpenCode loads `ai-eng-system` plugin:

```typescript
export const AiEngSystem: Plugin = async ({ directory }) => {
    // `directory` = where opencode.jsonc is located
    // Copies files to {directory}/.opencode/
}
```

### postinstall Script

**File**: `scripts/install.ts` → `scripts/install.js`

When `npm install` runs:

```typescript
function main(): void {
    const isPostInstall = process.env.npm_lifecycle_event === 'postinstall'

    if (isPostInstall) {
        // Find opencode.jsonc by traversing up from CWD
        const configPath = findOpenCodeConfig(process.cwd())

        if (configPath) {
            // Install to directory containing opencode.jsonc
            install(path.dirname(configPath), true) // Silent mode
        }
    }
}
```

## Installation Flow

```
User creates opencode.jsonc:
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-skills", "ai-eng-system"]
}

User runs: npm install ai-eng-system

↓

npm runs: postinstall script
  - Finds opencode.jsonc by traversing up directories
  - Installs to .opencode/command/ai-eng/
  - Installs to .opencode/agent/ai-eng/
  - Installs to .opencode/skill/

User runs: opencode

↓

OpenCode loads: ai-eng-system plugin
  - Plugin initialization function runs
  - Receives { directory } parameter
  - Installs files (if not already present)
```

## What Gets Installed

```
your-project/
├── opencode.jsonc
└── .opencode/
    ├── command/
    │   └── ai-eng/            # 16 commands
    ├── agent/
    │   └── ai-eng/            # 30 agents (5 categories)
    └── skill/                 # 15 skill files
```

## Files Modified

### 1. `src/index.ts` - Plugin Implementation
- Added `copyRecursive()` function
- Added `installToProject()` function
- Plugin initialization copies files automatically
- Detects if running from dist/ or package root

### 2. `scripts/install.ts` - Postinstall Script (NEW)
- Finds `opencode.jsonc` by traversing up directories
- Installs files silently during `npm install`
- Shows verbose output when run manually
- Safe: silently exits if no opencode.jsonc found

### 3. `package.json` - NPM Configuration
- Added: `"postinstall": "node scripts/install.js"`
- Includes: `"scripts/install.js"` in files array

### 4. `.opencode/opencode.jsonc` - Config Template
- Includes `"opencode-skills"` in plugin array
- Template for users to extend

### 5. `build.ts` - No Changes
- Already builds `dist/.opencode/` correctly
- Already builds `dist/skills/` correctly

## Key Features

### Automatic Detection
- postinstall script traverses up directories to find `opencode.jsonc`
- Works from nested directories within project

### Silent Mode
- postinstall runs silently (no output)
- Only shows errors if something goes wrong

### Manual Invocation
- Can run manually: `node scripts/install.js`
- Shows verbose output with file counts

### Dual Installation
- Plugin initialization: Runs when OpenCode loads plugin
- postinstall: Runs during `npm install`
- Either approach works - redundancy for reliability

### Safe
- Never touches `~/.config/opencode/`
- Only installs to project's `.opencode/` directory
- Won't overwrite existing files

## Testing

### Test Plugin Initialization
```bash
bun run build
node test-plugin.mjs
```

Expected output:
```
✅ Commands installed: 16 files
✅ Agents installed: 30 files
✅ Skills installed: 15 files
```

### Test postinstall Script
```bash
cd /tmp/test-npm-install
echo '{"$schema":"https://opencode.ai/config.json","plugin":["opencode-skills","ai-eng-system"]}' > opencode.jsonc
node /path/to/ai-eng-system/scripts/install.js
```

Expected output:
```
🔧 Installing AI Engineering System to /tmp/test-npm-install
  ✓ command/ai-eng/ (16 commands)
  ✓ agent/ai-eng/ (30 agents)
  ✓ skill/

✅ Installation complete!
   Namespace: ai-eng
```

### Test Silent postinstall
```bash
npm install ai-eng-system --silent
```

No output expected (silent mode), but files should be installed to `.opencode/`.

## User Workflow

### For New Projects

```bash
# 1. Create project directory
mkdir my-project && cd my-project

# 2. Create opencode.jsonc
echo '{"$schema":"https://opencode.ai/config.json","plugin":["opencode-skills","ai-eng-system"]}' > opencode.jsonc

# 3. Install package
npm install ai-eng-system

# 4. Run OpenCode
opencode

# Files are automatically available!
```

### For Existing Projects

```bash
# Add plugin to opencode.jsonc
# Then run:
npm install ai-eng-system
```

## Next Steps

1. ✅ Build project
2. ✅ Test installation manually
3. ✅ Test postinstall behavior
4. ✅ Test plugin initialization
5. 🔄 Publish to npm
6. 🔄 Update README.md
7. 🔄 Test with actual OpenCode installation

## Benefits

- **Automatic installation**: No manual file copying needed
- **Project-scoped**: Files go to `.opencode/`, not global
- **Dual approach**: Works via plugin OR npm install
- **Namespace isolation**: All commands/agents under `ai-eng` namespace
- **Skills integration**: Works with `opencode-skills` plugin
- **Safe**: Never touches global OpenCode config
