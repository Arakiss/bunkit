# bunkit 🍞

> Bake production-ready apps in seconds

**bunkit** is a modern, opinionated CLI for scaffolding Bun-powered projects with enterprise-grade patterns built-in.

[![Version](https://img.shields.io/badge/version-0.1.0--alpha.1-blue.svg)](https://github.com/Arakiss/bunkit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Bun](https://img.shields.io/badge/bun-1.3+-orange.svg)](https://bun.sh)
[![Status](https://img.shields.io/badge/status-alpha-yellow.svg)](./CHANGELOG.md)

> **⚠️ Alpha Release**: This is v0.1.0-alpha.1 - suitable for testing and early adoption. See [CHANGELOG](./packages/cli/CHANGELOG.md) for details.

## ✨ Features

- 🚀 **4 Production-Ready Presets** - From minimal CLIs to full-stack monorepos
- 🎨 **Beautiful Interactive CLI** - Built with @clack/prompts (same as Astro)
- 📦 **Modern Stack** - Next.js 15, React 19, Hono, Tailwind CSS 4
- ⚡ **Bun-Native** - Leverages Bun 1.3 features (catalogs, isolated installs, HMR)
- 🔒 **Type-Safe by Default** - TypeScript strict mode everywhere
- 🎯 **Zero Configuration** - Works out of the box, customize when needed
- 🏢 **Enterprise Patterns** - Monorepo architecture, shared packages, proper structure

## 🚀 Quick Start

### Using bunx (Recommended)

```bash
bunx @bunkit/cli init
```

### Global Installation

```bash
bun add -g @bunkit/cli
bunkit init
```

### Requirements

- [Bun](https://bun.sh) v1.1.0 or higher
- Node.js v18.0.0 or higher (for Next.js apps)

## 📦 Presets

### `minimal` - Single Repo, Clean Start

Perfect for CLIs, scripts, utilities, and proof-of-concepts.

**What you get:**
- Bun runtime with hot reload (`bun --hot`)
- TypeScript configured
- Clean folder structure
- Basic `.gitignore`

```bash
bunkit create minimal my-tool
cd my-tool
bun run dev
```

**Use cases:** CLI tools, scripts, learning projects, microservices

---

### `web` - Next.js 15 Frontend

Complete Next.js application with React 19, Tailwind CSS 4, and modern tooling.

**What you get:**
- Next.js 15 with App Router
- React 19 (Server Components by default)
- Tailwind CSS 4 (CSS-first configuration)
- Biome (linting + formatting)
- TypeScript strict mode
- Optimal folder structure

```bash
bunkit create web my-app
cd my-app
bun install  # If --no-install was used
bun dev
```

**Use cases:** Landing pages, marketing sites, SaaS frontends, web applications

---

### `api` - Hono Backend

Lightning-fast API built with Hono and Bun.serve() with native HMR.

**What you get:**
- Hono v4 web framework
- Bun.serve() with HMR enabled
- Example routes and middleware
- CORS and logging configured
- Error handling patterns
- TypeScript with Bun types

```bash
bunkit create api my-api
cd my-api
bun run dev
```

**Use cases:** REST APIs, GraphQL servers, webhooks, backend services

---

### `full` - Full-Stack Monorepo

Enterprise-grade monorepo with Next.js frontend, Hono backend, and shared packages.

**What you get:**
- Bun workspaces configured
- Dependency catalogs (centralized versions)
- Isolated installs (no phantom deps)
- Apps:
  - `web/` - Next.js frontend
  - `api/` - Hono backend
- Packages:
  - `types/` - Shared TypeScript types
  - `utils/` - Shared utilities
- Biome for code quality
- Proper TypeScript project references

```bash
bunkit create full my-saas
cd my-saas
bun install
bun dev  # Starts all apps
```

**Use cases:** SaaS products, full-stack applications, multi-app projects

## 🎯 Commands

### `bunkit init`

Interactive project creation with beautiful prompts.

```bash
bunkit init
```

You'll be asked:
1. Project name
2. Preset type (minimal/web/api/full)
3. Install dependencies? (default: yes)
4. Initialize git? (default: yes)

### `bunkit create <preset> <name>`

Quick, non-interactive project creation.

```bash
bunkit create web my-app
bunkit create api my-api --no-git
bunkit create full my-saas --no-install
```

**Options:**
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation

### `bunkit add <feature>`

Add features to existing projects (coming soon).

```bash
bunkit add auth       # Supabase auth + PKCE
bunkit add database   # Drizzle ORM + PostgreSQL
bunkit add ui         # shadcn/ui components
bunkit add payments   # Stripe integration
bunkit add email      # Resend + React Email
bunkit add storage    # File uploads
```

## 📁 Project Structure

### Minimal Preset

```
my-tool/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── bunfig.toml
└── README.md
```

### Web Preset

```
my-app/
├── src/
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── biome.json
└── README.md
```

### API Preset

```
my-api/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   └── users.ts
│   └── middleware/
├── package.json
├── tsconfig.json
├── bunfig.toml
└── README.md
```

### Full Preset

```
my-saas/
├── apps/
│   ├── web/          # Next.js app
│   └── api/          # Hono API
├── packages/
│   ├── types/        # Shared types
│   └── utils/        # Shared utilities
├── package.json      # Root with catalogs
├── bunfig.toml
├── tsconfig.json
└── README.md
```

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | Bun | 1.3+ |
| Frontend | Next.js | 15.5+ |
| React | React | 19.1+ |
| Backend | Hono | 4.7+ |
| Styling | Tailwind CSS | 4.1+ |
| Language | TypeScript | 5.7+ |
| Code Quality | Biome | 2.3+ |

## 💡 Philosophy

**bunkit** is built on these principles:

1. **Bun-First** - Leverage Bun's native capabilities (no external drivers when possible)
2. **Modern Stack** - Latest stable versions of Next.js, React, TypeScript
3. **Type Safety** - Strict TypeScript everywhere, no `any` types
4. **Performance** - Fast builds, fast runtime, minimal dependencies
5. **Developer Experience** - Beautiful CLI, hot reload, clear conventions
6. **Production Ready** - Enterprise patterns from day one

## 🔄 Comparison

| Feature | bunkit | create-next-app | create-t3-app |
|---------|--------|----------------|---------------|
| Bun-native | ✅ | ❌ | ❌ |
| Monorepo support | ✅ | ❌ | ❌ |
| Multiple presets | ✅ (4) | ❌ (1) | ✅ (modular) |
| API backend | ✅ Hono | ❌ | ✅ tRPC |
| Interactive CLI | ✅ | ✅ | ✅ |
| Dependency catalogs | ✅ | ❌ | ❌ |
| Isolated installs | ✅ | ❌ | ❌ |

## 📚 Examples

Check out the `examples/` directory for sample projects:

- `examples/minimal-cli/` - CLI tool example
- `examples/web-landing/` - Marketing site
- `examples/api-rest/` - REST API
- `examples/full-saas/` - Full-stack SaaS

## 📝 Versioning & Releases

bunkit uses [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management.

### Version History

- **v0.1.0-alpha.1** (Current) - Initial alpha release with all 4 presets
  - See [CHANGELOG](./packages/cli/CHANGELOG.md) for full details

### Semantic Versioning

We follow [SemVer 2.0.0](https://semver.org/):
- **Major** (1.0.0) - Breaking changes
- **Minor** (0.1.0) - New features, backwards compatible
- **Patch** (0.0.1) - Bug fixes
- **Prerelease** (0.1.0-alpha.1) - Testing and early adoption

### Release Process

**Automated (Recommended):**

1. Add a changeset for your changes:
   ```bash
   bun run changeset
   ```

2. Push to main (via PR merge)

3. GitHub Actions automatically creates "Release: Version Packages" PR

4. Merge the release PR → Packages auto-publish to npm ✨

**Manual:**

```bash
# Version packages (updates package.json + CHANGELOG)
bun run version

# Build and publish to npm
bun run release
```

### CI/CD

bunkit uses **GitHub Actions + Changesets** for automated releases:

- **Workflow**: `.github/workflows/release.yml`
- **Triggers**: Push to `main` branch
- **Process**:
  1. Detects changesets
  2. Creates release PR with version bumps
  3. Publishes to npm on PR merge

**Setup Requirements:**
- `NPM_TOKEN` secret configured in GitHub
- Token type: "Automation" (no 2FA)
- Token permissions: "Read and write"

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup guide.

### Roadmap

**Alpha (Current - v0.1.0-alpha.1)**
- ✅ Core CLI functionality
- ✅ All 4 presets working
- ✅ Beautiful interactive experience
- ✅ Automated CI/CD with GitHub Actions
- ✅ Semantic versioning with Changesets

**Beta (v0.2.0-beta.x)**
- Feature system (`bunkit add`)
- Tests and test coverage
- Community feedback integration
- Example projects

**Stable (v1.0.0)**
- Production-ready
- Full test coverage
- Complete documentation
- npm registry publication

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT © [Arakiss](https://github.com/Arakiss)

## 🙏 Acknowledgments

- [@clack/prompts](https://www.clack.cc/) - Beautiful CLI prompts by the Astro team
- [create-t3-app](https://create.t3.gg/) - Inspiration for modular approach
- [Bun](https://bun.sh) - The amazing all-in-one JavaScript runtime

---

**Made with ❤️ for the indie hacker community** | [GitHub](https://github.com/Arakiss/bunkit) | [Issues](https://github.com/Arakiss/bunkit/issues)
