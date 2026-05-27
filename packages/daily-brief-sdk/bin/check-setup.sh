#!/bin/bash
#
# Pre-install/pre-launch verification for daily-brief-sdk.
#
# Validates:
#   1. ~/.claude/cook-and-brief/.env exists, mode 0600
#   2. SMTP_HOST, SMTP_USER, SMTP_PASS, BRIEF_TO are present in .env
#   3. ATLASSIAN_API_TOKEN is present (Atlassian MCP requirement)
#   4. SMTP_HOST is not "localhost" or empty (deliverability check; warn-only)
#
# Exits non-zero on any hard failure. Warnings are advisory.

set -euo pipefail

ENV_FILE="${HOME}/.claude/cook-and-brief/.env"

# 1. .env exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "FAIL: $ENV_FILE does not exist" >&2
    echo "      Create it from packages/daily-brief-sdk/.env.example and chmod 0600." >&2
    exit 1
fi

# 2. .env mode is 0600
MODE=$(stat -f '%OLp' "$ENV_FILE" 2>/dev/null || stat -c '%a' "$ENV_FILE" 2>/dev/null)
if [[ "$MODE" != "600" ]]; then
    echo "FAIL: $ENV_FILE permissions are $MODE; must be 600" >&2
    echo "      Run: chmod 600 $ENV_FILE" >&2
    exit 1
fi

# 3. Required keys present
REQUIRED=("SMTP_HOST" "SMTP_USER" "SMTP_PASS" "BRIEF_TO" "ATLASSIAN_API_TOKEN")
MISSING=()
for key in "${REQUIRED[@]}"; do
    if ! grep -q "^${key}=" "$ENV_FILE"; then
        MISSING+=("$key")
    fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
    echo "FAIL: missing required keys in $ENV_FILE: ${MISSING[*]}" >&2
    exit 1
fi

# 4. Deliverability soft-check: warn if SMTP_HOST is localhost
SMTP_HOST_VALUE=$(grep '^SMTP_HOST=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
case "$SMTP_HOST_VALUE" in
    localhost|127.0.0.1|""|"localhost:*"|"127.0.0.1:*")
        echo "WARN: SMTP_HOST=\"$SMTP_HOST_VALUE\" is likely to land in spam." >&2
        echo "      For inbox delivery, use a relay with valid SPF + DKIM" >&2
        echo "      (Postmark, SES, Mailgun all qualify). See INSTALL.md §SPF/DKIM." >&2
        ;;
esac

echo "OK: $ENV_FILE present, mode 0600, all required keys set."
