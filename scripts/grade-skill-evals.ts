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

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .replace(/`/g, "")
    .replace(/#{1,6}\s/g, "")
    .toLowerCase();
}

async function gradeAssertion(assertion: string, outputText: string): Promise<AssertionResult> {
  const rawOutput = outputText.toLowerCase();
  const cleanOutput = stripMarkdown(outputText);
  const lowerAssertion = assertion.toLowerCase();

  // Detect negation
  const hasNegation = /\b(does not|doesn't|must not|should not|no|never|without)\b/i.test(assertion);

  // Extract exact quoted strings
  const quotedStrings: string[] = [];
  const quoteMatches = assertion.matchAll(/"([^"]+)"/g);
  for (const m of quoteMatches) {
    const cleanQuote = stripMarkdown(m[1]);
    quotedStrings.push(cleanQuote);
    // Also try raw match for things like "- [ ]"
    if (m[1].includes("[")) quotedStrings.push(m[1].toLowerCase());
  }

  // Pattern: contains a section titled 'X'
  const sectionMatch = lowerAssertion.match(/section titled ['"]([^'"]+)['"]/);
  if (sectionMatch) {
    const sectionName = stripMarkdown(sectionMatch[1]);
    const found = cleanOutput.includes(sectionName) || rawOutput.includes("## " + sectionName);
    if (hasNegation) {
      return { text: assertion, passed: !found, evidence: found ? `Found section ${sectionName}` : `Section ${sectionName} not found` };
    }
    return { text: assertion, passed: found, evidence: found ? `Found section "${sectionName}"` : `Section "${sectionName}" not found` };
  }

  // Pattern: contains '**X:**' or '**X**'
  const boldMatch = lowerAssertion.match(/\*\*([^*]+)\*\*/);
  if (boldMatch) {
    const boldText = stripMarkdown(boldMatch[1]);
    const found = cleanOutput.includes(boldText);
    if (hasNegation) {
      return { text: assertion, passed: !found, evidence: found ? `Found ${boldText}` : `${boldText} not found` };
    }
    return { text: assertion, passed: found, evidence: found ? `Found "${boldText}"` : `"${boldText}" not found` };
  }

  // Pattern: at least N occurrences of X
  const countMatch = lowerAssertion.match(/at least (\d+) .*?(?:checkbox|- \[ \]|item)/i);
  if (countMatch) {
    const minCount = parseInt(countMatch[1], 10);
    const checkboxPattern = /- \[ \]/g;
    const count = (outputText.match(checkboxPattern) || []).length;
    const found = count >= minCount;
    return { text: assertion, passed: found, evidence: `Found ${count} checkboxes (need ${minCount})` };
  }

  // Pattern: does not contain / does not use
  if (hasNegation) {
    // Check quoted strings first
    const forbiddenFound = quotedStrings.filter(q => cleanOutput.includes(q));
    if (quotedStrings.length > 0) {
      const passed = forbiddenFound.length === 0;
      return {
        text: assertion,
        passed,
        evidence: passed ? `None of the forbidden phrases found` : `Found forbidden phrases: ${forbiddenFound.slice(0, 3).join(", ")}`,
      };
    }

    // Extract key noun from the assertion
    const words = lowerAssertion
      .replace(/\b(does not|doesn't|must not|should not|no|never|without|contain|include|have|use|assume|the|output|it|is|are|be|being|been|a|an|and|or|but|with|for|from|than|this|that|these|those|word|words)\b/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3);

    const found = words.filter(w => cleanOutput.includes(w));
    const passed = found.length === 0;
    return {
      text: assertion,
      passed,
      evidence: passed ? `Forbidden concepts not found` : `Found: ${found.slice(0, 5).join(", ")}`,
    };
  }

  // Positive assertions: check quoted strings, then keywords
  if (quotedStrings.length > 0) {
    const found = quotedStrings.filter(q => cleanOutput.includes(q));
    const passed = found.length >= Math.max(1, Math.floor(quotedStrings.length * 0.5));
    return {
      text: assertion,
      passed,
      evidence: passed ? `Matched ${found.length}/${quotedStrings.length} quoted phrases` : `Only matched ${found.length}/${quotedStrings.length}`,
    };
  }

  // Fallback: keyword matching
  const keywords = lowerAssertion
    .replace(/[\"'\[\]\(\)\{\}]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 4 && !["contains", "includes", "should", "must", "have", "with", "that", "this", "does", "not", "and", "the", "for", "from", "than", "output", "followed", "there"].includes(w));

  const matches = keywords.filter(k => cleanOutput.includes(k)).length;
  const threshold = Math.max(1, Math.floor(keywords.length * 0.4));
  const passed = matches >= threshold;

  return {
    text: assertion,
    passed,
    evidence: passed ? `Found ${matches}/${keywords.length} keywords` : `Only found ${matches}/${keywords.length} keywords`,
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
