#!/usr/bin/env bun
/**
 * Generate evals/evals.json for every command in content/commands/.
 * Reads the command markdown, extracts frontmatter + body sections,
 * and produces context-aware eval cases.
 */

import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import { existsSync } from "fs";

interface EvalCase {
  id: number;
  name: string;
  prompt: string;
  expected_output: string;
  assertions: string[];
}

interface EvalFile {
  command_name: string;
  evals: EvalCase[];
}

function generateEvals(commandName: string, frontmatter: Record<string, any>, body: string): EvalFile {
  const hasAgent = frontmatter.agent || frontmatter.mode;
  const hasSubtask = frontmatter.subtask === true;
  const bodySections = body.match(/^##\s+.+$/gm) || [];

  const evals: EvalCase[] = [];

  // Eval 1: Basic invocation
  evals.push({
    id: 1,
    name: "basic-invocation",
    prompt: `Run the /${commandName} command`,
    expected_output: `Output that follows the ${commandName} command's instructions, including its agent routing and process steps.`,
    assertions: [
      `The output contains the command's process or workflow steps`,
      `The output is actionable, not purely descriptive`,
      `The output routes to the correct agent or skill if specified`,
    ],
  });

  // Eval 2: Frontmatter compliance
  if (hasAgent) {
    evals.push({
      id: 2,
      name: "agent-routing",
      prompt: `What agent does /${commandName} route to?`,
      expected_output: `The correct agent name and mode from the command frontmatter.`,
      assertions: [
        `The output mentions agent "${frontmatter.agent || frontmatter.mode}"`,
        `The output describes the agent's role`,
      ],
    });
  }

  // Eval 3: Body structure
  if (bodySections.length > 0) {
    evals.push({
      id: 3,
      name: "body-structure",
      prompt: `Describe the structure of the /${commandName} command`,
      expected_output: `A summary of the command's sections and their purposes.`,
      assertions: bodySections.slice(0, 3).map(s =>
        `The output mentions section "${s.replace(/^##\s+/, '')}"`
      ),
    });
  }

  // Eval 4: Subtask behavior
  if (hasSubtask) {
    evals.push({
      id: 4,
      name: "subtask-behavior",
      prompt: `Is /${commandName} a subtask command?`,
      expected_output: `Confirmation that the command is designed as a subtask with appropriate behavior.`,
      assertions: [
        `The output confirms the command is a subtask`,
        `The output explains subtask-specific behavior`,
      ],
    });
  }

  return {
    command_name: commandName,
    evals,
  };
}

async function main(): Promise<void> {
  const commandsDir = join(import.meta.dir, "..", "content", "commands");
  const entries = await readdir(commandsDir, { withFileTypes: true });
  const commandFiles = entries.filter(e => e.isFile() && e.name.endsWith(".md"));

  let generated = 0;
  let skipped = 0;

  for (const file of commandFiles) {
    const commandName = basename(file.name, ".md");
    const commandPath = join(commandsDir, file.name);
    const content = await readFile(commandPath, "utf-8");

    // Parse frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    const frontmatter: Record<string, any> = {};
    if (fmMatch) {
      const lines = fmMatch[1].split("\n");
      for (const line of lines) {
        const [key, ...rest] = line.split(":");
        if (key && rest.length > 0) {
          frontmatter[key.trim()] = rest.join(":").trim();
        }
      }
    }

    const body = content.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

    const evalsDir = join(commandsDir, "..", "..", "evals", "commands", commandName);
    const evalsPath = join(evalsDir, "evals.json");

    if (existsSync(evalsPath)) {
      skipped++;
      continue;
    }

    const evals = generateEvals(commandName, frontmatter, body);

    await mkdir(evalsDir, { recursive: true });
    await writeFile(evalsPath, JSON.stringify(evals, null, 2) + "\n");
    generated++;
  }

  console.log(`Command evals: ${generated} generated, ${skipped} skipped`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
