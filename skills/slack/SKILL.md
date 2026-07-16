---
name: slack
description: Build secure, reliable Slack integrations and bots. Use for webhook design, Block Kit UI, Socket Mode, and API best practices.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Slack Integration Engineering

## Current Versions (Verify Before Use)

```bash
# Check Slack API changelog for breaking changes
curl -s https://api.slack.com/changelog | grep -i "breaking"
```

The [Slack API changelog](https://api.slack.com/changelog) tracks all changes. The [Slack Bolt SDK](https://slack.dev/bolt-js/) is the recommended framework for bots.

## Core Principles

1. **Never trust incoming webhooks.** Verify Slack request signatures on every request.
2. **OAuth over tokens.** Use OAuth 2.0 for workspace installs. Bot tokens are for development only.
3. **Block Kit for rich UI.** Use structured blocks instead of raw markdown for interactive experiences.
4. **Async acknowledgment.** Acknowledge Slack events within 3 seconds, process asynchronously.
5. **Rate limits are real.** The Slack API has tiered rate limits. Handle `429` responses with exponential backoff.

## Webhook Security

### Request Verification
```javascript
import { createHmac } from 'crypto';

function verifySlackRequest(req) {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  const body = req.rawBody;

  // Reject old requests (5 min window)
  if (Date.now() / 1000 - Number(timestamp) > 300) return false;

  const base = `v0:${timestamp}:${body}`;
  const hash = createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(base)
    .digest('hex');

  return signature === `v0=${hash}`;
}
```

### Token Storage
- Store tokens encrypted at rest (AES-256 or KMS)
- Rotate tokens quarterly
- Use per-workspace token isolation
- Never log tokens

## Block Kit Patterns

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Deployment Complete*\n<https://github.com/org/repo|org/repo>"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Logs" },
          "url": "https://logs.example.com/run/123"
        }
      ]
    }
  ]
}
```

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| No signature verification | Anyone can spoof Slack requests | Verify `x-slack-signature` |
| Hardcoded bot token | Can't rotate, workspace-locked | OAuth + encrypted storage |
| Synchronous processing | >3s = timeout error | Ack immediately, process async |
| Ignoring rate limits | 429 errors, broken integration | Exponential backoff, respect Retry-After |
| Raw markdown for complex UI | Limited interactivity, inconsistent rendering | Block Kit structured blocks |
| Storing tokens in plaintext | Data breach exposure | Encrypted at rest |
| No error handling | Silent failures, missed messages | Log and alert on API errors |

## Validation Checklist

- [ ] All incoming webhooks verify Slack signature
- [ ] OAuth flow implemented for workspace installation
- [ ] Tokens encrypted at rest
- [ ] Async processing with 3-second acknowledgment
- [ ] Rate limit handling with exponential backoff
- [ ] Block Kit used for interactive messages
- [ ] Error handling and retry logic for all API calls

## Official Resources

- [Slack API docs](https://api.slack.com/)
- [Bolt SDK](https://slack.dev/bolt-js/)
- [Block Kit Builder](https://app.slack.com/block-kit-builder)
- [OAuth guide](https://api.slack.com/authentication/oauth-v2)
- [Rate limits](https://api.slack.com/docs/rate-limits)
