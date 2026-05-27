#!/usr/bin/env tsx
/**
 * OpenCode SDK SEO review runner.
 *
 * Usage:
 *   npx tsx runner.ts "https://example.com"
 *   npx tsx runner.ts --agent technical-seo "https://example.com"
 */

import { createOpencode, type OpencodeClient } from "@opencode-ai/sdk";
import { buildPrompt, parseArgs, writeReport } from "../shared/prompt.ts";

async function autoApprovePermissions(client: OpencodeClient): Promise<void> {
  try {
    const stream = await client.global.event();
    stream.on("message", async (event: unknown) => {
      const data = (
        event as { data?: { type?: string; sessionId?: string; permissionId?: string } }
      ).data;
      if (data?.type === "permission" && data.sessionId && data.permissionId) {
        try {
          await client.postSessionIdPermissionsPermissionId({
            path: { id: data.sessionId, permissionId: data.permissionId },
            body: { response: "always" },
          });
        } catch {
          // Non-fatal
        }
      }
    });
  } catch {
    console.error("Warning: could not subscribe to event stream for auto-approve");
  }
}

async function main(): Promise<void> {
  const { url, agent } = parseArgs();
  if (!url) {
    console.error('Usage: npx tsx runner.ts [--agent technical-seo] "https://example.com"');
    process.exit(1);
  }

  const prompt = buildPrompt(url, agent);
  console.error(`Starting OpenCode server…`);
  const { client, server } = await createOpencode();

  await autoApprovePermissions(client);

  console.error(`Running SEO review via OpenCode SDK for ${url}…`);

  const sessionResp = await client.session.create({
    body: { title: `seo-review: ${url}` },
  });

  if (!sessionResp.data) {
    server.close();
    throw new Error(`Failed to create session: ${JSON.stringify(sessionResp.error)}`);
  }

  const sessionId = sessionResp.data.id;

  const promptResp = await client.session.prompt({
    path: { id: sessionId },
    body: { parts: [{ type: "text", text: prompt }] },
  } as Parameters<typeof client.session.prompt>[0]);

  server.close();

  if (!promptResp.data) {
    throw new Error(`Prompt failed: ${JSON.stringify(promptResp.error)}`);
  }

  const textPart = (promptResp.data as any).parts?.find(
    (p: { type: string }) => p.type === "text",
  );
  const report: string = (textPart as { text?: string } | undefined)?.text ?? "(no text response)";

  const reportPath = writeReport(url, report.trim() || "(no report)", "opencode");
  console.error(`SEO review written to: ${reportPath}`);
  console.log(report);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
