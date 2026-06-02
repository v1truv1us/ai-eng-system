---
name: docker
description: Build, run, and secure Docker containers with current best practices. Use for Dockerfile review, multi-stage builds, Compose orchestration, image hardening, and CI/CD integration.
disable-model-invocation: true
---

# Docker Container Engineering

## Current Versions (Verify Before Use)

```bash
docker --version          # Engine version
docker compose version    # Compose plugin version
docker buildx version     # BuildKit/buildx version
```

Check the [Docker Engine release notes](https://docs.docker.com/engine/release-notes/) for the latest stable.

## Core Principles

1. **Multi-stage builds are the default.** Every production Dockerfile should use multi-stage builds to minimize attack surface and image size.
2. **Non-root containers.** Every container should run as a non-root user unless impossible.
3. **Layer caching is a first-class concern.** Order Dockerfile instructions from least-frequently-changing to most-frequently-changing.
4. **Healthchecks are mandatory.** Every long-running container must define a `HEALTHCHECK`.
5. **Scan before push.** Every image should pass a security scan before registry upload.

## Dockerfile Review Checklist

### Structure
- [ ] Uses multi-stage build (at least 2 stages: builder + runtime)
- [ ] Base image is a slim or distroless variant (`alpine`, `slim`, `distroless`)
- [ ] No `latest` tag — pinned to specific digest or version
- [ ] `WORKDIR` is set before file operations
- [ ] `COPY` uses specific files, not `COPY . .` where possible

### Security
- [ ] Runs as non-root (`USER` directive or `--user` at runtime)
- [ ] No secrets in layers (use BuildKit secrets or runtime mounts)
- [ ] `EXPOSE` documents only necessary ports
- [ ] `HEALTHCHECK` is defined
- [ ] No unnecessary packages installed (`apt-get` cleaned, no dev tools in runtime)
- [ ] Image scanned with `docker scout` or Trivy

### Efficiency
- [ ] `.dockerignore` exists and excludes: `.git`, `node_modules`, `*.log`, `.env`
- [ ] Layer order respects cache invalidation (dependencies before code)
- [ ] `RUN` commands combined where logical (but not excessively long)
- [ ] BuildKit enabled (`DOCKER_BUILDKIT=1` or default in modern Docker)

## Multi-Stage Build Template

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production

FROM node:22-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"
CMD ["node", "server.js"]
```

## Docker Compose Patterns

### Development vs Production Separation
```yaml
# docker-compose.yml — production baseline
services:
  app:
    build: .
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

```yaml
# docker-compose.override.yml — development only
services:
  app:
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### Validation
```bash
docker compose config              # validate and merge
docker compose config --profiles   # check profile separation
```

## Security Scanning

```bash
# Docker Scout (built-in, requires login)
docker scout quickview myimage:latest
docker scout cves myimage:latest

# Trivy (open source)
trivy image myimage:latest
trivy filesystem .

# Snyk
snyk container test myimage:latest
```

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| `FROM node:latest` | Non-reproducible builds, surprise updates | Pin to `node:22-alpine` or digest |
| Running as root | Container escape = host compromise | `USER` directive + file ownership |
| `COPY . .` without `.dockerignore` | Bloats image, leaks secrets | Explicit `.dockerignore` |
| `apt-get update && apt-get install` without cleanup | Bloated layers | `&& rm -rf /var/lib/apt/lists/*` |
| No healthcheck | Orchestrator can't detect failure | `HEALTHCHECK` in Dockerfile or compose |
| Secrets in ENV | Visible in `docker inspect` | BuildKit secrets or runtime mounts |
| Single-stage build | Large attack surface, slow deploys | Multi-stage: build → runtime |

## CI/CD Integration

```yaml
# .github/workflows/docker.yml
- name: Build and scan
  run: |
    docker build -t app:${{ github.sha }} .
    docker scout cves app:${{ github.sha }} --exit-code --only-severity critical,high
    docker run --rm app:${{ github.sha }} npm test
```

## Troubleshooting Flow

1. **Build fails:** Check layer cache — `docker build --no-cache` to isolate
2. **Image too large:** Run `dive myimage:latest` to analyze layer bloat
3. **Container exits immediately:** Check `CMD`/`ENTRYPOINT` and logs (`docker logs`)
4. **Permission denied:** Verify `USER` directive and file ownership in `COPY --chown`
5. **Healthcheck failing:** Test command inside container with `docker exec`

## Official Resources

- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- [Compose specification](https://docs.docker.com/compose/compose-file/)
- [Docker security best practices](https://docs.docker.com/develop/dev-best-practices/)
- [BuildKit documentation](https://docs.docker.com/build/buildkit/)
- [Docker Scout](https://docs.docker.com/scout/)
