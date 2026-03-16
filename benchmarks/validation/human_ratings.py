"""
Human Ratings Collection System for Meta-Validation
Collects and manages human gold standard ratings for LLM evaluation validation.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import random


class HumanRatingsCollector:
    """Collects and manages human ratings for meta-validation."""

    def __init__(
        self, tasks_dir: str = "../tasks", output_file: str = "gold_standard.json"
    ):
        self.tasks_dir = Path(tasks_dir)
        self.output_file = Path(output_file)
        self.output_file.parent.mkdir(parents=True, exist_ok=True)

    def select_gold_standard_tasks(self, num_tasks: int = 10) -> List[Dict[str, Any]]:
        """Select diverse tasks for gold standard creation."""
        all_tasks = []

        # Load all tasks
        for category_dir in self.tasks_dir.iterdir():
            if category_dir.is_dir():
                for task_file in category_dir.glob("*.json"):
                    try:
                        with open(task_file, "r") as f:
                            task = json.load(f)
                            task["file_path"] = str(task_file)
                            all_tasks.append(task)
                    except Exception as e:
                        print(f"Error loading {task_file}: {e}")

        # Select diverse tasks across categories
        selected_tasks = []
        categories = ["code-review", "architecture", "hard-problems", "creative"]

        # Ensure representation from each category
        for category in categories:
            category_tasks = [t for t in all_tasks if t.get("category") == category]
            if category_tasks:
                # Select 2-3 tasks per category, preferring medium difficulty
                medium_tasks = [
                    t for t in category_tasks if t.get("difficulty") == "medium"
                ]
                if len(medium_tasks) >= 2:
                    selected = random.sample(medium_tasks, 2)
                else:
                    selected = random.sample(
                        category_tasks, min(2, len(category_tasks))
                    )
                selected_tasks.extend(selected)

        # Fill remaining slots with random selection
        remaining_slots = num_tasks - len(selected_tasks)
        if remaining_slots > 0:
            unselected = [t for t in all_tasks if t not in selected_tasks]
            if unselected:
                additional = random.sample(
                    unselected, min(remaining_slots, len(unselected))
                )
                selected_tasks.extend(additional)

        # Limit to requested number
        selected_tasks = selected_tasks[:num_tasks]

        print(f"Selected {len(selected_tasks)} diverse tasks for gold standard:")
        for task in selected_tasks:
            print(f"  - {task['id']}: {task['title']} ({task['category']})")

        return selected_tasks

    def create_rating_template(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Create a rating template for a task."""
        return {
            "task_id": task["id"],
            "task_title": task["title"],
            "task_category": task["category"],
            "task_description": task["task"],
            "ratings": {
                "accuracy": {"score": None, "reasoning": "", "confidence": None},
                "completeness": {"score": None, "reasoning": "", "confidence": None},
                "clarity": {"score": None, "reasoning": "", "confidence": None},
                "actionability": {"score": None, "reasoning": "", "confidence": None},
                "relevance": {"score": None, "reasoning": "", "confidence": None},
            },
            "overall_assessment": {
                "baseline_wins": None,
                "enhanced_wins": None,
                "tie": None,
                "confidence": None,
                "rationale": "",
            },
            "rater_info": {
                "rater_id": "",
                "experience_level": "",  # "beginner", "intermediate", "expert"
                "timestamp": datetime.now().isoformat(),
            },
        }

    def generate_simulated_ratings(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate simulated human ratings for demonstration purposes."""
        gold_standard = {
            "metadata": {
                "created": datetime.now().isoformat(),
                "description": "Simulated gold standard ratings for meta-validation demonstration",
                "num_tasks": len(tasks),
                "rating_scale": "1-5 (1=Very Poor, 5=Excellent)",
                "raters": ["simulated_expert", "simulated_intermediate"],
            },
            "tasks": {},
            "ratings": {},
        }

        # Simulate ratings for each task
        for task in tasks:
            task_id = task["id"]
            gold_standard["tasks"][task_id] = {
                "title": task["title"],
                "category": task["category"],
                "difficulty": task.get("difficulty", "medium"),
            }

            # Simulate expert rater ratings
            expert_ratings = self._simulate_expert_ratings(task)
            gold_standard["ratings"][f"{task_id}_expert"] = expert_ratings

            # Simulate intermediate rater ratings
            intermediate_ratings = self._simulate_intermediate_ratings(
                task, expert_ratings
            )
            gold_standard["ratings"][f"{task_id}_intermediate"] = intermediate_ratings

        return gold_standard

    def _simulate_expert_ratings(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate expert-level ratings with high consistency."""
        category = task.get("category", "unknown")
        difficulty = task.get("difficulty", "medium")

        # Base scores vary by category and difficulty
        base_scores = {
            "code-review": {
                "accuracy": 4.5,
                "completeness": 4.2,
                "clarity": 4.8,
                "actionability": 4.3,
                "relevance": 4.7,
            },
            "architecture": {
                "accuracy": 4.3,
                "completeness": 4.5,
                "clarity": 4.2,
                "actionability": 4.4,
                "relevance": 4.6,
            },
            "hard-problems": {
                "accuracy": 4.0,
                "completeness": 4.1,
                "clarity": 3.8,
                "actionability": 4.2,
                "relevance": 4.4,
            },
            "creative": {
                "accuracy": 4.2,
                "completeness": 4.3,
                "clarity": 4.4,
                "actionability": 4.1,
                "relevance": 4.5,
            },
        }

        scores = base_scores.get(category, base_scores["code-review"])

        # Add realistic variation
        ratings = {}
        for dimension, base_score in scores.items():
            # Add small random variation (±0.3)
            variation = random.uniform(-0.3, 0.3)
            score = max(1, min(5, base_score + variation))
            ratings[dimension] = {
                "score": round(score, 1),
                "reasoning": f"Expert analysis of {dimension} for {category} task",
                "confidence": 0.9,
            }

        # Overall assessment - enhanced typically wins for expert persona tasks
        if "expert-persona" in task.get("validates_techniques", []):
            ratings["overall"] = {
                "baseline_score": 3.8,
                "enhanced_score": 4.4,
                "winner": "enhanced",
                "confidence": 0.85,
                "rationale": "Enhanced response shows expert-level analysis and domain knowledge",
            }
        else:
            ratings["overall"] = {
                "baseline_score": 3.5,
                "enhanced_score": 4.1,
                "winner": "enhanced",
                "confidence": 0.8,
                "rationale": "Enhanced response provides more comprehensive analysis",
            }

        ratings["rater_info"] = {
            "rater_id": "simulated_expert",
            "experience_level": "expert",
            "timestamp": datetime.now().isoformat(),
        }

        return ratings

    def _simulate_intermediate_ratings(
        self, task: Dict[str, Any], expert_ratings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Simulate intermediate-level ratings with some correlation to expert ratings."""
        # Start with expert ratings and add variation
        ratings = {}

        for dimension in [
            "accuracy",
            "completeness",
            "clarity",
            "actionability",
            "relevance",
        ]:
            expert_score = expert_ratings[dimension]["score"]
            # Intermediate raters have more variation (±0.5)
            variation = random.uniform(-0.5, 0.5)
            score = max(1, min(5, expert_score + variation))
            ratings[dimension] = {
                "score": round(score, 1),
                "reasoning": f"Intermediate analysis of {dimension}",
                "confidence": 0.7,
            }

        # Overall assessment with some agreement but less confidence
        expert_overall = expert_ratings["overall"]
        ratings["overall"] = {
            "baseline_score": max(
                1, min(5, expert_overall["baseline_score"] + random.uniform(-0.3, 0.3))
            ),
            "enhanced_score": max(
                1, min(5, expert_overall["enhanced_score"] + random.uniform(-0.3, 0.3))
            ),
            "winner": expert_overall["winner"],  # Same winner but different scores
            "confidence": 0.6,
            "rationale": "Enhanced response appears more comprehensive",
        }

        ratings["rater_info"] = {
            "rater_id": "simulated_intermediate",
            "experience_level": "intermediate",
            "timestamp": datetime.now().isoformat(),
        }

        return ratings

    def save_gold_standard(self, gold_standard: Dict[str, Any]):
        """Save the gold standard to file."""
        with open(self.output_file, "w") as f:
            json.dump(gold_standard, f, indent=2, default=str)
        print(f"Gold standard saved to {self.output_file}")

    def load_gold_standard(self) -> Optional[Dict[str, Any]]:
        """Load existing gold standard if it exists."""
        if self.output_file.exists():
            try:
                with open(self.output_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading gold standard: {e}")
        return None


def main():
    """Main function to create gold standard dataset."""
    collector = HumanRatingsCollector()

    # Select diverse tasks
    tasks = collector.select_gold_standard_tasks(10)

    # Generate simulated ratings
    gold_standard = collector.generate_simulated_ratings(tasks)

    # Save to file
    collector.save_gold_standard(gold_standard)


def main():
    """Main function to create gold standard dataset."""
    collector = HumanRatingsCollector()

    # Select diverse tasks
    tasks = collector.select_gold_standard_tasks(10)

    # Generate simulated ratings
    gold_standard = collector.generate_simulated_ratings(tasks)

    # Save to file
    collector.save_gold_standard(gold_standard)

    print(
        f"\nGold standard created with {len(gold_standard['ratings'])} ratings across {len(tasks)} tasks"
    )
    print("Categories represented:", set(task["category"] for task in tasks))


if __name__ == "__main__":
    main()
