# Dual Package.json Publishing Strategy

This project uses a dual package.json approach to support both workspace development and npm publishing without complex dependency manipulation scripts.

## Overview

- **Development**: Uses `package.json` with `workspace:*` dependencies for live workspace linking
- **Publishing**: Uses `package.json.publish` with actual version numbers for npm registry
- **Backup**: Maintains `package.json.dev` as a copy of the development version

## File Structure

```
packages/cli/
├── package.json          # Development version (workspace:*)
├── package.json.dev      # Backup of development version  
├── package.json.publish # Publish-ready version (^x.x.x)
```

## Publish Workflow

1. **Update Versions**: `bun run update-publish-versions`
   - Reads core package version
   - Updates `package.json.publish` with actual versions
   - Syncs CLI version with core version

2. **Prepare CLI**: `bun run prepublish:cli`
   - Copies `package.json.publish` → `package.json`
   - Package now has actual version dependencies

3. **Publish**: `cd packages/cli && bun publish`
   - Publishes with real dependencies to npm

4. **Restore**: `bun run postpublish:cli`
   - Copies `package.json.dev` → `package.json`
   - Restores workspace:* for development

## Benefits

✅ **Clean separation** - Development and publishing configs are distinct files
✅ **No in-place mutation** - Never modifies the development package.json permanently  
✅ **Atomic operations** - Copy/replace is safer than JSON manipulation
✅ **Version safety** - Publish versions are generated from actual core version
✅ **Easy rollback** - Can always restore from .dev backup
✅ **Git safety** - Development files never contain published versions

## Usage

### Development
```bash
bun install          # Uses workspace:*
bun run build        # Works with workspace linking
```

### Publishing
```bash
# Full publish workflow
bun run publish      # Updates versions + publishes core + CLI

# Manual CLI publishing
bun run update-publish-versions  # Update publish versions
bun run prepublish:cli           # Prepare CLI for publish
cd packages/cli && bun publish   # Publish to npm
bun run postpublish:cli         # Restore dev config
```

## Maintenance

- `package.json.publish` is auto-generated - don't edit manually
- `package.json.dev` is a backup - auto-generated when missing
- Only edit `package.json` for development changes
- Run `bun run update-publish-versions` before any publish

## Migration from Old System

The previous system used scripts to modify `package.json` in place, replacing `workspace:*` with versions and back. This approach:

- Risked leaving development files in published state
- Required complex JSON manipulation logic
- Was harder to debug and rollback
- Mixed concerns in single files

The dual file approach eliminates these issues by maintaining separate, purpose-specific files.