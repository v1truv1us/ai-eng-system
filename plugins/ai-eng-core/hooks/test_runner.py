#!/usr/bin/env python3
"""
Simple test runner for prompt-optimizer.py
Tests core functionality without external dependencies.
"""

import json
import sys
from pathlib import Path

# Add hooks directory to Python path for testing
hook_dir = Path(__file__).parent
sys.path.insert(0, str(hook_dir))

def test_basic_functionality():
    """Test basic prompt optimizer functionality"""
    try:
        from prompt_optimizer import PromptOptimizer
        
        print("Testing PromptOptimizer initialization...")
        optimizer = PromptOptimizer()
        print("✓ Initialization successful")
        
        print("Testing domain detection...")
        # Test security domain
        domain = optimizer._detect_domain("help me fix this authentication bug")
        assert domain == "security", f"Expected 'security', got '{domain}'"
        print("✓ Security domain detection works")
        
        # Test frontend domain  
        domain = optimizer._detect_domain("optimize this React component")
        assert domain == "frontend", f"Expected 'frontend', got '{domain}'"
        print("✓ Frontend domain detection works")
        
        print("Testing complexity assessment...")
        # Test low complexity
        complexity = optimizer._assess_complexity("hello world")
        assert complexity == "low", f"Expected 'low', got '{complexity}'"
        print("✓ Low complexity detection works")
        
        # Test high complexity
        complexity = optimizer._assess_complexity("design a scalable microservices architecture with event-driven communication for a high-throughput e-commerce platform")
        assert complexity == "high", f"Expected 'high', got '{complexity}'"
        print("✓ High complexity detection works")
        
        print("Testing technique application...")
        prompt = "help me fix this authentication bug"
        
        # Test expert persona
        optimized = optimizer._apply_expert_persona(prompt, "security")
        assert "senior security engineer" in optimized.lower()
        assert "years of experience" in optimized.lower()
        print("✓ Expert persona application works")
        
        # Test step-by-step reasoning
        optimized = optimizer._apply_step_by_step_reasoning(prompt)
        assert "take a deep breath" in optimized.lower()
        assert "systematically" in optimized.lower()
        print("✓ Step-by-step reasoning works")
        
        # Test stakes language
        optimized = optimizer._apply_stakes_language(prompt)
        assert any(word in optimized.lower() for word in ["critical", "important", "crucial"])
        print("✓ Stakes language works")
        
        print("Testing full optimization...")
        result = optimizer.optimize_prompt("help me fix this authentication bug")
        
        required_keys = ["original_prompt", "optimized_prompt", "techniques_applied", "improvement_estimate", "domain", "complexity"]
        for key in required_keys:
            assert key in result, f"Missing key: {key}"
        print("✓ Full optimization returns required keys")
        
        assert result["domain"] == "security"
        assert result["optimized_prompt"] != result["original_prompt"]
        assert len(result["techniques_applied"]) > 0
        assert result["improvement_estimate"] > 0
        print("✓ Full optimization produces expected results")
        
        print("Testing escape character...")
        escape_prompt = "!just say hello"
        result = optimizer.optimize_prompt(escape_prompt)
        assert result["optimized_prompt"] == escape_prompt
        assert len(result["techniques_applied"]) == 0
        print("✓ Escape character handling works")
        
        print("Testing JSON serialization...")
        json_str = json.dumps(result)
        parsed = json.loads(json_str)
        assert parsed == result
        print("✓ JSON serialization works")
        
        print("\n🎉 All tests passed! Prompt optimizer is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_command_line_interface():
    """Test command line interface"""
    try:
        print("\nTesting command line interface...")
        
        # Test main function
        test_prompt = "help me fix this authentication bug"
        
        # Backup original sys.argv
        original_argv = sys.argv
        
        try:
            sys.argv = ['prompt-optimizer.py', test_prompt]
            from prompt_optimizer import main
            
            # Capture output
            from io import StringIO
            import contextlib
            
            f = StringIO()
            with contextlib.redirect_stdout(f):
                main()
            
            output = f.getvalue()
            result = json.loads(output)
            
            assert "optimized_prompt" in result
            assert result["domain"] == "security"
            print("✓ Command line interface works")
            
        except SystemExit:
            # Expected when main() completes
            pass
        finally:
            sys.argv = original_argv
            
        return True
        
    except Exception as e:
        print(f"❌ CLI test failed: {e}")
        return False

if __name__ == "__main__":
    print("Running Prompt Optimizer Tests")
    print("=" * 40)
    
    basic_passed = test_basic_functionality()
    cli_passed = test_command_line_interface()
    
    if basic_passed and cli_passed:
        print("\n🎉 All test suites passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)