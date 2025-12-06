"""
Evaluation runner for validation framework.
Orchestrates complete workflow from task loading through statistical analysis.
"""

import json
import asyncio
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path

from .types import (
    GEvalResult,
    DimensionScore,
    OverallScore,
    ComparisonResult,
    ValidationError,
)

from .scoring import GEvalScorer
from harness.collector import ResponseCollector
from harness.analyzer import StatisticalAnalyzer


class EvaluationRunner:
    """Main evaluation runner for validation framework."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.scorer = GEvalScorer()
        self.collector = ResponseCollector(config, dry_run=config.get("dry_run", False))
        self.analyzer = StatisticalAnalyzer()
        self.geval_template = self._load_geval_template()

    async def run_evaluation(
        self, output_dir: str, dry_run: bool = False
    ) -> Dict[str, Any]:
        """Run evaluations on collected responses."""
        print("📊 Running evaluations...")

        if dry_run:
            print("🔍 DRY RUN MODE - No evaluation API calls will be made")
            return {"status": "dry_run_complete", "evaluations": 0}

        # Find all response files
        responses_dir = Path(output_dir)
        response_files = list(responses_dir.glob("*.json"))
        response_files = [
            f for f in response_files if not f.name.endswith("_eval.json")
        ]

        # Group responses by task_id
        task_responses = {}
        for response_file in response_files:
            try:
                with open(response_file, "r") as f:
                    data = json.load(f)

                task_id = data.get("task_id")
                if task_id:
                    if task_id not in task_responses:
                        task_responses[task_id] = {"baseline": [], "enhanced": []}

                    prompt_type = data.get("prompt_type", "")
                    if prompt_type == "baseline":
                        task_responses[task_id]["baseline"].append(data)
                    elif prompt_type == "enhanced":
                        task_responses[task_id]["enhanced"].append(data)
            except Exception as e:
                print(f"⚠️  Error loading {response_file}: {e}")

        # Evaluate each task
        evaluation_count = 0
        for task_id, responses in task_responses.items():
            if responses["baseline"] and responses["enhanced"]:
                for i, (baseline, enhanced) in enumerate(
                    zip(responses["baseline"], responses["enhanced"])
                ):
                    await self._evaluate_pair(
                        baseline, enhanced, task_id, i, output_dir
                    )
                    evaluation_count += 1
            else:
                print(f"⚠️  Skipping {task_id}: missing baseline or enhanced responses")

        print(f"✅ Evaluation complete! Processed {evaluation_count} response pairs")
        return {"status": "complete", "evaluations": evaluation_count}

    async def _evaluate_responses(
        self, task_variant: Dict[str, Any], output_dir: str
    ) -> None:
        """Evaluate responses for a task variant."""
        task_id = task_variant["task_id"]

        # Get baseline and enhanced responses for this task
        baseline_responses = []
        enhanced_responses = []

        # Load baseline responses
        for variant in task_variant["variants"]["baseline"]:
            response_file = (
                Path(output_dir) / f"{task_id}_baseline_{variant['id']}.json"
            )
            if response_file.exists():
                with open(response_file, "r") as f:
                    data = json.load(f)
                    baseline_responses.append(data)

        # Load enhanced responses
        for variant in task_variant["variants"]["enhanced"]:
            response_file = (
                Path(output_dir) / f"{task_id}_enhanced_{variant['id']}.json"
            )
            if response_file.exists():
                with open(response_file, "r") as f:
                    data = json.load(f)
                    enhanced_responses.append(data)

        if not baseline_responses or not enhanced_responses:
            print(
                f"⚠  Missing responses for {task_id}. Baseline: {len(baseline_responses)}, Enhanced: {len(enhanced_responses)}"
            )
            return

        # Evaluate each baseline-enhanced pair
        for i, (baseline, enhanced) in enumerate(
            zip(baseline_responses, enhanced_responses)
        ):
            await self._evaluate_pair(baseline, enhanced, task_id, i, output_dir)

    async def _evaluate_pair(
        self,
        baseline: Dict[str, Any],
        enhanced: Dict[str, Any],
        task_id: str,
        pair_index: int,
        output_dir: str,
    ) -> None:
        """Evaluate a baseline-enhanced response pair using G-Eval."""
        try:
            # Load task data for context
            task_file = Path(output_dir).parent / "tasks" / f"{task_id}.json"
            task_data = {}
            if task_file.exists():
                with open(task_file, "r") as f:
                    task_data = json.load(f)

            # Create G-Eval prompt
            geval_prompt = self._create_geval_prompt(
                task=task_data.get("task", ""),
                baseline_response=baseline.get("response", ""),
                enhanced_response=enhanced.get("response", ""),
            )

            # Call LLM for evaluation
            eval_response, eval_metadata = await self.collector.collect_response(
                task_id=f"{task_id}_eval_{pair_index}",
                prompt_type="evaluation",
                variant_id=f"pair_{pair_index}",
                prompt=geval_prompt,
                output_dir=output_dir,
                dry_run=self.config.get("dry_run", False),
            )

            # Parse evaluation result
            eval_result = self.scorer.extract_eval_result(
                eval_response.get("response", ""), task_id
            )

            # Save evaluation result
            eval_file = Path(output_dir) / f"{task_id}_pair_{pair_index}_eval.json"
            eval_file.parent.mkdir(parents=True, exist_ok=True)

            result_data = {
                "task_id": task_id,
                "pair_index": pair_index,
                "baseline_response": baseline.get("response", ""),
                "enhanced_response": enhanced.get("response", ""),
                "evaluation": {
                    "accuracy": eval_result.evaluation["accuracy"].__dict__,
                    "completeness": eval_result.evaluation["completeness"].__dict__,
                    "clarity": eval_result.evaluation["clarity"].__dict__,
                    "actionability": eval_result.evaluation["actionability"].__dict__,
                    "relevance": eval_result.evaluation["relevance"].__dict__,
                    "overall": eval_result.evaluation["overall"].__dict__,
                },
                "timestamp": eval_result.timestamp,
                "metadata": eval_metadata,
            }

            with open(eval_file, "w") as f:
                json.dump(result_data, f, indent=2, default=str)

            print(f"  ✓ Evaluated: {task_id} pair {pair_index}")

        except Exception as e:
            print(f"  ❌ Error evaluating {task_id} pair {pair_index}: {e}")
            # Save error result
            error_file = Path(output_dir) / f"{task_id}_pair_{pair_index}_eval.json"
            error_data = {
                "task_id": task_id,
                "pair_index": pair_index,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
            with open(error_file, "w") as f:
                json.dump(error_data, f, indent=2)

    async def _generate_report(
        self, task_variant: Dict[str, List[PromptVariant]], output_dir: str
    ) -> Dict[str, Any]:
        """Generate a validation report for a task variant."""
        task_id = task_variant["task_id"]
        variant_type = task_variant["type"]

        # Load evaluation results
        eval_results = []
        for variant in task_variant["variants"]:
            eval_file = (
                Path(output_dir) / f"{task_id}_{variant_type}_{variant['id']}_eval.json"
            )

            if eval_file.exists():
                with open(eval_file, "r") as f:
                    data = json.load(f)
                    eval_results.append(data)
            else:
                print(
                    f"⚠  No evaluation found for {task_id}_{variant_type}_{variant['id']}"
                )

        if not eval_results:
            print(f"⚠ No evaluations found for {task_id}_{variant_type}")
            return {}

        # Generate report
        return {
            "task_id": task_id,
            "variant_type": variant_type,
            "report": self._generate_markdown_report(
                task_id, variant_type, eval_results
            ),
        }

    def _generate_markdown_report(
        self, task_id: str, variant_type: str, eval_results: List[Dict[str, Any]]
    ) -> str:
        """Generate a markdown report for evaluation results."""
        lines = []
        lines.append(f"# Validation Report: {task_id} ({variant_type})")
        lines.append(f"Generated: {datetime.now().isoformat()}")
        lines.append("")

        # Overall summary
        if eval_results:
            avg_baseline = sum(
                r["evaluation"]["overall"]["baseline_score"] for r in eval_results
            ) / len(eval_results)
            avg_enhanced = sum(
                r["evaluation"]["overall"]["enhanced_score"] for r in eval_results
            ) / len(eval_results)
            if avg_baseline > 0:
                improvement = ((avg_enhanced - avg_baseline) / avg_baseline) * 100
            else:
                improvement = 0

            lines.append(f"## Overall Summary")
            lines.append(f"- Baseline Average Score: {avg_baseline:.2f}")
            lines.append(f"- Enhanced Average Score: {avg_enhanced:.2f}")
            lines.append(f"- Average Improvement: {improvement:.1f}%")
            lines.append("")

        # Individual variant results
        for i, result in enumerate(eval_results):
            lines.append(
                f"### Variant {i + 1} ({result['evaluation']['overall']['winner']})"
            )
            lines.append(
                f"**Score:** {result['evaluation']['overall']['enhanced_score']:.2f}"
            )
            lines.append(
                f"**Improvement:** {((result['evaluation']['overall']['enhanced_score'] - result['evaluation']['overall']['baseline_score']) / result['evaluation']['overall']['baseline_score'] * 100):.1f}%"
            )
            lines.append("")

            # Dimension breakdown
            for dimension in [
                "accuracy",
                "completeness",
                "clarity",
                "actionability",
                "relevance",
            ]:
                baseline_score = result["evaluation"][dimension]["score"]
                enhanced_score = result["evaluation"][dimension]["score"]
                lines.append(f"- **{dimension.title()}**")
                lines.append(
                    f"  - Baseline: {baseline_score:.2f} ({result['evaluation'][dimension]['reasoning'][:50]}...)"
                )
                lines.append(
                    f"  - Enhanced: {enhanced_score:.2f} ({result['evaluation'][dimension]['reasoning'][:50]}...)"
                )
            if baseline_score > 0:
                improvement = ((enhanced_score - baseline_score) / baseline_score) * 100
            else:
                improvement = 0
                lines.append(f"  - Improvement: {improvement:.1f}%")
                lines.append("")

        lines.append("")
        lines.append("## Detailed Results")
        lines.append("| Variant | Winner | Baseline | Enhanced | Improvement |")
        lines.append("|--------|--------|----------|------------|------------|")

        for i, result in enumerate(eval_results):
            winner = (
                "✓" if result["evaluation"]["overall"]["winner"] == "enhanced" else "✗"
            )
            baseline_score = result["evaluation"]["overall"]["baseline_score"]
            enhanced_score = result["evaluation"]["overall"]["enhanced_score"]
            if baseline_score > 0:
                improvement = ((enhanced_score - baseline_score) / baseline_score) * 100
            else:
                improvement = 0

            lines.append(
                f"| {i + 1:2} | {winner} | {baseline_score:.2f} | {enhanced_score:.2f} | {improvement:.1f}% |"
            )

        lines.append("")

        return "\n".join(lines)

    def _load_geval_template(self) -> str:
        """Load G-Eval template from file."""
        template_path = Path(__file__).parent / "geval_template.md"
        try:
            with open(template_path, "r") as f:
                content = f.read()

            # Extract the actual template content (between ```markdown blocks)
            start_marker = "```markdown"
            end_marker = "```"
            start_idx = content.find(start_marker)
            if start_idx != -1:
                start_idx += len(start_marker)
                end_idx = content.find(end_marker, start_idx)
                if end_idx != -1:
                    return content[start_idx:end_idx].strip()

            # If no markdown block found, return the content after the template structure
            return content
        except FileNotFoundError:
            raise FileNotFoundError(f"G-Eval template not found at {template_path}")

    def _create_geval_prompt(
        self, task: str, baseline_response: str, enhanced_response: str
    ) -> str:
        """Create G-Eval evaluation prompt."""
        prompt = self.geval_template

        # Replace placeholders
        prompt = prompt.replace("{{task}}", task)
        prompt = prompt.replace("{{baseline_response}}", baseline_response)
        prompt = prompt.replace("{{enhanced_response}}", enhanced_response)

        return prompt


# Example usage
if __name__ == "__main__":
    import asyncio

    async def main():
        # Example task
        task = {
            "id": "EXAMPLE-001",
            "title": "Example Task",
            "task": "Example task description",
            "expected_elements": ["Element 1", "Element 2"],
            "difficulty": "medium",
            "validates_techniques": ["expert-persona"],
        }

        # Generate variants and run validation
        variants = generatePromptVariants(
            [task],
            {
                "baseline": "# Baseline prompt\n\n{{task}}",
                "enhanced": "# Enhanced prompt\n\n{{task}}",
            },
        )

        reports = await run_validation(variants, dry_run=True)

        # Print summary
        for report in reports:
            print(report)

        print(f"\n📊 Generated {len(reports)} reports for {len(variants)} variants")
