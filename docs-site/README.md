# ai-eng-system Documentation Site

Official documentation site for ai-eng-system, built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

## 🚀 Quick Deploy

### Deploy to Coolify (Recommended)

1. Create service in Coolify
2. Select your GitHub repository
3. Set repository path: `docs-site/`
4. Build command: `bun install && bun run build`
5. Output directory: `dist`
6. Deploy!

📖 **Complete guide**: [COOLIFY-DEPLOYMENT.md](./COOLIFY-DEPLOYMENT.md)

### Deploy to GitHub Pages

Automatically deployed on push to `main` branch. Just enable GitHub Pages in repository settings.

1. Go to **Settings** → **Pages**
2. Select **GitHub Actions** as build source
3. Push to `main` to deploy

## 📝 Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

The dev server will be available at `http://localhost:4321/`

## Project Structure

```
docs-site/
├── .github/
│   └── workflows/
│       └── deploy-docs.yml    # GitHub Pages deployment workflow
├── public/                    # Static assets
├── src/
│   ├── components/            # Astro components
│   ├── content/
│   │   ├── config.ts         # Content collections configuration
│   │   └── docs/             # Documentation content
│   │       ├── getting-started/
│   │       ├── features/
│   │       ├── reference/
│   │       ├── architecture/
│   │       ├── development/
│   │       └── troubleshooting/
│   └── pages/                # Page routes
├── astro.config.mjs           # Astro configuration
└── package.json              # Project dependencies
```

## Deployment

### 🟢 Coolify (Recommended)

Fastest deployment with preview environments and custom domains.

**Quick Deploy**:
- Repository path: `docs-site/`
- Build command: `bun install && bun run build`
- Output directory: `dist`

**Complete Guide**: [COOLIFY-DEPLOYMENT.md](./COOLIFY-DEPLOYMENT.md)

### 🟡 GitHub Pages (Automatic)

The site is automatically deployed to GitHub Pages on push to `main` branch.

To enable GitHub Pages in your repository:

1. Go to **Settings** → **Pages**
2. Select **GitHub Actions** as the build and deployment source
3. The `.github/workflows/deploy-docs.yml` workflow will handle deployment

The site will be deployed to: `https://v1truv1us.github.io/ai-eng-system/`

### 🐳 Docker

Production-ready Dockerfile provided for containerized deployments.

```bash
# Build image
docker build -t ai-eng-docs .

# Run container
docker run -p 8080:80 ai-eng-docs
```

### 🔵 Other Platforms

Can be deployed to any static site hosting platform:
- **Netlify**: Use static site deployment
- **Vercel**: Use static site deployment
- **Cloudflare Pages**: Use static site deployment

## Deployment Comparison

| Platform | Preview Deployments | Custom Domain | Environment Variables |
|----------|-------------------|---------------|----------------------|
| **Coolify** | ✅ Native | ✅ Easy | ✅ Full support |
| **GitHub Pages** | ❌ | ✅ | ❌ Limited |
| **Netlify** | ✅ | ✅ | ✅ |
| **Vercel** | ✅ | ✅ | ✅ |
| **Docker** | ✅ Manual | ✅ Manual | ✅ |

## Technologies

- **Astro**: Modern static site generator
- **Starlight**: Official Astro documentation theme
- **Bun**: Fast JavaScript runtime and package manager
- **Pagefind**: Static site search
- **TypeScript**: Type-safe development

## Contributing

Documentation improvements are welcome! Please:
1. Follow existing style and structure
2. Test your changes locally
3. Submit a pull request with clear descriptions

## License

This documentation site is part of ai-eng-system project and follows the same [MIT License](../LICENSE).
