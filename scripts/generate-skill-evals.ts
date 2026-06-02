#!/usr/bin/env bun
/**
 * Generate evals/evals.json for every skill that doesn't have one.
 * Reads SKILL.md frontmatter + body to create context-aware test cases.
 */

import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { join, basename } from "path";
import { existsSync } from "fs";

const SKILLS_DIR = join(import.meta.dir, "..", "skills");

interface EvalCase {
  id: number;
  name: string;
  prompt: string;
  expected_output: string;
  assertions: string[];
}

interface EvalsJson {
  skill_name: string;
  evals: EvalCase[];
}

function parseFrontmatter(text: string): { name: string; description: string; body: string } {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { name: "", description: "", body: text };
  const fm = match[1];
  const body = match[2];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*[">]?\s*(.+?)(?:\n|$)/m);
  return {
    name: nameMatch?.[1]?.trim() || "",
    description: descMatch?.[1]?.trim() || "",
    body,
  };
}

function extractKeySections(body: string): string[] {
  const sections: string[] = [];
  const matches = body.matchAll(/^(#{1,3})\s+(.+)$/gm);
  for (const m of matches) {
    sections.push(m[2].trim().toLowerCase());
  }
  return sections;
}

function generateEvals(skillName: string, description: string, sections: string[]): EvalsJson {
  const evals: EvalCase[] = [];
  const hasWhenToUse = sections.some(s => s.includes("when to use") || s.includes("when"));
  const hasProcess = sections.some(s => s.includes("process") || s.includes("workflow"));
  const hasRules = sections.some(s => s.includes("rule") || s.includes("constraint"));
  const hasExample = sections.some(s => s.includes("example"));

  // Eval 1: Basic invocation
  evals.push({
    id: 1,
    name: "basic-invocation",
    prompt: `Apply the ${skillName} skill to the following task: implement a user authentication feature with JWT tokens in a Node.js Express app.`,
    expected_output: `Output that follows the ${skillName} skill's guidance, including its key sections and recommendations.`,
    assertions: [
      `The output references or follows ${skillName} guidance`,
      hasProcess ? "The output follows a structured process or workflow" : "The output provides actionable guidance",
      hasRules ? "The output respects the skill's stated rules or constraints" : "The output is specific, not generic",
    ],
  });

  // Eval 2: Edge case / ambiguous input
  evals.push({
    id: 2,
    name: "ambiguous-input",
    prompt: `The codebase is messy and needs cleanup. Apply the ${skillName} skill.`,
    expected_output: "The skill handles vague input by either asking clarifying questions or providing bounded guidance.",
    assertions: [
      "The output does not hallucinate specific technologies not mentioned",
      hasWhenToUse ? "The output is scoped to the skill's intended use case" : "The output is relevant to the skill domain",
      "The output is actionable rather than purely descriptive",
    ],
  });

  // Eval 3: Complex scenario (if skill has examples or advanced sections)
  if (hasExample || sections.length > 5) {
    evals.push({
      id: 3,
      name: "complex-scenario",
      prompt: `A large enterprise team needs to adopt the practices from the ${skillName} skill across 5 microservices with different tech stacks. How should they apply it?`,
      expected_output: "The skill scales its guidance to a multi-team, multi-service context without losing specificity.",
      assertions: [
        "The output addresses complexity without being vague",
        "The output provides concrete next steps",
        sections.some(s => s.includes("scale") || s.includes("team")) ? "The output includes team or scaling guidance" : "The output acknowledges tradeoffs",
      ],
    });
  }

  return { skill_name: skillName, evals };
}

async function main(): Promise<void> {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory() && e.name !== "AGENTS.md");

  let created = 0;
  let skipped = 0;

  for (const dir of skillDirs) {
    const skillPath = join(SKILLS_DIR, dir.name);
    const skillMdPath = join(skillPath, "SKILL.md");
    const evalsDir = join(skillPath, "evals");
    const evalsPath = join(evalsDir, "evals.json");

    if (!existsSync(skillMdPath)) continue;
    if (existsSync(evalsPath)) {
      skipped++;
      continue;
    }

    const content = await readFile(skillMdPath, "utf-8");
    const { name, description, body } = parseFrontmatter(content);
    const sections = extractKeySections(body);
    const evals = generateEvals(name || dir.name, description, sections);

    await mkdir(evalsDir, { recursive: true });
    await writeFile(evalsPath, JSON.stringify(evals, null, 2) + "\n");
    created++;
  }

  console.log(`Created ${created} eval files, skipped ${skipped} (already exist)`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
