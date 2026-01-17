---
name: ai-eng/init
description: Initialize ai-eng-system configuration and project setup
agent: plan
version: 1.0.0
inputs:
  - name: interactive
    type: boolean
    required: false
    description: Interactive configuration setup
  - name: overwrite
    type: boolean
    required: false
    description: Overwrite existing config file
outputs:
  - name: config_file
    type: file
    format: YAML
    description: .ai-eng/config.yaml with default or custom settings
---

# Initialize Command

Initialize ai-eng-system for: $ARGUMENTS

> **Project Setup**: Initialize configuration files and development environment

Set up ai-eng-system configuration with defaults or interactive prompts. Ensures proper project structure and development environment readiness.

## Why This Matters

Proper initialization prevents configuration issues, establishes development standards, and ensures all team members use consistent settings. Without initialization, the system may fail to locate assets, apply wrong settings, or produce unpredictable behavior.

## Quick Start

```bash
# Initialize with defaults
/ai-eng/init

# Interactive setup
/ai-eng/init --interactive

# Force overwrite existing config
/ai-eng/init --overwrite

# Combined options
/ai-eng/init --interactive --overwrite
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --interactive` | Interactive configuration setup with prompts |
| `--overwrite` | Overwrite existing configuration file |
| `-v, --verbose` | Enable verbose output |

## Configuration Options

### Interactive Mode Prompts

When `--interactive` is specified, you'll be prompted for:

1. **Default Model Selection**
   - Choose preferred AI model (claude-3.5-sonnet, gpt-4, etc.)
   - Set model parameters (temperature, max tokens)

2. **Project Type**
   - Web application (React/Vue/Angular)
   - Backend service (Node.js/Python/Go)
   - Full-stack application
   - CLI tool
   - Library/Package

3. **Development Preferences**
   - Testing framework preference
   - Code style and formatting
   - Build system choices
   - CI/CD platform

4. **Quality Gates**
   - Enable code review automation
   - Set performance thresholds
   - Security scanning preferences

### Default Configuration

Without interactive mode, creates `.ai-eng/config.yaml` with sensible defaults:

```yaml
# AI Engineering System Configuration
version: "1.0"
project:
  name: "ai-eng-project"
  type: "full-stack"
  root: "."
  
models:
  default: "claude-3.5-sonnet"
  temperature: 0.7
  max_tokens: 4096
  
development:
  test_framework: "bun"
  linter: "biome"
  formatter: "biome"
  
quality:
  code_review: true
  security_scan: true
  performance_threshold: 500
  
paths:
  source: "src/"
  tests: "tests/"
  docs: "docs/"
  build: "dist/"
  
logging:
  level: "INFO"
  file: ".ai-eng/logs/ai-eng.log"
  max_size: "10MB"
```

## Initialization Steps

### Phase 1: Environment Setup

1. **Create Directory Structure**
   ```bash
   .ai-eng/
   ├── config.yaml
   ├── logs/
   └── checkpoints/
   ```

2. **Detect Project Context**
   - Scan for existing configuration files
   - Identify project type and framework
   - Determine development environment

3. **Configuration Generation**
   - Apply defaults or user preferences
   - Validate configuration schema
   - Create or update config file

### Phase 2: Asset Verification

1. **Verify CLI Installation**
   - Check if CLI is globally available
   - Validate PATH configuration
   - Test basic functionality

2. **Plugin Registration**
   - Register with Claude Code if detected
   - Register with OpenCode if detected
   - Validate plugin permissions

3. **Development Environment**
   - Check for required tools (bun, node, etc.)
   - Verify build system compatibility
   - Validate test framework setup

### Phase 3: Integration Setup

1. **Git Hooks Configuration**
   - Install pre-commit hooks
   - Configure commit message validation
   - Set up automated testing

2. **IDE Integration**
   - Create VS Code workspace settings
   - Configure extensions recommendations
   - Set up debug configurations

3. **Documentation Generation**
   - Create initial project documentation
   - Generate API documentation stubs
   - Set up contribution guidelines

## Quality Validation

After initialization, verify:

- [ ] `.ai-eng/config.yaml` exists and is valid YAML
- [ ] CLI commands respond correctly
- [ ] Build system recognizes the configuration
- [ ] Test framework integration works
- [ ] Git hooks are properly installed
- [ ] Documentation files are created

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Fix: Ensure write permissions
   chmod 755 .ai-eng/
   ```

2. **Missing Tools**
   ```bash
   # Fix: Install required dependencies
   bun install
   npm install -g @ai-eng-system/cli
   ```

3. **Configuration Conflicts**
   ```bash
   # Fix: Remove existing config and reinitialize
   rm .ai-eng/config.yaml
   /ai-eng/init --overwrite
   ```

4. **PATH Issues**
   ```bash
   # Fix: Verify global installation
   which ai-eng
   export PATH="$PATH:$(npm bin -g)"
   ```

## Expert Context

You are a DevOps and setup automation expert with 10+ years of experience at companies like GitHub, GitLab, and Vercel. Your expertise is in creating robust initialization processes, detecting environment nuances, and ensuring seamless developer onboarding.

Focus on:
- **Reliability**: Ensure initialization works in diverse environments
- **Validation**: Verify all components are properly configured
- **Documentation**: Provide clear guidance for next steps
- **Error Handling**: Gracefully handle configuration conflicts

Execute initialization systematically, validating each step before proceeding.

$ARGUMENTS