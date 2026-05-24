---
name: resume-session
description: Resume work from a saved session checkpoint
agent: build
version: 1.0.0
---

# Resume Session Command

Load a previously saved session and resume from where you left off.

```
/resume-session              # Resume the most recent checkpoint
/resume-session <id>         # Resume a specific session
/resume-session --label "x"  # Resume from a labeled checkpoint
```

See also: `/checkpoint`, `/sessions`

$ARGUMENTS
