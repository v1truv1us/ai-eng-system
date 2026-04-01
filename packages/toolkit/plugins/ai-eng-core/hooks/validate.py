#!/usr/bin/env python3
"""
Validation script for prompt-optimizer.py
Runs basic functionality tests without external dependencies.
"""

import json
import sys
import subprocess
import tempfile
import os

def test_prompt_optimizer():
    """Test prompt optimizer functionality"""
    print("Testing Prompt Optimizer...")
    
    test_cases = [
        {
            "prompt": "help me fix this authentication bug",
            "expected_domain": "security",
            "min_techniques": 1,
            "min_improvement": 10
        },
        {
            "prompt": "design a scalable microservices architecture",
            "expected_domain": "backend", 
            "min_techniques": 1,
            "min_improvement": 20
        },
        {
            "prompt": "!escape this prompt",
            "expected_domain": "general",
            "min_techniques": 0,
            "min_improvement": 0
        }
    ]
    
    passed = 0
    total = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        prompt = test_case["prompt"]
        print(f"\nTest {i}/{total}: {prompt[:50]}...")
        
        try:
            # Run prompt optimizer as subprocess
            result = subprocess.run(
                [sys.executable, "prompt-optimizer.py", prompt],
                capture_output=True,
                text=True,
                cwd=os.path.dirname(__file__)
            )
            
            if result.returncode != 0:
                print(f"❌ Failed to run prompt optimizer: {result.stderr}")
                continue
            
            output = json.loads(result.stdout)
            
            # Validate required fields
            required_fields = ["original_prompt", "optimized_prompt", "techniques_applied", 
                            "improvement_estimate", "domain", "complexity"]
            missing_fields = [field for field in required_fields if field not in output]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                continue
            
            # Validate expected values
            if output["domain"] != test_case["expected_domain"]:
                print(f"❌ Expected domain '{test_case['expected_domain']}', got '{output['domain']}'")
                continue
            
            if len(output["techniques_applied"]) < test_case["min_techniques"]:
                print(f"❌ Expected at least {test_case['min_techniques']} techniques, got {len(output['techniques_applied'])}")
                continue
            
            if output["improvement_estimate"] < test_case["min_improvement"]:
                print(f"❌ Expected improvement estimate ≥ {test_case['min_improvement']}, got {output['improvement_estimate']}")
                continue
            
            print(f"✓ Domain: {output['domain']}, Techniques: {len(output['techniques_applied'])}, Improvement: {output['improvement_estimate']}%")
            passed += 1
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    return passed == total

def test_json_output():
    """Test that output is valid JSON"""
    print("\nTesting JSON output format...")
    
    try:
        result = subprocess.run(
            [sys.executable, "prompt-optimizer.py", "test prompt"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__)
        )
        
        if result.returncode != 0:
            print(f"❌ Failed to run prompt optimizer")
            return False
        
        # Try to parse as JSON
        json.loads(result.stdout)
        print("✓ Output is valid JSON")
        return True
        
    except json.JSONDecodeError:
        print("❌ Output is not valid JSON")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all validation tests"""
    print("Prompt Optimizer Validation")
    print("=" * 30)
    
    tests_passed = 0
    tests_total = 2
    
    if test_prompt_optimizer():
        tests_passed += 1
    
    if test_json_output():
        tests_passed += 1
    
    print(f"\nOverall: {tests_passed}/{tests_total} validation suites passed")
    
    if tests_passed == tests_total:
        print("🎉 All validations passed!")
        return 0
    else:
        print("❌ Some validations failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())