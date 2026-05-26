#!/usr/bin/env python3
"""OpenAI Agents SDK research runner (codex variant).

Runs all 9 query templates in parallel against a single research question,
then writes a brief to the vault's wiki/briefs/ directory.

Usage:
    python runner.py "your research question"
    python runner.py --templates A1,M1 "targeted question"
    OPENAI_API_KEY=sk-... python runner.py "question"

Requires OPENAI_API_KEY in environment or .env file.
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Allow importing from ../shared without installing as a package
sys.path.insert(0, str(Path(__file__).parent.parent / "shared"))

from agents import Agent, Runner
from dotenv import load_dotenv
from output import TemplateResult, synthesize, write_brief
from templates import QueryTemplate, ResearchData, load_templates

load_dotenv()

MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o")


async def run_template(
    system_prompt: str,
    template: QueryTemplate,
    query: str,
) -> TemplateResult:
    """Run one query template through the OpenAI Agents SDK."""
    agent = Agent(
        name=f"ResearchRunner-{template.id}",
        instructions=system_prompt,
        model=MODEL,
    )
    prompt = f"{template.text}\n\nQuery context: {query}"
    result = await Runner.run(agent, prompt)
    text = result.final_output or "(no text response)"
    return TemplateResult(id=template.id, name=template.name, text=text)


async def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run research templates in parallel via OpenAI Agents SDK"
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

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        print(
            "Error: OPENAI_API_KEY is not set. Add it to codex/.env or export it in your shell.",
            file=sys.stderr,
        )
        sys.exit(1)

    data: ResearchData = load_templates()

    if args.templates:
        filter_ids = {t.strip() for t in args.templates.split(",")}
        templates = [t for t in data.templates if t.id in filter_ids]
        if not templates:
            print(f"No templates matched: {args.templates}", file=sys.stderr)
            sys.exit(1)
    else:
        templates = data.templates

    print(
        f"Running {len(templates)} template(s) in parallel via OpenAI Agents SDK ({MODEL})…",
        file=sys.stderr,
    )

    tasks = [run_template(data.system_prompt, t, query) for t in templates]
    results: list[TemplateResult] = list(await asyncio.gather(*tasks))

    synthesis = synthesize(query, results)
    brief_path = write_brief(query, results, variant="codex", synthesis=synthesis)

    print(f"Brief written to: {brief_path}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
