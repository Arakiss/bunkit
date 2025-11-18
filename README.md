# bunkit 🍞

> Bake production-ready apps in seconds | Modern CLI tool for Bun monorepo scaffolding

**bunkit** is a modern, opinionated CLI tool for scaffolding Bun-powered projects with enterprise-grade patterns built-in. Create production-ready full-stack applications, APIs, monorepos, and web apps with Next.js, Hono, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, and Supabase in seconds.

[![npm version](https://img.shields.io/npm/v/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli) [![npm downloads](https://img.shields.io/npm/dm/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli) [![License](https://img.shields.io/npm/l/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli) [![Bun](https://img.shields.io/badge/bun-1.3+-orange.svg)](https://bun.sh) [![Status](https://img.shields.io/badge/status-beta-blue.svg)](./packages/cli/CHANGELOG.md) [![CI/CD](https://github.com/Arakiss/bunkit/actions/workflows/release.yml/badge.svg)](https://github.com/Arakiss/bunkit/actions/workflows/release.yml) [![GitHub stars](https://img.shields.io/github/stars/Arakiss/bunkit)](https://github.com/Arakiss/bunkit) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

> **🚀 Beta Release**: bunkit is in active development. Production-ready for early adopters. See [CHANGELOG](./packages/cli/CHANGELOG.md) for latest updates.

**Keywords**: Bun CLI, Bun scaffold, Bun monorepo, Next.js starter, Hono API template, TypeScript boilerplate, Tailwind CSS starter, shadcn/ui setup, Drizzle ORM template, Supabase starter, full-stack template, project generator, developer tools, Bun runtime, Bun workspaces

## ✨ Features

- 🏗️ **Monorepo Architecture** - Bun workspaces + catalogs + isolated installs done right
- 🎨 **Beautiful Interactive CLI** - Built with @clack/prompts (same as Astro)
- 📦 **Modern Stack** - Next.js 16, React 19, Hono, Tailwind CSS 4
- 🎭 **shadcn/ui Integration** - Complete UI component system with themes, customization, and auto-installation
- ⚡ **Bun-Native** - Leverages Bun 1.3+ features (catalogs, isolated installs, HMR)
- 🗄️ **Database Patterns** - PostgreSQL/Drizzle, Supabase (with presets and feature selection), SQLite setup (structure, not models)
- 🤖 **AI-Optimized** - Ultracite integration (Cursor, Windsurf, Claude Code, Zed)
- 🐳 **Docker Ready** - Multi-stage Dockerfiles with Bun official images
- 🔄 **CI/CD Built-in** - GitHub Actions workflows with lint/test/build/docker
- 🔒 **Type-Safe by Default** - TypeScript strict mode everywhere (configurable)
- 🎯 **Workspace Management** - Add workspaces and shared packages easily
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

bunkit offers **7 presets** to choose from, including options **without Next.js** for those who prefer different frameworks:

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
- **shadcn/ui** - Complete UI component system (optional, configurable)
  - 5 base color themes (neutral, gray, zinc, stone, slate)
  - Style options (new-york, default)
  - Customizable border radius
  - Auto-installed default components (button, card)
  - Example components and documentation
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

---

### `bun-api` - Bun.serve() Native API (No Dependencies)

Ultra-fast API server using Bun.serve() native routing with zero external dependencies.

**What you get:**
- Bun.serve() with native routing (SIMD-accelerated)
- Zero dependencies (pure Bun runtime)
- Type-safe route parameters
- Built-in error handling
- Request utilities and middleware patterns
- TypeScript with Bun types

```bash
bunkit create bun-api my-api
cd my-api
bun run dev
```

**Use cases:** High-performance APIs, microservices, serverless functions

---

### `bun-fullstack` - Bun.serve() + HTML Imports (No Next.js)

Full-stack application using Bun.serve() with HTML imports - React without Next.js.

**What you get:**
- Bun.serve() with HTML imports support
- React 19 (client-side)
- Hot reloading
- API routes alongside frontend
- TypeScript configured
- No Next.js dependency

```bash
bunkit create bun-fullstack my-app
cd my-app
bun run dev
```

**Use cases:** Full-stack apps without Next.js, React SPA with Bun backend

---

### `monorepo-bun` - Monorepo with Bun.serve() (No Next.js)

Enterprise monorepo using Bun.serve() for both frontend and backend - no Next.js required.

**What you get:**
- Bun workspaces configured
- Apps:
  - `web/` - Bun.serve() + HTML imports (React frontend)
  - `api/` - Bun.serve() native API
- Packages:
  - `types/` - Shared TypeScript types
  - `utils/` - Shared utilities
- All Bun-native, no Next.js

```bash
bunkit create monorepo-bun my-saas
cd my-saas
bun install
bun dev  # Starts all apps
```

**Use cases:** Full-stack monorepos without Next.js, Bun-native architectures

## 🎯 Commands

### `bunkit init`

Interactive project creation with beautiful prompts.

```bash
bunkit init
```

You'll be guided through **21+ interactive prompts** in "buffet libre" style - choose exactly what you need:

1. Project name
2. Preset type (minimal/web/api/bun-api/bun-fullstack/full/monorepo-bun)
3. Database configuration (PostgreSQL/Drizzle/Prisma, MySQL/Drizzle/Prisma, SQLite/Drizzle/Prisma, Supabase variants, none)
4. Supabase configuration (if selected):
   - Preset: full-stack, auth-only, database-only, or custom
   - Features: auth, storage, realtime, edge-functions, database
5. Authentication system (better-auth, NextAuth.js, Supabase, none) - for API/Full-stack presets
6. Redis cache/session store (yes/no) - for API/Full-stack presets
7. Bun.secrets for environment variables (yes/no) - all presets
8. Code quality tool (Ultracite, Biome)
9. TypeScript strictness level (strict, moderate, loose)
10. CSS framework (Tailwind, Vanilla, CSS Modules)
11. UI library (shadcn/ui with full customization, none)
12. shadcn/ui options (if selected):
    - Style: new-york, default
    - Base color: neutral, gray, zinc, stone, slate
    - Border radius: customizable
13. Testing framework (Bun Test, Vitest, none)
14. Docker configuration (yes/no)
15. CI/CD setup (yes/no)
16. Install dependencies? (default: yes)
17. Initialize git? (default: yes)

**Save your configuration as a preset:**
```bash
bunkit init --save-preset my-api-preset
```

**Reuse saved presets:**
```bash
bunkit init --load-preset my-api-preset
bunkit preset list
bunkit preset delete my-api-preset
```

### `bunkit create <preset> <name>`

Quick, non-interactive project creation.

```bash
bunkit create web my-app
bunkit create api my-api --no-git
bunkit create full my-saas --no-install
```

**Options:**
- `--name <name>` - Project name
- `--preset <preset>` - Preset type (minimal, web, api, bun-api, bun-fullstack, full, monorepo-bun)
- `--database <database>` - Database option (postgres-drizzle, postgres-prisma, mysql-drizzle, mysql-prisma, supabase, supabase-drizzle, supabase-prisma, sqlite-drizzle, sqlite-prisma, none)
- `--auth <auth>` - Authentication system (better-auth, nextauth, supabase, none)
- `--redis` - Enable Redis cache/session store
- `--use-bun-secrets` - Use Bun.secrets API instead of .env files
- `--supabase-preset <preset>` - Supabase preset (full-stack, auth-only, database-only, custom)
- `--supabase-features <features>` - Comma-separated Supabase features (auth,storage,realtime,edge-functions,database)
- `--code-quality <tool>` - Code quality tool (ultracite, biome)
- `--ts-strictness <level>` - TypeScript strictness (strict, moderate, loose)
- `--ui-library <library>` - UI library (shadcn, none)
- `--css-framework <framework>` - CSS framework (tailwind, vanilla, css-modules)
- `--shadcn-style <style>` - shadcn/ui style (new-york, default)
- `--shadcn-base-color <color>` - shadcn/ui base color (neutral, gray, zinc, stone, slate)
- `--shadcn-radius <radius>` - shadcn/ui border radius (e.g., 0.5rem, 8px)
- `--testing <framework>` - Testing framework (bun-test, vitest, none)
- `--docker` - Include Docker configuration
- `--cicd` - Include GitHub Actions CI/CD
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation
- `--non-interactive` - Run without prompts (requires all options)

### `bunkit add <feature>` (or `bunkit a`)

Extend your monorepo with new workspaces, shared packages, or shadcn/ui components.

```bash
# Use the alias
bunkit a workspace
bunkit a package
bunkit a component
```

**Available features:**

**1. Workspace** - Add a new workspace to monorepo
```bash
bunkit add workspace              # Interactive mode
bunkit add workspace --name apps/admin --preset nextjs
bunkit add workspace --name apps/docs --preset nextjs
bunkit add workspace --name apps/api --preset hono
```

**2. Package** - Add a shared package to monorepo
```bash
bunkit add package                # Interactive mode
bunkit add package --name @myapp/email --type library
bunkit add package --name utils --type utils
bunkit add package --name types --type types
```

**3. Component** - Add shadcn/ui components (requires shadcn/ui setup)
```bash
# Add specific components
bunkit add component --components button,card,input

# Browse all available components interactively
bunkit add component --all
```

**Examples:**
```bash
# Create a full-stack monorepo
bunkit init full my-saas
cd my-saas

# Add admin dashboard workspace
bunkit add workspace --name apps/admin --preset nextjs

# Add shared email package
bunkit add package --name @myapp/email --type library

# Add shared types package
bunkit add package --name @myapp/types --type types

# Use shared packages in workspaces
# apps/admin/package.json:
# "dependencies": {
#   "@myapp/email": "workspace:*",
#   "@myapp/types": "workspace:*"
# }
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
| Frontend | Next.js | 16.0.3+ |
| React | React | 19.2.0+ |
| Backend | Hono | 4.10.6+ |
| Database | Drizzle ORM | 0.44.7+ |
| Database | Supabase JS | 2.81.1+ |
| Styling | Tailwind CSS | 4.1.17+ |
| UI Components | shadcn/ui | Latest |
| Language | TypeScript | 5.9.3+ |
| Code Quality | Biome / Ultracite | 2.3.6+ / 6.0.1+ |
| Testing | Bun Test / Vitest | Built-in / 2.0.0+ |

## 💡 Philosophy

**bunkit** is built on these principles:

1. **Architecture, Not Product** - Provides foundation and structure, not business logic
2. **Bun-First** - Leverages Bun 1.3+ features (catalogs, isolated installs, workspaces)
3. **Monorepo Expertise** - Makes Bun monorepos easy and maintainable
4. **Type Safety** - Strict TypeScript everywhere, proper project references
5. **Modern Stack** - Latest stable versions (Next.js 16, React 19, Hono, Tailwind 4)
6. **Developer Experience** - Beautiful CLI, hot reload, clear conventions

## 🔄 Comparison

| Feature | bunkit | create-next-app | create-t3-app | turborepo |
|---------|--------|----------------|---------------|-----------|
| Bun-native | ✅ | ❌ | ❌ | ⚠️ |
| Workspace management | ✅ | ❌ | ❌ | ⚠️ (manual) |
| Shared packages | ✅ | ❌ | ❌ | ⚠️ (manual) |
| Dependency catalogs | ✅ | ❌ | ❌ | ❌ |
| Isolated installs | ✅ | ❌ | ❌ | ❌ |
| Multiple presets | ✅ (7) | ❌ (1) | ✅ | ❌ |
| No Next.js options | ✅ (3 presets) | ❌ | ❌ | ❌ |
| API backend | ✅ Hono | ❌ | ✅ tRPC | ❌ |
| Interactive CLI | ✅ | ✅ | ✅ | ⚠️ |

**bunkit's unique value:** Bun monorepo management made easy. Nobody else does this well.

## 📝 Versioning & Releases

bunkit uses [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management.

### Version History

- **v0.9.0** (Current) - Bun 1.3 integration, database expansion, auth systems, and "buffet libre" CLI
- **v0.8.0** - Major release with Supabase integration and CLI improvements
  - Complete Supabase integration with presets and granular feature selection
  - New database options: `supabase` (client-only) and `supabase-drizzle` (with Drizzle ORM)
  - Supabase presets: full-stack, auth-only, database-only, and custom
  - Configurable Supabase features: auth, storage, realtime, edge-functions, database
  - All major dependencies updated to latest stable versions
  - Dependency management scripts (`update-deps`, `check-deps`)
  - Significantly improved CLI developer experience and visual polish
  - Enhanced banner, progress messages, and configuration summaries
  - Professional nomenclature improvements across all commands
  - Command aliases (init|i, create|c, add|a)

- **v0.7.0** - Deep shadcn/ui integration
  - Full theme system with 5 base colors (neutral, gray, zinc, stone, slate) and OKLCH color values
  - Style options (new-york, default) configurable via CLI
  - Customizable border radius
  - Automatic installation of default components (button, card)
  - New `bunkit add component` command for adding shadcn/ui components
  - Example components and comprehensive documentation

- **v0.6.0** - Workspace and package management
  - `bunkit add workspace` command - Add Next.js, Hono, or library workspaces to monorepos
  - `bunkit add package` command - Add shared packages (library, utils, types, config) to monorepos
  - Monorepo detection and validation utilities
  - Automatic catalog integration for new workspaces and packages
  - TypeScript project references support

- **v0.5.0** - Major customization update
  - Database integration (PostgreSQL/Drizzle, Supabase, SQLite)
  - Ultracite AI-optimized code quality (.cursorrules, .windsurfrules, CLAUDE.md)
  - Docker support (multi-stage builds with Bun official images)
  - GitHub Actions CI/CD (lint, typecheck, test, build, docker)
  - TypeScript strictness levels (strict, moderate, loose)
  - Testing framework options (bun-test, vitest)
  - Bun dependency catalog implementation

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

### Keeping Dependencies Updated

bunkit maintains all dependencies at their latest stable versions. To keep your project dependencies up to date:

**Check for outdated dependencies:**
```bash
bun run check-deps
```

**Update all dependencies to latest versions:**
```bash
bun run update-deps
```

This will:
- Update all dependencies to their latest compatible versions
- Update the lockfile (`bun.lock`)
- Verify everything still builds correctly

**Note:** Major version updates (e.g., Zod 3 → 4, Vitest 2 → 4) are kept at stable versions to avoid breaking changes. These are updated manually after thorough testing.

### Roadmap

**Current (v0.8.0)**
- ✅ Core CLI functionality
- ✅ All 4 presets working (minimal, web, api, full)
- ✅ Beautiful interactive experience
- ✅ Automated CI/CD with GitHub Actions
- ✅ Semantic versioning with Changesets
- ✅ **Complete Supabase integration** - Full-stack, auth-only, database-only, and custom presets with granular feature selection
- ✅ Database setup (PostgreSQL, Supabase, SQLite) - structure only
- ✅ AI-optimized code quality (Ultracite)
- ✅ Docker support (multi-stage builds)
- ✅ GitHub Actions workflows
- ✅ Dependency catalog management
- ✅ Enhanced `bunkit init` with 12+ customization prompts
- ✅ `bunkit add workspace` - Add workspaces to monorepo
- ✅ `bunkit add package` - Add shared packages
- ✅ **Deep shadcn/ui integration** - Complete UI component system
  - 5 base color themes with OKLCH color values
  - Style options (new-york, default)
  - Customizable border radius
  - Auto-installation of default components
  - `bunkit add component` command
  - Example components and documentation
- ✅ Dependency management scripts (`update-deps`, `check-deps`)
- ✅ Enhanced CLI developer experience with improved visuals and messaging

**v0.9.0** (Current) - Bun 1.3 Integration, Database Expansion & Auth Systems 🚀
- ✅ **Prisma ORM support** - Full Prisma integration as alternative to Drizzle (PostgreSQL, MySQL, SQLite)
- ✅ **MySQL & Redis support** - Native Bun 1.3 clients (MySQL + Drizzle/Prisma, Redis for caching/sessions)
- ✅ **Authentication systems** - better-auth and NextAuth.js integration with database adapters
- ✅ **Enhanced Hono defaults** - Comprehensive middleware, utilities, and patterns for faster iteration
- ✅ **Bun.secrets integration** - Secure credential management using Bun.secrets API with type-safe helpers
- ✅ **New presets** - `bun-api` (Bun.serve() native), `bun-fullstack` (Bun.serve() + HTML imports), `monorepo-bun` (monorepo without Next.js)
- ✅ **"Buffet libre" CLI** - Fully interactive `bunkit init` with 21+ configuration prompts
- ✅ **Custom presets** - Save and reuse project configurations (`bunkit preset save/load/list/delete`)
- ✅ `bunkit catalog add` - Manage catalog dependencies
- ✅ `bunkit catalog sync` - Sync versions across workspaces
- ✅ **VSCode debugging** - Complete debugging configuration with launch.json, settings.json, extensions.json
- ✅ **bunfig.toml defaults** - Comprehensive Bun configuration with customizable defaults
- ✅ Improved Bun.serve() configuration with full-stack dev server features

**v1.0.0 - Type Safety & Advanced Features**
- `bunkit add trpc` - tRPC setup for type-safe APIs
- `bunkit generate types` - Generate types from schema
- Enhanced workspace TypeScript project references
- Example projects
- Production-ready monorepo toolkit
- Full test coverage
- Complete documentation

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
