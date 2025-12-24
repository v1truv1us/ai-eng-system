# Contributing to Ferg Engineering System

Thank you for your interest in contributing to the Ferg Engineering System! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### Development Setup

1. **Clone the repository**
   ```bash
git clone https://github.com/v1truv1us/ai-eng-system.git
cd ai-eng-system
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Build the system**
   ```bash
   bun run build
   ```

4. **Run tests**
   ```bash
   bun test
   ```

5. **Test installations**
   ```bash
   # Test OpenCode global install
   bun run install:global

   # Test Claude Code (manual testing required)
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following the single-source-of-truth principle:
   - Edit files in `content/commands/` and `content/agents/`
   - Run `bun run build` to generate platform outputs
   - Test both Claude Code and OpenCode

3. **Run quality checks**
   ```bash
   bun test              # Run all tests
   bun run build         # Build the system
   bun run validate      # Validate content
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Create a pull request**
   - Push your branch to GitHub
   - Create a PR with a clear description
   - Reference any related issues

## 📋 Contribution Guidelines

### Code Style

- **TypeScript**: Strict mode enabled, comprehensive type coverage
- **Imports**: ES modules with `.js` extensions in import statements
- **Naming**: PascalCase for classes/types, camelCase for variables/functions
- **Documentation**: JSDoc comments for all public APIs
- **Error Handling**: Custom error classes with proper inheritance

### Single Source of Truth

This system uses a single-source-of-truth architecture:

```
content/                    # ✏️ EDIT HERE - canonical source
├── commands/             # Command definitions
└── agents/               # Agent definitions

build.ts                  # 🔄 Transformation script

dist/                     # 🚫 GENERATED - never edit directly
├── .claude-plugin/       # Claude Code output
└── .opencode/           # OpenCode output
```

**Always edit files in `content/` and run `bun run build` to update outputs.**

### Testing Requirements

- **Test Coverage**: Aim for 80%+ coverage on new code
- **Test Types**: Unit tests, integration tests, and performance tests
- **Cross-Platform**: Test both Claude Code and OpenCode installations
- **Build Validation**: Ensure `bun run build` completes successfully

### Documentation

- **Update Documentation**: Keep documentation in sync with code changes
- **Cross-References**: Ensure links between related documents work
- **Version Updates**: Update version numbers in relevant files
- **Changelog**: Add entries to CHANGELOG.md for significant changes

## 🏗️ Architecture Overview

### Core Components

- **`src/execution/`**: Plan parsing, task execution, quality gates
- **`src/agents/`**: Agent orchestration and coordination
- **`src/research/`**: Research orchestration system
- **`src/cli/`**: Command-line interface
- **`content/`**: Source definitions for commands and agents

### Key Design Principles

1. **Compounding Engineering**: Each change makes future work easier
2. **Single Source of Truth**: One place to edit, automated distribution
3. **Research-Backed**: Techniques validated by academic research
4. **Cross-Platform**: Consistent experience across Claude Code and OpenCode

## 🧪 Testing

### Running Tests

```bash
# All tests
bun test

# Specific test suites
bun run test:unit
bun run test:integration
bun run test:performance
bun run test:build

# Watch mode
bun run test:watch

# Coverage
bun run test:coverage
```

### Writing Tests

- **Unit Tests**: Test individual functions in isolation
- **Integration Tests**: Test complete workflows
- **Performance Tests**: Benchmark critical paths
- **Build Tests**: Validate the build system

### Test Data

- Use `test-data/` directory for sample inputs
- Mock external dependencies appropriately
- Include both success and failure scenarios

## 📝 Commit Message Conventions

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat: add research orchestration system

- Add parallel discovery agents
- Implement evidence-based reporting
- Add configurable research scopes

Closes #123
```

```
fix: correct package name references

- Update all @ferg-cod3s/ references to @v1truv1us/
```

## 🔄 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes following the guidelines above
4. **Test** thoroughly (unit, integration, cross-platform)
5. **Update** documentation as needed
6. **Commit** with clear, conventional commit messages
7. **Push** your branch to your fork
8. **Create** a Pull Request with:
   - Clear title and description
   - Reference to any related issues
   - Screenshots/videos for UI changes
   - Test results and coverage reports

### PR Review Process

- **Automated Checks**: CI/CD will run tests and build validation
- **Code Review**: At least one maintainer review required
- **Testing**: Reviewer may request additional testing
- **Approval**: PR merged by maintainer after approval

## 🐛 Reporting Issues

### Bug Reports

Please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Step-by-step reproduction instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, platform (Claude/OpenCode)
- **Logs**: Relevant error messages or logs

### Feature Requests

Please include:
- **Description**: Clear description of the proposed feature
- **Use Case**: Why this feature would be useful
- **Implementation Ideas**: Any thoughts on how to implement
- **Alternatives**: Considered alternatives

## 📚 Resources

- **[README.md](../README.md)**: Project overview and installation
- **[AGENTS.md](../AGENTS.md)**: Agent coordination and capabilities
- **[CLAUDE.md](../CLAUDE.md)**: Project philosophy
- **[IMPLEMENTATION-GUIDE.md](../IMPLEMENTATION-GUIDE.md)**: Technical implementation details
- **[TESTING.md](../TESTING.md)**: Testing procedures and guidelines

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Maintain professional communication

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.

## 🙏 Acknowledgments

Thank you for contributing to the Ferg Engineering System! Your contributions help make engineering workflows more efficient and effective for everyone.