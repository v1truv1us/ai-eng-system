"""Write research briefs to the vault's wiki/briefs/ directory."""
from __future__ import annotations

import json
import os
import subprocess
from dataclasses import dataclass
from datetime import date
from pathlib import Path

import anthropic

VAULT_PATH = Path(
    os.environ.get(
        "VAULT_PATH",
        Path.home()
        / "Library/CloudStorage"
        / "ProtonDrive-john.ferguson@unfergettabledesigns.com-folder"
        / "Obsidian",
    )
)


def _call_claude_cli(prompt: str) -> str:
    """Invoke `claude -p` as a subprocess (works with Claude Code subscription)."""
    result = subprocess.run(
        [
            "claude", "-p",
            "--output-format", "json",
            "--model", "claude-opus-4-7",
            "--no-session-persistence",
            "--tools", "",
        ],
        input=prompt,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        raise RuntimeError(f"claude CLI error: {result.stderr.strip()}")
    return json.loads(result.stdout).get("result", "")


def make_anthropic_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if api_key:
        return anthropic.Anthropic(api_key=api_key)
    raise RuntimeError("ANTHROPIC_API_KEY not set.")


def make_async_anthropic_client() -> anthropic.AsyncAnthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if api_key:
        return anthropic.AsyncAnthropic(api_key=api_key)
    raise RuntimeError("ANTHROPIC_API_KEY not set.")


@dataclass
class TemplateResult:
    id: str
    name: str
    text: str


def synthesize(query: str, results: list[TemplateResult]) -> str:
    prompt = (
        f"Research analyses on: '{query}'\n\n"
        + "\n\n".join(f"## {r.id}\n{r.text}" for r in results)
        + "\n\nWrite a 2–3 paragraph unified brief: surface the key insights, "
          "note any gaps or contradictions, and highlight the most actionable findings."
    )
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if api_key:
        resp = anthropic.Anthropic(api_key=api_key).messages.create(
            model="claude-opus-4-7",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text
    return _call_claude_cli(prompt)


def write_brief(
    query: str,
    results: list[TemplateResult],
    variant: str,
    synthesis: str = "",
) -> Path:
    today = date.today().isoformat()
    brief_path = VAULT_PATH / "wiki" / "briefs" / f"{today}.md"

    sections = "\n\n---\n\n".join(
        f"## {r.id} — {r.name}\n\n{r.text}" for r in results
    )
    synthesis_section = (
        f"\n\n---\n\n## Key Takeaways\n\n{synthesis}" if synthesis.strip() else ""
    )

    run_block = (
        f"# Research Brief: {query}\n"
        f"**Date:** {today}  **Runner:** {variant}\n\n"
        f"{sections}{synthesis_section}\n\n"
        "---\n\n"
        "## Limitations\n\n"
        "- Templates run with raw query injection; brackets not pre-filled\n"
        "- FACT/LIKELY tiers are AI-reported, not independently verified\n"
        "- No cross-template verification pass performed\n"
    )

    if brief_path.exists():
        brief_path.write_text(
            brief_path.read_text(encoding="utf-8") + "\n\n---\n\n" + run_block,
            encoding="utf-8",
        )
    else:
        brief_path.write_text(run_block, encoding="utf-8")

    return brief_path
