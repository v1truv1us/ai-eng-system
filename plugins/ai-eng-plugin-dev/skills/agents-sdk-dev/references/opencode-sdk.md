# OpenCode SDK Reference

## Installation

```bash
npm install @opencode-ai/sdk
```

OpenCode is a **local** agent runtime. There is no cloud API — it runs an
OpenCode server process on the local machine and communicates via HTTP.

## Authentication

No API key needed. OpenCode runs locally.

The SDK starts an OpenCode server process and communicates with it over HTTP.

## Core API (TypeScript)

### Create Client and Run Prompt

```ts
import { createOpencode } from "@opencode-ai/sdk";

const { client, server } = await createOpencode();

// Create a session
const sessionResp = await client.session.create({
  body: { title: "my-workflow" },
});
const sessionId = sessionResp.data.id;

// Send a prompt
const promptResp = await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [{ type: "text", text: "Explain the auth module" }],
  },
});

// Extract text from response
const textPart = promptResp.data.parts?.find(
  (p) => p.type === "text"
);
console.log(textPart?.text);

// Clean up
server.close();
```

### Auto-Approve Permissions

OpenCode asks for permission before file operations. Auto-approve in workflows:

```ts
async function autoApprovePermissions(client: OpencodeClient): Promise<void> {
  const stream = await client.global.event();
  stream.on("message", async (event: unknown) => {
    const data = (event as { data?: { type?: string; sessionId?: string; permissionId?: string } }).data;
    if (data?.type === "permission" && data.sessionId && data.permissionId) {
      await client.postSessionIdPermissionsPermissionId({
        path: { id: data.sessionId, permissionId: data.permissionId },
        body: { response: "always" },
      });
    }
  });
}
```

### Session Management

```ts
// List sessions
const sessions = await client.session.list();

// Get specific session
const session = await client.session.get({ path: { id: sessionId } });

// Continue a session with a follow-up prompt
const followUp = await client.session.prompt({
  path: { id: sessionId },
  body: { parts: [{ type: "text", text: "Now refactor it" }] },
});
```

### Cleanup

```ts
// Always close the server when done
server.close();
```

## Error Handling

```ts
if (!sessionResp.data) {
  throw new Error(
    `Failed to create session: ${JSON.stringify(sessionResp.error)}`
  );
}

if (!promptResp.data) {
  throw new Error(
    `Prompt failed: ${JSON.stringify(promptResp.error)}`
  );
}
```

## Patterns

### Workflow Runner

```ts
import { createOpencode, type OpencodeClient } from "@opencode-ai/sdk";

async function runWorkflow(goal: string): Promise<string> {
  const { client, server } = await createOpencode();

  try {
    await autoApprovePermissions(client);

    const session = await client.session.create({
      body: { title: `workflow: ${goal.slice(0, 60)}` },
    });

    if (!session.data) throw new Error("Session creation failed");

    const result = await client.session.prompt({
      path: { id: session.data.id },
      body: { parts: [{ type: "text", text: goal }] },
    });

    const text = result.data?.parts?.find(p => p.type === "text")?.text;
    return text ?? "(no response)";
  } finally {
    server.close();
  }
}
```

### Multi-Turn Iteration

```ts
async function iterate(
  client: OpencodeClient,
  sessionId: string,
  prompt: string
): Promise<string> {
  const resp = await client.session.prompt({
    path: { id: sessionId },
    body: { parts: [{ type: "text", text: prompt }] },
  });

  return resp.data?.parts?.find(p => p.type === "text")?.text ?? "";
}
```

## Traps

- **Local only** — no cloud runtime. The SDK spawns a server process.
- **Always call `server.close()`** — otherwise orphaned processes accumulate.
- **Permission prompts** — auto-approve in unattended workflows or they hang.
- **Response shape** — `promptResp.data` contains `parts` array; find text part explicitly.
- **Session is stateful** — use the same session ID for multi-turn conversations.
- **No model selection** — OpenCode uses its configured default model.

## Local Examples

- Driver: `agents/runner-shared/drivers/opencode.ts`
- Runner: `agents/research-runner/opencode/runner.ts`
