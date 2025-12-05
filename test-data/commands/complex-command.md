---
name: complex-command
description: A complex command with extensive metadata
agent: build
subtask: true
model: sonnet
temperature: 0.3
tools:
  read: true
  write: true
  bash: true
  grep: true
  glob: true
  list: true
permission:
  network: true
  filesystem: read-write
  environment: read
tags:
  - complex
  - testing
  - benchmark
  - performance
  - integration
---

# Complex Command

This command has extensive frontmatter and complex content for testing.

## Features

### Advanced Features

- Feature 1 with detailed description
- Feature 2 with configuration options
- Feature 3 with integration examples

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | "default" | First option |
| option2 | number | 42 | Second option |
| option3 | boolean | true | Third option |

## Code Examples

```typescript
const example = {
  name: "complex-command",
  options: {
    option1: "custom",
    option2: 100,
    option3: false
  }
}
```

## Integration

This command integrates with:

1. **Build System**: For compilation and bundling
2. **Test Runner**: For automated testing
3. **Plugin System**: For extensibility

## Performance Considerations

- Memory usage: < 50MB
- Execution time: < 5s
- Scalability: Handles 1000+ items

## Error Handling

The command includes comprehensive error handling:

- Validation errors
- Runtime errors
- Network errors
- File system errors

## Testing

Test cases include:

- Unit tests for individual functions
- Integration tests for workflows
- Performance tests for scalability
- Edge case testing for robustness
