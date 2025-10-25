# bunkit 🍞

> Bake production-ready apps in seconds

**bunkit** is a modern, opinionated CLI for scaffolding Bun-powered projects with enterprise-grade patterns built-in.

[![npm version](https://img.shields.io/npm/v/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![npm downloads](https://img.shields.io/npm/dm/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![npm bundle size](https://img.shields.io/bundlephobia/min/bunkit-cli)](https://bundlephobia.com/package/bunkit-cli)
[![License](https://img.shields.io/npm/l/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![Bun](https://img.shields.io/badge/bun-1.3+-orange.svg)](https://bun.sh)
[![Status](https://img.shields.io/badge/status-beta-blue.svg)](./CHANGELOG.md)
[![CI/CD](https://github.com/Arakiss/bunkit/actions/workflows/release.yml/badge.svg)](https://github.com/Arakiss/bunkit/actions/workflows/release.yml)

> **🚀 Beta Release**: bunkit is in active development. Production-ready for early adopters. See [CHANGELOG](./packages/cli/CHANGELOG.md) for latest updates.

## ✨ Features

- 🚀 **4 Production-Ready Presets** - From minimal CLIs to full-stack monorepos
- 🎨 **Beautiful Interactive CLI** - Built with @clack/prompts (same as Astro)
- 📦 **Modern Stack** - Next.js 16, React 19, Hono, Tailwind CSS 4
- ⚡ **Bun-Native** - Leverages Bun 1.3 features (catalogs, isolated installs, HMR)
- 🗄️ **Database Options** - PostgreSQL/Drizzle, Supabase, SQLite, or None
- 🤖 **AI-Optimized** - Ultracite integration (Cursor, Windsurf, Claude Code, Zed)
- 🐳 **Docker Ready** - Multi-stage Dockerfiles with Bun official images
- 🔄 **CI/CD Built-in** - GitHub Actions workflows with lint/test/build/docker
- 🔒 **Type-Safe by Default** - TypeScript strict mode everywhere (configurable)
- 🎯 **Zero Configuration** - Works out of the box, fully customizable
- 🏢 **Enterprise Patterns** - Monorepo architecture, shared packages, proper structure

## 🚀 Quick Start

### Using bunx (Recommended)

```bash
bunx bunkit-cli init
```

### Global Installation

```bash
bun add -g bunkit-cli
bunkit init
```

### Requirements

- [Bun](https://bun.sh) v1.1.0 or higher
- Node.js v20.9.0 or higher (required for Next.js 16)

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

### `web` - Next.js 16 Frontend

Complete Next.js application with React 19, Tailwind CSS 4, and modern tooling.

**What you get:**
- Next.js 16 with App Router
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
| Frontend | Next.js | 16.0+ |
| React | React | 19.1+ |
| Backend | Hono | 4.7+ |
| Database | Drizzle ORM | 0.38+ |
| Database | Supabase JS | 2.48+ |
| Styling | Tailwind CSS | 4.1+ |
| Language | TypeScript | 5.9+ |
| Code Quality | Biome / Ultracite | 2.3+ / 1.0+ |
| Testing | Bun Test / Vitest | Built-in / 2.0+ |

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

- **v0.5.1** (Current) - Bun dependency catalog implementation
  - Centralized dependency management with catalog: references
  - Updated all dependencies to latest versions
  - TypeScript 5.9.3 across all presets

- **v0.5.0** - Major customization update
  - Database integration (PostgreSQL/Drizzle, Supabase, SQLite)
  - Ultracite AI-optimized code quality (.cursorrules, .windsurfrules, CLAUDE.md)
  - Docker support (multi-stage builds with Bun official images)
  - GitHub Actions CI/CD (lint, typecheck, test, build, docker)
  - TypeScript strictness levels (strict, moderate, loose)
  - Testing framework options (bun-test, vitest)

- **v0.1.0-alpha.1** - Initial alpha release
  - All 4 presets (minimal, web, api, full)
  - Beautiful interactive CLI
  - Bun 1.3+ monorepo features
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

**Beta (Current - v0.5.x)**
- ✅ Core CLI functionality
- ✅ All 4 presets working
- ✅ Beautiful interactive experience
- ✅ Automated CI/CD with GitHub Actions
- ✅ Semantic versioning with Changesets
- ✅ Database integration (PostgreSQL, Supabase, SQLite)
- ✅ AI-optimized code quality (Ultracite)
- ✅ Docker support
- ✅ GitHub Actions workflows
- ✅ Dependency catalog management
- 🚧 Enhanced `bunkit init` with 12 customization prompts
- 🚧 Tests and test coverage
- 🚧 Example projects

**v0.6.0 - Feature System**
- `bunkit add auth` - Authentication (Supabase, Clerk, NextAuth)
- `bunkit add ui` - UI components (shadcn/ui)
- `bunkit add payments` - Payments (Stripe)
- `bunkit add email` - Email (Resend + React Email)
- `bunkit add storage` - File storage (Supabase, S3)

**Stable (v1.0.0)**
- Production-ready
- Full test coverage
- Complete documentation
- Active community

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
