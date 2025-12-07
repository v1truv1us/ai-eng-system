"""
G-Eval scoring and validation module.
Extracts and validates scores from LLM responses.
"""

import json
import re
import random
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass

from .types import (
    GEvalResult,
    DimensionScore,
    OverallScore,
    ScoreRange,
    ComparisonResult,
    ValidationError,
)


class GEvalScorer:
    """Extracts and validates G-Eval scores from LLM responses."""

    def __init__(self):
        self.score_pattern = re.compile(
            r'"score":\s*(\d+\.?\d*)\s*,\s*"reasoning":\s*"([^"]+)"'
        )
        self.overall_pattern = re.compile(
            r'"overall":\s*{\s*"baseline_score"\s*:\s*(\d+\.?\d*)\s*,\s*"enhanced_score"\s*:\s*(\d+\.?\d*)\s*,\s*"winner"\s*:\s*"([^"]+)"\s*}'
        )

    def parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON response from LLM."""
        try:
            # Clean up the response
            cleaned = response.strip()
            if not cleaned.startswith("{"):
                cleaned = "{" + cleaned + "}"

            # Try to extract JSON
            start_idx = cleaned.find("{")
            if start_idx != -1:
                end_idx = cleaned.rfind("}")
                if end_idx > start_idx:
                    json_str = cleaned[start_idx : end_idx + 1]
                else:
                    json_str = cleaned
            else:
                # Try to find JSON array
                json_str = cleaned

            return json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON response: {e}")

    def extract_dimension_score(self, dimension_data: Dict[str, Any]) -> DimensionScore:
        """Extract and validate a single dimension score."""
        try:
            score = float(dimension_data["score"])
            reasoning = str(dimension_data.get("reasoning", ""))
            confidence = dimension_data.get("confidence")

            # Validate score range
            if not (ScoreRange.VALID.value[0] <= score <= ScoreRange.VALID.value[1]):
                raise ValidationError(
                    f"Invalid score {score} for dimension '{dimension_data.get('dimension')}'. Must be 1-5"
                )

            # Validate confidence range
            if confidence is not None and not (0.0 <= confidence <= 1.0):
                raise ValidationError(
                    f"Invalid confidence {confidence} for dimension '{dimension_data.get('dimension')}'. Must be 0-1"
                )

            return DimensionScore(
                score=score, reasoning=reasoning, confidence=confidence
            )
        except (KeyError, ValueError, TypeError) as e:
            raise ValidationError(f"Invalid dimension data: {e}")

    def extract_overall_score(self, overall_data: Dict[str, Any]) -> OverallScore:
        """Extract and validate the overall comparison."""
        try:
            baseline_score = float(overall_data["baseline_score"])
            enhanced_score = float(overall_data["enhanced_score"])
            winner = str(overall_data["winner"])
            confidence = overall_data.get("confidence")

            # Validate score ranges
            if not (
                ScoreRange.VALID.value[0] <= baseline_score <= ScoreRange.VALID.value[1]
            ):
                raise ValidationError(
                    f"Invalid baseline_score {baseline_score}. Must be 1-5"
                )
            if not (
                ScoreRange.VALID.value[0] <= enhanced_score <= ScoreRange.VALID.value[1]
            ):
                raise ValidationError(
                    f"Invalid enhanced_score {enhanced_score}. Must be 1-5"
                )

            # Validate winner
            if winner not in ["baseline", "enhanced", "tie"]:
                raise ValidationError(
                    f"Invalid winner '{winner}'. Must be 'baseline', 'enhanced', or 'tie'"
                )

            # Validate confidence
            if confidence is not None and not (0.0 <= confidence <= 1.0):
                raise ValidationError(f"Invalid confidence {confidence}. Must be 0-1")

            return OverallScore(
                baseline_score=baseline_score,
                enhanced_score=enhanced_score,
                winner=winner,
                confidence=confidence,
            )
        except (KeyError, ValueError, TypeError) as e:
            raise ValidationError(f"Invalid overall data: {e}")

    def extract_eval_result(self, response: str, task_id: str) -> GEvalResult:
        """Extract complete G-Eval result from LLM response."""
        try:
            data = self.parse_json_response(response)

            # Extract dimension scores
            accuracy = self.extract_dimension_score(data.get("accuracy", {}))
            completeness = self.extract_dimension_score(data.get("completeness", {}))
            clarity = self.extract_dimension_score(data.get("clarity", {}))
            actionability = self.extract_dimension_score(data.get("actionability", {}))
            relevance = self.extract_dimension_score(data.get("relevance", {}))

            # Extract overall score
            overall = self.extract_overall_score(data.get("overall", {}))

            # Calculate average scores
            baseline_avg = (
                accuracy.score
                + completeness.score
                + clarity.score
                + actionability.score
                + relevance.score
            ) / 5
            enhanced_avg = (overall.baseline_score + overall.enhanced_score) / 5

            return GEvalResult(
                task_id=task_id,
                baseline_response=response,
                enhanced_response=response,
                evaluation={
                    "accuracy": accuracy,
                    "completeness": completeness,
                    "clarity": clarity,
                    "actionability": actionability,
                    "relevance": relevance,
                    "overall": overall,
                },
                timestamp=self._get_timestamp(),
            )
        except (ValidationError, KeyError, ValueError) as e:
            raise ValidationError(f"Failed to extract evaluation: {e}")

    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime

        return datetime.now().isoformat()

    def validate_scores(self, result: GEvalResult) -> List[str]:
        """Validate all scores in the result."""
        errors = []

        # Check dimension scores
        for dimension_name, dimension_score in result.evaluation.items():
            if dimension_name != "overall":
                try:
                    self._validate_dimension_score(dimension_score, dimension_name)
                except ValidationError as e:
                    errors.append(str(e))

        # Check overall score
        try:
            self._validate_overall_score(result.evaluation["overall"], "overall")
        except ValidationError as e:
            errors.append(str(e))

        return errors

    def _validate_dimension_score(
        self, score: DimensionScore, dimension_name: str
    ) -> None:
        """Validate a single dimension score."""
        if not (ScoreRange.VALID.value[0] <= score.score <= ScoreRange.VALID.value[1]):
            raise ValidationError(
                f"Invalid {dimension_name} score: {score.score}. Must be 1-5"
            )

    def _validate_overall_score(self, score: OverallScore, score_name: str) -> None:
        """Validate the overall score."""
        if not (
            ScoreRange.VALID.value[0]
            <= score.baseline_score
            <= ScoreRange.VALID.value[1]
        ):
            raise ValidationError(
                f"Invalid {score_name}_score: {score.baseline_score}. Must be 1-5"
            )
        if not (
            ScoreRange.VALID.value[0]
            <= score.enhanced_score
            <= ScoreRange.VALID.value[1]
        ):
            raise ValidationError(
                f"Invalid {score_name}_score: {score.enhanced_score}. Must be 1-5"
            )

        # Validate winner
        if score.winner not in ["baseline", "enhanced", "tie"]:
            raise ValidationError(
                f"Invalid winner: {score.winner}. Must be 'baseline', 'enhanced', or 'tie'"
            )
    
    def generate_mock_evaluation(self, task_id: str, improvement_bias: float = 0.65) -> str:
        """Generate realistic mock G-Eval JSON response.
        
        Args:
            task_id: Task identifier
            improvement_bias: Probability (0-1) that enhanced scores are better. Default 0.65 ~= 30% improvement
        
        Returns:
            JSON string formatted as G-Eval response
        """
        # Generate baseline scores (1-5)
        baseline_accuracy = random.randint(2, 4)
        baseline_completeness = random.randint(2, 4)
        baseline_clarity = random.randint(2, 4)
        baseline_actionability = random.randint(2, 4)
        baseline_relevance = random.randint(2, 4)
        
        # Generate enhanced scores with improvement bias
        def enhanced_score(baseline: int) -> int:
            if random.random() < improvement_bias:
                # Improved score (usually +1, sometimes +2)
                return min(5, baseline + random.randint(1, 2))
            else:
                # Same or slightly worse
                return max(1, baseline + random.randint(-1, 0))
        
        enhanced_accuracy = enhanced_score(baseline_accuracy)
        enhanced_completeness = enhanced_score(baseline_completeness)
        enhanced_clarity = enhanced_score(baseline_clarity)
        enhanced_actionability = enhanced_score(baseline_actionability)
        enhanced_relevance = enhanced_score(baseline_relevance)
        
        # Calculate overall scores
        baseline_overall = (baseline_accuracy + baseline_completeness + baseline_clarity + 
                           baseline_actionability + baseline_relevance) / 5
        enhanced_overall = (enhanced_accuracy + enhanced_completeness + enhanced_clarity + 
                          enhanced_actionability + enhanced_relevance) / 5
        
        # Determine winner
        if enhanced_overall > baseline_overall + 0.3:
            winner = "enhanced"
        elif baseline_overall > enhanced_overall + 0.3:
            winner = "baseline"
        else:
            winner = "tie"
        
        # Create G-Eval response
        response = {
            "accuracy": {
                "score": baseline_accuracy,
                "reasoning": f"Baseline accuracy level: {baseline_accuracy}/5"
            },
            "completeness": {
                "score": baseline_completeness,
                "reasoning": f"Baseline completeness level: {baseline_completeness}/5"
            },
            "clarity": {
                "score": baseline_clarity,
                "reasoning": f"Baseline clarity level: {baseline_clarity}/5"
            },
            "actionability": {
                "score": baseline_actionability,
                "reasoning": f"Baseline actionability level: {baseline_actionability}/5"
            },
            "relevance": {
                "score": baseline_relevance,
                "reasoning": f"Baseline relevance level: {baseline_relevance}/5"
            },
            "overall": {
                "baseline_score": baseline_overall,
                "enhanced_score": enhanced_overall,
                "winner": winner,
                "reasoning": f"Enhanced approach shows {'improvement' if winner == 'enhanced' else 'similar or lower performance'}"
            }
        }
        
        return json.dumps(response)
