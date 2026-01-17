# @ai-eng-system/core

Core package containing all agents, skills, commands, and content for the AI Engineering System.

## Installation

```bash
npm install @ai-eng-system/core
```

## Usage

```typescript
import { 
  getAgentContent, 
  getCommandContent, 
  getSkillContent,
  getOpenCodeContent 
} from '@ai-eng-system/core/content';

// Get all agents
const agents = await getAgentContent();

// Get OpenCode installation content
const openCodeContent = await getOpenCodeContent();
```

## Package Structure

```
packages/core/
├── content/          # Source content (agents, commands)
├── skills/           # Skill definitions
├── opencode/         # OpenCode-specific content
├── claude/           # Claude Code-specific content
└── dist/            # Built content for installation
    ├── .opencode/
    └── .claude-plugin/
```

## Exports

- `./` - Main package exports
- `./content` - Content loading utilities
- `./paths` - Path resolution utilities

## License

MIT