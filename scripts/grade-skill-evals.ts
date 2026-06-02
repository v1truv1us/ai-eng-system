#!/usr/bin/env bun
/**
 * Grade skill eval outputs against assertions.
 * Usage: bun scripts/grade-skill-evals.ts --skill=create-goal --output=path/to/output.md
 * Or:    bun scripts/grade-skill-evals.ts --all --workspace=eval-workspace/
 */

import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import { existsSync } from "fs";

interface AssertionResult {
  text: string;
  passed: boolean;
  evidence: string;
}

interface EvalResult {
  id: number;
  name: string;
  prompt: string;
  results: AssertionResult[];
  summary: { passed: number; failed: number; total: number; pass_rate: number };
}

interface SkillResult {
  skill_name: string;
  evals: EvalResult[];
  aggregate: { passed: number; failed: number; total: number; pass_rate: number };
}

function parseArgs(): { skill?: string; output?: string; all?: boolean; workspace?: string } {
  const args: Record<string, string> = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith("--")) {
      const [key, val] = arg.slice(2).split("=");
      args[key] = val || "true";
    }
  }
  return {
    skill: args.skill,
    output: args.output,
    all: args.all === "true",
    workspace: args.workspace || "eval-workspace",
  };
}

async function gradeAssertion(assertion: string, outputText: string): Promise<AssertionResult> {
  // Simple keyword-based grading for now
  const lowerOutput = outputText.toLowerCase();
  const lowerAssertion = assertion.toLowerCase();

  // Extract key phrases from assertion (nouns, verbs, specific terms)
  const keywords = lowerAssertion
    .replace(/^(the output |output |it )/i, "")
 .replace(/[\"'\[\]\(\)\{\}]/g, "")
 .split(/\s+/)
 .filter(w => w.length > 3 && !["contains", "includes", "should", "must", "have", "with", "that", "this", "does", "not", "and", "the", "for", "from", "than"].includes(w));

  // Check for negation
  const hasNegation = lowerAssertion.includes("does not") || lowerAssertion.includes("not ") || lowerAssertion.includes("no ");
  const matches = keywords.filter(k => lowerOutput.includes(k)).length;
  const threshold = Math.max(1, Math.floor(keywords.length * 0.5));

  if (hasNegation) {
    // For negation assertions, PASS if keywords are NOT found
    const passed = matches === 0;
    return {
      text: assertion,
      passed,
      evidence: passed
        ? `None of the restricted keywords (${keywords.slice(0, 5).join(", ")}) found in output`
        : `Found ${matches} restricted keywords in output`,
    };
  }

  const passed = matches >= threshold;
  return {
    text: assertion,
    passed,
    evidence: passed
      ? `Found ${matches}/${keywords.length} relevant keywords: ${keywords.filter(k => lowerOutput.includes(k)).slice(0, 5).join(", ")}`
      : `Only found ${matches}/${keywords.length} keywords in output`,
  };
}

async function gradeSkill(skillName: string, outputDir: string): Promise<SkillResult | null> {
  const skillDir = join(import.meta.dir, "..", "skills", skillName);
  const evalsPath = join(skillDir, "evals", "evals.json");

  if (!existsSync(evalsPath)) {
    console.warn(`No evals found for skill: ${skillName}`);
    return null;
  }

  const evalsJson = JSON.parse(await readFile(evalsPath, "utf-8"));
  const results: EvalResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const evalCase of evalsJson.evals) {
    const outputFile = join(outputDir, `eval-${evalCase.name}`, "output.md");
    let outputText = "";

    if (existsSync(outputFile)) {
      outputText = await readFile(outputFile, "utf-8");
    } else {
      console.warn(`  No output file for eval ${evalCase.name}: ${outputFile}`);
    }

    const assertionResults: AssertionResult[] = [];
    let passed = 0;
    let failed = 0;

    for (const assertion of evalCase.assertions || []) {
      const result = await gradeAssertion(assertion, outputText);
      assertionResults.push(result);
      if (result.passed) passed++; else failed++;
    }

    totalPassed += passed;
    totalFailed += failed;

    results.push({
      id: evalCase.id,
      name: evalCase.name,
      prompt: evalCase.prompt,
      results: assertionResults,
      summary: { passed, failed, total: passed + failed, pass_rate: (passed / (passed + failed)) || 0 },
    });
  }

  const total = totalPassed + totalFailed;
  return {
    skill_name: skillName,
    evals: results,
    aggregate: {
      passed: totalPassed,
      failed: totalFailed,
      total,
      pass_rate: total > 0 ? totalPassed / total : 0,
    },
  };
}

async function gradeAll(workspace: string): Promise<void> {
  const skillsDir = join(import.meta.dir, "..", "skills");
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory() && e.name !== "AGENTS.md");

  const allResults: SkillResult[] = [];

  for (const dir of skillDirs) {
    const result = await gradeSkill(dir.name, workspace);
    if (result) allResults.push(result);
  }

  // Write benchmark
  const benchmark = {
    run_summary: {
      total_skills: allResults.length,
      total_assertions: allResults.reduce((s, r) => s + r.aggregate.total, 0),
      overall_pass_rate: allResults.reduce((s, r) => s + r.aggregate.passed, 0) /
        Math.max(1, allResults.reduce((s, r) => s + r.aggregate.total, 0)),
      skills: allResults.map(r => ({
        name: r.skill_name,
        pass_rate: r.aggregate.pass_rate,
        passed: r.aggregate.passed,
        failed: r.aggregate.failed,
      })),
    },
  };

  await mkdir(workspace, { recursive: true });
  await writeFile(join(workspace, "benchmark.json"), JSON.stringify(benchmark, null, 2) + "\n");

  // Write detailed results
  await writeFile(
    join(workspace, "grading-results.json"),
    JSON.stringify(allResults, null, 2) + "\n",
  );

  console.log(`\n=== BENCHMARK ===`);
  console.log(`Skills evaluated: ${benchmark.run_summary.total_skills}`);
  console.log(`Total assertions: ${benchmark.run_summary.total_assertions}`);
  console.log(`Overall pass rate: ${(benchmark.run_summary.overall_pass_rate * 100).toFixed(1)}%`);
  console.log(`\nPer-skill breakdown:`);
  for (const s of benchmark.run_summary.skills) {
    const status = s.pass_rate >= 0.8 ? "✅" : s.pass_rate >= 0.5 ? "⚠️" : "❌";
    console.log(`  ${status} ${s.name}: ${s.passed}/${s.passed + s.failed} (${(s.pass_rate * 100).toFixed(0)}%)`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.all) {
    await gradeAll(args.workspace!);
  } else if (args.skill && args.output) {
    const result = await gradeSkill(args.skill, basename(args.output));
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log(`Usage:
  bun scripts/grade-skill-evals.ts --skill=NAME --output=path/to/output.md
  bun scripts/grade-skill-evals.ts --all --workspace=eval-workspace/
`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
