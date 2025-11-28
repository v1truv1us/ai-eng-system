/**
 * Ferg Engineering System - OpenCode Plugin
 *
 * Provides hooks and tools for compounding engineering workflows:
 * - Planning and research
 * - Multi-agent code review
 * - SEO audits
 * - Deployment workflows
 */

import type { Plugin, PluginContext } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";

interface VerificationResult {
  commands: { found: string[]; missing: string[] };
  agents: { found: string[]; missing: string[] };
  skills: { found: string[]; missing: string[] };
  isSetup: boolean;
}

/**
 * Verify that all required commands, agents, and skills are available.
 * Checks both project-local (.opencode/) and global (~/.config/opencode/) locations.
 */
async function verifySetup(context: PluginContext): Promise<VerificationResult> {
  const projectDir = context.directory || process.cwd();
  const globalDir = path.join(process.env.HOME || "~", ".config/opencode");

  const result: VerificationResult = {
    commands: { found: [], missing: [] },
    agents: { found: [], missing: [] },
    skills: { found: [], missing: [] },
    isSetup: true,
  };

  // Expected items
  const expectedCommands = ["plan.md", "review.md", "seo.md", "deploy.md"];
  const expectedAgents = [
    "frontend-reviewer.md",
    "seo-specialist.md",
    "architect-advisor.md",
  ];
  const expectedSkills = ["coolify-deploy", "git-worktree"];

  // Check commands in project-local first, then global
  for (const cmd of expectedCommands) {
    const projectPath = path.join(projectDir, ".opencode/command", cmd);
    const globalPath = path.join(globalDir, "command", cmd);

    if (fs.existsSync(projectPath) || fs.existsSync(globalPath)) {
      result.commands.found.push(cmd);
    } else {
      result.commands.missing.push(cmd);
      result.isSetup = false;
    }
  }

  // Check agents in project-local first, then global
  for (const agent of expectedAgents) {
    const projectPath = path.join(projectDir, ".opencode/agent", agent);
    const globalPath = path.join(globalDir, "agent", agent);

    if (fs.existsSync(projectPath) || fs.existsSync(globalPath)) {
      result.agents.found.push(agent);
    } else {
      result.agents.missing.push(agent);
      result.isSetup = false;
    }
  }

  // Check skills
  for (const skill of expectedSkills) {
    const projectPath = path.join(
      projectDir,
      "skills/devops",
      skill,
      "SKILL.md"
    );
    const globalPath = path.join(globalDir, "skills/devops", skill, "SKILL.md");

    if (fs.existsSync(projectPath) || fs.existsSync(globalPath)) {
      result.skills.found.push(skill);
    } else {
      result.skills.missing.push(skill);
      result.isSetup = false;
    }
  }

  return result;
}

/**
 * Format verification results for logging
 */
function formatVerificationReport(result: VerificationResult): string[] {
  const lines: string[] = [];

  if (result.isSetup) {
    lines.push(
      "[ferg-engineering] ✓ All components verified and ready to use"
    );
  } else {
    lines.push("[ferg-engineering] ⚠ Setup verification found issues:");
  }

  if (result.commands.missing.length > 0) {
    lines.push(
      `  Missing commands: ${result.commands.missing.join(", ")}`
    );
  }
  if (result.agents.missing.length > 0) {
    lines.push(`  Missing agents: ${result.agents.missing.join(", ")}`);
  }
  if (result.skills.missing.length > 0) {
    lines.push(`  Missing skills: ${result.skills.missing.join(", ")}`);
  }

  if (!result.isSetup) {
    lines.push("");
    lines.push("[ferg-engineering] To set up globally, run:");
    lines.push("  ./setup-global.sh");
    lines.push("");
    lines.push("[ferg-engineering] Or manually copy to ~/.config/opencode/:");
    lines.push("  mkdir -p ~/.config/opencode/{command,agent,skills}");
    lines.push("  cp -r .opencode/command/* ~/.config/opencode/command/");
    lines.push("  cp -r .opencode/agent/* ~/.config/opencode/agent/");
    lines.push("  cp -r skills/* ~/.config/opencode/skills/");
  }

  return lines;
}

export default function fergEngineering(): Plugin {
  return {
    name: "ferg-engineering",
    version: "1.0.0",

    hooks: {
      // Verify setup on session start
      onSessionStart: async (context: PluginContext) => {
        const verification = await verifySetup(context);
        const report = formatVerificationReport(verification);

        console.log("[ferg-engineering] Session started. Verifying setup...");
        report.forEach((line) => console.log(line));

        if (verification.isSetup) {
          console.log(
            "[ferg-engineering] Available commands: plan, review, seo, work, compound, deploy"
          );
          console.log("[ferg-engineering] Available agents: plan, review, build");
          console.log(
            "[ferg-engineering] Available subagents: frontend-reviewer, seo-specialist, architect-advisor"
          );
        }
      },

      // Log when commands are invoked
      onCommandStart: async (context: PluginContext, command: string) => {
        if (
          [
            "plan",
            "review",
            "seo",
            "deploy",
            "work",
            "compound",
          ].includes(command)
        ) {
          console.log(`[ferg-engineering] Starting: ${command}`);
        }
      },

      // Track completion of major workflows
      onSessionEnd: async (context: PluginContext) => {
        console.log("[ferg-engineering] Session ended.");
      },
    },

    // Custom tools can be added here if needed
    tools: [],
  };
}

