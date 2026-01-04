# Global-Aware Plugin Installation

## Overview

Modify the ai-eng-system OpenCode plugin to automatically detect and install to the correct location based on where the `opencode.jsonc` configuration file is found. Currently, the plugin unconditionally installs to the project's local `.opencode/` directory, ignoring the global `~/.config/opencode/` installation location.

## Context

### Problem Statement

The ai-eng-system plugin (`src/index.ts`) currently:
1. Receives a `directory` parameter from OpenCode (always the project directory)
2. Unconditionally installs commands, agents, and skills to `{directory}/.opencode/`
3. Does NOT check if ai-eng-system is already installed in `~/.config/opencode/`
4. Does NOT respect the existing `scripts/install.js` behavior that checks for global config

### User Personas

- **Primary**: Single-user developer (the maintainer) who wants ai-eng-system installed globally to avoid duplicating files across projects
- **Secondary**: Future users who may install ai-eng-system and expect it to respect their OpenCode configuration

### System Context

This feature modifies the ai-eng-system OpenCode plugin:
- **Component**: `src/index.ts` (TypeScript plugin) and `dist/index.js` (compiled)
- **Integration Point**: OpenCode plugin system (`@opencode-ai/plugin` package)
- **Related Component**: `scripts/install.js` (npm postinstall - already has correct logic)
- **Configuration File**: `opencode.jsonc` (project) and `~/.config/opencode/opencode.jsonc` (global)

### Research Context

Key findings from `docs/research/2026-01-04-global-vs-local-installation.md`:

1. **Two Installation Paths**: The plugin and postinstall script have different behaviors:
   - `scripts/install.js`: ✅ Checks global config, respects priority (local → global)
   - `src/index.ts`: ❌ Always installs locally, ignores global

2. **OpenCode Config Locations**:
   - Project: `<project>/.opencode/opencode.jsonc`
   - Global: `~/.config/opencode/opencode.jsonc`

3. **Plugin Load Order** (from OpenCode docs):
   - Global config → Project config → Global plugins → Project plugins
   - Components are merged, not replaced

## User Stories

### US-001: Auto-Detect Installation Location
**As a** developer who has ai-eng-system configured in global OpenCode config
**I want** the plugin to automatically install to `~/.config/opencode/` instead of my project
**So that** I don't have duplicate installations across every project

#### Acceptance Criteria
- [ ] Plugin checks for `opencode.jsonc` in both project (`.opencode/`) and global (`~/.config/opencode/`) locations
- [ ] Plugin installs to the directory containing the `opencode.jsonc` that references `ai-eng-system`
- [ ] If both configs exist with `ai-eng-system` referenced, project-level takes precedence (matching postinstall behavior)
- [ ] If only global config exists with `ai-eng-system` referenced, install to global
- [ ] If no config with `ai-eng-system` referenced exists, log warning and skip installation

### US-002: Always Use Latest Version
**As a** developer who updates ai-eng-system package
**I want** the plugin to always overwrite old files with new ones
**So that** I'm always using the latest commands, agents, and skills

#### Acceptance Criteria
- [ ] All existing commands in `~/.config/opencode/command/ai-eng/` or `.opencode/command/ai-eng/` are overwritten
- [ ] All existing agents in `~/.config/opencode/agent/ai-eng/` or `.opencode/agent/ai-eng/` are overwritten
- [ ] All existing skills in `~/.config/opencode/skill/` or `.opencode/skill/` are overwritten (same filename = overwrite)
- [ ] No version comparison or conditional overwrite logic

### US-003: Silent Installation with Initial Log
**As a** developer using ai-eng-system
**I want** the plugin to be mostly silent but tell me where it installed files on first run
**So that** I can verify the installation location without noisy logs on every session

#### Acceptance Criteria
- [ ] Plugin logs installation location only on first run per session (when files are actually copied)
- [ ] Log message format: `[ai-eng-system] Installed to: {targetPath}`
- [ ] Subsequent runs in same session produce no output
- [ ] Errors are still logged to console.error

### US-004: Handle Missing Config Gracefully
**As a** developer who hasn't configured ai-eng-system in OpenCode yet
**I want** the plugin to not crash or error when no config is found
**So that** OpenCode can still start and function normally

#### Acceptance Criteria
- [ ] If no `opencode.jsonc` is found in either location, plugin logs info message and continues
- [ ] If `opencode.jsonc` exists but doesn't reference `ai-eng-system`, plugin logs debug message and continues
- [ ] Plugin never throws errors that prevent OpenCode from loading

## Non-Functional Requirements

### Security
- Plugin must not write files outside of `~/.config/opencode/` or project `.opencode/` directories
- Plugin must validate that target directory is within expected OpenCode paths
- No external network calls or data exfiltration

### Performance
- Installation should complete within 50ms on typical hardware
- File operations should use synchronous I/O (matching existing pattern)
- No blocking operations that delay OpenCode initialization

### Availability & Reliability
- Plugin should handle missing directories by creating them
- Plugin should handle permission errors gracefully (log and continue)
- Plugin should not prevent OpenCode from starting if installation fails

### Maintainability
- Plugin behavior should match `scripts/install.js` for consistency
- Clear logging for debugging installation issues
- Code should be easily testable with mocked filesystem

### Compliance
- N/A: Single-user tool, no compliance requirements

### Accessibility
- N/A: CLI plugin, no user interface

## Technical Design

### File Structure Changes

```
src/
├── index.ts          # Modified: add global-aware installation logic
dist/
├── index.js          # Recompiled: with new installation logic
├── index.d.ts        # Regenerated: type definitions
```

### Algorithm for Installation Location Detection

```typescript
function findOpenCodeConfig(): ConfigResult | null {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const cwd = process.cwd(); // Or directory from plugin context

    // Priority 1: Check project-local config
    const projectConfigPath = path.join(cwd, ".opencode", "opencode.jsonc");
    if (fs.existsSync(projectConfigPath)) {
        return { path: projectConfigPath, scope: "project" };
    }

    // Priority 2: Check global config
    const globalConfigPath = path.join(homeDir, ".config", "opencode", "opencode.jsonc");
    if (fs.existsSync(globalConfigPath)) {
        return { path: globalConfigPath, scope: "global" };
    }

    return null;
}

function isPluginReferenced(configPath: string): boolean {
    try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configContent);
        
        if (Array.isArray(config.plugin)) {
            return config.plugin.includes("ai-eng-system");
        }
        return false;
    } catch {
        return false;
    }
}
```

### Installation Flow

```typescript
async function install() {
    const configResult = findOpenCodeConfig();
    
    if (!configResult) {
        console.info("[ai-eng-system] No opencode.jsonc found, skipping installation");
        return;
    }
    
    if (!isPluginReferenced(configResult.path)) {
        console.info("[ai-eng-system] ai-eng-system not referenced in opencode.jsonc, skipping installation");
        return;
    }
    
    const targetDir = path.dirname(configResult.path);
    const isFirstRun = !fs.existsSync(path.join(targetDir, "command", "ai-eng"));
    
    await installToProject(targetDir);
    
    if (isFirstRun) {
        console.info(`[ai-eng-system] Installed to: ${targetDir}`);
    }
}
```

### File Copy Strategy

- Commands: `dist/.opencode/command/ai-eng/*` → `{target}/command/ai-eng/`
- Agents: `dist/.opencode/agent/ai-eng/*` → `{target}/agent/ai-eng/`
- Skills: `dist/.opencode/skill/*` → `{target}/skill/`
- All files: **Overwrite existing** (always use new version)

## Open Questions

None - all requirements have been clarified by the user.

## Success Criteria

- [x] Plugin detects installation location based on `opencode.jsonc` presence
- [x] Plugin installs to `~/.config/opencode/` when global config is used
- [x] Plugin installs to `.opencode/` when project config is used
- [x] Plugin prefers project config over global when both exist (matching postinstall behavior)
- [x] All files are overwritten on each installation (always latest version)
- [x] Installation location is logged on first run only
- [x] Plugin handles missing configs gracefully (no errors)
- [x] `bun run build` produces working plugin in `dist/index.js`
- [x] Plugin behavior matches `scripts/install.js` for consistency

## Implementation Plan Summary

1. **Modify `src/index.ts`**:
   - Add `findOpenCodeConfig()` function (adapted from `scripts/install.js`)
   - Add `isPluginReferenced()` function (from `scripts/install.js`)
   - Modify `installToProject()` to accept target directory parameter
   - Add first-run detection for logging
   - Add graceful error handling

2. **Update `dist/index.js`**:
   - Recompile with `bun run build`

3. **Test the changes**:
   - Verify installation to global location
   - Verify installation to project location
   - Verify first-run logging
   - Verify file overwriting behavior

## Dependencies

- `@opencode-ai/plugin` (existing dependency)
- Node.js `fs` and `path` modules (existing)
- No new external dependencies

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking change for existing users | Change is backward-compatible; users with local config will still get local install |
| OpenCode plugin API changes | Plugin uses stable `directory` parameter from OpenCode core |
| Permission errors on global directory | Plugin catches errors and logs warning, doesn't crash |

## Validation

After implementation, verify:

```bash
# Test 1: Global installation
echo '{"plugin": ["ai-eng-system"]}' > ~/.config/opencode/opencode.jsonc
rm -rf ~/.config/opencode/command/ai-eng ~/.config/opencode/agent/ai-eng ~/.config/opencode/skill
opencode run "test"
# Should log: [ai-eng-system] Installed to: ~/.config/opencode/
# Verify files exist in ~/.config/opencode/

# Test 2: Project installation
echo '{"plugin": ["ai-eng-system"]}' > .opencode/opencode.jsonc
rm -rf .opencode/command/ai-eng .opencode/agent/ai-eng .opencode/skill
opencode run "test"
# Should log: [ai-eng-system] Installed to: .opencode/
# Verify files exist in .opencode/

# Test 3: File overwriting
# Modify a command file, run opencode again
# Verify the file was overwritten with original
```
