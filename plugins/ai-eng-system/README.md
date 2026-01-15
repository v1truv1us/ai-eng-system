# ai-eng-system OpenCode Plugin

A minimal OpenCode plugin that logs version information when sessions are created.

## Purpose

This plugin provides a simple session start notification by:
- Listening for `session.created` events
- Reading the version from `package.json`
- Logging "ai-eng-system vX.X.X loaded" to the console

## Installation

Place this plugin in `.opencode/plugin/ai-eng-system/` directory:
```bash
mkdir -p .opencode/plugin/ai-eng-system
cp plugin.ts .opencode/plugin/ai-eng-system/
```

## Implementation Details

- **Event Hook**: Uses the generic `event` hook to monitor all events
- **Event Filter**: Checks for `event.type === "session.created"`
- **Version Reading**: Dynamically imports `package.json` to get version
- **Minimal Dependencies**: Only depends on `@opencode-ai/plugin` types

## Code Structure

```typescript
const plugin: Plugin = async ({ client, project, directory, worktree, $ }) => {
  const version = await getVersion()
  
  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        console.log(`ai-eng-system v${version} loaded`)
      }
    }
  }
}
```

This plugin follows OpenCode's plugin architecture with proper TypeScript typing and async version loading.