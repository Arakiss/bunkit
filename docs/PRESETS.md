# bunkit Presets

bunkit offers **8 production-ready presets** organized by architecture type.

## Quick Reference

| Preset | Type | Framework | Use Case |
|--------|------|-----------|----------|
| `minimal` | Single | Bun | CLIs, scripts, utilities |
| `nextjs` | Single | Next.js 16 | Web apps, landing pages |
| `hono-api` | Single | Hono | REST APIs, backends |
| `bun-api` | Single | Bun.serve() | High-perf APIs (zero deps) |
| `bun-fullstack` | Single | Bun + React | Full-stack (no Next.js) |
| `nextjs-monorepo` | Monorepo | Next.js + Hono | SaaS products |
| `bun-monorepo` | Monorepo | Bun.serve() | Bun-native full-stack |
| `enterprise-monorepo` | Monorepo | Next.js + Services | Enterprise platforms |

## Preset Aliases

For backwards compatibility:

| Alias | Resolves To |
|-------|-------------|
| `web` | `nextjs` |
| `api` | `hono-api` |
| `full` | `nextjs-monorepo` |
| `monorepo-bun` | `bun-monorepo` |

---

## Single Repository Presets

### `minimal`

**Clean start for CLIs, scripts, and utilities.**

```bash
bunkit create minimal my-tool
```

**Includes:**
- Bun runtime with hot reload (`bun --hot`)
- TypeScript configured
- Clean folder structure
- Basic `.gitignore`

**Structure:**
```
my-tool/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── bunfig.toml
└── README.md
```

**Best for:** CLI tools, scripts, learning projects, microservices

---

### `nextjs`

**Complete Next.js 16 application with modern tooling.**

```bash
bunkit create nextjs my-app
```

**Includes:**
- Next.js 16 with App Router
- React 19 (Server Components by default)
- Tailwind CSS 4 (CSS-first config)
- shadcn/ui (optional, configurable)
- Biome (linting + formatting)
- TypeScript strict mode

**Structure:**
```
my-app/
├── src/
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── components/          # If shadcn/ui enabled
│   └── ui/
├── package.json
├── next.config.ts
├── tsconfig.json
└── biome.json
```

**Best for:** Landing pages, marketing sites, SaaS frontends, web applications

---

### `hono-api`

**Lightning-fast API with Hono framework.**

```bash
bunkit create hono-api my-api
```

**Includes:**
- Hono v4 web framework
- Bun.serve() with HMR
- Example routes and middleware
- CORS and logging configured
- Error handling patterns
- TypeScript with Bun types

**Structure:**
```
my-api/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   └── users.ts
│   └── middleware/
├── package.json
├── tsconfig.json
└── bunfig.toml
```

**Best for:** REST APIs, GraphQL servers, webhooks, backend services

---

### `bun-api`

**Ultra-fast API with zero external dependencies.**

```bash
bunkit create bun-api my-api
```

**Includes:**
- Bun.serve() with native routing (SIMD-accelerated)
- Zero dependencies
- Type-safe route parameters
- Built-in error handling
- Request utilities and middleware patterns

**Structure:**
```
my-api/
├── src/
│   ├── index.ts
│   ├── router.ts
│   └── handlers/
├── package.json
└── tsconfig.json
```

**Best for:** High-performance APIs, microservices, serverless functions

---

### `bun-fullstack`

**Full-stack app with Bun.serve() + HTML imports (no Next.js).**

```bash
bunkit create bun-fullstack my-app
```

**Includes:**
- Bun.serve() with HTML imports
- React 19 (client-side)
- Hot reloading
- API routes alongside frontend
- TypeScript configured

**Structure:**
```
my-app/
├── src/
│   ├── index.ts
│   ├── app/
│   │   ├── index.html
│   │   └── client.tsx
│   └── routes/
├── package.json
└── tsconfig.json
```

**Best for:** Full-stack apps without framework overhead, React SPAs with Bun backend

---

## Monorepo Presets

### `nextjs-monorepo`

**Enterprise-grade monorepo with Next.js + Hono.**

```bash
bunkit create nextjs-monorepo my-saas
```

**Includes:**
- Bun workspaces with dependency catalogs
- Isolated installs (no phantom dependencies)
- **Apps:**
  - `apps/web/` - Customer-facing Next.js (port 3000)
  - `apps/platform/` - Admin dashboard Next.js (port 3001)
  - `apps/api/` - Hono backend API
- **Packages:**
  - `packages/types/` - Shared TypeScript types
  - `packages/utils/` - Shared utilities
  - `packages/ui/` - Shared UI components (optional)
- **Tooling:**
  - `tooling/typescript/` - Shared TypeScript configs

**Structure:**
```
my-saas/
├── apps/
│   ├── web/
│   ├── platform/
│   └── api/
├── packages/
│   ├── types/
│   ├── utils/
│   └── ui/              # If shadcn/ui enabled
├── tooling/
│   └── typescript/
├── package.json         # Root with catalogs
├── bunfig.toml
└── tsconfig.json
```

**Scripts:**
```bash
bun dev              # Start all apps
bun run dev:web      # Start customer app
bun run dev:platform # Start admin dashboard
bun run dev:api      # Start API server
```

**Best for:** SaaS products, full-stack applications, multi-app projects

---

### `bun-monorepo`

**Monorepo with Bun.serve() for everything (no Next.js).**

```bash
bunkit create bun-monorepo my-saas
```

**Includes:**
- Bun workspaces configured
- **Apps:**
  - `apps/web/` - Bun.serve() + HTML imports (React frontend)
  - `apps/api/` - Bun.serve() native API
- **Packages:**
  - `packages/types/` - Shared TypeScript types
  - `packages/utils/` - Shared utilities
- **Tooling:**
  - `tooling/typescript/` - Shared TypeScript configs

**Structure:**
```
my-saas/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── types/
│   └── utils/
├── tooling/
│   └── typescript/
├── package.json
└── bunfig.toml
```

**Scripts:**
```bash
bun dev            # Start all apps
bun run dev:web    # Start web app
bun run dev:api    # Start API
```

**Best for:** Full-stack monorepos without Next.js, Bun-native architectures

---

### `enterprise-monorepo`

**Enterprise platform with multiple apps and microservices.**

```bash
bunkit create enterprise-monorepo my-platform
```

**Includes:**
- **Multiple Next.js apps:**
  - `apps/web/` - Marketing/Landing (port 3000)
  - `apps/app/` - Main SaaS product (port 3002)
  - `apps/platform/` - Admin dashboard (port 3001)
- **Microservices:**
  - `apps/service-identity/` - Identity service (port 3003)
- **Packages:**
  - `packages/types/` - Shared TypeScript types
  - `packages/utils/` - Shared utilities
  - `packages/ui/` - Shared UI components (shadcn/ui)
  - `packages/db/` - Shared database schema (if configured)
- **Tooling:**
  - `tooling/typescript/` - Shared TypeScript configs

**Structure:**
```
my-platform/
├── apps/
│   ├── web/
│   ├── app/
│   ├── platform/
│   └── service-identity/
├── packages/
│   ├── types/
│   ├── utils/
│   ├── ui/
│   └── db/              # If database configured
├── tooling/
│   └── typescript/
├── package.json
└── bunfig.toml
```

**Scripts:**
```bash
bun dev              # Start everything
bun run dev:web      # Marketing site (3000)
bun run dev:app      # Main product (3002)
bun run dev:platform # Admin dashboard (3001)
bun run dev:identity # Identity service (3003)
```

**Extending:**
```bash
# Add a new service
bunkit add workspace --name apps/service-payments --preset hono

# Add another Next.js app
bunkit add workspace --name apps/docs --preset nextjs
```

**Best for:** Enterprise SaaS platforms, multi-tenant applications, complex architectures

---

## Choosing a Preset

### Decision Tree

```
Do you need a monorepo?
├─ No
│  ├─ Building a web app? → nextjs
│  ├─ Building an API? → hono-api or bun-api
│  ├─ Building full-stack without Next.js? → bun-fullstack
│  └─ Building a CLI/script? → minimal
│
└─ Yes
   ├─ Need Next.js? → nextjs-monorepo
   ├─ Want pure Bun? → bun-monorepo
   └─ Enterprise with multiple apps? → enterprise-monorepo
```

### Quick Comparison

| Need | Preset |
|------|--------|
| Fastest possible API | `bun-api` |
| Full-featured API | `hono-api` |
| Standard web app | `nextjs` |
| No framework overhead | `bun-fullstack` |
| SaaS starter | `nextjs-monorepo` |
| Bun everything | `bun-monorepo` |
| Enterprise platform | `enterprise-monorepo` |

---

[Back to CLI Reference](./CLI.md) | [Back to README](../README.md)
