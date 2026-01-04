# Coolify Deployment Guide for ai-eng-system Documentation Site

## Quick Start

The ai-eng-system documentation site can be deployed to Coolify in just a few minutes.

## Prerequisites

- Coolify instance (self-hosted or coolify.io)
- GitHub repository access
- Coolify connected to your GitHub account

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Log in to Coolify**

2. **Create New Service**
   - Click "Create New Service"
   - Select "Git Repository"
   - Choose your GitHub repository
   - Select branch: `main`
   - Select repository path: `docs-site/`

3. **Configure Build Settings**

   **Build Type**: Static Site

   **Build Command**:
   ```bash
   bun install && bun run build
   ```

   **Output Directory**:
   ```bash
   dist
   ```

4. **Configure Environment** (Optional)

   Set Node.js version if needed:
   ```bash
   NODE_VERSION=20
   ```

5. **Deploy**
   - Click "Create & Deploy"
   - Coolify will build and deploy automatically
   - Access your site at the generated URL

### Option 2: Deploy Using Dockerfile (Advanced)

1. **Create Dockerfile** (already provided in docs-site/)
   ```dockerfile
   # Use Node.js 20 Alpine
   FROM node:20-alpine AS builder

   # Install Bun
   RUN npm install -g bun

   # Set working directory
   WORKDIR /app

   # Copy package files
   COPY package.json bun.lockb ./

   # Install dependencies
   RUN bun install --frozen-lockfile

   # Copy source files
   COPY . .

   # Build the site
   RUN bun run build

   # Use Nginx to serve static files
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Deploy with Docker**
   - In Coolify, select "Docker" as deployment type
   - Choose the Dockerfile
   - Deploy

## Deployment Configuration

### Automatic Deployments

Coolify automatically deploys on push to configured branch:
- **Default**: `main` branch
- **Trigger**: Any push to docs-site/
- **Preview deployments**: Enable for PR testing

### Custom Domain

1. After deployment, go to service settings
2. Click "Domains"
3. Add custom domain (e.g., `docs.ai-eng-system.dev`)
4. Configure DNS (Coolify provides instructions)
5. Enable SSL (automatic with Let's Encrypt)

### Environment Variables

Most deployments won't need environment variables, but you can add:

```bash
# Node.js version
NODE_VERSION=20

# Custom Astro build settings (if needed)
ASTRO_SITE_URL=https://docs.ai-eng-system.dev
```

## Build Configuration

### Coolify Build Process

Coolify will:
1. Clone your repository
2. Install dependencies with Bun
3. Run build command: `bun run build`
4. Serve `dist/` directory as static site

### Build Time

- **First build**: ~30-60 seconds
- **Subsequent builds**: ~20-40 seconds (cached dependencies)

### Build Logs

Access build logs in Coolify UI:
- Service → Deployments → [deployment] → Logs

## Troubleshooting

### Build Fails

**Issue**: `bun: command not found`

**Solution**: Add build script to use npm as fallback:
```bash
npm install && npm run build
```

**Issue**: `astro build fails`

**Solution**: Check build logs for specific error, common issues:
- Missing dependencies: `bun install`
- TypeScript errors: Fix in source files
- Asset path issues: Check `astro.config.mjs`

### Deployment Fails

**Issue**: Site returns 404

**Solution**:
- Verify output directory is `dist`
- Check build succeeded
- Confirm deployment health status in Coolify

**Issue**: Custom domain not working

**Solution**:
- Verify DNS records (A record or CNAME)
- Wait for DNS propagation (up to 48 hours)
- Check SSL certificate status

### Preview Deployments Not Working

**Issue**: Preview URLs not accessible

**Solution**:
- Enable preview deployments in service settings
- Check Coolify has access to pull requests
- Verify PR workflow triggers deployment

## Comparison: Coolify vs GitHub Pages

| Feature | Coolify | GitHub Pages |
|---------|---------|-------------|
| **Deployment Speed** | Fast (custom server) | Fast (CDN) |
| **Custom Domain** | Easy (built-in SSL) | Easy (built-in SSL) |
| **Preview Deployments** | ✅ Native support | ❌ Requires workarounds |
| **Environment Variables** | ✅ Full support | ❌ Limited |
| **Build Logs** | ✅ Detailed UI | ✅ GitHub Actions |
| **Automatic Deployments** | ✅ On push | ✅ On push |
| **Cost** | Self-hosted: free, Managed: paid | Free |
| **Control** | Full control | Limited control |

## Monitoring

### Coolify UI

- **Service Dashboard**: Resource usage, uptime, logs
- **Deployments**: Deployment history and status
- **Logs**: Real-time logs for running services

### Uptime Monitoring

1. Configure external monitoring (e.g., UptimeRobot, StatusCake)
2. Set up alerts for downtime
3. Monitor endpoint: `https://your-docs-url.com`

## Maintenance

### Update Dependencies

```bash
cd docs-site
bun update
git add .
git commit -m "Update dependencies"
git push
```

Coolify will automatically redeploy.

### Update Content

1. Edit files in `docs-site/src/content/docs/`
2. Commit and push to GitHub
3. Coolify automatically deploys

### Rollback

If deployment fails:
1. Go to Service → Deployments in Coolify
2. Click on previous successful deployment
3. Click "Redeploy"

## Advanced Configuration

### Caching

Configure cache headers in Coolify:
```nginx
# Add to custom nginx config if using Docker
location / {
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache HTML
    location / {
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

### Redirects

Create `_redirects` file in `docs-site/public/`:
```
# Redirect old URLs
/old-page /new-page 301
/docs / 302
```

### Custom Headers

Create `_headers` file in `docs-site/public/`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
```

## Performance Optimization

### Already Optimized

- ✅ Static site generation (no server overhead)
- ✅ Pagefind search (fast, no backend)
- ✅ Optimized images
- ✅ Minimal JavaScript (~73KB gzipped)

### Additional Optimizations

1. **Enable Brotli compression** (Coolify auto-gzip)
2. **CDN integration** (Cloudflare)
3. **Image optimization** (Astro already handles this)
4. **Lazy loading** (Astro default)

## Security

### Best Practices

1. **Enable HTTPS**: Automatic in Coolify with Let's Encrypt
2. **Set security headers**: See "Custom Headers" section
3. **Regular updates**: Keep dependencies updated
4. **Access control**: Restrict Coolify instance access

### Monitoring Security

- Check build logs for vulnerabilities
- Use `npm audit` before deploying
- Enable security scanning in CI/CD

## Success Checklist

Before deploying, verify:

- [ ] GitHub repository accessible from Coolify
- [ ] `docs-site/package.json` has build script
- [ ] `astro.config.mjs` configured correctly
- [ ] Output directory is `dist`
- [ ] All documentation pages build locally: `bun run build`
- [ ] Site works locally: `bun run preview`
- [ ] Custom domain DNS configured (if applicable)
- [ ] SSL certificate enabled (if custom domain)

## Getting Help

- **Coolify Documentation**: https://coolify.io/docs
- **Astro Documentation**: https://docs.astro.build
- **Starlight Documentation**: https://starlight.astro.build
- **Project Issues**: https://github.com/v1truv1us/ai-eng-system/issues

## Summary

Deploying the ai-eng-system documentation site to Coolify is straightforward:

1. **Build Command**: `bun install && bun run build`
2. **Output Directory**: `dist`
3. **Deployment Type**: Static Site

The site is production-ready and will deploy in ~30-60 seconds with automatic deployments on push.

---

**Last Updated**: 2026-01-04
**Coolify Version**: Compatible with v4+
**Astro Version**: v5.16.6
