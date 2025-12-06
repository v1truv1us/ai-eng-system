"""
Self-Consistency Validation for Meta-Validation
Tests whether LLM evaluations are consistent across multiple runs with temperature > 0.
"""

import json
import random
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path
from dataclasses import dataclass
import numpy as np
from sklearn.metrics import cohen_kappa_score


@dataclass
class ConsistencyResult:
    """Result of a self-consistency test."""

    task_id: str
    num_runs: int
    average_kappa: float
    kappa_std: float
    winner_consistency: float
    score_variance: Dict[str, float]
    temperature_effect: float
    stable_evaluation: bool


class SelfConsistencyTester:
    """Tests self-consistency of LLM evaluations across multiple runs."""

    def __init__(self, gold_standard_file: str = "gold_standard.json"):
        self.gold_standard_file = gold_standard_file
        self.gold_standard = self.load_gold_standard()

    def load_gold_standard(self) -> Dict[str, Any]:
        """Load gold standard ratings."""
        with open(self.gold_standard_file, "r") as f:
            return json.load(f)

    def simulate_evaluation_with_temperature(
        self, baseline_response: str, enhanced_response: str, temperature: float = 0.7
    ) -> str:
        """
        Simulate LLM evaluation with temperature > 0.

        In a real implementation, this would call the LLM with temperature > 0.
        For demonstration, we'll simulate realistic variation.
        """
        # Get "true" quality scores (simplified)
        baseline_quality = self._estimate_response_quality(baseline_response)
        enhanced_quality = self._estimate_response_quality(enhanced_response)

        # Add temperature-induced variation
        # Higher temperature = more variation
        baseline_noise = np.random.normal(0, temperature * 0.2)
        enhanced_noise = np.random.normal(0, temperature * 0.2)

        baseline_score = baseline_quality + baseline_noise
        enhanced_score = enhanced_quality + enhanced_noise

        # Small positional bias (5%)
        if random.choice([True, False]):  # Randomize which is "first"
            baseline_score *= 1.05
            enhanced_score *= 0.95
        else:
            baseline_score *= 0.95
            enhanced_score *= 1.05

        # Determine winner
        if enhanced_score > baseline_score:
            return "enhanced"
        elif baseline_score > enhanced_score:
            return "baseline"
        else:
            return "tie"

    def _estimate_response_quality(self, response: str) -> float:
        """Estimate response quality (same as bias test)."""
        length_score = min(len(response) / 500, 1.0)
        structure_score = 1.0 if "```" in response else 0.7
        keyword_score = (
            sum(
                1
                for word in ["however", "therefore", "additionally", "importantly"]
                if word in response.lower()
            )
            / 4
        )

        base_score = (length_score + structure_score + keyword_score) / 3
        variation = np.random.normal(0, 0.05)  # Small random variation
        return max(0, min(1, base_score + variation))

    def test_self_consistency(
        self, task_id: str, num_runs: int = 10, temperatures: List[float] = None
    ) -> ConsistencyResult:
        """
        Test self-consistency for a task across multiple evaluation runs.

        Runs evaluations multiple times with different temperatures to assess stability.
        """
        if temperatures is None:
            temperatures = [0.1, 0.3, 0.5, 0.7, 0.9]

        # Get task data
        task_data = self.gold_standard["tasks"].get(task_id)
        if not task_data:
            raise ValueError(f"Task {task_id} not found in gold standard")

        # Get gold standard winner
        expert_key = f"{task_id}_expert"
        if expert_key not in self.gold_standard["ratings"]:
            raise ValueError(f"No expert ratings found for {task_id}")

        gold_standard_winner = self.gold_standard["ratings"][expert_key]["overall"][
            "winner"
        ]

        # Run multiple evaluations
        all_winners = []
        temperature_results = {}

        for temp in temperatures:
            temp_winners = []
            for run in range(num_runs):
                # Simulate responses (in real implementation, these would be from actual LLM responses)
                baseline_response = f"Baseline response for {task_id} (run {run})"
                enhanced_response = f"Enhanced response for {task_id} (run {run})"

                winner = self.simulate_evaluation_with_temperature(
                    baseline_response, enhanced_response, temp
                )
                temp_winners.append(winner)
                all_winners.append(winner)

            temperature_results[temp] = temp_winners

        # Calculate consistency metrics
        winner_counts = {}
        for winner in all_winners:
            winner_counts[winner] = winner_counts.get(winner, 0) + 1

        most_common_winner = max(winner_counts.keys(), key=lambda k: winner_counts[k])
        winner_consistency = winner_counts.get(gold_standard_winner, 0) / len(
            all_winners
        )

        # Calculate agreement between different temperature runs
        kappas = []
        for i, temp1 in enumerate(temperatures):
            for j, temp2 in enumerate(temperatures):
                if i < j:  # Avoid duplicate comparisons
                    # Convert winners to numeric for kappa calculation
                    winner_to_num = {"baseline": 0, "enhanced": 1, "tie": 2}
                    r1_numeric = [winner_to_num[w] for w in temperature_results[temp1]]
                    r2_numeric = [winner_to_num[w] for w in temperature_results[temp2]]

                    try:
                        kappa = cohen_kappa_score(r1_numeric, r2_numeric)
                        kappas.append(kappa)
                    except:
                        kappas.append(0.0)  # Fallback for calculation errors

        average_kappa = np.mean(kappas) if kappas else 0.0
        kappa_std = np.std(kappas) if kappas else 0.0

        # Calculate temperature effect (variance across temperatures)
        temp_consistencies = []
        for temp, winners in temperature_results.items():
            temp_consistency = sum(
                1 for w in winners if w == gold_standard_winner
            ) / len(winners)
            temp_consistencies.append(temp_consistency)

        temperature_effect = np.std(temp_consistencies)

        # Calculate score variance (simplified - would use actual scores in real implementation)
        score_variance = {
            "winner_variance": np.var(
                [1 if w == gold_standard_winner else 0 for w in all_winners]
            ),
            "temperature_variance": temperature_effect,
            "overall_stability": 1.0 - temperature_effect,  # Higher = more stable
        }

        # Determine if evaluation is stable
        stable_evaluation = (
            winner_consistency > 0.7  # >70% agreement with gold standard
            and temperature_effect < 0.2  # Low temperature-induced variance
            and average_kappa > 0.6  # Good agreement between temperature runs
        )

        return ConsistencyResult(
            task_id=task_id,
            num_runs=len(all_winners),
            average_kappa=average_kappa,
            kappa_std=kappa_std,
            winner_consistency=winner_consistency,
            score_variance=score_variance,
            temperature_effect=temperature_effect,
            stable_evaluation=stable_evaluation,
        )

    def run_consistency_tests(
        self, num_runs_per_task: int = 10, temperatures: List[float] = None
    ) -> Dict[str, ConsistencyResult]:
        """Run self-consistency tests for all tasks in gold standard."""
        if temperatures is None:
            temperatures = [0.1, 0.3, 0.5, 0.7, 0.9]

        results = {}

        for task_id in self.gold_standard["tasks"].keys():
            try:
                result = self.test_self_consistency(
                    task_id, num_runs_per_task, temperatures
                )
                results[task_id] = result
                print(
                    f"✓ Tested consistency for {task_id}: kappa={result.average_kappa:.3f}, stable={result.stable_evaluation}"
                )
            except Exception as e:
                print(f"❌ Error testing consistency for {task_id}: {e}")
                results[task_id] = None

        return results

    def analyze_consistency_results(
        self, consistency_results: Dict[str, ConsistencyResult]
    ) -> Dict[str, Any]:
        """Analyze overall consistency test results."""
        valid_results = [r for r in consistency_results.values() if r is not None]

        if not valid_results:
            return {"error": "No valid consistency test results"}

        # Calculate summary statistics
        average_kappas = [r.average_kappa for r in valid_results]
        winner_consistencies = [r.winner_consistency for r in valid_results]
        temperature_effects = [r.temperature_effect for r in valid_results]
        stable_count = sum(1 for r in valid_results if r.stable_evaluation)

        analysis = {
            "total_tasks_tested": len(valid_results),
            "average_inter_temperature_kappa": float(np.mean(average_kappas)),
            "kappa_std": float(np.std(average_kappas)),
            "average_winner_consistency": float(np.mean(winner_consistencies)),
            "average_temperature_effect": float(np.mean(temperature_effects)),
            "max_temperature_effect": float(np.max(temperature_effects)),
            "stable_evaluations": stable_count,
            "stability_percentage": float(stable_count / len(valid_results) * 100),
        }

        analysis["overall_consistency"] = self._assess_overall_consistency(analysis)
        analysis["recommendations"] = self._generate_consistency_recommendations(
            analysis
        )

        return analysis

    def _assess_overall_consistency(self, analysis: Dict[str, Any]) -> str:
        """Assess overall consistency level."""
        kappa = analysis["average_inter_temperature_kappa"]
        consistency = analysis["average_winner_consistency"]
        stability_pct = analysis["stability_percentage"]

        if kappa > 0.8 and consistency > 0.8 and stability_pct > 80:
            return "Excellent consistency"
        elif kappa > 0.6 and consistency > 0.7 and stability_pct > 60:
            return "Good consistency"
        elif kappa > 0.4 and consistency > 0.6 and stability_pct > 40:
            return "Moderate consistency"
        else:
            return "Poor consistency - temperature effects significant"

    def _generate_consistency_recommendations(
        self, analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on consistency analysis."""
        recommendations = []

        if analysis["average_inter_temperature_kappa"] < 0.6:
            recommendations.append(
                "Low inter-temperature agreement - consider using temperature=0 for consistency"
            )

        if analysis["average_winner_consistency"] < 0.7:
            recommendations.append(
                "Low agreement with gold standard - review evaluation methodology"
            )

        if analysis["average_temperature_effect"] > 0.2:
            recommendations.append(
                "High temperature-induced variance - use majority voting or temperature averaging"
            )

        if analysis["stability_percentage"] < 60:
            recommendations.append(
                "Many evaluations are unstable - implement quality checks"
            )

        if not recommendations:
            recommendations.append(
                "Self-consistency is good - evaluation method appears stable"
            )

        return recommendations

    def save_consistency_report(
        self,
        consistency_results: Dict[str, ConsistencyResult],
        analysis: Dict[str, Any],
        output_file: str = "consistency_test_report.json",
    ):
        """Save comprehensive consistency test report."""
        report = {
            "title": "Self-Consistency Test Report",
            "description": "Analysis of LLM evaluation consistency across temperature variations",
            "generated": str(np.datetime64("now")),
            "task_results": {
                task_id: result.__dict__ if result else None
                for task_id, result in consistency_results.items()
            },
            "analysis": analysis,
        }

        with open(output_file, "w") as f:
            json.dump(report, f, indent=2, default=str)

        print(f"Consistency test report saved to {output_file}")


def main():
    """Main function to run self-consistency testing."""
    tester = SelfConsistencyTester()

    # Run consistency tests
    consistency_results = tester.run_consistency_tests(
        num_runs_per_task=15, temperatures=[0.1, 0.3, 0.5, 0.7]
    )

    # Analyze results
    analysis = tester.analyze_consistency_results(consistency_results)

    # Save report
    tester.save_consistency_report(consistency_results, analysis)

    # Print summary
    print("\nSelf-Consistency Test Summary:")
    print("=" * 40)
    print(f"Tasks tested: {analysis['total_tasks_tested']}")
    print(".3f")
    print(".3f")
    print(".3f")
    print(
        f"Stable evaluations: {analysis['stable_evaluations']} ({analysis['stability_percentage']:.1f}%)"
    )
    print(f"Overall consistency: {analysis['overall_consistency']}")

    print("\nRecommendations:")
    for rec in analysis["recommendations"]:
        print(f"• {rec}")


if __name__ == "__main__":
    main()
