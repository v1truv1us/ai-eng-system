# Config File

Configure ai-eng-system behavior with JSON config.

---

## Config Location

File: `.claude/ai-eng-config.json`

Auto-created if not present

Read by hooks and commands

---

## Prompt Optimization Settings

```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": false,
    "verbosity": "normal",
    "escapePrefix": "!"
  }
}
```

---

## Setting Details

enabled: Enable/disable prompt optimization

autoApprove: Skip interactive approval

verbosity: Output detail level (quiet|normal|verbose)

escapePrefix: Character to bypass optimization

---

## Session Commands

Toggle auto-approve: `/optimize-auto on|off`

Set verbosity: `/optimize-verbosity quiet|normal|verbose`

Changes apply to current session only
