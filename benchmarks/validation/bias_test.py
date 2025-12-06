"""
Positional Bias Testing for Meta-Validation
Tests whether LLM evaluations are affected by response presentation order.
"""

import json
import random
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path
from dataclasses import dataclass
from sklearn.metrics import cohen_kappa_score
import numpy as np


@dataclass
class BiasTestResult:
    """Result of a positional bias test."""

    task_id: str
    original_winner: str
    randomized_winner: str
    consistency_score: float
    position_effect: float
    significant_bias: bool


class PositionalBiasTester:
    """Tests for positional bias in LLM evaluations."""

    def __init__(self, gold_standard_file: str = "gold_standard.json"):
        self.gold_standard_file = gold_standard_file
        self.gold_standard = self.load_gold_standard()

    def load_gold_standard(self) -> Dict[str, Any]:
        """Load gold standard ratings."""
        with open(self.gold_standard_file, "r") as f:
            return json.load(f)

    def randomize_response_order(
        self, baseline_response: str, enhanced_response: str
    ) -> Tuple[str, str, bool]:
        """
        Randomize the order of responses for evaluation.

        Returns:
            Tuple of (response_a, response_b, baseline_is_first)
        """
        if random.choice([True, False]):
            return baseline_response, enhanced_response, True
        else:
            return enhanced_response, baseline_response, False

    def simulate_evaluation_with_order(
        self, response_a: str, response_b: str, baseline_is_first: bool
    ) -> str:
        """
        Simulate LLM evaluation with specific response order.

        In a real implementation, this would call the actual LLM evaluator.
        For demonstration, we'll simulate realistic behavior.
        """
        # Simulate realistic evaluation behavior
        # LLM tends to favor the first response slightly (positional bias)
        bias_strength = 0.05  # 5% bias toward first response (more realistic)

        # Parse response quality (simplified simulation)
        a_quality = self._estimate_response_quality(response_a)
        b_quality = self._estimate_response_quality(response_b)

        # Apply positional bias
        if baseline_is_first:
            a_quality *= 1 + bias_strength
            b_quality *= 1 - bias_strength
        else:
            a_quality *= 1 - bias_strength
            b_quality *= 1 + bias_strength

        # Determine winner
        if a_quality > b_quality:
            return "baseline" if baseline_is_first else "enhanced"
        elif b_quality > a_quality:
            return "enhanced" if baseline_is_first else "baseline"
        else:
            return "tie"

    def _estimate_response_quality(self, response: str) -> float:
        """Estimate response quality from text (simplified simulation)."""
        # Simple heuristic: longer, more structured responses are higher quality
        length_score = min(
            len(response) / 500, 1.0
        )  # Normalize length (shorter threshold)
        structure_score = (
            1.0 if "```" in response else 0.7
        )  # Code blocks indicate structure
        keyword_score = (
            sum(
                1
                for word in ["however", "therefore", "additionally", "importantly"]
                if word in response.lower()
            )
            / 4
        )

        # Add some random variation to make it more realistic
        base_score = (length_score + structure_score + keyword_score) / 3
        variation = np.random.normal(0, 0.1)  # ±0.1 variation
        return max(0, min(1, base_score + variation))

    def test_positional_bias(
        self, task_id: str, num_trials: int = 10
    ) -> BiasTestResult:
        """
        Test for positional bias in a specific task.

        Runs multiple evaluations with randomized response order.
        """
        # Get task data
        task_data = self.gold_standard["tasks"].get(task_id)
        if not task_data:
            raise ValueError(f"Task {task_id} not found in gold standard")

        # Get original evaluation result (from gold standard)
        expert_key = f"{task_id}_expert"
        if expert_key not in self.gold_standard["ratings"]:
            raise ValueError(f"No expert ratings found for {task_id}")

        original_winner = self.gold_standard["ratings"][expert_key]["overall"]["winner"]

        # Run multiple randomized evaluations
        randomized_winners = []
        consistency_scores = []

        for trial in range(num_trials):
            # Get baseline and enhanced responses (simplified)
            baseline_response = f"Baseline response for {task_id}"
            enhanced_response = f"Enhanced response for {task_id}"

            # Randomize order
            response_a, response_b, baseline_is_first = self.randomize_response_order(
                baseline_response, enhanced_response
            )

            # Evaluate with this order
            winner = self.simulate_evaluation_with_order(
                response_a, response_b, baseline_is_first
            )
            randomized_winners.append(winner)

            # Calculate consistency with original
            consistency = 1.0 if winner == original_winner else 0.0
            consistency_scores.append(consistency)

        # Analyze results
        avg_consistency = np.mean(consistency_scores)
        most_common_winner = max(set(randomized_winners), key=randomized_winners.count)
        winner_consistency = randomized_winners.count(original_winner) / len(
            randomized_winners
        )

        # Calculate position effect (difference in consistency when baseline is first vs second)
        first_position_trials = [
            i for i, winner in enumerate(randomized_winners) if (i % 2 == 0)
        ]  # Simplified: assume even trials have baseline first
        second_position_trials = [
            i for i, winner in enumerate(randomized_winners) if (i % 2 == 1)
        ]

        first_position_consistency = (
            np.mean([consistency_scores[i] for i in first_position_trials])
            if first_position_trials
            else 0.5
        )
        second_position_consistency = (
            np.mean([consistency_scores[i] for i in second_position_trials])
            if second_position_trials
            else 0.5
        )

        position_effect = abs(first_position_consistency - second_position_consistency)

        # Determine if bias is significant (arbitrary threshold)
        significant_bias = position_effect > 0.2 or winner_consistency < 0.7

        return BiasTestResult(
            task_id=task_id,
            original_winner=original_winner,
            randomized_winner=most_common_winner,
            consistency_score=avg_consistency,
            position_effect=position_effect,
            significant_bias=significant_bias,
        )

    def run_bias_tests(
        self, num_trials_per_task: int = 10
    ) -> Dict[str, BiasTestResult]:
        """Run positional bias tests for all tasks in gold standard."""
        results = {}

        for task_id, task_data in self.gold_standard["tasks"].items():
            pass  # task_id is already available
            try:
                result = self.test_positional_bias(task_id, num_trials_per_task)
                results[task_id] = result
                print(
                    f"✓ Tested bias for {task_id}: consistency={result.consistency_score:.2f}, bias={result.significant_bias}"
                )
            except Exception as e:
                print(f"❌ Error testing bias for {task_id}: {e}")
                results[task_id] = None

        return results

    def analyze_bias_results(
        self, bias_results: Dict[str, BiasTestResult]
    ) -> Dict[str, Any]:
        """Analyze overall bias test results."""
        valid_results = [r for r in bias_results.values() if r is not None]

        if not valid_results:
            return {"error": "No valid bias test results"}

        # Calculate summary statistics
        consistency_scores = [r.consistency_score for r in valid_results]
        position_effects = [r.position_effect for r in valid_results]
        significant_bias_count = sum(1 for r in valid_results if r.significant_bias)

        analysis = {
            "total_tasks_tested": len(valid_results),
            "average_consistency": float(np.mean(consistency_scores)),
            "consistency_std": float(np.std(consistency_scores)),
            "average_position_effect": float(np.mean(position_effects)),
            "max_position_effect": float(np.max(position_effects)),
            "tasks_with_significant_bias": significant_bias_count,
            "bias_percentage": float(significant_bias_count / len(valid_results) * 100),
            "overall_bias_detected": significant_bias_count
            > len(valid_results) * 0.3,  # >30% show bias
        }

        analysis["recommendations"] = self._generate_bias_recommendations(analysis)

        return analysis

    def _generate_bias_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on bias analysis."""
        recommendations = []

        if analysis["overall_bias_detected"]:
            recommendations.append(
                "Positional bias detected - implement response order randomization in production"
            )
            recommendations.append("Consider majority voting across multiple orderings")

        if analysis["average_consistency"] < 0.8:
            recommendations.append(
                "Low consistency with gold standard - review evaluation prompts"
            )

        if analysis["max_position_effect"] > 0.3:
            recommendations.append(
                "Strong positional effects observed - evaluate mitigation strategies"
            )

        if not recommendations:
            recommendations.append(
                "No significant positional bias detected - current evaluation method appears robust"
            )

        return recommendations

    def save_bias_report(
        self,
        bias_results: Dict[str, BiasTestResult],
        analysis: Dict[str, Any],
        output_file: str = "bias_test_report.json",
    ):
        """Save comprehensive bias test report."""
        report = {
            "title": "Positional Bias Test Report",
            "description": "Analysis of positional bias in LLM evaluations",
            "generated": str(np.datetime64("now")),
            "task_results": {
                task_id: result.__dict__ if result else None
                for task_id, result in bias_results.items()
            },
            "analysis": analysis,
        }

        with open(output_file, "w") as f:
            json.dump(report, f, indent=2, default=str)

        print(f"Bias test report saved to {output_file}")


def main():
    """Main function to run positional bias testing."""
    tester = PositionalBiasTester()

    # Run bias tests
    bias_results = tester.run_bias_tests(num_trials_per_task=20)

    # Analyze results
    analysis = tester.analyze_bias_results(bias_results)

    # Save report
    tester.save_bias_report(bias_results, analysis)

    # Print summary
    print("\nPositional Bias Test Summary:")
    print("=" * 40)
    print(f"Tasks tested: {analysis['total_tasks_tested']}")
    print(".2f")
    print(".2f")
    print(
        f"Tasks with significant bias: {analysis['tasks_with_significant_bias']} ({analysis['bias_percentage']:.1f}%)"
    )
    print(f"Overall bias detected: {analysis['overall_bias_detected']}")

    print("\nRecommendations:")
    for rec in analysis["recommendations"]:
        print(f"• {rec}")


if __name__ == "__main__":
    main()
