/**
 * OpenCode SDK research runner.
 *
 * Creates one OpenCode session per query template, runs all in parallel,
 * then writes a brief to the vault.
 *
 * Usage:
 *   npx tsx runner.ts "your research question"
 *   npx tsx runner.ts --templates A1,M2 "targeted question"
 */

import { createOpencode, type OpencodeClient } from "@opencode-ai/sdk";
import { loadTemplates, type QueryTemplate } from "../shared/templates.ts";
import {
  synthesize,
  writeBrief,
  type TemplateResult,
} from "../shared/output.ts";

async function runTemplate(
  client: OpencodeClient,
  systemPrompt: string,
  template: QueryTemplate,
  query: string,
): Promise<TemplateResult> {
  const sessionResp = await client.session.create({
    body: { title: `research-runner: ${template.id}` },
  });

  if (!sessionResp.data) {
    throw new Error(
      `Failed to create session for ${template.id}: ${JSON.stringify(sessionResp.error)}`,
    );
  }

  const sessionId = sessionResp.data.id;
  const fullText = `${systemPrompt}\n\n${template.text}\n\nQuery context: ${query}`;

  const promptResp = await client.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: "text", text: fullText }],
    },
  } as Parameters<typeof client.session.prompt>[0]);

  if (!promptResp.data) {
    throw new Error(
      `Prompt failed for ${template.id}: ${JSON.stringify(promptResp.error)}`,
    );
  }

  const textPart = (promptResp.data as any).parts?.find(
    (p: { type: string }) => p.type === "text",
  );
  const text: string =
    (textPart as { text?: string } | undefined)?.text ?? "(no text response)";

  return { id: template.id, name: template.name, text };
}

async function autoApprovePermissions(client: OpencodeClient): Promise<void> {
  try {
    const stream = await client.global.event();
    stream.on("message", async (event: unknown) => {
      const data = (event as { data?: { type?: string; sessionId?: string; permissionId?: string } }).data;
      if (data?.type === "permission" && data.sessionId && data.permissionId) {
        try {
          await client.postSessionIdPermissionsPermissionId({
            path: { id: data.sessionId, permissionId: data.permissionId },
            body: { response: "always" },
          });
        } catch {
          // Non-fatal: permission may have already been resolved
        }
      }
    });
  } catch {
    // Event stream unavailable — permissions must be approved manually
    console.error("Warning: could not subscribe to event stream for auto-approve");
  }
}

function parseArgs(): { query: string; templateFilter: string[] } {
  const args = process.argv.slice(2);
  const flagIdx = args.indexOf("--templates");
  let templateFilter: string[] = [];
  let rest = [...args];

  if (flagIdx !== -1) {
    templateFilter = (args[flagIdx + 1] ?? "").split(",").filter(Boolean);
    rest = args.filter((_, i) => i !== flagIdx && i !== flagIdx + 1);
  }

  const query = rest.join(" ").trim();
  return { query, templateFilter };
}

async function main(): Promise<void> {
  const { query, templateFilter } = parseArgs();
  if (!query) {
    console.error(
      'Usage: npx tsx runner.ts [--templates A1,M2] "research question"',
    );
    process.exit(1);
  }

  const data = loadTemplates();
  const templates =
    templateFilter.length > 0
      ? data.templates.filter((t) => templateFilter.includes(t.id))
      : data.templates;

  if (templates.length === 0) {
    console.error(`No templates matched: ${templateFilter.join(",")}`);
    process.exit(1);
  }

  console.error("Starting OpenCode server…");
  const { client, server } = await createOpencode();

  await autoApprovePermissions(client);

  console.error(`Running ${templates.length} template(s) in parallel…`);

  const results = await Promise.all(
    templates.map((t) => runTemplate(client, data.systemPrompt, t, query)),
  );

  server.close();

  const synthesis = await synthesize(query, results);
  const briefPath = writeBrief(query, results, "opencode", synthesis);
  console.error(`Brief written to: ${briefPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
