# bunkit-cli

<div align="center">

```
  ____              _    _ _
 |  _ \            | |  (_) |
 | |_) |_   _ _ __ | | ___| |_
 |  _ <| | | | '_ \| |/ / | __|
 | |_) | |_| | | | |   <| | |_
 |____/ \__,_|_| |_|_|\_\_|\__|

    🍞 Bake production-ready apps in seconds

    Modern • Fast • Opinionated
```

[![npm version](https://img.shields.io/npm/v/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.3+-black)](https://bun.sh)

**Beautiful CLI for creating production-ready Bun projects**

[Features](#features) • [Installation](#installation) • [Commands](#commands) • [Examples](#examples) • [Repository](https://github.com/Arakiss/bunkit)

</div>

---

## Features

- **Lightning Fast** - Powered by Bun runtime for instant scaffolding
- **Interactive CLI** - Beautiful prompts powered by @clack/prompts (same as Astro)
- **Multiple Presets** - Choose from minimal, web, api, or full-stack templates
- **shadcn/ui Integration** - Complete UI component system with themes and customization
- **Workspace Management** - Add workspaces and shared packages to monorepos
- **Modern Stack** - Next.js 16, React 19, Hono, Drizzle ORM, TypeScript 5
- **Monorepo Expertise** - Bun workspaces with dependency catalogs and isolated installs
- **Architecture First** - Provides foundation and structure, not business logic

## Installation

### Global Installation (Recommended)

```bash
bun install -g bunkit-cli
```

### Or use with bunx (No installation)

```bash
bunx bunkit-cli@latest init
```

## Commands

### `bunkit init`

Create a new project interactively with beautiful prompts.

```bash
bunkit init
```

You'll be guided through:
- Project name selection
- Preset choice (minimal, web, api, full)
- Database configuration:
  - PostgreSQL + Drizzle ORM
  - Supabase (Client Only) - with presets and feature selection
  - Supabase + Drizzle ORM - with presets and feature selection
  - SQLite + Drizzle ORM
  - None
- Supabase configuration (if Supabase selected):
  - Preset: full-stack, auth-only, database-only, or custom
  - Features: auth, storage, realtime, edge-functions, database
- Code quality tools (Ultracite, Biome)
- TypeScript strictness level
- CSS framework (Tailwind, Vanilla, CSS Modules)
- UI library (shadcn/ui with full customization)
  - Style (new-york, default)
  - Base color (neutral, gray, zinc, stone, slate)
  - Border radius
- Testing framework (Bun Test, Vitest, none)
- Docker configuration
- CI/CD setup
- Git initialization

#### Non-Interactive Mode (AI-Friendly)

Create projects without prompts using environment variables or CLI flags. Perfect for automation, CI/CD pipelines, and AI agents.

**Using Environment Variables (Highest Priority):**

```bash
# Full control via env vars
BUNKIT_PROJECT_NAME=my-app \
BUNKIT_PRESET=web \
BUNKIT_GIT=false \
BUNKIT_INSTALL=false \
BUNKIT_NON_INTERACTIVE=true \
bunkit init
```

**Using CLI Flags (Medium Priority):**

```bash
# Same result with flags
bunkit init --name my-app --preset web --no-git --no-install --non-interactive
```

**Available Environment Variables:**
- `BUNKIT_PROJECT_NAME` - Project name
- `BUNKIT_PRESET` - Preset type (minimal, web, api, full)
- `BUNKIT_GIT` - Initialize git (true/false, default: true)
- `BUNKIT_INSTALL` - Install dependencies (true/false, default: true)
- `BUNKIT_NON_INTERACTIVE` - Skip all prompts (true/false, default: false)

**Available CLI Flags:**
- `--name <name>` - Project name
- `--preset <preset>` - Preset type (minimal, web, api, full)
- `--database <database>` - Database option (postgres-drizzle, supabase, supabase-drizzle, sqlite-drizzle, none)
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

**Priority Order:**
1. Environment variables (highest)
2. CLI flags (medium)
3. Interactive prompts (lowest)

**Examples for AI Agents:**

```bash
# Claude Code can use this to create projects autonomously
env BUNKIT_PROJECT_NAME=saas-app \
    BUNKIT_PRESET=full \
    BUNKIT_GIT=true \
    BUNKIT_INSTALL=true \
    BUNKIT_NON_INTERACTIVE=true \
    bunkit init

# Or with flags for simplicity
bunkit init \
  --name saas-app \
  --preset full \
  --non-interactive
```

### `bunkit create`

Quickly create a project without prompts.

```bash
bunkit create <preset> <name> [options]

# Options:
  --no-git      Skip git initialization
  --no-install  Skip dependency installation
```

**Available Presets:**

- `minimal` - Bare Bun project with TypeScript
- `web` - Next.js 16 + React 19 frontend
- `api` - Hono backend with TypeScript
- `full` - Full-stack monorepo (web + api + shared packages)

### `bunkit add`

Extend your monorepo with new workspaces and shared packages.

```bash
bunkit add <feature> [options]

# Options:
  --name <name>      Name for the workspace or package
  --preset <preset>  Preset for workspace (nextjs, hono, library)
  --type <type>      Type for package (library, utils, types, config)
```

**Available Features:**

- `workspace` - Add a new workspace to monorepo (nextjs, hono, or library)
- `package` - Add a shared package to monorepo (library, utils, types, or config)
- `component` - Add shadcn/ui components to your project
  ```bash
  bunkit add component --components button,card,input
  bunkit add component --all  # Browse all available components
  ```

## Examples

### Create a Full-Stack Project

```bash
bunkit create full my-saas-app
cd my-saas-app
bun install
bun dev
```

### Create Next.js Frontend Only

```bash
bunkit create web my-landing-page
cd my-landing-page
bun dev
```

### Create Hono API Only

```bash
bunkit create api my-backend
cd my-backend
bun --hot src/index.ts
```

### Add Workspace to Monorepo

```bash
cd my-saas
bunkit add workspace --name apps/admin --preset nextjs
# Creates new Next.js workspace in apps/admin
```

### Add Shared Package to Monorepo

```bash
cd my-saas
bunkit add package --name @myapp/email --type library
# Creates shared package in packages/email
```

### Add shadcn/ui Components

```bash
# After creating a project with shadcn/ui configured
cd my-app

# Add specific components
bunkit add component --components button,card,input

# Browse all available components
bunkit add component --all

# Components are installed and ready to use!
# Import them: import { Button } from "@/components/ui/button"
```

## What You Get

### Full-Stack Monorepo Structure

```
my-app/
├── apps/
│   ├── web/              # Next.js 16 customer-facing app
│   ├── platform/         # Next.js 16 dashboard/admin
│   └── api/              # Hono backend with Bun.serve
├── packages/
│   ├── ui/               # Shared UI components (shadcn/ui)
│   ├── db/               # Database schema (Drizzle ORM)
│   ├── utils/            # Shared utilities
│   └── types/            # Shared TypeScript types
├── package.json          # Root with dependency catalogs
├── bunfig.toml           # Bun configuration
└── biome.json            # Code quality (linting + formatting)
```

### Tech Stack

- **Runtime:** Bun 1.3+ (fast, native TypeScript)
- **Monorepo:** Bun workspaces with dependency catalogs
- **Frontend:** Next.js 16 + React 19 (Server Components)
- **Backend:** Hono (ultra-fast web framework)
- **Database:** Drizzle ORM with native Bun drivers
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 (CSS-first configuration)
- **UI Components:** shadcn/ui - Complete component system
  - 5 base color themes (neutral, gray, zinc, stone, slate)
  - Style variants (new-york, default)
  - Customizable border radius
  - Auto-installed default components (button, card)
  - 60+ available components via `bunkit add component`
  - Example components and comprehensive documentation
- **Code Quality:** Biome (NO ESLint, NO Prettier)

## Why bunkit?

### For Indie Hackers

Ship your MVP in hours, not weeks. bunkit handles all the boring setup so you can focus on building your product.

### For Teams

Production-ready architecture from day one. Monorepo structure scales from prototype to enterprise.

### For Developers

Modern stack with zero legacy baggage. Bun runtime means fast installs, fast tests, fast everything.

## Requirements

- **Bun 1.3+** - [Install Bun](https://bun.sh)
- **Node.js 20.9+** (required for Next.js 16) - [Download](https://nodejs.org/)
- **Git** - For version control

## Philosophy

- **Architecture, Not Product** - Provides foundation and structure, not business logic
- **Bun-First** - Leverages Bun 1.3+ features (catalogs, isolated installs, workspaces)
- **Monorepo Expertise** - Makes Bun monorepos easy and maintainable
- **Type Safety** - Strict TypeScript everywhere, proper project references
- **Modern Stack** - Latest stable versions (Next.js 16, React 19, Hono, Tailwind 4)
- **Developer Experience** - Beautiful CLI, hot reload, clear conventions

## Community & Support

- **GitHub Repository:** [Arakiss/bunkit](https://github.com/Arakiss/bunkit)
- **Issues:** [Report bugs or request features](https://github.com/Arakiss/bunkit/issues)
- **License:** MIT

## Credits

Built with love for the indie hacker community.

Made possible by:
- [Bun](https://bun.sh) - Incredibly fast JavaScript runtime
- [@clack/prompts](https://github.com/natemoo-re/clack) - Beautiful CLI prompts
- [Next.js](https://nextjs.org) - React framework
- [Hono](https://hono.dev) - Ultra-fast web framework
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM

---

<div align="center">

**Don't Panic - your app is being baked** 🍞

</div>
