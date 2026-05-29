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
#   5. ofelia (cron scheduler)
#   6. App scripts + skills + config

FROM node:22-alpine

# System deps
RUN apk add --no-cache git python3 bash curl make g++ procps

# Install pi globally
RUN npm install -g @earendil-works/pi-coding-agent

# Install pi-intelli-search (provides intelli_search, intelli_research, intelli_extract, etc.)
RUN npm install -g @curio-data/pi-intelli-search

# Install ofelia — cron scheduler
RUN ARCH=$(uname -m) && \
    OFELIA_ARCH="amd64" && \
    if [ "$ARCH" = "aarch64" ]; then OFELIA_ARCH="arm64"; fi && \
    curl -L -o /usr/local/bin/ofelia \
      "https://github.com/mcuadros/ofelia/releases/download/v0.5.7/ofelia-v0.5.7-linux-${OFELIA_ARCH}" && \
    chmod +x /usr/local/bin/ofelia

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
COPY agents/research-runner/deploy/config/ofelia.ini /app/ofelia.ini
COPY agents/research-runner/deploy/config/entrypoint.sh /app/entrypoint.sh
COPY agents/research-runner/deploy/config/settings.json /app/config/settings.json

RUN chmod +x /app/scripts/*.sh /app/entrypoint.sh

# Vault data survives redeployments
VOLUME ["/app/data"]

# Health check
HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
    CMD pgrep ofelia || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
