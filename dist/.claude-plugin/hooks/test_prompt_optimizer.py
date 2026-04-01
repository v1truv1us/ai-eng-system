#!/usr/bin/env python3
"""
Test suite for prompt-optimizer.py
Tests research-backed prompt optimization techniques.
"""

import json
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Simple pytest-like assertion functions
def assert_equal(actual, expected, message=""):
    if actual != expected:
        raise AssertionError(f"Expected {expected}, got {actual}. {message}")

def assert_in(item, container, message=""):
    if item not in container:
        raise AssertionError(f"{item} not found in {container}. {message}")

def assert_not_in(item, container, message=""):
    if item in container:
        raise AssertionError(f"{item} found in {container}. {message}")

def assert_true(condition, message=""):
    if not condition:
        raise AssertionError(f"Assertion failed: {message}")

# Add hooks directory to Python path for testing
hook_dir = Path(__file__).parent
sys.path.insert(0, str(hook_dir))

from prompt_optimizer import PromptOptimizer


class TestPromptOptimizer:
    """Test suite for PromptOptimizer class"""

    def setup_method(self):
        """Set up test fixtures"""
        self.optimizer = PromptOptimizer()

    def test_initialization(self):
        """Test optimizer initializes with correct configuration"""
        assert self.optimizer.config is not None
        assert "techniques" in self.optimizer.config
        assert "domains" in self.optimizer.config

    def test_detect_domain_simple(self):
        """Test domain detection for simple prompts"""
        # Security domain
        prompt = "help me fix this authentication bug"
        domain = self.optimizer._detect_domain(prompt)
        assert domain == "security"

        # Frontend domain
        prompt = "optimize this React component"
        domain = self.optimizer._detect_domain(prompt)
        assert domain == "frontend"

        # Backend domain
        prompt = "design a scalable API"
        domain = self.optimizer._detect_domain(prompt)
        assert domain == "backend"

    def test_detect_domain_complex(self):
        """Test domain detection for complex multi-domain prompts"""
        prompt = "help me debug this slow database query in my authentication service"
        domain = self.optimizer._detect_domain(prompt)
        assert domain in ["security", "backend", "database"]

    def test_assess_complexity_low(self):
        """Test complexity assessment for simple prompts"""
        prompt = "hello world"
        complexity = self.optimizer._assess_complexity(prompt)
        assert complexity == "low"

    def test_assess_complexity_medium(self):
        """Test complexity assessment for medium prompts"""
        prompt = "help me debug this error in my code"
        complexity = self.optimizer._assess_complexity(prompt)
        assert complexity == "medium"

    def test_assess_complexity_high(self):
        """Test complexity assessment for complex prompts"""
        prompt = "design a scalable microservices architecture with event-driven communication for a high-throughput e-commerce platform"
        complexity = self.optimizer._assess_complexity(prompt)
        assert complexity == "high"

    def test_apply_expert_persona(self):
        """Test expert persona application"""
        prompt = "help me fix this authentication bug"
        optimized = self.optimizer._apply_expert_persona(prompt, "security")
        
        assert "senior security engineer" in optimized.lower()
        assert "years of experience" in optimized.lower()
        assert any(company in optimized.lower() for company in ["google", "microsoft", "amazon", "netflix"])

    def test_apply_step_by_step_reasoning(self):
        """Test step-by-step reasoning application"""
        prompt = "help me debug this error"
        optimized = self.optimizer._apply_step_by_step_reasoning(prompt)
        
        assert "take a deep breath" in optimized.lower()
        assert "systematically" in optimized.lower()
        assert "step" in optimized.lower()

    def test_apply_stakes_language(self):
        """Test stakes language application"""
        prompt = "help me optimize this query"
        optimized = self.optimizer._apply_stakes_language(prompt)
        
        assert any(word in optimized.lower() for word in ["critical", "important", "crucial"])

    def test_apply_challenge_framing(self):
        """Test challenge framing application"""
        prompt = "help me solve this problem"
        optimized = self.optimizer._apply_challenge_framing(prompt)
        
        assert "challenge" in optimized.lower()
        assert "can't" in optimized.lower() or "cannot" in optimized.lower()

    def test_apply_self_evaluation(self):
        """Test self-evaluation application"""
        prompt = "help me understand this"
        optimized = self.optimizer._apply_self_evaluation(prompt)
        
        assert "confidence" in optimized.lower()
        assert "rating" in optimized.lower() or "score" in optimized.lower()

    def test_optimize_prompt_simple(self):
        """Test full optimization pipeline for simple prompt"""
        prompt = "help me debug this error"
        result = self.optimizer.optimize_prompt(prompt)
        
        assert "optimized_prompt" in result
        assert "techniques_applied" in result
        assert "improvement_estimate" in result
        assert "domain" in result
        assert "complexity" in result
        assert len(result["techniques_applied"]) > 0
        assert result["optimized_prompt"] != prompt

    def test_optimize_prompt_complex(self):
        """Test full optimization pipeline for complex prompt"""
        prompt = "design a scalable microservices architecture for authentication system"
        result = self.optimizer.optimize_prompt(prompt)
        
        assert result["complexity"] == "high"
        assert len(result["techniques_applied"]) >= 3  # Should apply more techniques for complex prompts
        assert result["improvement_estimate"] >= 45  # Minimum improvement estimate

    def test_escape_character(self):
        """Test escape character functionality"""
        prompt = "!just say hello"
        result = self.optimizer.optimize_prompt(prompt)
        
        assert result["optimized_prompt"] == prompt  # Should return unchanged
        assert len(result["techniques_applied"]) == 0

    def test_empty_prompt(self):
        """Test handling of empty prompts"""
        prompt = ""
        result = self.optimizer.optimize_prompt(prompt)
        
        assert result["optimized_prompt"] == prompt
        assert len(result["techniques_applied"]) == 0

    def test_improvement_estimate_calculation(self):
        """Test improvement estimate calculation"""
        # Low complexity with few techniques
        result1 = self.optimizer.optimize_prompt("hello")
        assert 10 <= result1["improvement_estimate"] <= 45
        
        # High complexity with many techniques
        result2 = self.optimizer.optimize_prompt("design a complex system for handling sensitive user data with high availability requirements")
        assert result2["improvement_estimate"] >= 80

    def test_domain_specific_personas(self):
        """Test that different domains get appropriate personas"""
        security_prompt = "fix this security vulnerability"
        frontend_prompt = "optimize this React component"
        
        security_result = self.optimizer.optimize_prompt(security_prompt)
        frontend_result = self.optimizer.optimize_prompt(frontend_prompt)
        
        assert "security" in security_result["optimized_prompt"].lower()
        assert "frontend" in frontend_result["optimized_prompt"].lower() or "react" in frontend_result["optimized_prompt"].lower()

    def test_technique_combination(self):
        """Test that techniques combine properly without redundancy"""
        prompt = "help me debug this complex authentication issue"
        result = self.optimizer.optimize_prompt(prompt)
        
        optimized = result["optimized_prompt"]
        
        # Should contain elements from multiple techniques
        has_expert = any(word in optimized.lower() for word in ["engineer", "expert", "specialist"])
        has_steps = any(word in optimized.lower() for word in ["step", "systematically", "deep breath"])
        has_stakes = any(word in optimized.lower() for word in ["critical", "important", "crucial"])
        
        assert has_expert or has_steps or has_stakes

    def test_json_output_format(self):
        """Test that optimize_prompt returns proper JSON-serializable output"""
        prompt = "help me optimize this code"
        result = self.optimizer.optimize_prompt(prompt)
        
        # Should be JSON serializable
        json_str = json.dumps(result)
        parsed = json.loads(json_str)
        
        assert parsed == result

    def test_configuration_loading(self):
        """Test that configuration loads properly"""
        assert "techniques" in self.optimizer.config
        assert "expert_persona" in self.optimizer.config["techniques"]
        assert "step_by_step_reasoning" in self.optimizer.config["techniques"]


class TestPromptOptimizerIntegration:
    """Integration tests for PromptOptimizer"""

    def test_main_function(self):
        """Test main function execution"""
        test_prompt = "help me fix this authentication bug"
        
        with patch('sys.argv', ['prompt-optimizer.py', test_prompt]):
            with patch('builtins.print') as mock_print:
                try:
                    from prompt_optimizer import main
                    main()
                except SystemExit:
                    pass  # Expected when script completes
                
                # Check that print was called with JSON output
                mock_print.assert_called_once()
                printed_output = mock_print.call_args[0][0]
                
                # Should be valid JSON
                parsed = json.loads(printed_output)
                assert "optimized_prompt" in parsed

    def test_command_line_interface(self):
        """Test command line interface with various arguments"""
        test_cases = [
            "simple prompt",
            "help me design a scalable microservices architecture",
            "!escape this prompt",
            ""
        ]
        
        for prompt in test_cases:
            with patch('sys.argv', ['prompt-optimizer.py', prompt]):
                with patch('builtins.print') as mock_print:
                    try:
                        from prompt_optimizer import main
                        main()
                    except SystemExit:
                        pass
                    
                    # Should always output valid JSON
                    mock_print.assert_called_once()
                    output = mock_print.call_args[0][0]
                    parsed = json.loads(output)
                    assert "optimized_prompt" in parsed


if __name__ == "__main__":
    pytest.main([__file__, "-v"])