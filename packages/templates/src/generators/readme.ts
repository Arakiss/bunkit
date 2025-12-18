import { writeFile } from '@bunkit/core';
import { join } from 'pathe';
import type { TemplateContext } from '@bunkit/core';

/**
 * Generate README.md footer with author attribution
 */
export function generateReadmeFooter(context: TemplateContext): string {
  const year = new Date().getFullYear();
  return `
---

## Author

**${context.projectName}** was created by you using [bunkit](https://github.com/Arakiss/bunkit).

## License

This project is yours to use however you want. Consider adding a license file (MIT, Apache, etc.) to clarify usage terms for others.

---

<p align="center">
  <sub>Scaffolded with <a href="https://github.com/Arakiss/bunkit">bunkit</a> 🍞 | ${year}</sub>
</p>
`;
}

/**
 * Generate README for minimal preset
 */
export async function generateMinimalReadme(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const content = `# ${context.projectName}

A minimal Bun project scaffolded with bunkit.

## Getting Started

\`\`\`bash
# Development with hot reload
bun run dev

# Production
bun run start
\`\`\`

## Project Structure

\`\`\`
${context.projectName}/
├── src/
│   └── index.ts    # Entry point
├── package.json
├── tsconfig.json
└── bunfig.toml
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`bun run dev\` | Start with hot reload |
| \`bun run start\` | Run production build |

## Next Steps

- Add your business logic to \`src/index.ts\`
- Install dependencies: \`bun add <package>\`
- Add tests: \`bun test\`

${generateReadmeFooter(context)}`;

  await writeFile(join(projectPath, 'README.md'), content);
}

/**
 * Generate README for Next.js (web) preset
 */
export async function generateNextjsReadme(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const hasShadcn = context.uiLibrary === 'shadcn';

  const content = `# ${context.projectName}

A modern Next.js 16 application with React 19, Tailwind CSS 4, and TypeScript.

## Getting Started

\`\`\`bash
# Install dependencies
bun install

# Development
bun run dev

# Build for production
bun run build

# Start production server
bun run start
\`\`\`

## Demo

Visit [http://localhost:3000](http://localhost:3000) after starting the dev server.

## Project Structure

\`\`\`
${context.projectName}/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
${hasShadcn ? `│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   └── lib/
│       └── utils.ts        # Utility functions` : `│   └── components/         # Your components`}
├── public/                  # Static assets
├── next.config.ts
├── tsconfig.json
└── package.json
\`\`\`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 (Server Components)
- **Styling**: Tailwind CSS 4${hasShadcn ? '\n- **Components**: shadcn/ui' : ''}
- **Language**: TypeScript 5.9+
- **Runtime**: Bun 1.3+

${hasShadcn ? `## Adding shadcn/ui Components

\`\`\`bash
# Add components
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add dialog
\`\`\`

` : ''}## Scripts

| Script | Description |
|--------|-------------|
| \`bun run dev\` | Start dev server with Turbopack |
| \`bun run build\` | Build for production |
| \`bun run start\` | Start production server |
| \`bun run debug\` | Start with debugger attached |

${generateReadmeFooter(context)}`;

  await writeFile(join(projectPath, 'README.md'), content);
}

/**
 * Generate README for Hono API preset
 */
export async function generateHonoApiReadme(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const content = `# ${context.projectName}

A lightning-fast API server built with Hono and Bun.serve().

## Getting Started

\`\`\`bash
# Development with hot reload
bun run dev

# Production
bun run start
\`\`\`

## Demo

Start the server and visit:
- [http://localhost:3000](http://localhost:3000) - Welcome message
- [http://localhost:3000/health](http://localhost:3000/health) - Health check
- [http://localhost:3000/api/hello](http://localhost:3000/api/hello) - Example API endpoint

## Project Structure

\`\`\`
${context.projectName}/
├── src/
│   ├── index.ts           # Server entry point
│   ├── routes/            # API route handlers
│   │   └── hello.ts       # Example route
│   └── middleware/        # Custom middleware
├── package.json
├── tsconfig.json
└── bunfig.toml
\`\`\`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | \`/\` | Welcome message |
| GET | \`/health\` | Health check |
| GET | \`/api/hello\` | Example endpoint |

## Adding Routes

Create a new file in \`src/routes/\`:

\`\`\`typescript
// src/routes/users.ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (context) => {
  return context.json({ users: [] });
});

export default app;
\`\`\`

Then mount it in \`src/index.ts\`:

\`\`\`typescript
import users from './routes/users';
app.route('/api/users', users);
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`bun run dev\` | Start with hot reload |
| \`bun run start\` | Start production server |
| \`bun run debug\` | Start with debugger |

${generateReadmeFooter(context)}`;

  await writeFile(join(projectPath, 'README.md'), content);
}

/**
 * Generate README for Bun API preset
 */
export async function generateBunApiReadme(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const content = `# ${context.projectName}

An ultra-fast API server using Bun.serve() with zero external dependencies.

## Getting Started

\`\`\`bash
# Development with hot reload
bun run dev

# Production
bun run start
\`\`\`

## Demo

Start the server and visit:
- [http://localhost:3000](http://localhost:3000) - Welcome message
- [http://localhost:3000/health](http://localhost:3000/health) - Health check
- [http://localhost:3000/api/version](http://localhost:3000/api/version) - Version info

## Project Structure

\`\`\`
${context.projectName}/
├── src/
│   ├── index.ts           # Server entry with Bun.serve()
│   ├── router.ts          # Route handling
│   └── handlers/          # Request handlers
├── package.json
├── tsconfig.json
└── bunfig.toml
\`\`\`

## Why Zero Dependencies?

- **Ultra-fast**: No module loading overhead
- **Tiny footprint**: Only Bun runtime required
- **Maximum control**: No framework abstractions
- **SIMD-accelerated**: Bun.serve() uses native SIMD for routing

## Adding Routes

Routes are defined directly using Bun.serve():

\`\`\`typescript
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/users') {
      return Response.json({ users: [] });
    }

    return new Response('Not Found', { status: 404 });
  },
});
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`bun run dev\` | Start with hot reload |
| \`bun run start\` | Start production server |
| \`bun run debug\` | Start with debugger |

${generateReadmeFooter(context)}`;

  await writeFile(join(projectPath, 'README.md'), content);
}

/**
 * Generate README for monorepo presets
 */
export async function generateMonorepoReadme(
  projectPath: string,
  context: TemplateContext,
  type: 'nextjs' | 'bun' | 'enterprise'
): Promise<void> {
  const hasShadcn = context.uiLibrary === 'shadcn';

  const structures: Record<string, string> = {
    nextjs: `apps/
├── web/              # Customer-facing Next.js app (port 3000)
├── platform/         # Admin dashboard (port 3001)
└── api/              # Hono API server

packages/
├── types/            # Shared TypeScript types
├── utils/            # Shared utilities
${hasShadcn ? '└── ui/               # Shared shadcn/ui components' : ''}

tooling/
└── typescript/       # Shared TypeScript configurations`,

    bun: `apps/
├── web/              # Bun.serve() + React frontend
└── api/              # Bun.serve() API server

packages/
├── types/            # Shared TypeScript types
└── utils/            # Shared utilities

tooling/
└── typescript/       # Shared TypeScript configurations`,

    enterprise: `apps/
├── web/              # Marketing site (port 3000)
├── app/              # Main SaaS product (port 3002)
├── platform/         # Admin dashboard (port 3001)
└── service-identity/ # Identity service (port 3003)

packages/
├── types/            # Shared TypeScript types
├── utils/            # Shared utilities
├── ui/               # Shared shadcn/ui components
└── db/               # Shared database schema

tooling/
└── typescript/       # Shared TypeScript configurations`,
  };

  const scripts: Record<string, string> = {
    nextjs: `| \`bun dev\` | Start all apps |
| \`bun run dev:web\` | Start customer app (3000) |
| \`bun run dev:platform\` | Start admin dashboard (3001) |
| \`bun run dev:api\` | Start API server |`,

    bun: `| \`bun dev\` | Start all apps |
| \`bun run dev:web\` | Start web app |
| \`bun run dev:api\` | Start API server |`,

    enterprise: `| \`bun dev\` | Start all apps and services |
| \`bun run dev:web\` | Start marketing site (3000) |
| \`bun run dev:app\` | Start main product (3002) |
| \`bun run dev:platform\` | Start admin (3001) |
| \`bun run dev:identity\` | Start identity service (3003) |`,
  };

  const typeNames: Record<string, string> = {
    nextjs: 'Next.js + Hono',
    bun: 'Bun.serve()',
    enterprise: 'Enterprise',
  };

  const content = `# ${context.projectName}

A ${typeNames[type]} monorepo scaffolded with bunkit.

## Getting Started

\`\`\`bash
# Install all dependencies
bun install

# Start all apps in development
bun dev

# Build all apps
bun run build
\`\`\`

## Demo

After starting with \`bun dev\`, visit:
${type === 'enterprise'
  ? `- [http://localhost:3000](http://localhost:3000) - Marketing site
- [http://localhost:3001](http://localhost:3001) - Admin dashboard
- [http://localhost:3002](http://localhost:3002) - Main product
- [http://localhost:3003](http://localhost:3003) - Identity service`
  : type === 'nextjs'
    ? `- [http://localhost:3000](http://localhost:3000) - Customer app
- [http://localhost:3001](http://localhost:3001) - Admin dashboard
- [http://localhost:3002](http://localhost:3002) - API server`
    : `- [http://localhost:3000](http://localhost:3000) - Web app
- [http://localhost:3001](http://localhost:3001) - API server`}

## Project Structure

\`\`\`
${context.projectName}/
${structures[type]}

package.json          # Root with Bun dependency catalogs
bunfig.toml
tsconfig.json
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
${scripts[type]}
| \`bun run build\` | Build all apps |
| \`bun run lint\` | Lint all code |

## Bun Monorepo Features

This project uses Bun 1.3+ monorepo features:

### Dependency Catalogs

Centralized versions in root \`package.json\`:

\`\`\`json
{
  "catalog": {
    "react": "^19.2.3",
    "next": "^16.0.10"
  }
}
\`\`\`

Reference in workspace packages:

\`\`\`json
{
  "dependencies": {
    "react": "catalog:"
  }
}
\`\`\`

### Workspace Protocol

Link local packages:

\`\`\`json
{
  "dependencies": {
    "@${context.packageName}/types": "workspace:*"
  }
}
\`\`\`

## Adding Workspaces

\`\`\`bash
# Add a new app
bunkit add workspace --name apps/docs --preset nextjs

# Add a shared package
bunkit add package --name @${context.packageName}/email --type library
\`\`\`
${hasShadcn ? `
## Adding shadcn/ui Components

\`\`\`bash
# Components go to packages/ui
cd packages/ui
bunx shadcn@latest add button card dialog
\`\`\`

Import in apps:
\`\`\`typescript
import { Button } from '@${context.packageName}/ui/components/ui/button';
\`\`\`
` : ''}
${generateReadmeFooter(context)}`;

  await writeFile(join(projectPath, 'README.md'), content);
}

/**
 * Generate README for Bun full-stack preset
 */
export async function generateBunFullstackReadme(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const content = `# ${context.projectName}

A full-stack application built with Bun.serve() and HTML imports - no framework overhead.

## Getting Started

\`\`\`bash
# Development with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun run start
\`\`\`

## Demo

Start the server and visit:
- [http://localhost:3000](http://localhost:3000) - Full-stack React app
- [http://localhost:3000/health](http://localhost:3000/health) - Health check
- [http://localhost:3000/api/version](http://localhost:3000/api/version) - API version info

## Project Structure

\`\`\`
${context.projectName}/
├── src/
│   ├── index.ts          # Server entry point
│   ├── app/
│   │   ├── index.html   # HTML entry point
│   │   └── client.tsx   # React client code
│   ├── routes/           # API route handlers
│   ├── middleware/       # Middleware functions
│   └── utils/            # Utility functions
├── package.json
├── tsconfig.json
└── bunfig.toml
\`\`\`

## Features

- ⚡ **Zero framework overhead** - No Next.js, just Bun
- 🔥 **Hot Module Replacement** - Native HMR with \`bun --hot\`
- 📦 **HTML imports** - Full-stack bundling with Bun
- ⚛️ **React 19** - Latest React with Server Components support
- 🚀 **Ultra-fast** - Native Bun performance

## How It Works

### Development Mode

In development, Bun bundles your React app on-the-fly:

\`\`\`typescript
const build = await Bun.build({
  entrypoints: ['./src/app/client.tsx'],
  // ...
});
\`\`\`

### Production Mode

For production, pre-build your assets:

\`\`\`bash
bun run build
bun run start
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`bun run dev\` | Start with hot reload |
| \`bun run build\` | Build for production |
| \`bun run start\` | Start production server |
| \`bun run debug\` | Start with debugger |

${generateReadmeFooter(context)}`;

  await writeFile(join(projectPath, 'README.md'), content);
}
