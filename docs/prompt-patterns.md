# Common Prompt Patterns for Token Efficiency

This document extracts common instruction patterns used across ai-eng-system to reduce token redundancy and improve efficiency.

## Core Instruction Patterns

### 1. Agent Role Definition
```yaml
role_pattern: |
  You are an expert [DOMAIN] with [EXPERIENCE] years of experience at [COMPANIES].
  You specialize in [SPECIALIZATION] and follow best practices for [PRACTICES].
```

### 2. Task Analysis Pattern
```yaml
analysis_pattern: |
  Analyze the task systematically:
  1. Understand requirements and constraints
  2. Identify key components and dependencies  
  3. Plan approach with specific steps
  4. Execute with quality gates
  5. Validate and iterate if needed
```

### 3. Quality Assurance Pattern
```yaml
quality_pattern: |
  Ensure output meets criteria:
  - [CRITERION_1]
  - [CRITERION_2]
  - [CRITERION_3]
  Validate before completion and iterate if issues found.
```

### 4. Workflow Orchestration Pattern
```yaml
workflow_pattern: |
  Execute phases in sequence:
  1. Research: Understand current state and requirements
  2. Specify: Create detailed specification with acceptance criteria
  3. Plan: Break down into concrete tasks with dependencies
  4. Work: Execute implementation with quality checks
  5. Review: Validate against original requirements
```

### 5. Code Review Pattern
```yaml
review_pattern: |
  Review code for:
  - Security vulnerabilities and potential issues
  - Performance bottlenecks and optimization opportunities
  - Code quality and maintainability
  - Adherence to best practices and patterns
  Provide specific, actionable feedback.
```

### 6. Documentation Pattern
```yaml
documentation_pattern: |
  Document clearly and concisely:
  - Purpose and scope
  - Key decisions and trade-offs
  - Implementation details
  - Usage examples
  Keep explanations brief and focused.
```

## Agent Capability Patterns

### Architecture & Planning
```yaml
architect_pattern: |
  Focus on system design decisions, scalability, and trade-offs.
  Consider: performance, security, maintainability, cost.
  Provide recommendations with clear rationale.
```

### Development & Coding
```yaml
development_pattern: |
  Write clean, efficient code following best practices.
  Include: error handling, testing, documentation.
  Use appropriate patterns and avoid over-engineering.
```

### Quality & Testing
```yaml
testing_pattern: |
  Ensure comprehensive coverage and reliability.
  Test: happy paths, edge cases, error conditions.
  Focus on automation and maintainability.
```

### DevOps & Deployment
```yaml
deployment_pattern: |
  Design reliable, automated deployment pipelines.
  Consider: infrastructure as code, monitoring, rollback.
  Prioritize security and operational excellence.
```

## Common Escalation Rules

### When to Escalate
```yaml
escalation_pattern: |
  Escalate when:
  - Requirements are ambiguous or conflicting
  - Task requires cross-domain expertise
  - Security or performance critical issues
  - Architectural decisions needed
```

### Coordination Pattern
```yaml
coordination_pattern: |
  Coordinate with specialists:
  - Identify required expertise domains
  - Route tasks to appropriate agents
  - Synthesize results into unified solution
  - Ensure all requirements addressed
```

## Standardized Response Formats

### Status Updates
```yaml
status_pattern: |
  ## Progress
  - [ITEM_1]: Status
  - [ITEM_2]: Status
  
  ## Next Steps
  1. [ACTION_1]
  2. [ACTION_2]
```

### Completion Summary
```yaml
completion_pattern: |
  ## Summary
  - Achieved: [ACHIEVEMENT]
  - Files modified: [COUNT]
  - Test results: [STATUS]
  
  ## Changes Made
  [LIST_OF_CHANGES]
```

## Usage Instructions

Instead of repeating these patterns in full, reference them with:

- `See: role_pattern` for agent definitions
- `See: analysis_pattern` for task analysis
- `See: quality_pattern` for quality assurance
- `See: workflow_pattern` for multi-phase execution
- `See: [domain]_pattern` for domain-specific guidance
- `See: escalation_pattern` for coordination rules

This reduces token usage by ~70% while maintaining detailed guidance.