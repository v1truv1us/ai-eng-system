# Test Suite Context

**Hierarchy Level:** Quality Assurance
**Parent:** [../AGENTS.md](../AGENTS.md)
**Philosophy:** [../CLAUDE.md](../CLAUDE.md)

This directory contains the comprehensive test suite for the Ferg Engineering System.

## Test Structure

- **unit.test.ts**: Isolated component testing
- **integration.test.ts**: End-to-end workflow testing
- **performance.test.ts**: Performance benchmarking
- **build.test.ts**: Build process validation
- **agents/**: Agent-specific test suites
- **cli/**: CLI command testing
- **context/**: Context management testing
- **execution/**: Task execution testing
- **research/**: Research orchestration testing

## Test Commands

```bash
# Run all tests
bun run test

# Run specific test suites
bun run test:unit           # Unit tests only
bun run test:integration    # Integration tests only
bun run test:performance    # Performance tests only
bun run test:build          # Build validation tests

# Run tests for specific modules
bun run test:execution      # Execution module tests
bun run test:context        # Context module tests
bun run test:cli            # CLI module tests

# Development testing
bun run test:watch          # Watch mode testing
bun run test:coverage       # Coverage reporting
```

## Testing Framework

- **Bun Test**: Native Bun testing framework
- **Test Organization**: Hierarchical describe/it blocks
- **Async Testing**: Full async/await support
- **Mocking**: Built-in mocking capabilities
- **Coverage**: Integrated coverage reporting

## Test Categories

### Unit Tests
- Individual function/component testing
- Isolated logic validation
- Mock external dependencies
- Fast execution (< 100ms per test)

### Integration Tests
- End-to-end workflow testing
- Real file system operations
- Cross-module interactions
- Build process validation

### Performance Tests
- Benchmarking critical paths
- Memory usage monitoring
- Execution time validation
- Scalability testing

## Quality Gates

- **Unit Test Coverage**: > 90% target
- **Integration Tests**: All core workflows covered
- **Performance Benchmarks**: Established baselines
- **Build Validation**: Pre-publish checks

## Test Data

- **test-data/**: Sample inputs and expected outputs
- **Temporary Directories**: Isolated test environments
- **Mock Projects**: Simulated monorepo structures</content>
<parameter name="filePath">tests/AGENTS.md