#!/usr/bin/env python3
"""Anthropic asyncio research runner.

Runs all 9 query templates in parallel against a single research question,
then writes a brief to the vault's wiki/briefs/ directory.

Usage:
    python runner.py "your research question"
    python runner.py --templates A1,M1 "targeted question"
    ANTHROPIC_API_KEY=sk-... python runner.py "question"

When ANTHROPIC_API_KEY is not set, falls back to `claude -p` subprocess
(works with a Claude Code subscription — no separate API key needed).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

# Allow importing from ../shared without installing as a package
sys.path.insert(0, str(Path(__file__).parent.parent / "shared"))

import anthropic
from dotenv import load_dotenv
from output import TemplateResult, make_async_anthropic_client, synthesize, write_brief
from templates import QueryTemplate, ResearchData, load_templates

load_dotenv()


async def run_template(
    client: anthropic.AsyncAnthropic,
    system_prompt: str,
    template: QueryTemplate,
    query: str,
) -> TemplateResult:
    """Send one template + query to Claude via SDK (requires ANTHROPIC_API_KEY)."""
    response = await client.messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        # Cache the system prompt — identical across all 9 parallel calls,
        # so calls 2-9 hit the prompt cache at ~10% of full token cost.
        system=[
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"{template.text}\n\nQuery context: {query}",
            }
        ],
    )
    text = next(
        (block.text for block in response.content if block.type == "text"),
        "(no text response)",
    )
    return TemplateResult(id=template.id, name=template.name, text=text)


async def run_template_cli(
    system_prompt: str,
    template: QueryTemplate,
    query: str,
) -> TemplateResult:
    """Subprocess fallback: uses `claude -p` (works with Claude Code subscription)."""
    full_prompt = f"{system_prompt}\n\n{template.text}\n\nQuery context: {query}"

    def _run() -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                "claude", "-p",
                "--output-format", "json",
                "--model", "claude-opus-4-7",
                "--no-session-persistence",
                "--tools", "",
            ],
            input=full_prompt,
            capture_output=True,
            text=True,
            timeout=120,
        )

    result = await asyncio.to_thread(_run)
    if result.returncode != 0:
        raise RuntimeError(
            f"claude CLI error for {template.id}: {result.stderr.strip()}"
        )
    text = json.loads(result.stdout).get("result", "(no text response)")
    return TemplateResult(id=template.id, name=template.name, text=text)


async def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run research templates in parallel via Anthropic API or claude CLI"
    )
    parser.add_argument("query", nargs="+", help="Research question")
    parser.add_argument(
        "--templates",
        default="",
        metavar="IDs",
        help="Comma-separated template IDs to run (default: all). E.g. --templates A1,M2",
    )
    args = parser.parse_args()
    query = " ".join(args.query)

    data: ResearchData = load_templates()

    if args.templates:
        filter_ids = {t.strip() for t in args.templates.split(",")}
        templates = [t for t in data.templates if t.id in filter_ids]
        if not templates:
            print(f"No templates matched: {args.templates}", file=sys.stderr)
            sys.exit(1)
    else:
        templates = data.templates

    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()

    if api_key:
        print(f"Running {len(templates)} template(s) via SDK…", file=sys.stderr)
        client = make_async_anthropic_client()
        tasks = [run_template(client, data.system_prompt, t, query) for t in templates]
    else:
        print(
            f"No ANTHROPIC_API_KEY — running {len(templates)} template(s) via claude CLI…",
            file=sys.stderr,
        )
        tasks = [run_template_cli(data.system_prompt, t, query) for t in templates]

    results: list[TemplateResult] = list(await asyncio.gather(*tasks))

    synthesis = synthesize(query, results)
    brief_path = write_brief(query, results, variant="anthropic", synthesis=synthesis)

    print(f"Brief written to: {brief_path}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
