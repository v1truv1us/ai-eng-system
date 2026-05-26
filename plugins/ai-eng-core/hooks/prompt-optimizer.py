#!/usr/bin/env python3
"""
Prompt Optimizer Hook for ai-eng-system

Applies research-backed prompt optimization techniques to improve prompt quality by 45-115%.

Based on peer-reviewed research:
- Kong et al. (2023): Expert persona assignment, 24% → 84% accuracy
- Yang et al. (2023): Step-by-step reasoning, +50% improvement  
- Bsharat et al. (2023): Stakes language, +45% quality
- Li et al. (2023): Challenge framing, +115% on hard tasks
- Self-evaluation: Confidence rating and uncertainty identification

Usage:
    python prompt_optimizer.py "your prompt here"
    
Outputs JSON with optimized prompt and metadata.
"""

import json
import sys
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any


class PromptOptimizer:
    """Research-backed prompt optimization system"""
    
    def __init__(self, config_path: str = None):
        """Initialize optimizer with configuration"""
        self.config = self._load_config(config_path)
        self.escape_prefix = "!"
        
    def _load_config(self, config_path: str = None) -> Dict[str, Any]:
        """Load configuration from file or use defaults"""
        default_config = {
            "techniques": {
                "expert_persona": {
                    "enabled": True,
                    "weight": 0.6,
                    "base_improvement": 60
                },
                "step_by_step_reasoning": {
                    "enabled": True,
                    "weight": 0.5,
                    "base_improvement": 46
                },
                "stakes_language": {
                    "enabled": True,
                    "weight": 0.4,
                    "base_improvement": 45
                },
                "challenge_framing": {
                    "enabled": True,
                    "weight": 0.8,
                    "base_improvement": 115
                },
                "self_evaluation": {
                    "enabled": True,
                    "weight": 0.1,
                    "base_improvement": 10
                }
            },
            "domains": {
                "security": {
                    "keywords": ["security", "authentication", "authorization", "vulnerability", "auth", "login", "password", "jwt", "oauth", "encryption", "hack", "attack"],
                    "persona": "senior security engineer with 10+ years of experience at Google and Microsoft, specializing in application security and threat modeling"
                },
                "frontend": {
                    "keywords": ["react", "vue", "angular", "component", "ui", "frontend", "javascript", "typescript", "css", "html", "user interface", "ux"],
                    "persona": "senior frontend developer with 10+ years of experience at Netflix and Stripe, expert in React, TypeScript, and user experience optimization"
                },
                "backend": {
                    "keywords": ["api", "backend", "server", "database", "microservices", "architecture", "scalable", "performance", "node", "python", "java", "go"],
                    "persona": "senior backend architect with 10+ years of experience at Amazon and Uber, expert in distributed systems and high-performance APIs"
                },
                "database": {
                    "keywords": ["database", "query", "sql", "nosql", "mysql", "postgresql", "mongodb", "redis", "index", "optimization", "schema"],
                    "persona": "senior database engineer with 10+ years of experience at Meta and LinkedIn, expert in query optimization and distributed databases"
                },
                "performance": {
                    "keywords": ["performance", "optimization", "speed", "latency", "throughput", "cache", "benchmark", "profile", "slow"],
                    "persona": "senior performance engineer with 10+ years of experience at Google Cloud and AWS, expert in system optimization and scalability"
                },
                "devops": {
                    "keywords": ["deploy", "ci/cd", "docker", "kubernetes", "infrastructure", "pipeline", "monitoring", "devops", "cloud"],
                    "persona": "senior DevOps engineer with 10+ years of experience at Microsoft and IBM, expert in cloud infrastructure and CI/CD pipelines"
                }
            },
            "complexity_thresholds": {
                "low": 15,
                "medium": 40
            }
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                    # Merge with defaults
                    for key in user_config:
                        if key in default_config:
                            if isinstance(default_config[key], dict) and isinstance(user_config[key], dict):
                                default_config[key].update(user_config[key])
                            else:
                                default_config[key] = user_config[key]
                        else:
                            default_config[key] = user_config[key]
            except (json.JSONDecodeError, IOError):
                pass  # Use defaults if config is invalid
                
        return default_config
    
    def _detect_domain(self, prompt: str) -> str:
        """Detect the primary domain of the prompt"""
        prompt_lower = prompt.lower()
        domain_scores = {}
        
        for domain, config in self.config["domains"].items():
            score = 0
            for keyword in config["keywords"]:
                if keyword in prompt_lower:
                    score += 1
            domain_scores[domain] = score
        
        # Return domain with highest score, or "general" if no matches
        if max(domain_scores.values()) == 0:
            return "general"
        
        return max(domain_scores, key=domain_scores.get)
    
    def _assess_complexity(self, prompt: str) -> str:
        """Assess prompt complexity based on length and content"""
        factors = {
            "length": len(prompt.split()),
            "technical_terms": 0,
            "complexity_words": 0
        }
        
        technical_indicators = [
            "architecture", "scalable", "microservices", "distributed", "algorithm",
            "optimization", "performance", "security", "authentication", "authorization",
            "database", "query", "api", "integration", "deployment", "infrastructure"
        ]
        
        complexity_words = [
            "complex", "difficult", "challenge", "advanced", "sophisticated",
            "enterprise", "production", "mission-critical", "high-throughput"
        ]
        
        prompt_lower = prompt.lower()
        for term in technical_indicators:
            if term in prompt_lower:
                factors["technical_terms"] += 1
                
        for word in complexity_words:
            if word in prompt_lower:
                factors["complexity_words"] += 1
        
        # Calculate complexity score
        score = (factors["length"] * 1 + 
                factors["technical_terms"] * 5 + 
                factors["complexity_words"] * 3)
        
        thresholds = self.config["complexity_thresholds"]
        if score <= thresholds["low"]:
            return "low"
        elif score <= thresholds["medium"]:
            return "medium"
        else:
            return "high"
    
    def _apply_expert_persona(self, prompt: str, domain: str) -> str:
        """Apply expert persona assignment"""
        if domain not in self.config["domains"]:
            domain = "general"
        
        persona = self.config["domains"][domain]["persona"]
        
        # Create expert persona prompt
        persona_prompt = f"You are a {persona}. Analyze the following request with your expertise and provide a comprehensive, production-ready solution.\n\nRequest: {prompt}"
        
        return persona_prompt
    
    def _apply_step_by_step_reasoning(self, prompt: str) -> str:
        """Apply step-by-step reasoning technique"""
        reasoning_prompt = ("Take a deep breath and analyze this request systematically. "
                         "Break down the problem into logical steps and reason through each one carefully before providing your solution.\n\n"
                         f"Request: {prompt}")
        
        return reasoning_prompt
    
    def _apply_stakes_language(self, prompt: str) -> str:
        """Apply stakes language technique"""
        stakes_prompt = ("This is a critical request that directly impacts production systems. "
                       "The quality of your response is crucial for success. Provide your best possible solution.\n\n"
                       f"Request: {prompt}")
        
        return stakes_prompt
    
    def _apply_challenge_framing(self, prompt: str) -> str:
        """Apply challenge framing technique"""
        challenge_prompt = ("This is a challenging problem that many developers struggle with. "
                         "I bet you can't provide an elegant, comprehensive solution that addresses all edge cases and considerations.\n\n"
                         f"Request: {prompt}")
        
        return challenge_prompt
    
    def _apply_self_evaluation(self, prompt: str) -> str:
        """Apply self-evaluation technique"""
        evaluation_prompt = (f"Request: {prompt}\n\n"
                           "After providing your solution, please include a confidence rating (0-100) and identify any areas of uncertainty or assumptions made.")
        
        return evaluation_prompt
    
    def _should_skip_optimization(self, prompt: str) -> bool:
        """Check if prompt should be skipped (escape character)"""
        return prompt.startswith(self.escape_prefix) or len(prompt.strip()) == 0
    
    def _calculate_improvement_estimate(self, techniques_applied: List[str], complexity: str) -> int:
        """Calculate estimated improvement percentage"""
        if not techniques_applied:
            return 0
        
        base_improvement = 0
        technique_count = len(techniques_applied)
        
        for technique in techniques_applied:
            if technique in self.config["techniques"]:
                base_improvement += self.config["techniques"][technique]["base_improvement"]
        
        # Apply complexity multiplier
        complexity_multipliers = {
            "low": 0.5,
            "medium": 1.0,
            "high": 1.5
        }
        
        multiplier = complexity_multipliers.get(complexity, 1.0)
        
        # Diminishing returns for too many techniques
        if technique_count > 4:
            base_improvement = base_improvement * 0.8
        elif technique_count > 2:
            base_improvement = base_improvement * 0.9
        
        estimated_improvement = int(base_improvement * multiplier)
        
        # Cap at reasonable range
        return min(max(estimated_improvement, 10), 150)
    
    def optimize_prompt(self, prompt: str) -> Dict[str, Any]:
        """Main optimization function"""
        # Check if should skip
        if self._should_skip_optimization(prompt):
            return {
                "original_prompt": prompt,
                "optimized_prompt": prompt,
                "techniques_applied": [],
                "improvement_estimate": 0,
                "domain": "general",
                "complexity": "low",
                "skipped": True
            }
        
        # Analyze prompt
        domain = self._detect_domain(prompt)
        complexity = self._assess_complexity(prompt)
        
        # Determine which techniques to apply
        techniques_to_apply = []
        optimized_prompt = prompt
        
        # Apply techniques based on complexity and domain
        if self.config["techniques"]["expert_persona"]["enabled"]:
            if complexity in ["medium", "high"] or domain != "general":
                optimized_prompt = self._apply_expert_persona(optimized_prompt, domain)
                techniques_to_apply.append("expert_persona")
        
        if self.config["techniques"]["step_by_step_reasoning"]["enabled"]:
            if complexity in ["medium", "high"]:
                optimized_prompt = self._apply_step_by_step_reasoning(optimized_prompt)
                techniques_to_apply.append("step_by_step_reasoning")
        
        if self.config["techniques"]["stakes_language"]["enabled"]:
            if complexity == "high" or domain in ["security", "performance"]:
                optimized_prompt = self._apply_stakes_language(optimized_prompt)
                techniques_to_apply.append("stakes_language")
        
        if self.config["techniques"]["challenge_framing"]["enabled"]:
            if complexity == "high":
                optimized_prompt = self._apply_challenge_framing(optimized_prompt)
                techniques_to_apply.append("challenge_framing")
        
        if self.config["techniques"]["self_evaluation"]["enabled"]:
            if complexity in ["medium", "high"]:
                optimized_prompt = self._apply_self_evaluation(optimized_prompt)
                techniques_to_apply.append("self_evaluation")
        
        # Calculate improvement estimate
        improvement_estimate = self._calculate_improvement_estimate(techniques_to_apply, complexity)
        
        return {
            "original_prompt": prompt,
            "optimized_prompt": optimized_prompt,
            "techniques_applied": techniques_to_apply,
            "improvement_estimate": improvement_estimate,
            "domain": domain,
            "complexity": complexity,
            "skipped": False
        }
    
    def batch_optimize(self, prompts: List[str]) -> List[Dict[str, Any]]:
        """Optimize multiple prompts"""
        return [self.optimize_prompt(prompt) for prompt in prompts]


def main():
    """Command line interface"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python prompt_optimizer.py '<prompt>'",
            "techniques_available": list(PromptOptimizer().config["techniques"].keys())
        }, indent=2))
        sys.exit(1)
    
    # Join all arguments as the prompt (to handle spaces)
    prompt = " ".join(sys.argv[1:])
    
    optimizer = PromptOptimizer()
    result = optimizer.optimize_prompt(prompt)
    
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()