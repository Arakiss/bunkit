> ⚠️ **Archived** — The Bun scaffolding space is well-served by `bun create`, `create-next-app`, and maintained community templates. Keeping this repo maintained alone is not a good use of time. Kept for history.

# bunkit

> Production-ready Bun projects in seconds.

[![npm version](https://img.shields.io/npm/v/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![npm downloads](https://img.shields.io/npm/dm/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![CI](https://github.com/Arakiss/bunkit/actions/workflows/ci.yml/badge.svg)](https://github.com/Arakiss/bunkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

bunkit is a CLI that scaffolds Bun-powered projects with the right defaults. Pick a preset, answer a few questions, and get a working project with TypeScript, linting, testing, and your choice of database, auth, and UI already wired up.

```bash
bunx bunkit-cli init
```

## Presets

bunkit ships 8 presets covering single apps through enterprise monorepos.

### Single-app

| Preset | Stack | Use case |
|--------|-------|----------|
| `minimal` | Bun + TypeScript | CLIs, scripts, utilities |
| `nextjs` | Next.js 16 + React 19 + Tailwind CSS 4 | Web apps, landing pages |
| `hono-api` | Hono 4 + Bun.serve() | REST APIs with middleware |
| `bun-api` | Bun.serve() native routing | Zero-dependency APIs |
| `bun-fullstack` | Bun.serve() + React 19 + Tailwind CSS 4 | Full-stack without Next.js |

### Monorepo

| Preset | Structure | Use case |
|--------|-----------|----------|
| `nextjs-monorepo` | 2 Next.js apps + Hono API + shared packages | SaaS products |
| `bun-monorepo` | Bun.serve() web + API + shared packages | Full-stack without Next.js |
| `enterprise-monorepo` | 3 Next.js apps + identity service + shared packages | Multi-product platforms |

Monorepo presets generate a complete workspace structure:

```
my-app/
  apps/
    web/           # Customer-facing app
    platform/      # Admin dashboard
    api/           # Backend API
  packages/
    ui/            # Shared shadcn/ui components
    types/         # Shared TypeScript types
    utils/         # Shared utilities
```

## Quick start

```bash
# Interactive — walks you through every option
bunx bunkit-cli init

# Direct — skip prompts, use sensible defaults
bunx bunkit-cli create nextjs my-app
bunx bunkit-cli create nextjs-monorepo my-saas
```

### Example: SaaS with database and auth

```bash
bunkit init \
  --name my-saas \
  --preset nextjs-monorepo \
  --database supabase-drizzle \
  --auth better-auth \
  --docker --cicd
```

## Commands

```
bunkit init                        Interactive project creation
bunkit create <preset> <name>      Quick creation with defaults
bunkit add workspace               Add an app to a monorepo
bunkit add package                 Add a shared package
bunkit add component               Add shadcn/ui components
bunkit migrate <type>              Run shadcn/ui migrations (radix, rtl, icons)
bunkit catalog add <pkg> [version] Add a package to the dependency catalog
bunkit catalog sync                Sync catalog versions across workspaces
bunkit preset list                 List saved custom presets
```

Full CLI reference: [docs/CLI.md](./docs/CLI.md)

## What you can configure

Every option below is available as an interactive prompt or a CLI flag.

**Database** — Postgres, MySQL, or SQLite with Drizzle ORM or Prisma. Supabase with optional Drizzle overlay.

**Auth** — better-auth, NextAuth.js, or Supabase Auth.

**UI** — [shadcn/ui](https://ui.shadcn.com) with 10 visual styles across Radix UI and Base UI foundations. Default: `radix-maia` with [Iconoir](https://iconoir.com) icons.

**Code quality** — Biome or Ultracite. TypeScript strict mode by default.

**Testing** — Bun Test or Vitest.

**Infrastructure** — Docker multi-stage builds, GitHub Actions CI/CD, Redis caching, `.env` templates.

## shadcn/ui integration

bunkit generates a fully configured [shadcn/ui](https://ui.shadcn.com) setup with the February 2026 features:

- **10 styles** — 5 Radix UI (`radix-maia`, `radix-vega`, `radix-nova`, `radix-lyra`, `radix-mira`) and 5 Base UI variants
- **Unified `radix-ui` package** — no more 20+ individual `@radix-ui/react-*` imports
- **RTL support** — optional right-to-left layout for all components
- **Iconoir icons** — 1,600+ tree-shakeable icons as the default library
- **Monorepo-ready** — shared `packages/ui` with centralized components.json

Migrate existing projects:

```bash
bunkit migrate radix    # Upgrade to unified radix-ui package
bunkit migrate rtl      # Enable RTL support
bunkit migrate icons    # Switch icon library
```

## Bun monorepo features

bunkit takes advantage of Bun 1.3+ workspace features:

- **Dependency catalogs** — centralize versions in root `package.json`, reference with `"catalog:"` in workspaces
- **Isolated installs** — each workspace only accesses its declared dependencies
- **Workspace protocol** — `"workspace:*"` for local package linking

## Requirements

- [Bun](https://bun.sh) 1.3.0+
- Node.js 20.9.0+ (for Next.js presets)

## Documentation

- [CLI Reference](./docs/CLI.md) — all commands and flags
- [Presets Reference](./docs/PRESETS.md) — detailed preset descriptions
- [Changelog](./packages/cli/CHANGELOG.md) — version history
- [Contributing](./CONTRIBUTING.md) — how to contribute

## License

[MIT](./LICENSE)