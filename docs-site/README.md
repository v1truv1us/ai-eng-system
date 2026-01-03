# ai-eng-system Documentation Site

Official documentation site for ai-eng-system, built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

## Quick Start

### Local Development

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

### GitHub Pages (Automatic)

The site is automatically deployed to GitHub Pages on push to `main` branch.

To enable GitHub Pages in your repository:

1. Go to **Settings** → **Pages**
2. Select **GitHub Actions** as the build and deployment source
3. The `.github/workflows/deploy-docs.yml` workflow will handle deployment

The site will be deployed to: `https://v1truv1us.github.io/ai-eng-system/`

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
