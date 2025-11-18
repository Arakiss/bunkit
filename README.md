# bunkit 🍞

> Bake production-ready apps in seconds | Modern CLI tool for Bun monorepo scaffolding

**bunkit** is a modern, opinionated CLI tool for scaffolding Bun-powered projects with enterprise-grade patterns built-in. Create production-ready full-stack applications, APIs, monorepos, and web apps with Next.js, Hono, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Prisma ORM, MySQL, Redis, Supabase, better-auth, NextAuth.js, and more in seconds.

[![npm version](https://img.shields.io/npm/v/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli) [![npm downloads](https://img.shields.io/npm/dm/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli) [![License](https://img.shields.io/npm/l/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli) [![Bun](https://img.shields.io/badge/bun-1.3+-orange.svg)](https://bun.sh) [![Status](https://img.shields.io/badge/status-stable-green.svg)](./packages/cli/CHANGELOG.md) [![CI/CD](https://github.com/Arakiss/bunkit/actions/workflows/release.yml/badge.svg)](https://github.com/Arakiss/bunkit/actions/workflows/release.yml) [![GitHub stars](https://img.shields.io/github/stars/Arakiss/bunkit)](https://github.com/Arakiss/bunkit) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

> **✨ Stable Release**: bunkit is production-ready and actively maintained. See [CHANGELOG](./packages/cli/CHANGELOG.md) for latest updates and [ROADMAP](./ROADMAP.md) for planned features.

## ✨ Features

### Core Architecture
- 🏗️ **Monorepo Architecture** - Bun workspaces + catalogs + isolated installs done right
- 🎨 **Beautiful Interactive CLI** - Built with @clack/prompts (same as Astro) with 21+ configuration prompts
- 📦 **Modern Stack** - Next.js 16, React 19, Hono, Tailwind CSS 4
- ⚡ **Bun-Native** - Leverages Bun 1.3+ features (catalogs, isolated installs, HMR)
- 🔒 **Type-Safe by Default** - TypeScript strict mode everywhere (configurable: strict, moderate, loose)
- 🛠️ **Shared TypeScript Tooling** - Centralized TypeScript configurations (`tooling/typescript/`) for consistent setup

### Database & ORM Support
- 🗄️ **PostgreSQL** - With Drizzle ORM or Prisma ORM
- 🗄️ **MySQL** - Native Bun 1.3 MySQL client with Drizzle ORM or Prisma ORM
- 🗄️ **SQLite** - With Drizzle ORM or Prisma ORM
- 🗄️ **Supabase** - Complete integration with presets (full-stack, auth-only, database-only, custom)
  - Configurable features: auth, storage, realtime, edge-functions, database
  - With or without Drizzle ORM / Prisma ORM

### Authentication Systems
- 🔐 **better-auth** - Modern, flexible authentication library with database adapters
- 🔐 **NextAuth.js** - Popular Next.js authentication solution with database adapters
- 🔐 **Supabase Auth** - Built-in Supabase authentication

### Infrastructure & Caching
- ⚡ **Redis Support** - Native Bun 1.3 Redis client for caching and session storage
- 🔑 **Bun.secrets** - Secure credential management using Bun.secrets API (alternative to .env files)

### UI & Styling
- 🎭 **shadcn/ui Integration** - Complete UI component system with themes, customization, and auto-installation
  - 5 base color themes (neutral, gray, zinc, stone, slate) with OKLCH color values
  - Style options (new-york, default)
  - Customizable border radius
  - Auto-installed default components
  - `bunkit add component` command for adding components
- 🎨 **CSS Frameworks** - Tailwind CSS 4, Vanilla CSS, CSS Modules

### Developer Experience
- 🤖 **AI-Optimized** - Ultracite integration (Cursor, Windsurf, Claude Code, Zed) - Official Ultracite structure with proper presets
- 🐛 **Bun Debugging** - Complete debugging support with WebKit Inspector Protocol
  - **Interactive Debugging** - `bun --inspect` for WebSocket-based debugging
  - **Break on Start** - `bun --inspect-brk` to pause at first line
  - **Wait for Debugger** - `bun --inspect-wait` to wait for debugger attachment
  - **VSCode Integration** - Complete `.vscode/launch.json` with Bun debugger configurations
  - **Network Debugging** - `BUN_CONFIG_VERBOSE_FETCH` for debugging fetch/node:http requests
    - Set to `curl` to print requests as curl commands
    - Set to `true` to print request & response info
  - **Sourcemaps** - Automatic sourcemap generation for TypeScript/JSX
  - **V8 Stack Traces** - Node.js-compatible stack traces with V8 Stack Trace API
  - **Pre-configured Scripts** - `debug`, `debug:brk`, `debug:wait` scripts in all presets
- 💾 **Custom Presets** - Save and reuse project configurations (`bunkit preset save/load/list/delete`)
- 📚 **Dependency Catalog** - Centralized version management (`bunkit catalog add/sync/list`)
- 🎯 **Workspace Management** - Add workspaces and shared packages easily (`bunkit add workspace/package`)
- ⚙️ **Bun Configuration Defaults** - Comprehensive `bunfig.toml` with sensible defaults
  - Package installation settings (auto-install, isolated installs for monorepos)
  - Test runner configuration (coverage, reporters, thresholds)
  - Runtime configuration (log levels, telemetry, console depth)
  - Script execution settings (shell, node aliasing)
  - Fully documented with inline comments and debugging tips

### DevOps & Quality
- 🐳 **Docker Ready** - Complete Docker setup for local development and production
  - **Multi-stage Dockerfiles** - Optimized builds with Bun official images
  - **Docker Compose** - Full local development stack with all dependencies
  - **Supabase Local** - Complete Supabase stack (PostgreSQL, Auth, Storage, Realtime, Studio) when using Supabase
  - **Redis Local** - Redis container for caching and sessions when enabled
  - **Database Containers** - PostgreSQL, MySQL, or SQLite containers based on configuration
  - **Network Isolation** - Proper Docker networks for service communication
  - **Production Ready** - Non-root user, optimized layers, proper caching
- 🔄 **CI/CD Built-in** - GitHub Actions workflows with lint/test/build/docker
- 🧪 **Testing Frameworks** - Bun Test (built-in) or Vitest
- 📝 **Code Quality** - Biome or Ultracite for linting and formatting

### Enterprise Features
- 🏢 **Enterprise Patterns** - Monorepo architecture, shared packages, proper structure
- 📦 **8 Production-Ready Presets** - From minimal to enterprise monorepo
- 🔧 **Individual Dev Scripts** - Run specific apps/services independently (`dev:web`, `dev:app`, `dev:platform`, etc.)

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

- [Bun](https://bun.sh) v1.3.0 or higher (required for catalogs, isolated installs, MySQL, Redis)
- Node.js v20.9.0 or higher (required for Next.js 16)

## 📦 Presets

bunkit offers **8 presets** with clear, descriptive names following the pattern `{framework}-{architecture}`. All presets support aliases for backwards compatibility.

### Preset Naming Convention

- **Framework**: `nextjs`, `hono-api`, `bun-api`, `bun-fullstack`
- **Architecture**: (none) = single repo, `monorepo` = monorepo structure
- **Aliases**: Old names still work (`web` → `nextjs`, `api` → `hono-api`, `full` → `nextjs-monorepo`)

---

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

### `nextjs` - Next.js 16 Frontend (Single Repo)

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
bunkit create nextjs my-app
# Alias: bunkit create web my-app
cd my-app
bun install  # If --no-install was used
bun dev
```

**Use cases:** Landing pages, marketing sites, SaaS frontends, web applications

---

### `hono-api` - Hono Backend (Single Repo)

Lightning-fast API built with Hono and Bun.serve() with native HMR.

**What you get:**
- Hono v4 web framework
- Bun.serve() with HMR enabled
- Example routes and middleware
- CORS and logging configured
- Error handling patterns
- TypeScript with Bun types

```bash
bunkit create hono-api my-api
# Alias: bunkit create api my-api
cd my-api
bun run dev
```

**Use cases:** REST APIs, GraphQL servers, webhooks, backend services

---

### `bun-api` - Bun.serve() Native API (Single Repo, No Dependencies)

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

### `bun-fullstack` - Bun.serve() + HTML Imports (Single Repo, No Next.js)

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

### `nextjs-monorepo` - Full-Stack Monorepo (Next.js + Hono)

Enterprise-grade monorepo with Next.js frontend, Hono backend, and shared packages.

**What you get:**
- Bun workspaces configured
- Dependency catalogs (centralized versions)
- Isolated installs (no phantom deps)
- Apps:
  - `apps/web/` - Next.js frontend (customer-facing)
  - `apps/platform/` - Next.js admin dashboard (port 3001)
  - `apps/api/` - Hono backend API
- Packages:
  - `packages/types/` - Shared TypeScript types
  - `packages/utils/` - Shared utilities
- **Shared tooling:**
  - `tooling/typescript/` - Shared TypeScript configurations
- Biome for code quality
- Proper TypeScript project references
- Individual dev commands per app

```bash
bunkit create nextjs-monorepo my-saas
# Aliases: bunkit create full my-saas
#          bunkit create monorepo-nextjs my-saas
cd my-saas
bun install
bun dev  # Starts all apps

# Or start individually:
bun run dev:web       # Start customer-facing app
bun run dev:platform  # Start admin dashboard
bun run dev:api       # Start backend API
```

**Use cases:** SaaS products, full-stack applications, multi-app projects

---

### `bun-monorepo` - Monorepo with Bun.serve() (No Next.js)

Enterprise monorepo using Bun.serve() for both frontend and backend - no Next.js required.

**What you get:**
- Bun workspaces configured
- Apps:
  - `apps/web/` - Bun.serve() + HTML imports (React frontend)
  - `apps/api/` - Bun.serve() native API
- Packages:
  - `packages/types/` - Shared TypeScript types
  - `packages/utils/` - Shared utilities
- **Shared tooling:**
  - `tooling/typescript/` - Shared TypeScript configurations
- All Bun-native, no Next.js
- Individual dev commands per app

```bash
bunkit create bun-monorepo my-saas
# Alias: bunkit create monorepo-bun my-saas
cd my-saas
bun install
bun dev  # Starts all apps

# Or start individually:
bun run dev:web    # Start web app
bun run dev:api    # Start API server
```

**Use cases:** Full-stack monorepos without Next.js, Bun-native architectures

---

### `enterprise-monorepo` - Enterprise Monorepo (Multiple Apps + Services)

Enterprise-grade monorepo with multiple Next.js applications and microservices - perfect for complex SaaS platforms.

**What you get:**
- **Multiple Next.js apps:**
  - `apps/web/` - Marketing/Landing site (port 3000)
  - `apps/app/` - Main SaaS product application (port 3002)
  - `apps/platform/` - Admin dashboard (port 3001)
- **Microservices:**
  - `apps/service-identity/` - Identity & authentication service (port 3003)
- **Shared packages:**
  - `packages/types/` - Shared TypeScript types
  - `packages/utils/` - Shared utilities
  - `packages/ui/` - Shared UI components (shadcn/ui)
  - `packages/db/` - Shared database schema (if configured)
- **Shared tooling:**
  - `tooling/typescript/` - Shared TypeScript configurations
- Bun workspaces configured
- Dependency catalogs (centralized versions)
- Individual dev commands per app/service
- Ready for microservices architecture

```bash
bunkit create enterprise-monorepo my-platform
cd my-platform
bun install
bun dev  # Starts all apps and services

# Or start individually:
bun run dev:web         # Start marketing site
bun run dev:app         # Start main product app
bun run dev:platform    # Start admin dashboard
bun run dev:identity    # Start identity service
```

**Use cases:** Enterprise SaaS platforms, multi-tenant applications, complex architectures with multiple apps and services

**Adding more services:**
```bash
# Add a new service
bunkit add workspace --name apps/service-payments --preset hono

# Add another Next.js app
bunkit add workspace --name apps/docs --preset nextjs
```

## 🎯 Commands

### `bunkit init` (or `bunkit i`)

Interactive project creation with beautiful prompts.

```bash
bunkit init
# Alias: bunkit i
```

You'll be guided through **21+ interactive prompts** à la carte - choose exactly what you need:

1. Project name
2. Preset type (minimal/nextjs/hono-api/bun-api/bun-fullstack/nextjs-monorepo/bun-monorepo/enterprise-monorepo)
   - All old names still work: `web` → `nextjs`, `api` → `hono-api`, `full` → `nextjs-monorepo`
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

**Options:**
- `--name <name>` - Project name (kebab-case recommended)
- `--preset <preset>` - Preset type (minimal, nextjs, hono-api, bun-api, bun-fullstack, nextjs-monorepo, bun-monorepo, enterprise-monorepo)
- `--database <database>` - Database option (postgres-drizzle, postgres-prisma, mysql-drizzle, mysql-prisma, supabase, supabase-drizzle, supabase-prisma, sqlite-drizzle, sqlite-prisma, none)
- `--auth <auth>` - Authentication system (better-auth, nextauth, supabase, none) - for API/Full-stack presets
- `--redis` - Enable Redis cache/session store - for API/Full-stack presets
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
- `--non-interactive` - Run without prompts (requires all options via flags)
- `--save-preset <name>` - Save current configuration as a custom preset
- `--load-preset <name>` - Load configuration from a custom preset

**Examples:**
```bash
# Interactive mode (recommended)
bunkit init

# Quick creation with preset
bunkit init --name my-app --preset nextjs

# Full customization via flags
bunkit init --name my-saas --preset nextjs-monorepo --database supabase --docker --cicd

# Save configuration as preset
bunkit init --save-preset my-api-preset

# Load saved preset
bunkit init --load-preset my-api-preset
```

### `bunkit create <preset> <name>` (or `bunkit c`)

Quick, non-interactive project creation with sensible defaults.

```bash
bunkit create nextjs my-app
# Alias: bunkit c nextjs my-app
bunkit create hono-api my-api --no-git
bunkit create nextjs-monorepo my-saas --no-install
# Aliases still work: bunkit create web my-app
```

**Options:**
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation

**Note:** This command uses sensible defaults. Use `bunkit init` for full customization with all options.

**Presets:**
- `minimal` - Single-file Bun project
- `nextjs` - Next.js 16 + React 19 web application (single repo)
- `hono-api` - Hono 4 + Bun.serve() API server (single repo)
- `bun-api` - Bun.serve() native routing (zero dependencies, single repo)
- `bun-fullstack` - Bun.serve() + HTML imports (no Next.js, single repo)
- `nextjs-monorepo` - Monorepo with Next.js + Hono
- `bun-monorepo` - Monorepo with Bun.serve() (no Next.js)
- `enterprise-monorepo` - Enterprise monorepo with multiple apps and services

**Aliases (backwards compatible):**
- `web` → `nextjs`
- `api` → `hono-api`
- `full` → `nextjs-monorepo`
- `monorepo-bun` → `bun-monorepo`

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

**Options:**
- `--name <name>` - Feature name (e.g., apps/admin, @myapp/utils, button)
- `--preset <preset>` - Workspace preset (nextjs, hono, library) - for workspace feature
- `--type <type>` - Package type (library, utils, types, config) - for package feature
- `--components <components>` - Comma-separated component names (e.g., button,card,input) - for component feature
- `--all` - Show interactive component browser - for component feature

**Examples:**
```bash
# Create a full-stack monorepo
bunkit init --preset nextjs-monorepo --name my-saas
cd my-saas

# Add admin dashboard workspace
bunkit add workspace --name apps/admin --preset nextjs

# Add shared email package
bunkit add package --name @myapp/email --type library

# Add shared types package
bunkit add package --name @myapp/types --type types

# Add shadcn/ui components
bunkit add component --components button,card,input

# Use shared packages in workspaces
# apps/admin/package.json:
# "dependencies": {
#   "@myapp/email": "workspace:*",
#   "@myapp/types": "workspace:*"
# }
```

### `bunkit preset`

Manage custom presets - save and reuse project configurations.

```bash
# List all custom presets
bunkit preset list

# Delete a custom preset
bunkit preset delete <name>

# Save preset (use during init flow)
bunkit init --save-preset <name>

# Load preset
bunkit init --load-preset <name>
```

**Subcommands:**
- `list` - List all custom presets
- `delete [name]` - Delete a custom preset (interactive if name not provided)
- `save [name]` - Save current configuration (use `bunkit init --save-preset` instead)

**Examples:**
```bash
# List all saved presets
bunkit preset list

# Delete a preset interactively
bunkit preset delete

# Delete a specific preset
bunkit preset delete my-api-preset

# Save a preset during init
bunkit init --save-preset my-custom-preset

# Use a saved preset
bunkit init --load-preset my-custom-preset
```

### `bunkit catalog` (or `bunkit cat`)

Manage dependency catalog for version synchronization across monorepo workspaces.

```bash
# Alias: bunkit cat
bunkit catalog add <package> [version]
bunkit catalog sync
bunkit catalog list
```

**Subcommands:**

**1. `add <package> [version]`** - Add package to catalog
```bash
# Interactive mode
bunkit catalog add

# Add with version
bunkit catalog add zod ^3.24.1
bunkit catalog add hono ^4.10.6
bunkit catalog add @prisma/client latest
```

**2. `sync`** - Sync catalog versions across all workspaces
```bash
bunkit catalog sync
```
Updates all workspace `package.json` files to use `catalog:` for packages that exist in the catalog.

**3. `list`** - List all packages in catalog
```bash
bunkit catalog list
```

**How it works:**
1. Add packages to catalog in root `package.json`:
   ```json
   {
     "catalog": {
       "react": "^19.1.0",
       "hono": "^4.10.6"
     }
   }
   ```

2. Reference in workspace `package.json`:
   ```json
   {
     "dependencies": {
       "react": "catalog:",
       "hono": "catalog:"
     }
   }
   ```

3. Sync versions across all workspaces:
   ```bash
   bunkit catalog sync
   ```

**Examples:**
```bash
# Add packages to catalog
bunkit catalog add react ^19.1.0
bunkit catalog add next ^16.0.0
bunkit catalog add hono ^4.10.6

# List catalog contents
bunkit catalog list

# Sync versions across workspaces
bunkit catalog sync
bun install  # Update lockfile
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

### Full Preset (nextjs-monorepo)

```
my-saas/
├── apps/
│   ├── web/          # Next.js frontend (customer-facing)
│   ├── platform/     # Next.js admin dashboard (port 3001)
│   └── api/          # Hono API backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
├── tooling/
│   └── typescript/   # Shared TypeScript configurations
├── package.json      # Root with catalogs
├── bunfig.toml
├── tsconfig.json
└── README.md
```

### Enterprise Monorepo Preset

```
my-platform/
├── apps/
│   ├── web/               # Marketing/Landing site (port 3000)
│   ├── app/               # Main SaaS product (port 3002)
│   ├── platform/          # Admin/Dashboard (port 3001)
│   └── service-identity/  # Identity service API (port 3003)
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Shared utilities
│   ├── ui/                # Shared UI components (shadcn/ui)
│   └── db/                # Shared database schema (if configured)
├── tooling/
│   └── typescript/        # Shared TypeScript configurations
├── package.json           # Root with catalogs
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
| Code Quality | Biome / Ultracite | 2.3.6+ / 6.3.4+ |
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

| Feature | bunkit | create-next-app | create-t3-app | turborepo | v1 |
|---------|--------|----------------|---------------|-----------|-----|
| Bun-native | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| Workspace management | ✅ | ❌ | ❌ | ⚠️ (manual) | ✅ (Turborepo) |
| Shared packages | ✅ | ❌ | ❌ | ⚠️ (manual) | ✅ |
| Dependency catalogs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Isolated installs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multiple presets | ✅ (8) | ❌ (1) | ✅ | ❌ | ❌ (1) |
| No Next.js options | ✅ (3 presets) | ❌ | ❌ | ❌ | ❌ |
| API backend | ✅ Hono | ❌ | ✅ tRPC | ❌ | ❌ |
| Interactive CLI | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Monorepo tooling | ✅ Bun workspaces | ❌ | ❌ | ✅ Turborepo | ✅ Turborepo |

**bunkit's unique value:** Bun-native monorepo management with dependency catalogs and isolated installs. Perfect for Bun-first projects that want enterprise patterns without Turborepo complexity.

## 📝 Versioning & Releases

bunkit uses [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management.

### Recent Releases

- **v1.0.0** (Current) - Enterprise-grade monorepo improvements, shared TypeScript tooling, enhanced scripts
- **v0.9.0** - Bun 1.3 integration, database expansion (Prisma, MySQL, Redis), auth systems, à la carte CLI
- **v0.8.0** - Complete Supabase integration with presets and granular feature selection

See [CHANGELOG](./packages/cli/CHANGELOG.md) for complete version history and [CONTRIBUTING.md](./CONTRIBUTING.md) for release process details.

### Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete roadmap and planned features.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT © [Arakiss](https://github.com/Arakiss)

## 🙏 Acknowledgments

- [@clack/prompts](https://www.clack.cc/) - Beautiful CLI prompts by the Astro team
- [create-t3-app](https://create.t3.gg/) - Inspiration for modular approach
- [v1](https://github.com/midday-ai/v1) - Inspiration for SaaS starter patterns and architecture
- [Bun](https://bun.sh) - The amazing all-in-one JavaScript runtime

---

**Made with ❤️ for the indie hacker community** | [GitHub](https://github.com/Arakiss/bunkit) | [Issues](https://github.com/Arakiss/bunkit/issues)
