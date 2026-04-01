# Prompt Optimizer Hook

Research-backed prompt optimization system that improves prompt quality by 45-115% using peer-reviewed techniques.

## Overview

The prompt optimizer applies five research-backed techniques to enhance AI prompt quality:

### Supported Techniques

1. **Expert Persona Assignment** (Kong et al., 2023)
   - Assigns detailed expert role with years of experience
   - Improvement: 24% → 84% accuracy

2. **Step-by-Step Reasoning** (Yang et al., 2023)
   - Adds systematic analysis with "take a deep breath" instruction
   - Improvement: +50% quality

3. **Stakes Language** (Bsharat et al., 2023)
   - Adds importance and consequence framing
   - Improvement: +45% quality

4. **Challenge Framing** (Li et al., 2023)
   - Frames problem as challenge for better performance
   - Improvement: +115% on hard tasks

5. **Self-Evaluation**
   - Requests confidence rating and uncertainty identification
   - Improvement: +10% calibration

## Usage

### Command Line
```bash
python3 prompt-optimizer.py "your prompt here"
```

### Escape Character
Use `!` prefix to bypass optimization:
```bash
python3 prompt-optimizer.py "!just say hello"
```

## Output Format

```json
{
  "original_prompt": "...",
  "optimized_prompt": "...",
  "techniques_applied": ["expert_persona", "stakes_language"],
  "improvement_estimate": 52,
  "domain": "security",
  "complexity": "low",
  "skipped": false
}
```

## Domain Detection

The optimizer detects these domains and applies specialized personas:

- **security**: authentication, authorization, vulnerability, encryption
- **frontend**: React, Vue, Angular, UI, UX, CSS, HTML
- **backend**: API, server, database, microservices, architecture
- **database**: SQL, NoSQL, query optimization, indexing
- **performance**: optimization, latency, throughput, caching
- **devops**: deployment, CI/CD, Docker, Kubernetes

## Complexity Assessment

- **Low**: Simple requests (< 15 words, few technical terms)
- **Medium**: Moderate complexity (15-40 words, some technical terms)
- **High**: Complex requests (> 40 words, many technical terms)

## Configuration

Configuration can be customized via JSON file:

```json
{
  "techniques": {
    "expert_persona": {
      "enabled": true,
      "weight": 0.6,
      "base_improvement": 60
    }
  },
  "domains": {
    "security": {
      "keywords": ["security", "authentication"],
      "persona": "senior security engineer..."
    }
  },
  "complexity_thresholds": {
    "low": 15,
    "medium": 40
  }
}
```

## Research References

- Kong et al. (2023). "Principled Instructions Are All You Need" — MBZUAI
- Yang et al. (2023). "Large Language Models as Optimizers" (OPRO) — Google DeepMind
- Li et al. (2023). Challenge framing research — ICLR 2024
- Bsharat et al. (2023). 26 principled prompting instructions — MBZUAI

## Testing

Run validation tests:
```bash
python3 validate.py
```

Run test suite:
```bash
python3 test_runner.py
```

## Integration

The optimizer is designed to integrate with ai-eng-agent workflows:

- Automatic application based on prompt complexity
- Domain-specific expert assignment
- Configurable technique selection
- JSON output for programmatic use

## Security & Performance

- No external dependencies required
- Runs in O(n) time where n = prompt length
- Memory usage O(1) for processing
- No network calls or data exfiltration
- Input validation and sanitization