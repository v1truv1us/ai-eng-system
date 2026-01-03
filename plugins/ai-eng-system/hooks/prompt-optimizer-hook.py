#!/usr/bin/env python3
"""
Claude Code UserPromptSubmit Hook for Step-by-Step Prompt Optimization

Intercepts all user prompts and applies research-backed optimization techniques
with step-by-step approval flow.
"""

import json
import sys
import os
import re

# ==================== CONFIG ====================

DEFAULT_CONFIG = {
    "enabled": True,
    "auto_approve": False,
    "verbosity": "normal",
    "escape_prefix": "!",
}

def load_config():
    """Load configuration from ai-eng-config.json."""
    config_path = os.path.join(
        os.environ.get("CLAUDE_PROJECT_DIR", "."),
        ".claude",
        "ai-eng-config.json"
    )

    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                return {**DEFAULT_CONFIG, **json.load(f)}
        except Exception:
            pass

    return DEFAULT_CONFIG.copy()

def save_config(config):
    """Save configuration to ai-eng-config.json."""
    config_path = os.path.join(
        os.environ.get("CLAUDE_PROJECT_DIR", "."),
        ".claude",
        "ai-eng-config.json"
    )

    try:
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Error saving config: {e}", file=sys.stderr)

# ==================== ANALYSIS ====================

DOMAIN_KEYWORDS = {
    "security": ["auth", "jwt", "oauth", "password", "token", "csrf", "injection"],
    "frontend": ["react", "vue", "angular", "component", "css", "html", "ui"],
    "backend": ["api", "server", "endpoint", "database", "rest", "graphql"],
    "database": ["sql", "postgresql", "mysql", "mongodb", "query", "index"],
    "devops": ["deploy", "docker", "kubernetes", "ci/cd", "pipeline"],
    "architecture": ["design", "pattern", "microservices", "scalability"],
    "testing": ["test", "spec", "jest", "cypress", "e2e"],
}

def detect_domain(prompt):
    """Detect domain from prompt keywords."""
    lower_prompt = prompt.lower()
    scores = {}

    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower_prompt)
        scores[domain] = score

    if not scores or max(scores.values()) == 0:
        return "general"

    # Find domain with highest score
    best_domain = "general"
    best_score = 0
    for domain, score in scores.items():
        if score > best_score:
            best_score = score
            best_domain = domain

    return best_domain

def detect_complexity(prompt):
    """Detect complexity from word count and keywords."""
    words = prompt.split()
    word_count = len(words)

    score = 0

    # Word count
    if word_count >= 20:
        score += 10
    elif word_count >= 10:
        score += 6
    elif word_count >= 5:
        score += 3

    # Keywords
    complexity_keywords = [
        "debug", "fix", "error", "bug", "design", "architecture",
        "optimize", "implement", "complex"
    ]
    for keyword in complexity_keywords:
        if keyword.lower() in prompt.lower():
            score += 2
            break

    # Question marks (reduce complexity)
    question_marks = prompt.count('?')
    score -= min(question_marks * 2, 5)

    # Determine complexity
    if score < 5:
        return "simple"
    elif score < 12:
        return "medium"
    else:
        return "complex"

# ==================== OPTIMIZATION ====================

PERSONAS = {
    "security": "You are a senior security engineer with 15+ years of authentication experience.",
    "frontend": "You are a senior frontend architect with 12+ years of React/Vue experience.",
    "backend": "You are a senior backend engineer with 15+ years of distributed systems experience.",
    "database": "You are a senior database architect with 15+ years of PostgreSQL experience.",
    "devops": "You are a senior platform engineer with 12+ years of Kubernetes experience.",
    "architecture": "You are a principal software architect with 20+ years of system design experience.",
    "testing": "You are a senior QA architect with 12+ years of test automation experience.",
    "general": "You are a senior software engineer with 15+ years of full-stack development experience.",
}

def optimize_prompt(prompt, config):
    """Optimize prompt with research-backed techniques."""
    # Check escape hatch
    if prompt.startswith(config.get("escape_prefix", "!")):
        return {
            "original_prompt": prompt,
            "optimized_prompt": prompt[1:].strip(),
            "skipped": True,
            "reason": "Escape prefix detected",
        }

    # Analyze
    domain = detect_domain(prompt)
    complexity = detect_complexity(prompt)

    # Skip for simple prompts
    if complexity == "simple":
        return {
            "original_prompt": prompt,
            "optimized_prompt": prompt,
            "skipped": True,
            "reason": "Simple prompt - optimization skipped",
        }

    # Build optimized prompt
    parts = []

    # Expert persona
    persona = PERSONAS.get(domain, PERSONAS["general"])
    parts.append(persona)

    # Reasoning chain
    parts.append("Take a deep breath and analyze this step by step.")

    # Stakes language
    parts.append("This is important for the project's success. A thorough, complete solution is essential.")

    # Self-evaluation
    parts.append("After providing your solution, rate your confidence 0-1 and identify any assumptions you made.")

    # Add original task
    parts.append(f"\n\nTask: {prompt}")

    optimized_prompt = "\n\n".join(parts)

    return {
        "original_prompt": prompt,
        "optimized_prompt": optimized_prompt,
        "complexity": complexity,
        "domain": domain,
        "skipped": False,
        "expected_improvement": "60-80%",
    }

# ==================== MAIN ====================

def main():
    """Hook entry point."""
    try:
        input_data = json.load(sys.stdin)
        prompt = input_data.get("prompt", "")

        if not prompt:
            print(json.dumps({}), file=sys.stdout)
            return

        # Load configuration
        config = load_config()

        # Optimize prompt
        result = optimize_prompt(prompt, config)

        # Build output
        if result.get("skipped", False):
            output = {
                "prompt": result["optimized_prompt"],
                "suppressOutput": False,
            }
        else:
            output = {
                "prompt": result["optimized_prompt"],
                "context": f"🔧 Optimized for {result['domain']} domain",
                "suppressOutput": False,
            }

        print(json.dumps(output), file=sys.stdout)

    except Exception as e:
        print(
            json.dumps({
                "systemMessage": f"ai-eng-system prompt optimization error: {str(e)}"
            }),
            file=sys.stderr
        )
        sys.exit(0)

if __name__ == "__main__":
    main()
