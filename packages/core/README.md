# @ai-eng-system/core

Shared library package for the AI Engineering System.

`@ai-eng-system/core` contains the packaged content loaders and path helpers used by the CLI, installers, and other consumers.

## Install

```bash
npm install @ai-eng-system/core
```

## Package role

`@ai-eng-system/core` is one of three published packages:

- `@ai-eng-system/core` - shared library and content loading helpers
- `@ai-eng-system/toolkit` - packaged Claude/OpenCode/plugin assets
- `@ai-eng-system/cli` - executable installer and command-line workflows

Use `core` when you need programmatic access to ai-eng-system content. Use `cli` for end-user installation. Use `toolkit` when you need packaged asset directories directly.

## Usage

```ts
import {
  getAgentContent,
  getCommandContent,
  getSkillContent,
  getOpenCodeContent,
} from "@ai-eng-system/core/content";

const agents = await getAgentContent();
const commands = await getCommandContent();
const skills = await getSkillContent();
const openCodeContent = await getOpenCodeContent();
```

You can also import path helpers from `@ai-eng-system/core/paths`.

## Exports

- `.` - main library entrypoint
- `./content` - content loading utilities
- `./paths` - path resolution helpers

## Release status

Current published version: `0.6.0`
