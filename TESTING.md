# Testing Guide for Ferg Engineering System

This guide covers the comprehensive test suite for the ferg-engineering-system plugin.

## Test Structure

The test suite is organized into four main categories:

### 1. Unit Tests (`tests/unit.test.ts`)
- **Purpose**: Test individual functions and utilities in isolation
- **Coverage**: Frontmatter parsing, content transformation, file operations
- **Speed**: Fast (milliseconds)
- **Use Case**: Development, CI/CD quick checks

### 2. Build Tests (`tests/build.test.ts`)
- **Purpose**: Test the build system functionality
- **Coverage**: Build process, plugin generation, platform outputs
- **Speed**: Medium (seconds)
- **Use Case**: Build system validation, CI/CD

### 3. Integration Tests (`tests/integration.test.ts`)
- **Purpose**: Test end-to-end workflows and real-world scenarios
- **Coverage**: Complete build process, plugin structure, content transformation
- **Speed**: Slow (tens of seconds)
- **Use Case**: Release validation, comprehensive testing

### 4. Performance Tests (`tests/performance.test.ts`)
- **Purpose**: Test system performance under various load conditions
- **Coverage**: Large file counts, complex operations, memory usage
- **Speed**: Variable (seconds to minutes)
- **Use Case**: Performance regression testing, optimization

## Running Tests

### Quick Start

```bash
# Run all tests
bun test

# Run specific test suite
bun run test:unit
bun run test:integration
bun run test:performance
bun run test:build

# Use the enhanced test runner
bun run test:runner
```

### Test Runner Options

The enhanced test runner provides additional functionality:

```bash
# Run all tests with detailed reporting
bun run test:runner

# Run specific test suites
bun run test:runner --unit
bun run test:runner --integration
bun run test:runner --performance
bun run test:runner --build

# Watch mode for development
bun run test:runner --watch

# Coverage reporting
bun run test:runner --coverage
```

## Test Coverage

### Core Functionality

- ✅ **Frontmatter Parsing**: YAML parsing, validation, error handling
- ✅ **Content Transformation**: Command/agent transformation to OpenCode format
- ✅ **File Operations**: Directory traversal, file reading/writing
- ✅ **Build Process**: Complete build workflow, plugin generation
- ✅ **Validation**: Content validation, error detection

### Platform Compatibility

- ✅ **Claude Code**: Plugin structure, YAML format preservation
- ✅ **OpenCode**: Table format transformation, directory structure
- ✅ **Cross-Platform**: Consistent behavior across platforms

### Edge Cases

- ✅ **Error Handling**: Invalid YAML, missing files, permission errors
- ✅ **Performance**: Large file counts, deep directory structures
- ✅ **Memory**: Memory usage, leak detection
- ✅ **Scalability**: Stress testing, load testing

## Test Data

The test suite uses mock data that mirrors real-world content:

### Sample Command
```yaml
---
name: test-command
description: A test command for validation
agent: build
subtask: true
---
```

### Sample Agent
```yaml
---
name: test-agent
description: A test agent for validation
mode: subagent
temperature: 0.1
tools:
  read: true
  write: true
---
```

### Sample Skill
```yaml
---
name: test-skill
description: A test skill for validation
version: 1.0.0
---
```

## Performance Benchmarks

The performance tests establish benchmarks for:

### Frontmatter Parsing
- **Simple frontmatter**: < 0.1ms per parse
- **Complex frontmatter**: < 0.5ms per parse
- **Large content**: < 1.0ms per parse

### File Operations
- **Directory traversal**: < 1s for 1000+ files
- **Linear scaling**: O(n) complexity for file operations
- **Memory usage**: < 10MB increase for 10k operations

### Build Process
- **Small project**: < 2s for 50+ files
- **Large project**: < 15s for 1000+ files
- **Memory efficiency**: Minimal memory leaks

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: |
    bun install
    bun run test:runner
    
- name: Upload Test Report
  uses: actions/upload-artifact@v3
  with:
    name: test-report
    path: test-report.md
```

### Pre-commit Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

bun run test:unit
bun run test:build
```

## Writing New Tests

### Unit Test Template

```typescript
describe('Feature Name', () => {
  it('should handle expected case', () => {
    // Test implementation
    expect(result).toBe(expected)
  })
  
  it('should handle edge case', () => {
    // Edge case testing
    expect(result).not.toThrow()
  })
})
```

### Integration Test Template

```typescript
describe('Workflow Name', () => {
  beforeEach(async () => {
    // Setup test environment
    await setupTestData()
  })
  
  it('should complete workflow successfully', async () => {
    // Test complete workflow
    const result = await runWorkflow()
    expect(result.success).toBe(true)
  })
})
```

### Performance Test Template

```typescript
describe('Performance Feature', () => {
  it('should handle load efficiently', async () => {
    const startTime = performance.now()
    
    // Perform operation
    await performOperation()
    
    const duration = performance.now() - startTime
    expect(duration).toBeLessThan(threshold)
  })
})
```

## Debugging Tests

### Common Issues

1. **File Permission Errors**: Ensure test directory is writable
2. **Timing Issues**: Increase timeouts for slow operations
3. **Memory Issues**: Force garbage collection in tests
4. **Path Issues**: Use absolute paths in tests

### Debugging Tools

```bash
# Run with verbose output
bun test --verbose

# Run specific test
bun test -t "test name"

# Debug with Node inspector
bun --inspect test
```

## Test Reports

After running tests, a detailed report is generated in `test-report.md`:

- Test suite results
- Performance metrics
- Coverage information
- Recommendations for fixes

## Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Cover edge cases** and error conditions
3. **Include performance tests** for critical paths
4. **Update documentation** for new test cases
5. **Verify CI/CD** passes all tests

## Future Improvements

Planned enhancements to the test suite:

- [ ] Visual regression testing for plugin output
- [ ] API testing for plugin endpoints
- [ ] Cross-platform compatibility matrix
- [ ] Automated performance regression detection
- [ ] Integration with real Claude Code/OpenCode instances