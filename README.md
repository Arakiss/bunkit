# bunkit 🍞

> Bake production-ready Bun apps in seconds

[![npm version](https://img.shields.io/npm/v/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![npm downloads](https://img.shields.io/npm/dm/bunkit-cli.svg)](https://www.npmjs.com/package/bunkit-cli)
[![Bun](https://img.shields.io/badge/bun-1.3+-orange.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen.svg)](./packages/core)

Modern CLI for scaffolding Bun-powered projects with enterprise patterns built-in.

## Quick Start

```bash
# Interactive mode (recommended)
bunx bunkit-cli init

# Or create directly
bunx bunkit-cli create nextjs my-app
```

## Why bunkit?

- **Bun-native** - Built for Bun 1.3+ with catalogs, isolated installs, and HMR
- **8 presets** - From minimal scripts to enterprise monorepos
- **Modern stack** - Next.js 16, React 19, Hono, Tailwind CSS 4, shadcn/ui
- **Zero config** - Production-ready TypeScript, linting, and testing out of the box
- **Monorepo expertise** - Workspace management, shared packages, dependency catalogs

## Presets

| Preset | Description |
|--------|-------------|
| `minimal` | Single-file Bun project |
| `nextjs` | Next.js 16 + React 19 web app |
| `hono-api` | Hono API server |
| `bun-api` | Bun.serve() native API (zero deps) |
| `bun-fullstack` | Bun.serve() + React (no Next.js) |
| `nextjs-monorepo` | Monorepo with Next.js + Hono |
| `bun-monorepo` | Monorepo with pure Bun |
| `enterprise-monorepo` | Multi-app enterprise platform |

See [Presets Reference](./docs/PRESETS.md) for detailed descriptions.

## Features

**Database & Auth**
- PostgreSQL, MySQL, SQLite with Drizzle or Prisma
- Supabase integration with presets
- better-auth, NextAuth.js, or Supabase Auth
- Redis for caching and sessions

**Developer Experience**
- Beautiful interactive CLI (21+ prompts)
- Hot reload with `bun --hot`
- VSCode debugging configured
- shadcn/ui with customizable themes
- Biome or Ultracite for code quality

**DevOps**
- Docker with multi-stage builds
- GitHub Actions CI/CD
- Bun Test or Vitest
- TypeScript strict mode

## Commands

```bash
bunkit init                    # Interactive project creation
bunkit create <preset> <name>  # Quick project creation
bunkit add workspace           # Add app to monorepo
bunkit add package             # Add shared package
bunkit add component           # Add shadcn/ui components
bunkit catalog add             # Manage dependency versions
bunkit preset list             # List saved configurations
```

See [CLI Reference](./docs/CLI.md) for all options.

## Example: Create a SaaS

```bash
# Create monorepo with database and auth
bunkit init \
  --name my-saas \
  --preset nextjs-monorepo \
  --database supabase-drizzle \
  --auth better-auth \
  --docker \
  --cicd

cd my-saas
bun install
bun dev
```

This creates:
- `apps/web` - Customer-facing Next.js app
- `apps/platform` - Admin dashboard
- `apps/api` - Hono API backend
- `packages/types` - Shared TypeScript types
- `packages/utils` - Shared utilities

## Requirements

- [Bun](https://bun.sh) v1.3.0+
- Node.js v20.9.0+ (for Next.js)

## Documentation

- [CLI Reference](./docs/CLI.md) - Complete command documentation
- [Presets Reference](./docs/PRESETS.md) - Detailed preset descriptions
- [Changelog](./packages/cli/CHANGELOG.md) - Version history
- [Roadmap](./ROADMAP.md) - Planned features
- [Contributing](./CONTRIBUTING.md) - How to contribute

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Bun 1.3+ |
| Frontend | Next.js 16, React 19 |
| Backend | Hono 4, Bun.serve() |
| Database | Drizzle ORM, Prisma, Supabase |
| Styling | Tailwind CSS 4, shadcn/ui |
| Language | TypeScript 5.9+ |
| Quality | Biome, Ultracite |

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT © [Arakiss](https://github.com/Arakiss)

---

**Made with ❤️ for the indie hacker community**

[GitHub](https://github.com/Arakiss/bunkit) · [Issues](https://github.com/Arakiss/bunkit/issues) · [npm](https://www.npmjs.com/package/bunkit-cli)
