/**
 * OpenCode SDK driver.
 */

import { createOpencode, type OpencodeClient } from "@opencode-ai/sdk";
import { DriverError, type Driver, type DriverConfig } from "./types.js";

const DEFAULT_TIMEOUT_MS = 60_000;

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

export function createDriver(_config?: DriverConfig): Driver {
  let client: OpencodeClient | null = null;
  let server: { close(): void } | null = null;

  return {
    async runPrompt(prompt: string): Promise<string> {
      const { client: c, server: s } = await createOpencode();
      client = c;
      server = s;

      await autoApprovePermissions(client);

      const sessionResp = await client.session.create({
        body: { title: `workflow: ${prompt.slice(0, 60)}` },
      });

      if (!sessionResp.data) {
        throw new DriverError(
          `Failed to create session: ${JSON.stringify(sessionResp.error)}`,
          "OPENCODE_SESSION",
        );
      }

      const sessionId = sessionResp.data.id;

      const promptResp = await client.session.prompt({
        path: { id: sessionId },
        body: { parts: [{ type: "text", text: prompt }] },
      } as Parameters<typeof client.session.prompt>[0]);

      if (!promptResp.data) {
        throw new DriverError(
          `Prompt failed: ${JSON.stringify(promptResp.error)}`,
          "OPENCODE_PROMPT",
        );
      }

      const textPart = (promptResp.data as any).parts?.find(
        (p: { type: string }) => p.type === "text",
      );
      const text: string = (textPart as { text?: string } | undefined)?.text ?? "(no text response)";

      return text;
    },

    async close(): Promise<void> {
      if (server) {
        server.close();
        server = null;
      }
    },
  };
}
