# Source Code Context

**Hierarchy Level:** Core Implementation
**Parent:** [../AGENTS.md](../AGENTS.md)
**Philosophy:** [../CLAUDE.md](../CLAUDE.md)

This directory contains the core TypeScript implementation of the Ferg Engineering System.

## Architecture Overview

- **agents/**: Agent orchestration and coordination engine
- **cli/**: Command-line interface implementation
- **context/**: Context management and memory systems
- **execution/**: Task execution and quality gates
- **research/**: Research orchestration and analysis

## Build & Test Commands

```bash
# Build the project
bun run build

# Run all tests
bun run test

# Run specific test suites
bun run test:unit        # Unit tests
bun run test:integration # Integration tests
bun run test:performance # Performance tests

# Development
bun run build:watch      # Watch mode building
bun run test:watch       # Watch mode testing
```

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, comprehensive type coverage
- **Imports**: ES modules with `.js` extensions in import statements
- **Naming**: PascalCase for classes/types, camelCase for variables/functions
- **Documentation**: JSDoc comments for all public APIs
- **Error Handling**: Custom error classes with proper inheritance

## Key Integration Points

- **agents/coordinator.ts**: Main orchestration engine
- **execution/task-executor.ts**: Core task execution logic
- **context/memory.ts**: Context persistence and retrieval
- **research/orchestrator.ts**: Multi-phase research coordination

## Framework Patterns

- **Event-driven**: EventEmitter-based communication between components
- **Strategy pattern**: Pluggable execution and aggregation strategies
- **Observer pattern**: Progress tracking and metrics collection
- **Factory pattern**: Dynamic agent instantiation</content>
<parameter name="filePath">src/AGENTS.md