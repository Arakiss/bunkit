import { type DatabaseType, ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { setupBetterAuth, setupNextAuth } from '../generators/auth';
import { generateBunfigContent } from '../generators/bunfig';
import {
  setupMySQLDrizzle,
  setupMySQLPrisma,
  setupPostgresDrizzle,
  setupPostgresPrisma,
  setupRedis,
  setupSQLiteDrizzle,
  setupSQLitePrisma,
  setupSupabaseDrizzle,
  setupSupabaseOnly,
  setupSupabasePrisma,
} from '../generators/database';
import { setupEnhancedHono } from '../generators/hono';
import { setupBunSecrets } from '../generators/secrets';

// Database setup function map
const databaseSetupMap: Record<
  DatabaseType,
  (path: string, context: TemplateContext, isMonorepo: boolean) => Promise<void>
> = {
  'postgres-drizzle': setupPostgresDrizzle,
  'postgres-prisma': setupPostgresPrisma,
  'mysql-drizzle': setupMySQLDrizzle,
  'mysql-prisma': setupMySQLPrisma,
  supabase: setupSupabaseOnly,
  'supabase-drizzle': setupSupabaseDrizzle,
  'supabase-prisma': setupSupabasePrisma,
  'sqlite-drizzle': setupSQLiteDrizzle,
  'sqlite-prisma': setupSQLitePrisma,
  none: async () => {}, // No-op
};

import { setupGitHubActions } from '../generators/cicd';
import { setupVSCodeDebug } from '../generators/debug';
import { setupDocker } from '../generators/docker';
import { generateMonorepoReadme } from '../generators/readme';
import { setupShadcnMonorepo } from '../generators/shadcn';
import { setupTooling } from '../generators/tooling';
import { setupBiome, setupUltracite } from '../generators/ultracite';

/**
 * Build full-stack monorepo preset files
 */
export async function buildFullPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create monorepo structure (enterprise SaaS trifecta)
  await ensureDirectory(join(projectPath, 'apps/web')); // Customer-facing app
  await ensureDirectory(join(projectPath, 'apps/platform')); // Dashboard/Admin panel
  await ensureDirectory(join(projectPath, 'apps/api')); // Backend API
  await ensureDirectory(join(projectPath, 'packages/types'));
  await ensureDirectory(join(projectPath, 'packages/utils'));
  await ensureDirectory(join(projectPath, 'packages/ui')); // Shared UI components (shadcn/ui)

  // Create database package if database is configured
  if (context.database && context.database !== 'none') {
    await ensureDirectory(join(projectPath, 'packages/db'));
  }

  // Root package.json (monorepo)
  const rootPackageJson = {
    name: `${context.packageName}-monorepo`,
    version: '0.0.0',
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts: {
      dev: 'bun run --filter "*" dev',
      build: 'bun run --filter "*" build',
      lint: context.codeQuality === 'biome' ? 'biome check .' : 'ultracite check .',
      format: context.codeQuality === 'biome' ? 'biome check --write .' : 'ultracite fix .',
      test: 'bun test',
      'dev:web': 'bun run --filter "@*/web" dev',
      'dev:platform': 'bun run --filter "@*/platform" dev',
      'dev:api': 'bun run --filter "@*/api" dev',
      debug: 'bun --inspect apps/api/src/index.ts',
      'debug:brk': 'bun --inspect-brk apps/api/src/index.ts',
      'debug:wait': 'bun --inspect-wait apps/api/src/index.ts',
    },
    devDependencies: {
      ...(context.codeQuality === 'biome' ? { '@biomejs/biome': 'catalog:' } : {}),
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
    catalog: {
      // Frontend
      react: '^19.2.3',
      'react-dom': '^19.2.3',
      next: '^16.0.10',

      // Backend
      hono: '^4.11.1',

      // Database
      'drizzle-orm': '^0.45.1',
      'drizzle-kit': '^0.31.8',
      postgres: '^3.4.7',
      '@supabase/supabase-js': '^2.88.0',

      // Styling
      tailwindcss: '^4.1.18',
      autoprefixer: '^10.4.23',
      postcss: '^8.5.6',
      '@tailwindcss/postcss': '^4.1.18',

      // UI
      '@radix-ui/react-slot': '^1.2.4',
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.4.0',
      'iconoir-react': '^7.11.0',
      'lucide-react': '^0.562.0',
      'tw-animate-css': '^1.2.9',

      // Code Quality
      ...(context.codeQuality === 'biome' ? { '@biomejs/biome': '^2.3.10' } : {}),
      ...(context.codeQuality === 'ultracite'
        ? { ultracite: '^6.4.2', '@biomejs/biome': '^2.3.10' }
        : {}),

      // Testing
      vitest: '^4.0.16',
      '@vitest/ui': '^4.0.16',

      // Types
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      '@types/node': '^25.0.3',
      typescript: '^5.9.3',
    },
  };

  await writeFile(join(projectPath, 'package.json'), JSON.stringify(rootPackageJson, null, 2));

  // bunfig.toml with enhanced defaults
  const bunfigContent = generateBunfigContent(context);
  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // apps/web/package.json
  const webPackageJson = {
    name: `@${context.packageName}/web`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      debug: 'bun --inspect node_modules/.bin/next dev',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@types/node': 'catalog:',
      typescript: 'catalog:',
      tailwindcss: 'catalog:',
    },
  };

  await writeFile(
    join(projectPath, 'apps/web/package.json'),
    JSON.stringify(webPackageJson, null, 2)
  );

  // apps/platform/package.json (Dashboard/Admin)
  const platformPackageJson = {
    name: `@${context.packageName}/platform`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev --port 3001',
      build: 'next build',
      start: 'next start --port 3001',
      debug: 'bun --inspect node_modules/.bin/next dev --port 3001',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev --port 3001',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev --port 3001',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@types/node': 'catalog:',
      typescript: 'catalog:',
      tailwindcss: 'catalog:',
    },
  };

  await writeFile(
    join(projectPath, 'apps/platform/package.json'),
    JSON.stringify(platformPackageJson, null, 2)
  );

  // apps/api/package.json
  const apiPackageJson = {
    name: `@${context.packageName}/api`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
      typecheck: 'tsc --noEmit',
      test: 'bun test',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies: {
      hono: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
  };

  await writeFile(
    join(projectPath, 'apps/api/package.json'),
    JSON.stringify(apiPackageJson, null, 2)
  );

  // packages/types/package.json
  const typesPackageJson = {
    name: `@${context.packageName}/types`,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
  };

  await writeFile(
    join(projectPath, 'packages/types/package.json'),
    JSON.stringify(typesPackageJson, null, 2)
  );

  // packages/types/src/index.ts
  const typesContent = `// Shared types for ${context.projectName}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
`;

  await writeFile(join(projectPath, 'packages/types/src/index.ts'), typesContent);

  // packages/utils/package.json
  const utilsPackageJson = {
    name: `@${context.packageName}/utils`,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
  };

  await writeFile(
    join(projectPath, 'packages/utils/package.json'),
    JSON.stringify(utilsPackageJson, null, 2)
  );

  // packages/utils/src/index.ts
  const utilsContent = `// Shared utilities for ${context.projectName}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
`;

  await writeFile(join(projectPath, 'packages/utils/src/index.ts'), utilsContent);

  // ========================================
  // apps/web - Next.js App (Customer-facing)
  // ========================================
  await ensureDirectory(join(projectPath, 'apps/web/src/app'));

  // apps/web/src/app/layout.tsx
  const webLayoutContent = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${context.projectName}',
  description: 'Enterprise SaaS built with bunkit 🍞',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  await writeFile(join(projectPath, 'apps/web/src/app/layout.tsx'), webLayoutContent);

  // apps/web/src/app/page.tsx
  const webPageContent = `export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          Welcome to ${context.projectName} 🍞
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Enterprise-grade SaaS monorepo built with Next.js 16, React 19, Hono, and Bun
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}
`;

  await writeFile(join(projectPath, 'apps/web/src/app/page.tsx'), webPageContent);

  // apps/web/src/app/globals.css
  const webGlobalsCssContent = `@import "tailwindcss";

@theme {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.5 0.15 280);
}
`;

  await writeFile(join(projectPath, 'apps/web/src/app/globals.css'), webGlobalsCssContent);

  // apps/web/next.config.ts
  const webNextConfigContent = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;

  await writeFile(join(projectPath, 'apps/web/next.config.ts'), webNextConfigContent);

  // apps/web/tailwind.config.ts
  const webTailwindConfigContent = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;

  await writeFile(join(projectPath, 'apps/web/tailwind.config.ts'), webTailwindConfigContent);

  // apps/web/tsconfig.json - configurable strictness
  const getWebTsConfig = () => {
    const baseOptions = {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: context.pathAliases ? { '@/*': ['./src/*'] } : undefined,
    };

    if (context.tsStrictness === 'strict') {
      return {
        ...baseOptions,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noImplicitReturns: true,
      };
    }

    if (context.tsStrictness === 'moderate') {
      return {
        ...baseOptions,
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
      };
    }

    return {
      ...baseOptions,
      strict: false,
      noImplicitAny: false,
    };
  };

  const webTsconfigContent = {
    extends: '../../tooling/typescript/nextjs.json',
    compilerOptions: {
      ...getWebTsConfig(),
      // Override specific options if needed
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/dev/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'apps/web/tsconfig.json'),
    JSON.stringify(webTsconfigContent, null, 2)
  );

  // ========================================
  // apps/platform - Next.js App (Dashboard/Admin)
  // ========================================
  await ensureDirectory(join(projectPath, 'apps/platform/src/app'));

  // apps/platform/src/app/layout.tsx
  const platformLayoutContent = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${context.projectName} - Admin Dashboard',
  description: 'Admin dashboard for ${context.projectName}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  await writeFile(join(projectPath, 'apps/platform/src/app/layout.tsx'), platformLayoutContent);

  // apps/platform/src/app/page.tsx
  const platformPageContent = `export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your ${context.projectName} platform
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Revenue</h2>
            <p className="text-3xl font-bold text-green-600">$12,345</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Active</h2>
            <p className="text-3xl font-bold text-purple-600">567</p>
          </div>
        </div>
      </div>
    </main>
  );
}
`;

  await writeFile(join(projectPath, 'apps/platform/src/app/page.tsx'), platformPageContent);

  // apps/platform/src/app/globals.css
  const platformGlobalsCssContent = `@import "tailwindcss";

@theme {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.5 0.15 280);
}
`;

  await writeFile(
    join(projectPath, 'apps/platform/src/app/globals.css'),
    platformGlobalsCssContent
  );

  // apps/platform/next.config.ts
  const platformNextConfigContent = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;

  await writeFile(join(projectPath, 'apps/platform/next.config.ts'), platformNextConfigContent);

  // apps/platform/tailwind.config.ts
  const platformTailwindConfigContent = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;

  await writeFile(
    join(projectPath, 'apps/platform/tailwind.config.ts'),
    platformTailwindConfigContent
  );

  // apps/platform/tsconfig.json - extends tooling
  const platformTsconfigContent = {
    extends: '../../tooling/typescript/nextjs.json',
    compilerOptions: {
      ...getWebTsConfig(),
      // Override specific options if needed
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/dev/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'apps/platform/tsconfig.json'),
    JSON.stringify(platformTsconfigContent, null, 2)
  );

  // ========================================
  // apps/api - Hono Server
  // ========================================
  await ensureDirectory(join(projectPath, 'apps/api/src'));

  // apps/api/src/index.ts
  const apiIndexContent = `import { Hono } from 'hono';
import { serve } from 'bun';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.get('/', (context) => {
  return context.json({
    message: 'Welcome to ${context.projectName} API 🍞',
    version: '1.0.0',
  });
});

app.get('/health', (context) => {
  return context.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/users', (context) => {
  return context.json({
    users: [
      { id: 1, email: 'john@example.com', name: 'John Doe' },
      { id: 2, email: 'jane@example.com', name: 'Jane Smith' },
    ],
  });
});

// 404 handler
app.notFound((context) => {
  return context.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((error, context) => {
  console.error(\`Error: \${error}\`);
  return context.json({ error: 'Internal server error' }, 500);
});

// Start server
serve({
  fetch: app.fetch,
  port: 3001,
  development: {
    hmr: true,
    console: true,
  },
});

console.log('🚀 ${context.projectName} API running on http://localhost:3001');
`;

  await writeFile(join(projectPath, 'apps/api/src/index.ts'), apiIndexContent);

  // apps/api/tsconfig.json - extends tooling
  const apiTsconfigContent = {
    extends: '../../tooling/typescript/api.json',
    compilerOptions: {
      // Override specific options if needed
      types: ['@types/bun'],
    },
  };

  await writeFile(
    join(projectPath, 'apps/api/tsconfig.json'),
    JSON.stringify(apiTsconfigContent, null, 2)
  );

  // Generate README.md with author attribution
  await generateMonorepoReadme(projectPath, context, 'nextjs');

  // Root tsconfig.json (references tooling)
  const tsconfigContent = {
    extends: './tooling/typescript/base.json',
    compilerOptions: {
      // Can override base config here if needed
    },
    include: ['apps/*/src/**/*', 'packages/*/src/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(join(projectPath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

  // ========================================
  // INTEGRATIONS - Database, Code Quality, Docker, CI/CD
  // ========================================

  // Setup database package if configured
  if (context.database && context.database !== 'none') {
    const dbPackagePath = join(projectPath, 'packages/db');

    // packages/db/package.json
    const dbPackageJson = {
      name: `@${context.packageName}/db`,
      version: '0.0.0',
      private: true,
      main: './src/index.ts',
      types: './src/index.ts',
      dependencies:
        context.database === 'supabase'
          ? {
              '@supabase/supabase-js': 'catalog:',
            }
          : context.database === 'supabase-drizzle'
            ? {
                '@supabase/supabase-js': 'catalog:',
                'drizzle-orm': 'catalog:',
                postgres: 'catalog:',
              }
            : context.database === 'postgres-drizzle'
              ? {
                  'drizzle-orm': 'catalog:',
                  postgres: 'catalog:',
                }
              : context.database === 'sqlite-drizzle'
                ? {
                    'drizzle-orm': 'catalog:',
                  }
                : {},
      devDependencies: {
        ...(context.database === 'postgres-drizzle' ||
        context.database === 'supabase-drizzle' ||
        context.database === 'sqlite-drizzle'
          ? {
              'drizzle-kit': 'catalog:',
            }
          : {}),
        '@types/bun': 'latest',
        typescript: 'catalog:',
      },
    };

    await writeFile(join(dbPackagePath, 'package.json'), JSON.stringify(dbPackageJson, null, 2));

    // Setup database files
    if (context.database) {
      const setupFn = databaseSetupMap[context.database];
      if (setupFn) {
        await setupFn(dbPackagePath, context, true);
      }
    }

    // Setup Redis if configured (independent of database)
    if (context.redis) {
      await setupRedis(projectPath, context, true);
    }

    // Setup authentication if configured (independent of database)
    if (context.auth && context.auth !== 'none') {
      if (context.auth === 'better-auth') {
        await setupBetterAuth(projectPath, context, true);
      } else if (context.auth === 'nextauth') {
        await setupNextAuth(projectPath, context, true);
      }
    }

    // Setup enhanced Hono middleware and utilities for API
    await setupEnhancedHono(projectPath, context, true);

    // Setup Bun.secrets if configured
    if (context.useBunSecrets) {
      await setupBunSecrets(projectPath, context, true);
    }

    // Update apps/api to use database
    const apiPackageJson = JSON.parse(
      await Bun.file(join(projectPath, 'apps/api/package.json')).text()
    );
    apiPackageJson.dependencies[`@${context.packageName}/db`] = 'workspace:*';
    await writeFile(
      join(projectPath, 'apps/api/package.json'),
      JSON.stringify(apiPackageJson, null, 2)
    );
  }

  // Setup code quality tools (root level for monorepo)
  if (context.codeQuality === 'ultracite') {
    await setupUltracite(projectPath, context);
  } else {
    await setupBiome(projectPath, context);
  }

  // Setup Docker for monorepo
  if (context.docker) {
    await setupDocker(projectPath, context);

    // Create docker-compose for monorepo with all services
    const isSupabase =
      context.database === 'supabase' ||
      context.database === 'supabase-drizzle' ||
      context.database === 'supabase-prisma';
    const hasLocalDb = context.database && context.database !== 'none' && !isSupabase;
    const hasRedis = context.redis === true;

    const dockerCompose = `version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: ../../Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      ${
        isSupabase
          ? `- NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
          : ''
      }
      ${hasRedis ? '- REDIS_URL=redis://redis:6379' : ''}
    ${isSupabase ? 'depends_on:\n      - supabase-db\n      - supabase-auth\n      - supabase-storage\n      - supabase-realtime' : ''}
    ${hasRedis ? 'depends_on:\n      - redis' : ''}
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  platform:
    build:
      context: ./apps/platform
      dockerfile: ../../Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      ${
        isSupabase
          ? `- NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
          : ''
      }
      ${hasRedis ? '- REDIS_URL=redis://redis:6379' : ''}
    ${isSupabase ? 'depends_on:\n      - supabase-db\n      - supabase-auth\n      - supabase-storage\n      - supabase-realtime' : ''}
    ${hasRedis ? 'depends_on:\n      - redis' : ''}
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  api:
    build:
      context: ./apps/api
      dockerfile: ../../Dockerfile
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=development
      ${hasLocalDb ? `- DATABASE_URL=postgres://postgres:postgres@db:5432/${context.projectName}` : ''}
      ${
        isSupabase
          ? `- SUPABASE_URL=http://localhost:8000
      - SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`
          : ''
      }
      ${hasRedis ? '- REDIS_URL=redis://redis:6379' : ''}
    ${hasLocalDb ? 'depends_on:\n      - db' : ''}
    ${isSupabase ? 'depends_on:\n      - supabase-db\n      - supabase-auth\n      - supabase-storage\n      - supabase-realtime' : ''}
    ${hasRedis ? 'depends_on:\n      - redis' : ''}
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  ${
    hasLocalDb
      ? `db:
    image: ${context.database === 'sqlite-drizzle' ? 'alpine:latest' : context.database?.includes('mysql') ? 'mysql:8.0' : 'postgres:16-alpine'}
    ${
      context.database !== 'sqlite-drizzle' && !context.database?.includes('mysql')
        ? `environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${context.projectName}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"`
        : context.database?.includes('mysql')
          ? `environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=${context.projectName}
      - MYSQL_USER=app
      - MYSQL_PASSWORD=app
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"`
          : 'volumes:\n      - sqlite_data:/data'
    }
    restart: unless-stopped
    networks:
      - ${context.projectName}-network
`
      : ''
  }

  ${
    isSupabase
      ? `# Supabase Local Development Stack
  supabase-db:
    image: supabase/postgres:15.1.0.147
    ports:
      - "54322:5432"
    environment:
      POSTGRES_HOST: /var/run/postgresql
      PGPORT: 5432
      POSTGRES_PORT: 5432
      PGDATABASE: postgres
      POSTGRES_DB: postgres
      PGPASSWORD: postgres
      POSTGRES_PASSWORD: postgres
      PGUSER: postgres
      POSTGRES_USER: postgres
      JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      JWT_EXP: 3600
    volumes:
      - supabase_db_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-auth:
    image: supabase/gotrue:v2.99.0
    ports:
      - "9999:9999"
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: http://localhost:9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:postgres@supabase-db:5432/postgres
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_URI_ALLOW_LIST: "*"
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "true"
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-storage:
    image: supabase/storage-api:v1.8.0
    ports:
      - "5000:5000"
    environment:
      ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
      POSTGREST_URL: http://supabase-rest:3000
      PGRST_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      DATABASE_URL: postgres://postgres:postgres@supabase-db:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
    volumes:
      - supabase_storage_data:/var/lib/storage
    depends_on:
      - supabase-db
      - supabase-rest
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-rest:
    image: postgrest/postgrest:v12.0.1
    ports:
      - "8000:3000"
    environment:
      PGRST_DB_URI: postgres://postgres:postgres@supabase-db:5432/postgres
      PGRST_DB_SCHEMAS: public,storage,graphql_public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      PGRST_DB_USE_LEGACY_GUCS: "false"
      PGRST_APP_SETTINGS_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      PGRST_APP_SETTINGS_JWT_EXP: 3600
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-realtime:
    image: supabase/realtime:v2.25.35
    ports:
      - "4000:4000"
    environment:
      PORT: 4000
      DB_HOST: supabase-db
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: postgres
      DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
      DB_ENC_KEY: supabaserealtime
      API_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      FLY_ALLOC_ID: fly123
      FLY_APP_NAME: realtime
      SECRET_KEY_BASE: UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq
      ERL_AFLAGS: -proto_dist inet_tcp
      ENABLE_TAILSCALE: "false"
      DNS_NODES: "''"
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-studio:
    image: supabase/studio:20240415-0b8c736
    ports:
      - "54323:3000"
    environment:
      STUDIO_PG_META_URL: http://supabase-meta:8080
      POSTGRES_PASSWORD: postgres
      DEFAULT_ORGANIZATION_NAME: Default Organization
      DEFAULT_PROJECT_NAME: Default Project
      SUPABASE_URL: http://localhost:8000
      SUPABASE_PUBLIC_URL: http://localhost:8000
      SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
    depends_on:
      - supabase-db
      - supabase-meta
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-meta:
    image: supabase/postgres-meta:v0.80.0
    ports:
      - "8080:8080"
    environment:
      PG_META_PORT: 8080
      PG_META_DB_HOST: supabase-db
      PG_META_DB_PORT: 5432
      PG_META_DB_NAME: postgres
      PG_META_DB_USER: postgres
      PG_META_DB_PASSWORD: postgres
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network
`
      : ''
  }

  ${
    hasRedis
      ? `redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    networks:
      - ${context.projectName}-network
`
      : ''
  }

${
  hasLocalDb || isSupabase || hasRedis
    ? `volumes:
  ${hasLocalDb && !context.database?.includes('mysql') && context.database !== 'sqlite-drizzle' ? 'postgres_data:' : ''}
  ${context.database?.includes('mysql') ? 'mysql_data:' : ''}
  ${context.database === 'sqlite-drizzle' ? 'sqlite_data:' : ''}
  ${
    isSupabase
      ? `supabase_db_data:
  supabase_storage_data:`
      : ''
  }
  ${hasRedis ? 'redis_data:' : ''}

networks:
  ${context.projectName}-network:
    driver: bridge
`
    : ''
}
`;

    await writeFile(join(projectPath, 'docker-compose.yml'), dockerCompose);
  }

  // Setup CI/CD for monorepo (with matrix builds for each app)
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }

  // Setup shadcn/ui for full-stack preset (always included with Tailwind)
  // Full-stack monorepo presets should always have shadcn/ui configured for shared UI components
  if (
    context.cssFramework === 'tailwind' &&
    (context.uiLibrary === 'shadcn' || context.uiLibrary === undefined)
  ) {
    // Ensure uiLibrary is set to shadcn for full-stack preset
    const fullContext = {
      ...context,
      uiLibrary: 'shadcn' as const,
      shadcnStyle: context.shadcnStyle || 'new-york',
      shadcnBaseColor: context.shadcnBaseColor || 'zinc',
      shadcnRadius: context.shadcnRadius || '0.625rem',
    };
    await setupShadcnMonorepo(projectPath, fullContext);
  }

  // Setup shared tooling (TypeScript configs)
  await setupTooling(projectPath, context);

  // Setup VSCode debugging configuration
  await setupVSCodeDebug(projectPath, context, 'full');
}
