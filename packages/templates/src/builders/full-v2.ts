/**
 * Full Preset Builder V2 - Clean Architecture
 *
 * This is the new, clean implementation that:
 * - Uses PresetRegistry for metadata
 * - Uses shared utilities (no duplication)
 * - Correctly handles Bun isolated installs
 * - Uses iconoir-react (NOT lucide-react)
 */

import { ensureDirectory, PresetRegistry, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { generateBunfigContent } from '../generators/bunfig';
import { setupGitHubActions } from '../generators/cicd';
import { setupVSCodeDebug } from '../generators/debug';
import { setupDocker } from '../generators/docker';
import { generateMonorepoReadme } from '../generators/readme';
import { setupTooling } from '../generators/tooling';
import { setupBiome, setupUltracite } from '../generators/ultracite';
import {
  writeHonoApiPackageJson,
  writeMonorepoRootPackageJson,
  writeNextjsAppPackageJson,
} from '../shared/package-json';
import { buildTypesPackage, buildUiPackage, buildUtilsPackage } from '../shared/ui-package';

/**
 * Build full-stack Next.js monorepo (nextjs-monorepo preset)
 *
 * Structure:
 * - apps/web (Next.js customer-facing)
 * - apps/platform (Next.js admin dashboard)
 * - apps/api (Hono API)
 * - packages/ui (shadcn/ui components)
 * - packages/types (shared types)
 * - packages/utils (shared utilities)
 * - tooling/typescript (shared TS configs)
 */
export async function buildFullPresetV2(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const preset = PresetRegistry.get('nextjs-monorepo');
  if (!preset) {
    throw new Error('nextjs-monorepo preset not found in registry');
  }

  const scopeName = context.packageName;

  // ========================================
  // 1. CREATE DIRECTORY STRUCTURE
  // ========================================
  const directories = [
    'apps/web/src/app',
    'apps/web/src/components',
    'apps/web/src/lib',
    'apps/platform/src/app',
    'apps/platform/src/components',
    'apps/platform/src/lib',
    'apps/api/src/routes',
    'apps/api/src/middleware',
    'packages/ui',
    'packages/types',
    'packages/utils',
    'tooling/typescript',
  ];

  for (const dir of directories) {
    await ensureDirectory(join(projectPath, dir));
  }

  // ========================================
  // 2. ROOT PACKAGE.JSON WITH CATALOG
  // ========================================
  // Use catalog from PresetRegistry - source of truth
  const catalog = preset.catalogEntries || {};

  await writeMonorepoRootPackageJson(projectPath, scopeName, catalog, {
    hasWeb: true,
    hasPlatform: true,
    hasApi: true,
    codeQuality: context.codeQuality === 'biome' ? 'biome' : 'ultracite',
  });

  // ========================================
  // 3. BUNFIG.TOML
  // ========================================
  await writeFile(join(projectPath, 'bunfig.toml'), generateBunfigContent(context));

  // ========================================
  // 4. APPS - NEXT.JS WEB
  // ========================================
  await writeNextjsAppPackageJson(join(projectPath, 'apps/web'), scopeName, 'web', {
    usesUi: true,
    usesTypes: true,
    shadcnIconLibrary: context.shadcnIconLibrary || 'iconoir',
  });

  // apps/web/src/app/layout.tsx
  await writeFile(
    join(projectPath, 'apps/web/src/app/layout.tsx'),
    `import type { Metadata } from 'next';
import '@${scopeName}/ui/globals.css';

export const metadata: Metadata = {
  title: '${context.projectName}',
  description: 'Enterprise SaaS built with bunkit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`
  );

  // apps/web/src/app/page.tsx
  await writeFile(
    join(projectPath, 'apps/web/src/app/page.tsx'),
    `import { Home, Rocket, Book } from 'iconoir-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 p-8 max-w-3xl">
        <div className="flex justify-center">
          <Home className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to ${context.projectName}
        </h1>
        <p className="text-xl text-muted-foreground">
          Enterprise-grade SaaS built with Next.js 16, React 19, Hono, and Bun
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
          >
            <Rocket className="w-5 h-5" />
            Get Started
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium"
          >
            <Book className="w-5 h-5" />
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}
`
  );

  // apps/web/next.config.ts
  await writeFile(
    join(projectPath, 'apps/web/next.config.ts'),
    `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@${scopeName}/ui'],
};

export default nextConfig;
`
  );

  // apps/web/tsconfig.json
  await writeFile(
    join(projectPath, 'apps/web/tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tooling/typescript/nextjs.json',
        compilerOptions: {
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // apps/web/postcss.config.mjs
  await writeFile(
    join(projectPath, 'apps/web/postcss.config.mjs'),
    `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`
  );

  // ========================================
  // 5. APPS - NEXT.JS PLATFORM (ADMIN)
  // ========================================
  await writeNextjsAppPackageJson(join(projectPath, 'apps/platform'), scopeName, 'platform', {
    usesUi: true,
    usesTypes: true,
    shadcnIconLibrary: context.shadcnIconLibrary || 'iconoir',
  });

  // apps/platform/src/app/layout.tsx
  await writeFile(
    join(projectPath, 'apps/platform/src/app/layout.tsx'),
    `import type { Metadata } from 'next';
import '@${scopeName}/ui/globals.css';

export const metadata: Metadata = {
  title: '${context.projectName} - Admin',
  description: 'Admin dashboard for ${context.projectName}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`
  );

  // apps/platform/src/app/page.tsx
  // Icons: Use valid iconoir-react names (Dollar not DollarSign, Activity not available - use Graph)
  await writeFile(
    join(projectPath, 'apps/platform/src/app/page.tsx'),
    `import { ViewGrid, User, Dollar, GraphUp } from 'iconoir-react';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <header className="mb-8 flex items-center gap-3">
          <ViewGrid className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your ${context.projectName} platform
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Users</h2>
            </div>
            <p className="text-3xl font-bold">1,234</p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Dollar className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Revenue</h2>
            </div>
            <p className="text-3xl font-bold">$12,345</p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <GraphUp className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Active</h2>
            </div>
            <p className="text-3xl font-bold">567</p>
          </div>
        </div>
      </div>
    </main>
  );
}
`
  );

  // apps/platform/next.config.ts
  await writeFile(
    join(projectPath, 'apps/platform/next.config.ts'),
    `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@${scopeName}/ui'],
};

export default nextConfig;
`
  );

  // apps/platform/tsconfig.json
  await writeFile(
    join(projectPath, 'apps/platform/tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tooling/typescript/nextjs.json',
        compilerOptions: {
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // apps/platform/postcss.config.mjs
  await writeFile(
    join(projectPath, 'apps/platform/postcss.config.mjs'),
    `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`
  );

  // ========================================
  // 6. APPS - HONO API
  // ========================================
  await writeHonoApiPackageJson(join(projectPath, 'apps/api'), scopeName, {
    usesTypes: true,
  });

  // apps/api/src/index.ts
  await writeFile(
    join(projectPath, 'apps/api/src/index.ts'),
    `import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.get('/', (context) => {
  return context.json({
    name: '${context.projectName} API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (context) => {
  return context.json({ status: 'ok' });
});

app.get('/api/users', (context) => {
  return context.json({
    users: [
      { id: '1', email: 'john@example.com', name: 'John Doe' },
      { id: '2', email: 'jane@example.com', name: 'Jane Smith' },
    ],
  });
});

// 404 handler
app.notFound((context) => {
  return context.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((error, context) => {
  console.error('Error:', error);
  return context.json({ error: 'Internal server error' }, 500);
});

// Start server with HMR
const server = Bun.serve({
  fetch: app.fetch,
  port: 3002,
  development: {
    hmr: true,
  },
});

console.log(\`🚀 ${context.projectName} API running on \${server.url}\`);

export default app;
`
  );

  // apps/api/tsconfig.json
  await writeFile(
    join(projectPath, 'apps/api/tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tooling/typescript/api.json',
        compilerOptions: {
          types: ['bun-types'],
        },
        include: ['src/**/*'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // ========================================
  // 7. PACKAGES - UI (shadcn/ui + Tailwind)
  // December 2025: Updated with new shadcn/ui "create" feature options
  // ========================================
  await buildUiPackage(join(projectPath, 'packages'), {
    scopeName,
    shadcnStyle: context.shadcnStyle || 'radix-maia',
    shadcnBase: context.shadcnBase || 'radix',
    shadcnBaseColor: context.shadcnBaseColor || 'zinc',
    shadcnIconLibrary: context.shadcnIconLibrary || 'iconoir', // bunkit default
    shadcnMenuAccent: context.shadcnMenuAccent || 'subtle',
    shadcnMenuColor: context.shadcnMenuColor || 'default',
    shadcnRadius: context.shadcnRadius || '0.625rem',
    shadcnRtl: context.shadcnRtl,
    appsToScan: ['web', 'platform'],
  });

  // ========================================
  // 8. PACKAGES - TYPES
  // ========================================
  await buildTypesPackage(join(projectPath, 'packages'), scopeName);

  // ========================================
  // 9. PACKAGES - UTILS
  // ========================================
  await buildUtilsPackage(join(projectPath, 'packages'), scopeName);

  // ========================================
  // 10. TOOLING - TYPESCRIPT CONFIGS
  // ========================================
  await setupTooling(projectPath, context);

  // ========================================
  // 11. ROOT TSCONFIG
  // ========================================
  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: './tooling/typescript/base.json',
        include: ['apps/*/src/**/*', 'packages/*/src/**/*'],
        exclude: ['node_modules', '**/node_modules', '**/.next'],
      },
      null,
      2
    )
  );

  // ========================================
  // 12. CODE QUALITY
  // ========================================
  if (context.codeQuality === 'ultracite') {
    await setupUltracite(projectPath, context);
  } else {
    await setupBiome(projectPath, context);
  }

  // ========================================
  // 13. DOCKER (OPTIONAL)
  // ========================================
  if (context.docker) {
    await setupDocker(projectPath, context);
  }

  // ========================================
  // 14. CI/CD (OPTIONAL)
  // ========================================
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }

  // ========================================
  // 15. VSCODE DEBUG CONFIG
  // ========================================
  await setupVSCodeDebug(projectPath, context, 'full');

  // ========================================
  // 16. README
  // ========================================
  await generateMonorepoReadme(projectPath, context, 'nextjs');
}
