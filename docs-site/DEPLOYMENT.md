# Documentation Site - Coolify Deployment

This directory contains the documentation site for ai-eng-system, ready to deploy with Coolify.

## Quick Deploy to Coolify

### Option 1: Static Site (Recommended)

1. Create service in Coolify
2. Select your GitHub repository
3. Set repository path: `docs-site/`
4. Build command: `bun install && bun run build`
5. Output directory: `dist`
6. Deploy!

### Option 2: Docker Deployment

1. Create service in Coolify
2. Select "Docker" deployment type
3. Use the provided `Dockerfile`
4. Deploy!

## Documentation

- [Coolify Deployment Guide](./COOLIFY-DEPLOYMENT.md) - Complete deployment instructions
- [Implementation Complete](./IMPLEMENTATION-COMPLETE.md) - Implementation details
- [Main README](./README.md) - General documentation

## Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment Options

| Platform | Status | Guide |
|----------|--------|-------|
| **Coolify** | ✅ Recommended | [COOLIFY-DEPLOYMENT.md](./COOLIFY-DEPLOYMENT.md) |
| **GitHub Pages** | ✅ Configured | `.github/workflows/deploy-docs.yml` |
| **Netlify** | ⚠️ Manual | Use static site deployment |
| **Vercel** | ⚠️ Manual | Use static site deployment |
| **Docker** | ✅ Supported | `Dockerfile` provided |

## Tech Stack

- **Astro**: Modern static site generator
- **Starlight**: Official Astro documentation theme
- **Bun**: Fast JavaScript runtime and package manager
- **Nginx**: Production web server (Docker deployment)

## Support

- [Coolify Docs](https://coolify.io/docs)
- [Astro Docs](https://docs.astro.build)
- [Starlight Docs](https://starlight.astro.build)
- [Project Issues](https://github.com/v1truv1us/ai-eng-system/issues)
