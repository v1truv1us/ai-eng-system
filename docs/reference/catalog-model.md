# Catalog Model

## Overview

The catalog defines the authoritative source of truth for counts, references, and generated surfaces in ai-eng-system.

## Source of Truth

| Surface | Canonical Source | Generated/Mirrored |
|---------|-----------------|-------------------|
| Skills | `skills/*/SKILL.md` | `.opencode/skill/*/SKILL.md` |
| Commands (content) | `content/commands/*.md` | - |
| Commands (Claude) | `.claude/commands/*.md` | Synced from `content/commands/` |
| Agents | `content/agents/*.md` | - |
| Hooks | `.claude/hooks/` | Copied during install |
| Reference docs | `docs/reference/*.md` | Should be validated against source |
| README counts | `README.md` | Must match actual file counts |

## Validation Rules

### Counts

- README skill count must equal `find skills -name 'SKILL.md' | wc -l`
- README agent count must equal `ls content/agents/*.md | wc -l`
- README command count must equal `ls content/commands/*.md | wc -l`
- docs/reference/skills.md count must match README
- docs/reference/agents.md count must match README
- docs/reference/commands.md count must match README

### Cross-References

- Every command that claims skill-backing must reference an existing skill
- Every alias command must point to a valid canonical target
- Every agent mentioned in routing tables must have a corresponding file

### Generated Surfaces

- `.claude/commands/` should contain at least as many files as `content/commands/`
- `.opencode/skill/` should reflect all skills from `skills/`
- Plugin outputs should contain expected surfaces

## Validation Commands

```bash
# Count skills
find skills -name 'SKILL.md' | wc -l

# Count agents
ls content/agents/*.md | wc -l

# Count content commands
ls content/commands/*.md | wc -l

# Count Claude commands
ls .claude/commands/*.md | wc -l

# Check skill count in README
grep -o '[0-9]* reusable skills' README.md

# Check agent count in docs
grep -o '[0-9]* specialized agents' docs/reference/agents.md
```

## Install Manifest (Planned)

Future: a manifest file that tracks what was installed where, enabling:
- Selective installation (only install needed skills/commands)
- Verification (check installed state matches manifest)
- Cleanup (remove surfaces no longer in the manifest)
