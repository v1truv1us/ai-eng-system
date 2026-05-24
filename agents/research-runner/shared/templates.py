"""Load the 9 query templates and system prompt from the vault's research-runner.md."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

VAULT_PATH = Path(
    os.environ.get(
        "VAULT_PATH",
        Path.home()
        / "Library/CloudStorage"
        / "ProtonDrive-john.ferguson@unfergettabledesigns.com-folder"
        / "Obsidian",
    )
)

RUNNER_MD = VAULT_PATH / "wiki" / "research-runner.md"


@dataclass
class QueryTemplate:
    id: str
    name: str
    text: str


@dataclass
class ResearchData:
    system_prompt: str
    templates: list[QueryTemplate]


def load_templates() -> ResearchData:
    try:
        content = RUNNER_MD.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Cannot read research-runner.md at {RUNNER_MD}. "
            "Set VAULT_PATH env var if your vault is elsewhere."
        ) from None

    m = re.search(r"## SYSTEM PROMPT[^\n]*\n+```\n([\s\S]+?)\n```", content)
    if not m:
        raise ValueError("Could not parse system prompt from research-runner.md")
    system_prompt = m.group(1).strip()

    # Each template: ### A1 — Name\n\n```\n...template text...\n```
    pattern = re.compile(r"### ([A-Z]\d) — ([^\n]+)\n\n```\n([\s\S]+?)\n```")
    templates = [
        QueryTemplate(id=m.group(1), name=m.group(2).strip(), text=m.group(3).strip())
        for m in pattern.finditer(content)
    ]

    if not templates:
        raise ValueError("No templates found in research-runner.md — check the file format.")

    return ResearchData(system_prompt=system_prompt, templates=templates)
