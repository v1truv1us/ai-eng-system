---
date: 2025-12-09
researcher: Assistant
topic: ferg-namespace-commands-analysis
tags: research, commands, namespace, migration, legacy
status: complete
confidence: high
agents_used: general
---

## Synopsis

Analysis of /ferg/* command presence reveals a namespace migration from 'ferg' to 'ai-eng' with extensive legacy references remaining in documentation and verification scripts.

## Summary

- **Current State**: System uses `ai-eng/` namespace for new installations
- **Legacy Presence**: Extensive `/ferg/` command references in documentation and verification scripts
- **Migration Status**: Build system migrated, documentation partially updated
- **User Impact**: Users may see `/ferg/` commands in old installations or documentation

## Detailed Findings

### Codebase Analysis

#### Current Command Architecture
**Primary Namespace**: `ai-eng/`
- Build configuration: `build.ts:30` - `const NAMESPACE_PREFIX = "ai-eng"`
- Built artifacts: `dist/.opencode/command/ai-eng/` (15 commands), `dist/.opencode/agent/ai-eng/` (24 agents)
- Commands: `compound`, `context`, `create-agent`, `create-command`, `create-plugin`, `create-skill`, `create-tool`, `deploy`, `optimize`, `plan`, `recursive-init`, `research`, `review`, `seo`, `work`

#### Legacy /ferg/ References
**Verification Scripts**: `verify-install.sh` maintains backward compatibility
- Lines 28-30: Checks `.opencode/command/ferg/` and `.opencode/agent/ferg/`
- Lines 46-48: Checks `~/.config/opencode/command/ferg/` and `~/.config/opencode/agent/ferg/`
- Line 52: Shows current usage as `/ai-eng/` prefix despite checking legacy paths

**Installation Scripts**: Mixed namespace handling
- `setup-global.sh`: Uses `ai-eng/` namespace exclusively for new installations
- `setup-selective.sh`: Uses `ai-eng/` but preserves existing non-ai-eng commands
- `scripts/install.js`: Uses `NAMESPACE_PREFIX` variable (undefined in script - potential bug)

### Documentation Insights

#### Extensive Legacy Documentation
**TESTING-GUIDE.md**: Comprehensive `/ferg/` command examples
- Lines 15-16: Directory structure shows `command/ferg/`, `agent/ferg/`
- Lines 24-38: Lists 15 commands with `/ferg/` prefix
- Lines 84, 88-90, 109, 111, 125, 127, 141, 143, 167, 178: Usage examples

**INSTALLATION.md**: Installation verification using `/ferg/` paths
- Line 106: "8 namespaced commands (`/ferg/plan`, `/ferg/review`, etc.)"
- Lines 128-129: `ls ~/.config/opencode/command/ferg/`

**IMPLEMENTATION-VERIFICATION.md**: Testing framework references
- Lines 23, 35-36, 71: Verification checks for `/ferg/` directories
- Lines 94-98, 119-125, 154-156, 246, 266, 284, 303: `/ferg/` command testing

#### Skills Documentation
**skills/plugin-dev/SKILL.md**: Plugin development examples
- Lines 33, 35: Directory structure references
- Lines 211-214, 306-308, 311-313, 316-320: `/ferg/` command examples

### Architecture Insights

#### Namespace Migration Timeline
1. **Original State**: `ferg/` namespace used throughout initial development
2. **Migration Point**: Transition to `ai-eng/` namespace for OpenCode installations
3. **Current State**: Build system uses `ai-eng/`, documentation partially migrated

#### Platform-Specific Behavior
**Claude Code**: No namespace prefix - commands are `/plan`, `/review`, etc.
**OpenCode**: Namespaced commands - `/ai-eng/plan`, `/ai-eng/review`, etc.
**Legacy OpenCode**: May still have `/ferg/` commands from old installations

#### Build System Status
- **Clean Migration**: `build.ts` uses only `ai-eng/` namespace
- **No Legacy Artifacts**: `dist/.opencode/` contains only `ai-eng/` directories
- **Verification Lag**: Scripts still check for `ferg/` directories for backward compatibility

## Recommendations

### Immediate Actions
1. **Update Documentation**: Replace all `/ferg/` references with `/ai-eng/` in TESTING-GUIDE.md, INSTALLATION.md, IMPLEMENTATION-VERIFICATION.md
2. **Fix Install Script**: Define `NAMESPACE_PREFIX` in `scripts/install.js` (currently undefined)
3. **Update Skills Docs**: Replace `/ferg/` examples in `skills/plugin-dev/SKILL.md` with `/ai-eng/`

### Long-term Considerations
- **Migration Script**: Create script to migrate existing `ferg/` installations to `ai-eng/`
- **Deprecation Notice**: Add warnings about `ferg/` namespace deprecation
- **Version Compatibility**: Document namespace changes in release notes

## Risks & Limitations

### Current Risks
- **Documentation Confusion**: Users see `/ferg/` commands in docs but system uses `/ai-eng/`
- **Installation Script Bug**: `scripts/install.js` uses undefined `NAMESPACE_PREFIX`
- **Backward Compatibility**: Verification scripts maintain old paths indefinitely

### Migration Challenges
- **Existing Installations**: Users with `ferg/` installations may be confused by new docs
- **Mixed Documentation**: Some docs updated, others still reference old namespace
- **Platform Differences**: Claude Code (no prefix) vs OpenCode (namespaced) complexity

## Open Questions

- [ ] Should legacy `ferg/` installations be automatically migrated?
- [ ] Is the `NAMESPACE_PREFIX` undefined in `scripts/install.js` intentional?
- [ ] Should verification scripts stop checking `ferg/` paths after migration period?
- [ ] Are there any production systems still using `ferg/` namespace that need migration?

## Code References

- `build.ts:30` - Current namespace definition
- `verify-install.sh:28-30,46-48` - Legacy path checks
- `setup-global.sh:14-16` - Migration messaging
- `TESTING-GUIDE.md:15-16,24-38` - Legacy command listings
- `INSTALLATION.md:106,128-129` - Legacy installation docs
- `scripts/install.js:45-46` - Undefined NAMESPACE_PREFIX usage</content>
<parameter name="filePath">docs/research/2025-12-09-ferg-namespace-commands-analysis.md