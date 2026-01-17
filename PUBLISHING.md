# Publishing Guide for ai-eng-system

## Structure Overview

After modularization, ai-eng-system is now a **workspace** with two publishable packages:

- `@ai-eng-system/core` - Contains all agents, skills, commands, and content
- `@ai-eng-system/cli` - Contains CLI orchestration and installation logic

## Publishing Commands

### Publish Core Package
```bash
cd packages/core
bun publish
```

### Publish CLI Package
```bash
cd packages/cli
bun publish
```

### Publish Both Packages
```bash
bun run publish
```

## Package Dependencies

- **CLI depends on Core**: `@ai-eng-system/cli` requires `@ai-eng-system/core`
- **Core is standalone**: No dependencies on CLI package
- **Users install CLI**: When users install `@ai-eng-system/cli`, they get both packages

## Version Management

### Synchronized Publishing
Both packages should be published together to maintain version alignment:

```bash
# Update version in both packages
bun run changelog:patch  # Updates both package.json files

# Publish both packages
bun run publish
```

### Individual Publishing (Advanced)
If you need to publish packages separately:

```bash
# Publish only core (content updates)
cd packages/core && bun publish

# Publish only CLI (tooling updates) 
cd packages/cli && bun publish
```

## Workflow Examples

### Typical Release
```bash
# 1. Update versions
bun run changelog:minor

# 2. Build both packages
bun run build

# 3. Test both packages
bun test

# 4. Publish both packages
bun run publish

# 5. Install and test locally
npm install -g @ai-eng-system/cli
ai-eng --help
```

### Content-Only Update
```bash
# 1. Update core package
cd packages/core
# ... make changes to agents/skills/commands ...

# 2. Build core
bun run build:core

# 3. Publish core
bun publish

# 4. Users get content updates without CLI changes
```

## Installation for Users

Users will install and use the CLI package as before:

```bash
# Install CLI (includes core dependency)
npm install -g @ai-eng-system/cli

# Use as normal
ai-eng --help
ai-eng install
ai-eng ralph "your prompt"
```

The CLI automatically pulls in the core package as a dependency, so users get everything they need.

## Development Workflow

### Setup Development Environment
```bash
# Clone and setup
git clone <repo>
cd ai-eng-system
bun install

# Start development (builds both packages)
bun run dev
```

### Working on Specific Package
```bash
# Work only on core content
cd packages/core
bun run dev

# Work only on CLI tooling
cd packages/cli  
bun run dev
```

This structure provides clean separation of concerns while maintaining the same user experience.

---

## 🎯 **Quick Start: Publishing Your Packages**

Since your workspace is now properly structured, here's how to publish:

### Step 1: Navigate to Package Directory
```bash
# To publish the core package (content)
cd packages/core

# To publish the CLI package (tooling)
cd packages/cli
```

### Step 2: Publish the Package
```bash
bun publish
```

### Step 3: Use Workspace Scripts (Recommended)
```bash
# From workspace root:
bun run publish:core  # Publish core package
bun run publish:cli   # Publish CLI package
bun run publish        # Publish both packages
```

**Now you should be able to publish successfully!** 🚀
---

## 🎯 **Quick Start: Publishing Your Packages**

Since your workspace is now properly structured, here'"'s how to publish:

### Step 1: Navigate to Package Directory
\`\`\`bash
# To publish the core package (content)
cd packages/core

# To publish the CLI package (tooling)
cd packages/cli
\`\`\`

### Step 2: Publish the Package
\`\`\`bash
bun publish
\`\`\`

### Step 3: Use Workspace Scripts (Recommended)
\`\`\`bash
# From workspace root:
bun run publish:core  # Publish core package
bun run publish:cli   # Publish CLI package
bun run publish        # Publish both packages
\`\`\`

**Now you should be able to publish successfully!** 🚀
