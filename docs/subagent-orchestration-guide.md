# Subagent Orchestrator Configuration Guide

**For**: ai-eng-system users  
**Platform**: OpenCode & Claude Code  
**Related**: [Using ai-eng-system Agents](../AGENTS.md)

---

## Overview

This guide explains how to **configure subagent orchestration** when using ai-eng-system with OpenCode or Claude Code. 

**ai-eng-system provides**:
- ✅ 29 specialized agents (code-reviewer, architect-advisor, etc.)
- ✅ 13 agent skills (prompt-refinement, text-cleanup, etc.)
- ✅ 17 custom commands

**This guide explains**:
- How to configure automatic routing to these agents
- Platform-specific configuration patterns (OpenCode vs Claude Code)
- Hook-based vs system prompt approaches
- Troubleshooting common configuration issues

---

## Quick Answer: "How Does Orchestrator Always Work?"

### OpenCode (Has Primary Agents)

In OpenCode, orchestrator is **injected into the primary agent's prompt**:

**Configuration**:
```json
// .opencode/opencode.json
{
  "agent": {
    "build": {
      "prompt": "{file:./prompts/primary-agent.txt}",
      "skills": ["agent-orchestration"]
    }
  }
}
```

**How it works**:
1. Build agent loads with orchestration instructions
2. User submits: "Write a function"
3. Build agent (with orchestrator lens) routes to @implementation-agent
4. Specialist executes

### Claude Code (No Primary Agent Concept)

In Claude Code, orchestrator is applied via **UserPromptSubmit Hook**:

**Configuration**:
```json
// .claude/hooks/hooks.json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PROJECT_DIR}/.claude/hooks/subagent-orchestrator-hook.py",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**How it works**:
1. User submits: "Write a function"
2. **Hook fires** (before every prompt)
3. Hook analyzes: "write", "function" → @implementation-agent
4. Hook adds routing guidance to prompt
5. Main conversation routes to specialist

---

## Three Implementation Layers

Both platforms use **three layers** for reliability:

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: Always Active (Base Layer)                       │
│  • OpenCode: Primary agent's prompt file                   │
│  • Claude Code: CLAUDE.md (project instructions)          │
│  • Zero latency, always present                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: Dynamic Enhancement (Recommended)                 │
│  • OpenCode: Agent skill (model-invoked)                  │
│  • Claude Code: UserPromptSubmit hook (always runs)        │
│  • Adds ~10-50ms latency                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: Knowledge Layer (Optional)                          │
│  • Agent skill: agent-orchestration                     │
│  • Provides detailed routing patterns                      │
│  • Adds ~100-200ms when loaded                            │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Purpose | Always Works? | Essential? |
|-------|---------|---------------|------------|
| **1. System Prompt/Base** | Orchestrator built into identity | ✅ YES | ✅ MANDATORY |
| **2. Dynamic Enhancement** | Hook or skill | ✅ YES* | 🔹 Recommended |
| **3. Knowledge Layer** | Detailed routing patterns | ❌ MAYBE | ❌ NO |

*Hook always runs in Claude Code; skill is model-invoked in OpenCode

---

## Configuration: OpenCode

### Step 1: Create Primary Agent Prompt

**File**: `.opencode/prompts/primary-agent.txt`

```
You are working in a multi-agent environment with ai-eng-system.

## Core Directive: ALWAYS Route to Specialists

You are NOT meant to complete all tasks yourself. Your primary role is to ROUTE tasks to specialized agents from ai-eng-system.

## Available ai-eng-system Agents

See [AGENTS.md](../AGENTS.md) for complete list. Key specialists:

### Architecture & Planning
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @architect-advisor | System architecture decisions | design, architecture, structure |
| @backend-architect | Backend system design | backend, api, database |
| @infrastructure-builder | Cloud infrastructure design | infra, cloud, deployment |

### Development & Coding
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @frontend-reviewer | Frontend code review | frontend, react, vue, ui |
| @full-stack-developer | End-to-end application development | implement, feature, build |
| @api-builder-advanced | REST/GraphQL API development | api, endpoint, graphql |

### Quality & Testing
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @code-reviewer | Comprehensive code review | review, quality, audit |
| @test-generator | Automated test suite generation | test, spec, verify |
| @security-scanner | Security vulnerability detection | security, vulnerability, audit |

### DevOps & Deployment
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @deployment-engineer | CI/CD pipeline design | deploy, ci/cd, pipeline |
| @monitoring-expert | System monitoring setup | monitoring, alerting, metrics |

## Routing Rules

### Priority 1: Direct Trigger Match
If request contains ai-eng-system agent trigger words → Route to that agent

### Priority 2: Domain Analysis
Analyze task's primary domain and route to appropriate ai-eng-system specialist

### Priority 3: Complexity Assessment
- Simple → Single specialist
- Medium → 2-3 sequential specialists
- Complex → Coordinated workflow

## Example Routing

User: "Review my recent authentication code"
Analysis:
- Domain: Quality & Testing (review, authentication)
- Agent: @code-reviewer

User: "Design a scalable microservices architecture"
Analysis:
- Domain: Architecture & Planning (design, architecture, scalable)
- Agent: @architect-advisor

User: "Set up CI/CD pipeline for this project"
Analysis:
- Domain: DevOps & Deployment (CI/CD, pipeline)
- Agent: @deployment-engineer

## Required Behavior

✅ ALWAYS analyze task type before starting
✅ ALWAYS select most appropriate ai-eng-system specialist
✅ ALWAYS delegate using appropriate method
✅ ALWAYS verify agent results before presenting to user
✅ NEVER skip specialists for "simple" tasks

## Forbidden Actions

❌ DO NOT write code directly when @full-stack-developer exists
❌ DO NOT review code directly when @code-reviewer exists
❌ DO NOT deploy directly when @deployment-engineer exists
❌ DO NOT design architecture directly when @architect-advisor exists
```

### Step 2: Configure OpenCode

**File**: `.opencode/opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "build": {
      "mode": "primary",
      "prompt": "{file:./prompts/primary-agent.txt}",
      "skills": ["agent-orchestration"],
      "model": "anthropic/claude-sonnet-4-20250514"
    },
    "plan": {
      "mode": "primary",
      "prompt": "{file:./prompts/primary-agent.txt}",
      "skills": ["agent-orchestration"],
      "model": "anthropic/claude-haiku-4-20250514"
    }
  },
  "permission": {
    "skill": {
      "agent-orchestration": "allow"
    }
  }
}
```

### Step 3: Create Orchestrator Skill (Optional)

**File**: `.opencode/skill/agent-orchestration/SKILL.md`

```markdown
---
name: agent-orchestration
description: Ensures proper delegation to ai-eng-system specialists. Apply before any development task.
---

# Agent Orchestration for ai-eng-system

## Core Principle

ALWAYS delegate to appropriate ai-eng-system specialist rather than handling tasks directly.

## ai-eng-system Specialist Registry

### Architecture & Planning
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @architect-advisor | System architecture decisions | design, architecture, structure, pattern |
| @backend-architect | Backend system design | backend, api, database, schema |
| @infrastructure-builder | Cloud infrastructure design | infra, cloud, deployment, iac |

### Development & Coding
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @frontend-reviewer | Frontend code review | frontend, react, vue, ui, component |
| @full-stack-developer | End-to-end application development | implement, feature, build, code |
| @api-builder-advanced | REST/GraphQL API development | api, endpoint, graphql, rest |

### Quality & Testing
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @code-reviewer | Comprehensive code review | review, quality, audit, analyze |
| @test-generator | Automated test suite generation | test, spec, verify, coverage |
| @security-scanner | Security vulnerability detection | security, vulnerability, audit, exploit |

### DevOps & Deployment
| Agent | Purpose | Trigger Words |
|--------|---------|---------------|
| @deployment-engineer | CI/CD pipeline design | deploy, ci/cd, pipeline, automation |
| @monitoring-expert | System monitoring setup | monitoring, alerting, metrics, observability |

## Routing Algorithm

1. **Analyze Task Type**: Identify primary domain
2. **Check Triggers**: Match against agent descriptions
3. **Select Specialist**: Choose most appropriate ai-eng-system agent
4. **Delegate**: Route to selected specialist
5. **Coordinate**: If multi-domain task, sequence specialists

## Required Behavior

✅ For ANY development task, route to appropriate ai-eng-system specialist
✅ Use trigger word matching for initial routing decision
✅ If multiple domains apply, plan sequential routing
✅ Always provide rationale for routing decision
✅ Never handle tasks directly when specialist exists
```

---

## Configuration: Claude Code

### Step 1: Create UserPromptSubmit Hook

**File**: `.claude/hooks/subagent-orchestrator-hook.py`

```python
#!/usr/bin/env python3
"""
Claude Code UserPromptSubmit Hook for ai-eng-system
Adds orchestration guidance to every prompt.
"""

import json
import sys
from typing import Optional

# ai-eng-system specialist registry
AI_ENG_AGENTS = {
    # Architecture & Planning
    "architect-advisor": {
        "triggers": ["design", "architecture", "structure", "pattern"],
        "description": "System architecture decisions and trade-off analysis"
    },
    "backend-architect": {
        "triggers": ["backend", "api design", "database", "schema"],
        "description": "Backend system design and scalability"
    },
    "infrastructure-builder": {
        "triggers": ["infra", "cloud", "deployment", "iac"],
        "description": "Cloud infrastructure design and IaC"
    },
    # Development & Coding
    "frontend-reviewer": {
        "triggers": ["frontend", "react", "vue", "ui", "component"],
        "description": "Frontend code review and accessibility"
    },
    "full-stack-developer": {
        "triggers": ["implement", "feature", "build", "code"],
        "description": "End-to-end application development"
    },
    "api-builder-advanced": {
        "triggers": ["api", "endpoint", "graphql", "rest"],
        "description": "REST/GraphQL API development"
    },
    # Quality & Testing
    "code-reviewer": {
        "triggers": ["review", "quality", "audit", "analyze"],
        "description": "Comprehensive code quality assessment"
    },
    "test-generator": {
        "triggers": ["test", "spec", "verify", "coverage"],
        "description": "Automated test suite generation"
    },
    "security-scanner": {
        "triggers": ["security", "vulnerability", "audit", "exploit"],
        "description": "Security vulnerability detection"
    },
    # DevOps & Deployment
    "deployment-engineer": {
        "triggers": ["deploy", "ci/cd", "pipeline", "automation"],
        "description": "CI/CD pipeline design and deployment automation"
    },
    "monitoring-expert": {
        "triggers": ["monitoring", "alerting", "metrics", "observability"],
        "description": "System monitoring setup and observability"
    }
}

def analyze_prompt(prompt: str) -> Optional[str]:
    """Analyze prompt to determine best ai-eng-system agent."""
    prompt_lower = prompt.lower()
    
    # Check each agent's triggers
    for agent_name, agent_info in AI_ENG_AGENTS.items():
        for trigger in agent_info["triggers"]:
            if trigger in prompt_lower:
                return agent_name
    
    return None

def generate_orchestration_guidance(prompt: str) -> str:
    """Generate routing guidance for ai-eng-system."""
    agent_key = analyze_prompt(prompt)
    
    if not agent_key:
        # Default guidance for ambiguous tasks
        guidance = """
## ai-eng-system Agent Routing

You are working with ai-eng-system's specialized agents. Route to the appropriate specialist.

Key agent categories:
- **Architecture**: @architect-advisor, @backend-architect, @infrastructure-builder
- **Development**: @frontend-reviewer, @full-stack-developer, @api-builder-advanced
- **Quality**: @code-reviewer, @test-generator, @security-scanner
- **DevOps**: @deployment-engineer, @monitoring-expert

See [AGENTS.md](../AGENTS.md) for complete agent list and descriptions.

Determine the primary domain of the task and route accordingly.
"""
        return guidance
    
    agent = AI_ENG_AGENTS[agent_key]
    
    # Specific guidance when agent is identified
    guidance = f"""
## ai-eng-system Agent Routing

The task: "{prompt[:100]}"

**Routing Decision**: Route to @{agent_key}

**Agent Purpose**: {agent['description']}

Use the ai-eng-system agent via Task tool or agent invocation. Provide full context about what needs to be done.

Original task: {prompt}
"""
    return guidance

def main():
    """Hook entry point."""
    try:
        input_data = json.load(sys.stdin)
        prompt = input_data.get("prompt", "")
        
        if not prompt:
            print(json.dumps({}), file=sys.stdout)
            sys.exit(0)
        
        guidance = generate_orchestration_guidance(prompt)
        
        output = {
            "context": guidance,
            "suppressOutput": False
        }
        
        print(json.dumps(output), file=sys.stdout)
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            "systemMessage": f"ai-eng-system hook warning: {str(e)}"
        }), file=sys.stderr)
        sys.exit(0)

if __name__ == '__main__':
    main()
```

### Step 2: Configure Hook

**File**: `.claude/hooks/hooks.json`

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PROJECT_DIR}/.claude/hooks/subagent-orchestrator-hook.py",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Step 3: Create Project-Level Instructions

**File**: `.claude/CLAUDE.md`

```markdown
# ai-eng-system Integration

You are working in a project that uses **ai-eng-system**, an advanced engineering toolkit for Claude Code and OpenCode.

## What is ai-eng-system?

ai-eng-system provides:
- **29 specialized agents** for engineering workflows
- **13 agent skills** for enhanced prompting
- **17 custom commands** for common tasks
- Research-backed prompting techniques (+45-115% quality improvement)

## Core Directive: Use Specialized Agents

For any development task, route to the appropriate ai-eng-system specialist rather than handling it directly.

## Key Agent Categories

### Architecture & Planning
Use these for system design and architectural decisions:
- **@architect-advisor** - System architecture decisions
- **@backend-architect** - Backend system design
- **@infrastructure-builder** - Cloud infrastructure

### Development & Coding
Use these for implementation work:
- **@full-stack-developer** - End-to-end development
- **@frontend-reviewer** - Frontend code review
- **@api-builder-advanced** - API development

### Quality & Testing
Use these for quality assurance:
- **@code-reviewer** - Code quality assessment
- **@test-generator** - Test suite generation
- **@security-scanner** - Security vulnerability detection

### DevOps & Deployment
Use these for infrastructure and deployment:
- **@deployment-engineer** - CI/CD pipeline design
- **@monitoring-expert** - System monitoring

## How to Use

See [AGENTS.md](../AGENTS.md) for complete agent list and usage examples.

Basic pattern:
```
User: "Review my authentication code"
→ Routes to @code-reviewer

User: "Design a scalable architecture"
→ Routes to @architect-advisor

User: "Set up CI/CD pipeline"
→ Routes to @deployment-engineer
```
```

## Related Documentation

- [AGENTS.md](../AGENTS.md) - Complete agent registry
- [README.md](../README.md) - Project overview
- [spec-driven-workflow.md](./spec-driven-workflow.md) - Spec-driven development approach
```

---

## Troubleshooting

### Issue: Agents Not Routing Automatically

**Symptoms**: Main conversation handles tasks directly instead of routing

**Solutions**:

**OpenCode**:
```bash
# Check prompt file is being loaded
cat .opencode/opencode.json

# Verify prompt file exists
cat .opencode/prompts/primary-agent.txt | head -20

# Restart OpenCode to load configuration
```

**Claude Code**:
```bash
# Check hook is registered
cat .claude/hooks/hooks.json

# Test hook manually
echo '{"prompt":"test"}' | python3 .claude/hooks/subagent-orchestrator-hook.py

# Restart Claude Code
```

### Issue: Wrong Agent Selected

**Symptoms**: Tasks route to incorrect specialist

**Solutions**:

1. **Review trigger words** - Ensure descriptions contain relevant keywords
2. **Check prompt content** - Verify your request uses clear terminology
3. **Adjust routing logic** - Update hook or prompt file with better patterns

### Issue: Hook Adds Too Much Latency

**Symptoms**: 100ms+ delay before every response

**Solutions**:

1. **Reduce hook complexity** - Simplify routing logic
2. **Lower timeout** - Reduce from 10ms to 5ms in hooks.json
3. **Consider disabling hook** - Rely on CLAUDE.md alone for basic routing

---

## Performance Considerations

| Component | Latency | Impact |
|-----------|----------|---------|
| **OpenCode: Primary Agent Prompt** | 0ms | None (loaded at startup) |
| **OpenCode: Agent Skill** | ~100-200ms (when loaded) | Per invocation |
| **Claude Code: CLAUDE.md** | 0ms | None (loaded at startup) |
| **Claude Code: UserPromptSubmit Hook** | ~10-50ms | Per prompt |

**Optimization Tips**:

1. Use **CLAUDE.md** (or primary agent prompt) for base orchestration
2. Use **Hook** (Claude Code) for dynamic routing when needed
3. Use **Agent Skills** for complex workflows that benefit from detailed guidance
4. Avoid loading skills for simple, repetitive tasks

---

## Best Practices

### 1. Layered Approach

✅ **DO**: Use all three layers (base + dynamic + knowledge)
   - Most reliable configuration
   - Good performance/accuracy trade-off

❌ **DON'T**: Rely solely on any single layer
   - Single point of failure
   - Less intelligent routing

### 2. Clear Trigger Words

✅ **DO**: Include specific, actionable trigger words
   - "design", "architecture", "structure" → @architect-advisor
   - "review", "audit", "quality" → @code-reviewer
   - "deploy", "pipeline", "ci/cd" → @deployment-engineer

❌ **DON'T**: Use vague descriptions
   - "helpful agent for X"
   - "specialist in Y"

### 3. Consistent Routing

✅ **DO**: Maintain consistent routing patterns across projects
   - Standardize agent triggers
   - Document routing decisions
   - Share configurations with team

❌ **DON'T**: Use inconsistent terminology
   - Different trigger words for same agent across projects
   - Unclear routing logic

### 4. Performance-Aware Configuration

✅ **DO**: Balance reliability with performance
   - Use CLAUDE.md for base (zero latency)
   - Use hook when dynamic routing needed (~10-50ms)
   - Use skills for complex workflows (~100-200ms)

❌ **DON'T**: Use all layers for every simple task
   - Unnecessary latency for "write a function"
   - Over-engineering simple routing

---

## Advanced Configuration

### Multi-Agent Workflows

For complex tasks spanning multiple domains, orchestrate sequential agent invocations:

**Example**: "Build a new feature with deployment"

```
1. @architect-advisor → Design architecture
2. @full-stack-developer → Implement feature
3. @code-reviewer → Review implementation
4. @test-generator → Create tests
5. @deployment-engineer → Set up deployment pipeline
```

### Custom Agent Creation

Use `/ai-eng/create-agent` command to generate new specialists:

```bash
/ai-eng/create-agent
# Follow prompts to create specialized agent
# Agent is automatically added to ai-eng-system
```

### Integration with Spec-Driven Workflow

Combine agent orchestration with spec-driven development:

```bash
/ai-eng/research "payment system requirements"    # Research
/ai-eng/specify "user authentication"            # Create spec
/ai-eng/plan --from-spec=specs/auth             # Plan implementation
/ai-eng/work "specs/auth/plan"                   # Execute with agents
/ai-eng/review                                     # Multi-agent review
```

---

## Summary

### Key Points

1. **OpenCode**: Orchestrator in primary agent's prompt (zero latency)
2. **Claude Code**: Orchestrator via UserPromptSubmit Hook (always runs)
3. **Three Layers**: Base + Dynamic + Knowledge for reliability
4. **ai-eng-system**: Provides 29 specialists to route to
5. **Integration**: Use ai-eng-system agents in your routing configuration

### Quick Reference

| Platform | Primary Mechanism | Base File | Dynamic Layer |
|-----------|-------------------|------------|----------------|
| **OpenCode** | Primary agent's prompt | `.opencode/prompts/primary-agent.txt` | Agent skill (optional) |
| **Claude Code** | UserPromptSubmit Hook | `.claude/CLAUDE.md` | Hook (always runs) |

### Next Steps

1. Copy configuration for your platform (OpenCode or Claude Code)
2. Test with sample prompts from this guide
3. Customize agent registry for your project needs
4. Add project-specific routing rules
5. Monitor and refine routing decisions

---

**Related Documentation**:
- [AGENTS.md](../AGENTS.md) - Complete agent registry
- [README.md](../README.md) - ai-eng-system overview
- [research-command-guide.md](./research-command-guide.md) - Research orchestration
- [spec-driven-workflow.md](./spec-driven-workflow.md) - Spec-driven development

**Status**: ✅ Complete  
**Last Updated**: January 1, 2026
