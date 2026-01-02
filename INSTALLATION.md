# Installation Guide

This guide covers installation methods for the AI Engineering System across Claude Code and OpenCode platforms.

## 🚀 Quick Start

```bash
npm install -g ai-eng-system
```

This single command installs the AI Engineering System for both **Claude Code** and **OpenCode**.

## 📋 Detailed Installation

### Global Installation

```bash
npm install -g ai-eng-system
```

**What gets installed:**
- ✅ Commands for both Claude Code and OpenCode
- ✅ 28 specialized agents
- ✅ 4 skill packages (devops, prompting, research, plugin-dev)
- ✅ Automatic version management

**Benefits:**
- ✅ One command for both platforms
- ✅ Automatic updates with `npm update`
- ✅ Version pinning support
- ✅ Works with any Node.js package manager

### Local Installation

For project-specific installation:

```bash
npm install --save-dev ai-eng-system
```

**Benefits:**
- ✅ Project-local commands and agents
- ✅ Version locked per project
- ✅ Team consistency

## 📦 What Gets Installed

### Claude Code
- **Commands:** 16 slash commands (`/ai-eng/plan`, `/ai-eng/review`, `/ai-eng/optimize`, `/ai-eng/clean`, `/ai-eng/research`, etc.)
- **Agents:** 28 specialized agents
- **Skills:** 4 skill packages (devops, prompting, research, plugin-dev)
- **Location:** `~/.claude/plugins/ai-eng-system/`
- **Format:** Markdown files with YAML frontmatter

### OpenCode
- **Commands:** 16 commands (`/ai-eng/plan`, `/ai-eng/review`, `/ai-eng/optimize`, `/ai-eng/clean`, `/ai-eng/research`, etc.)
- **Agents:** 28 specialized agents (`ai-eng/architect-advisor`, etc.)
- **Skills:** 4 skill packages (devops, prompting, research, plugin-dev)
- **Location:** `~/.config/opencode/` (global) or `.opencode/` (local)
- **Namespace:** `ai-eng/`

## 🛠️ Troubleshooting

### Common Issues

**"Plugin not found" in Claude Code**
```bash
# Check plugin is installed
/plugin list

# Reinstall if needed
npm uninstall -g ai-eng-system
npm install -g ai-eng-system
```

**"Command not found" in OpenCode**

Verify installation:
```bash
# Check commands are available
ls ~/.config/opencode/command/ai-eng/

# Check agents are available
ls ~/.config/opencode/agent/ai-eng/

# Test a command
/ai-eng/plan "test installation"

# Reinstall if needed
npm uninstall -g ai-eng-system
npm install -g ai-eng-system
```

**Permission errors**
```bash
# Use sudo for global installs
sudo npm install -g ai-eng-system

# Or fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

### Verification

After installation, verify everything works:

**Claude Code:**
```bash
# Test a command
/plan "test installation"

# List plugins
/plugin list
```

**OpenCode:**
```bash
# Test a command
/ai-eng/plan "test installation"
```

## 🔄 Updates

```bash
npm update -g ai-eng-system
```

This updates the system for both Claude Code and OpenCode simultaneously.

## 🏢 Enterprise Distribution

### Team Setup

**Claude Code:**
1. Add marketplace to team config
2. Require plugin installation in team guidelines
3. Use `/plugin update` for maintenance

**OpenCode:**
1. Add shell script to onboarding scripts
2. Include in development environment setup
3. Use git pull + reinstall in CI/CD for updates

### CI/CD Integration

```bash
# .github/workflows/setup.yml
- name: Install AI Engineering System
  run: |
    if command -v claude &> /dev/null; then
      claude plugin marketplace add v1truv1us/ai-eng-system
      claude plugin install ai-eng-system@ai-eng-marketplace
    else
      git clone https://github.com/v1truv1us/ai-eng-system /tmp/ai-eng-system
      cd /tmp/ai-eng-system
      bun scripts/install.js
    fi
```

## 📚 Additional Resources

- [Main README](../README.md) - Overview and quick reference
- [Architecture Guide](../README.md#architecture) - System design
- [Development Guide](../README.md#development) - Contributing and building
- [Plugin Documentation](PLUGIN.md) - Technical plugin details
- [Agent Coordination](AGENTS.md) - Agent usage patterns