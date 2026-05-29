# pi-runner: Scheduled research agent for Coolify
#
# Lives in ai-eng-system at agents/research-runner/deploy/
# Built from repo root (Coolify sets context to repo root).
#
# Layers:
#   1. Node.js runtime
#   2. pi CLI (agent sessions)
#   3. pi-intelli-search (web research tools)
#   4. ai-eng-system research-runner (TypeScript, runs via tsx — no build needed)
#   5. dcron (cron scheduler)
#   6. App scripts + skills + config

FROM node:22-alpine

# System deps
RUN apk add --no-cache git python3 bash curl make g++ procps dcron

# Install pi globally
RUN npm install -g @earendil-works/pi-coding-agent

# Install pi-intelli-search (provides intelli_search, intelli_research, intelli_extract, etc.)
RUN npm install -g @curio-data/pi-intelli-search

# ── ai-eng-system research-runner (runs via tsx, no build step) ──
# Copy only what the research-runner needs
COPY agents/research-runner/pi/ /opt/ai-eng-system/agents/research-runner/pi/
COPY agents/research-runner/shared/ /opt/ai-eng-system/agents/research-runner/shared/
COPY agents/runner-shared/ /opt/ai-eng-system/agents/runner-shared/

# Install dependencies (tsx for running .ts, anthropic sdk for pi driver)
# Use npm ci for reproducible installs; esbuild platform binaries are optional deps of tsx.
RUN cd /opt/ai-eng-system/agents/research-runner/pi && npm ci
RUN cd /opt/ai-eng-system/agents/runner-shared && npm install || true

# ── App layer ──
RUN mkdir -p /app/scripts /app/scheduled /app/data/vault/wiki \
    /app/logs /app/locks /app/skills /app/config

WORKDIR /app

COPY agents/research-runner/deploy/scripts/ /app/scripts/
COPY agents/research-runner/deploy/scheduled/ /app/scheduled/
COPY agents/research-runner/deploy/skills/ /app/skills/
COPY agents/research-runner/deploy/config/crontab /etc/crontabs/root
COPY agents/research-runner/deploy/config/entrypoint.sh /app/entrypoint.sh
COPY agents/research-runner/deploy/config/settings.json /app/config/settings.json
COPY agents/research-runner/deploy/queue-server.js /app/queue-server.js

RUN chmod +x /app/scripts/*.sh /app/entrypoint.sh /app/queue-server.js && chmod 600 /etc/crontabs/root

# Vault data survives redeployments
VOLUME ["/app/data"]

# Queue UI
EXPOSE 8080

# Health check
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD pgrep crond || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
