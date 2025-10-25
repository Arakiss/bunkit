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
- **Modular Features** - Add auth, database, payments, and more on demand
- **Modern Stack** - Next.js 16, React 19, Hono, Drizzle ORM, TypeScript 5
- **Monorepo Ready** - Bun workspaces with dependency catalogs
- **Zero Config** - Smart defaults, fully customizable

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
- Feature selection (auth, database, payments, etc.)
- Package manager preference
- Git initialization

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

Add features to an existing project.

```bash
bunkit add <feature> [options]

# Options:
  --provider <provider>  Specify provider (e.g., supabase, stripe)
```

**Available Features:**

- `auth` - Authentication (Supabase Auth, NextAuth, etc.)
- `database` - Database with Drizzle ORM (PostgreSQL, MySQL, SQLite)
- `ui` - UI components with shadcn/ui + Tailwind CSS 4
- `payments` - Payment integration (Stripe, Paddle)
- `email` - Email service (Resend, Nodemailer)
- `storage` - File storage (Supabase Storage, S3)

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

### Add Authentication to Existing Project

```bash
cd my-project
bunkit add auth --provider supabase
```

### Add UI Components

```bash
bunkit add ui
# Installs shadcn/ui with Tailwind CSS 4 and iconoir-react icons
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
- **UI Components:** shadcn/ui with iconoir-react icons
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

- **Quality First** - Enterprise-grade code from day one
- **Type Safety** - Strict TypeScript everywhere
- **Performance** - Native Bun APIs, minimal dependencies
- **Developer Experience** - Fast iteration with HMR
- **Modern Stack** - Latest stable versions only

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
