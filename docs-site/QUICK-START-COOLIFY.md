# 🚀 Deploy Documentation Site to Coolify in 5 Minutes

## TL;DR

1. Create service in Coolify
2. Select your GitHub repository
3. Set: Repository path = `docs-site/`
4. Set: Build command = `bun install && bun run build`
5. Set: Output directory = `dist`
6. Click "Deploy"

That's it! Your site will be live in ~30 seconds.

---

## Detailed Steps

### 1. Prepare Repository

Make sure your repository is on GitHub and accessible to Coolify.

### 2. Create Service in Coolify

1. Log in to your Coolify instance
2. Click **"New Service"** or **"+"**
3. Select **"Git Repository"**
4. Choose your GitHub repository
5. Select branch: `main`

### 3. Configure Service

**Basic Settings**:
- **Name**: `ai-eng-docs` (or your preferred name)
- **Repository Path**: `docs-site/`

**Build Settings**:
- **Build Type**: **Static Site**
- **Build Command**:
  ```bash
  bun install && bun run build
  ```
- **Output Directory**:
  ```bash
  dist
  ```

### 4. Deploy

Click **"Create & Deploy"** and wait ~30-60 seconds.

### 5. Access Your Site

Coolify will provide a URL like:
```
https://ai-eng-docs.your-coolify-instance.com
```

Or configure a custom domain in service settings.

---

## Quick Reference Card

| Setting | Value |
|---------|-------|
| **Repository Path** | `docs-site/` |
| **Build Type** | Static Site |
| **Build Command** | `bun install && bun run build` |
| **Output Directory** | `dist` |
| **Port** | 80 (default) |

---

## Common Issues

### Issue: `bun: command not found`

**Fix**: Change build command to use npm:
```bash
npm install && npm run build
```

### Issue: Build fails with dependencies error

**Fix**: Make sure you have `bun.lockb` in the repository:
```bash
cd docs-site
bun install
git add bun.lockb
git commit -m "Add bun.lockb"
git push
```

### Issue: Preview deployments not working

**Fix**: Enable preview deployments in Coolify:
- Service → Settings → General → Enable "Preview Deployments"

---

## Advanced Configuration

### Custom Domain

1. Go to service → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `docs.ai-eng-system.dev`)
4. Configure DNS (Coolify provides instructions)
5. SSL is automatic

### Environment Variables

Go to service → **Environment** → Add variable:
```bash
NODE_VERSION=20
```

### Redirects

Create `docs-site/public/_redirects`:
```
/old-page /new-page 301
/docs / 302
```

---

## Verification Checklist

After deployment, verify:

- [ ] Site loads at Coolify-provided URL
- [ ] All navigation links work
- [ ] Search function returns results
- [ ] Dark/light mode toggle works
- [ ] Mobile responsive design works
- [ ] Custom domain (if configured) works
- [ ] SSL certificate is valid

---

## Next Steps

### Add Content

```bash
# Edit documentation
cd docs-site/src/content/docs
# Edit .md files

# Deploy
git add .
git commit -m "Update documentation"
git push
# Coolify auto-deploys!
```

### Monitor

- Check service health in Coolify dashboard
- Monitor build logs for errors
- Set up uptime monitoring

### Update Dependencies

```bash
cd docs-site
bun update
git add .
git commit -m "Update dependencies"
git push
```

---

## Support

- 📖 [Full Deployment Guide](./COOLIFY-DEPLOYMENT.md)
- 🌐 [Coolify Documentation](https://coolify.io/docs)
- 🐛 [Report Issues](https://github.com/v1truv1us/ai-eng-system/issues)

---

**Deployment Time**: ~30-60 seconds
**Difficulty**: Easy (beginner-friendly)
**Requirements**: Coolify instance + GitHub repository

🚀 **Ready to deploy!**
