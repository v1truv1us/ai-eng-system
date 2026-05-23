---
name: plugin-dev
description: This skill should be used when creating extensions for Claude Code or OpenCode, including plugins, commands, agents, skills, and custom tools. Covers both platforms with format specifications, best practices, and the ai-eng-system build system.
version: 1.0.0
---

# Plugin Development for Claude Code & OpenCode

## Critical Importance

**Creating high-quality plugins is critical to your development workflow's long-term success.** Plugins are used repeatedly by yourself and others. Design flaws, poor documentation, or broken functionality compound over time and across users. A well-designed plugin becomes a trusted tool used daily; a poorly designed plugin becomes abandoned technical debt. Invest time in architecture, testing, and documentation—the returns multiply across all future uses.

## Systematic Approach

** approach plugin development systematically.** Plugins require careful planning: understand the problem, design the API, implement incrementally, test thoroughly, and document comprehensively. Don't rush to code—clarify requirements, define interfaces, and consider edge cases first. Build iteratively, validate frequently, and refactor continuously. Every design decision impacts maintainability and extensibility.

## The Challenge

**The create a plugin that balances specificity with flexibility perfectly, but if you can:**

- Your plugin will be a joy to use and extend
- Others will build on top of your work
- The plugin will remain useful as needs evolve
- You'll establish patterns for future plugin development

The challenge is designing plugins that solve specific problems while staying flexible enough for future use cases. Can you create focused, opinionated tools that don't paint yourself into corners?

## Plugin Confidence Assessment

After completing or reviewing plugin development, rate your confidence from **0.0 to 1.0**:

- **0.8-1.0**: Plugin well-architected, fully tested, thoroughly documented, follows platform conventions
- **0.5-0.8**: Plugin functional but missing some tests or documentation, some technical debt
- **0.2-0.5**: Plugin works but design unclear, minimal testing, poor documentation
- **0.0-0.2**: Plugin incomplete or broken, unclear purpose, significant rework needed

Identify uncertainty areas: Is the plugin's purpose clear? Are there edge cases unhandled? Will the plugin work as requirements change? What's the maintenance burden?

## Overview

The ai-eng-system supports extension development for both Claude Code and OpenCode through a unified content system with automated transformation. Understanding this system enables creating well-organized, maintainable extensions that integrate seamlessly with both platforms.

## Extension Types

| Type | Claude Code | OpenCode | Shared Format |
|------|-------------|----------|---------------|
| Commands | ✅ YAML frontmatter | ✅ Table format | YAML frontmatter |
| Agents | ✅ YAML frontmatter | ✅ Table format | YAML frontmatter |
| Skills | ✅ Same format | ✅ Same format | SKILL.md |
| Hooks | ✅ hooks.json | ✅ Plugin events | Platform-specific |
| Custom Tools | ❌ (use MCP) | ✅ tool() helper | OpenCode only |
| MCP Servers | ✅ .mcp.json | ✅ Same format | Same format |

## Development Approaches

### 1. Canonical Development (Recommended)

Create content in `content/` directory, let build.ts transform to platform formats:

```
content/
├── commands/my-command.md  → dist/.claude-plugin/commands/
│                           → dist/.opencode/command/ai-eng/
└── agents/my-agent.md      → dist/.claude-plugin/agents/
                            → dist/.opencode/agent/ai-eng/
```

### 2. Platform-Specific Development

Create directly in platform directories:

- Claude Code: `.claude/commands/`, `.claude-plugin/`
- OpenCode: `.opencode/command/`, `.opencode/agent/`

### 3. Global vs Project-Local

| Location | Claude Code | OpenCode |
|----------|-------------|----------|
| **Project** | `.claude/` | `.opencode/` |
| **Global** | `~/.claude/` | `~/.config/opencode/` |

## Quick Reference

### Command Frontmatter

**Canonical (content/):**
```yaml
---
name: my-command
description: What this command does
agent: build           # Optional: which agent handles this
subtask: true          # Optional: run as subtask
temperature: 0.3      # Optional: temperature
tools:                 # Optional: tool restrictions
  read: true
  write: true
---
```

**Claude Code Output:** Same format (YAML frontmatter)

**OpenCode Output:** YAML frontmatter with OpenCode-compatible fields
```markdown
---
description: Description here
agent: build
---
```

### Agent Frontmatter

**Canonical (content/):**
```yaml
---
name: my-agent
description: Use this agent when... <example>...</example>
mode: subagent
color: cyan
temperature: 0.3
tools:
  read: true
  write: true
---
```

**Claude Code Output:** Same format (YAML frontmatter)

**OpenCode Output:** YAML frontmatter with OpenCode-compatible fields
```markdown
---
description: Description here
mode: subagent
---
```

### Skill Structure

Both platforms use identical format:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description)
│   └── Markdown body (1,000-3,000 words)
└── Bundled Resources (optional)
    ├── references/       # Detailed documentation
    ├── examples/         # Working code
    └── scripts/          # Utility scripts
```

### OpenCode Custom Tools

Use TypeScript with `tool()` helper:

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Tool description",
  args: {
    param: tool.schema.string().describe("Parameter description"),
  },
  async execute(args, context) {
    // Tool implementation
    return result
  },
})
```

## Directory Locations

### For Development in ai-eng-system

```
ai-eng-system/
├── content/
│   ├── commands/              # Add new commands here
│   └── agents/                # Add new agents here
├── skills/
│   └── plugin-dev/           # This skill
└── build.ts                   # Transforms to both platforms
```

### For User Projects

**Project-local:**
- Claude Code: `.claude/commands/`, `.claude-plugin/`
- OpenCode: `.opencode/command/`, `.opencode/agent/`

**Global:**
- Claude Code: `~/.claude/commands/`, `~/.claude-plugin/`
- OpenCode: `~/.config/opencode/command/`, `~/.config/opencode/agent/`

## Platform-Specific Features

### Claude Code

**Components:**
- Commands with YAML frontmatter
- Agents with YAML frontmatter
- Skills with SKILL.md format
- Hooks via `hooks/hooks.json`
- MCP servers via `.mcp.json`

**Manifest:** `.claude-plugin/plugin.json`
```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief description",
  "commands": ["./commands/*"],
  "mcpServers": "./.mcp.json"
}
```

### OpenCode

**Components:**
- Commands with table format
- Agents with table format
- Skills via opencode-skills plugin
- Custom tools with TypeScript
- Plugin events via TypeScript

**Plugin:** `.opencode/plugin/plugin.ts`
```typescript
import { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, worktree, $ }) => {
  return {
    // Plugin hooks here
  }
}) satisfies Plugin
```

## Development Workflow

### 1. Create Component

Use plugin-dev commands:
- `/ai-eng/create-agent` - Create new agent
- `/ai-eng/create-command` - Create new command
- `/ai-eng/create-skill` - Create new skill
- `/ai-eng/create-tool` - Create new custom tool

### 2. Build

```bash
cd ai-eng-system
bun run build              # Build all platforms
bun run build --watch        # Watch mode
bun run build --validate      # Validate content
```

### 3. Test

**Claude Code:**
```bash
claude plugin add https://github.com/v1truv1us/ai-eng-system
```

**OpenCode:**
```bash
# Project-local
./setup.sh

# Global
./setup-global.sh
```

## Best Practices

### Content Quality
- Use third-person in skill descriptions
- Write commands/agents FOR Claude, not to user
- Include specific trigger phrases
- Follow progressive disclosure for skills

### File Organization
- One component per file
- Clear naming conventions (kebab-case)
- Proper frontmatter validation

### Cross-Platform Compatibility
- Use canonical format in `content/`
- Test build output for both platforms
- Document platform differences

### Security
- No hardcoded credentials
- Use HTTPS/WSS for external connections
- Validate user inputs
- Follow principle of least privilege

## Additional Resources

### References

- `references/claude-code-plugins.md` - Claude Code specifics
- `references/opencode-plugins.md` - OpenCode specifics
- `references/command-format.md` - Command syntax guide
- `references/agent-format.md` - Agent configuration guide
- `references/skill-format.md` - Skills specification
- `references/opencode-tools.md` - Custom tool development

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll test the plugin after I finish all features" | Test incrementally. Untested plugins accumulate bugs that are hard to trace. |
| "The canonical format is optional" | Canonical format ensures cross-platform compatibility. Use it or break one platform. |
| "I don't need to document platform differences" | Platform differences are where plugins break. Document them or users will hit them. |
| "Security is not a concern for internal plugins" | Internal plugins run with the same privileges as external ones. Validate inputs always. |
| "The frontmatter fields are self-explanatory" | Missing or malformed frontmatter causes silent failures. Validate before deploying. |

### Examples

Study existing components in ai-eng-system:
- `content/commands/plan.md` - Command structure
- `content/agents/architect-advisor.md` - Agent structure
- `skills/prompting/incentive-prompting/SKILL.md` - Skill structure

## Troubleshooting

### Build Issues
- Run `bun run build --validate` to check content
- Check file permissions in output directories
- Verify YAML frontmatter syntax

### Platform Testing
- Test commands in both Claude Code and OpenCode
- Verify agents trigger correctly
- Check skills load via opencode-skills plugin

### Common Errors
- Missing required frontmatter fields
- Incorrect directory structure
- Invalid YAML syntax
- Wrong file permissions

## Integration with AI Engineering System

The plugin-dev system integrates seamlessly with existing ai-eng-system components:

### Existing Commands
- `/ai-eng/plan` - Implementation planning
- `/ai-eng/review` - Code review
- `/ai-eng/work` - Task execution

### Existing Agents
- `ai-eng/architect-advisor` - Architecture guidance
- `ai-eng/frontend-reviewer` - Frontend review
- `ai-eng/seo-specialist` - SEO optimization

### Plugin-Dev Commands
- `/ai-eng/create-plugin` - Full plugin development workflow
- `/ai-eng/create-agent` - Quick agent creation
- `/ai-eng/create-command` - Quick command creation
- `/ai-eng/create-skill` - Quick skill creation
- `/ai-eng/create-tool` - Quick tool creation

All use the same quality standards and research-backed prompting techniques.

## Imported from create-plugin/review-plugin-submission (MIT, cursor/plugins)

# Review plugin submission

## Trigger

A plugin is implemented and needs a final quality check before submission or release.

## Workflow

1. Verify manifest validity:
   - `.cursor-plugin/plugin.json` exists
   - `name` is valid lowercase kebab-case
   - metadata fields are coherent (`description`, `version`, `author`, `license`)
2. Verify component discoverability:
   - Skills in `skills/*/SKILL.md`
   - Rules in `rules/` as `.mdc` or markdown variants
   - Agents in `agents/` markdown files
   - Commands in `commands/` markdown or text files
   - Hooks in `hooks/hooks.json`
   - MCP config in `mcp.json` (or `mcpServers` override)
3. Verify component metadata:
   - Skills include `name` and `description` frontmatter
   - Rules include valid frontmatter and clear guidance
   - Agents and commands include `name` and `description`
4. Verify repository integration:
   - For marketplace repos, plugin entry exists in `.cursor-plugin/marketplace.json`
   - `source` resolves to plugin directory and names are unique
5. Verify documentation quality:
   - `README.md` states purpose, installation, and component coverage
   - optional logo path is valid and repository-hosted

## Checklist

- Manifest exists and parses as valid JSON
- All declared paths exist and are relative
- No broken file references
- No missing frontmatter on skills/rules/agents/commands
- Plugin scope is clear and focused
- Marketplace registration complete (if multi-plugin repo)

## Output

- Pass/fail report by section
- Prioritized fix list
- Final submission recommendation

## Imported from create-plugin/create-plugin-scaffold (MIT, cursor/plugins)

# Create plugin scaffold

## Trigger

You need to create a new Cursor plugin from scratch and make it ready for local use or marketplace submission.

## Required Inputs

- Plugin name (lowercase kebab-case)
- Plugin purpose and target users
- Component set to include (`rules`, `skills`, `agents`, `commands`, `hooks`, `mcpServers`)
- Repository style (`single-plugin` or `multi-plugin marketplace`)

## Output Location

By default, create the plugin inside the user's local plugin directory:

```
~/.cursor/plugins/local/<plugin-name>/
```

This path makes the plugin immediately available to Cursor without any install step. If the user explicitly asks to create the plugin elsewhere (e.g. inside an existing repo or a specific directory), respect that choice instead.

## Workflow

1. Validate plugin name format: lowercase kebab-case, starts and ends with an alphanumeric character.
2. Determine the target directory:
   - Default: `~/.cursor/plugins/local/<plugin-name>/`
   - Override: use the path the user specifies, if any.
   - Create the directory (and parents) if it does not exist.
3. Create base files inside the target directory:
   - `.cursor-plugin/plugin.json`
   - `README.md`
   - `LICENSE`
   - optional `CHANGELOG.md`
4. Populate `plugin.json`:
   - Required: `name`
   - Recommended: `version`, `description`, `author`, `license`, `keywords`
   - Add explicit component paths only when non-default discovery is needed.
5. Create component files with valid frontmatter:
   - Rules: `.mdc` with `description`, `alwaysApply`, optional `globs`
   - Skills: `skills/<skill-name>/SKILL.md` with `name`, `description`
   - Agents: `agents/*.md` with `name`, `description`
   - Commands: `commands/*.(md|txt)` with `name`, `description`
6. If repository uses `.cursor-plugin/marketplace.json`, add plugin entry:
   - `name`
   - `source`
   - optional metadata (`description`, `keywords`, `category`, `tags`)
7. Ensure all manifest paths are relative, valid, and do not use absolute paths or parent traversal.

## Guardrails

- Keep the plugin focused on one use case.
- Prefer concise, actionable skill and rule text over long prose.
- Do not reference files that do not exist.
- Use folder discovery defaults unless custom paths are required.
- Always save to `~/.cursor/plugins/local/<plugin-name>/` unless the user provides a different path.

## Output

- Created file tree for the plugin (with full path to the output directory)
- Final `plugin.json`
- Marketplace entry (if applicable)
- Short validation report of required fields and component metadata
- Confirmation that the plugin is saved under `~/.cursor/plugins/local/` and ready for use

