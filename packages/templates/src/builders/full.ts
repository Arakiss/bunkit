import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';
import {
  setupPostgresDrizzle,
  setupSupabase,
  setupSQLiteDrizzle,
} from '../generators/database';
import { setupUltracite, setupBiome } from '../generators/ultracite';
import { setupDocker } from '../generators/docker';
import { setupGitHubActions } from '../generators/cicd';

/**
 * Build full-stack monorepo preset files
 */
export async function buildFullPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create monorepo structure (enterprise SaaS trifecta)
  await ensureDirectory(join(projectPath, 'apps/web'));      // Customer-facing app
  await ensureDirectory(join(projectPath, 'apps/platform')); // Dashboard/Admin panel
  await ensureDirectory(join(projectPath, 'apps/api'));      // Backend API
  await ensureDirectory(join(projectPath, 'packages/types'));
  await ensureDirectory(join(projectPath, 'packages/utils'));

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
      lint: 'biome check .',
      format: 'biome check --write .',
      test: 'bun test',
    },
    devDependencies: {
      '@biomejs/biome': '^2.3.0',
      '@types/bun': 'latest',
      typescript: '^5.7.2',
    },
    catalog: {
      react: '^19.1.0',
      'react-dom': '^19.1.0',
      next: '^16.0.0',
      hono: '^4.7.12',
    },
  };

  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(rootPackageJson, null, 2)
  );

  // bunfig.toml
  const bunfigContent = `[install]
frozenLockfile = false

[test]
coverage = true
`;

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
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
    },
    devDependencies: {
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      '@types/node': '^22.10.6',
      typescript: '^5.7.2',
      tailwindcss: '^4.1.5',
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
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
    },
    devDependencies: {
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      '@types/node': '^22.10.6',
      typescript: '^5.7.2',
      tailwindcss: '^4.1.5',
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
    },
    dependencies: {
      hono: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.7.2',
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
    compilerOptions: getWebTsConfig(),
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

  await writeFile(join(projectPath, 'apps/platform/src/app/globals.css'), platformGlobalsCssContent);

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

  await writeFile(join(projectPath, 'apps/platform/tailwind.config.ts'), platformTailwindConfigContent);

  // apps/platform/tsconfig.json - same strictness as web
  const platformTsconfigContent = {
    compilerOptions: getWebTsConfig(), // Reuse same config as web
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

  // apps/api/tsconfig.json
  const apiTsconfigContent = {
    compilerOptions: {
      lib: ['ESNext'],
      target: 'ESNext',
      module: 'ESNext',
      moduleDetection: 'force',
      allowJs: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      noFallthroughCasesInSwitch: true,
      types: ['@types/bun'],
    },
  };

  await writeFile(
    join(projectPath, 'apps/api/tsconfig.json'),
    JSON.stringify(apiTsconfigContent, null, 2)
  );

  // Root README
  const readmeContent = `# ${context.projectName}

Enterprise-grade SaaS monorepo created with [bunkit](https://github.com/Arakiss/bunkit) 🍞

## Structure

\`\`\`
${context.projectName}/
├── apps/
│   ├── web/        # Customer-facing app (landing, marketing)
│   ├── platform/   # Dashboard/Admin panel (port 3001)
│   └── api/        # Backend API (Hono)
└── packages/
    ├── types/      # Shared TypeScript types
    └── utils/      # Shared utilities
\`\`\`

## The Enterprise SaaS Trifecta

This monorepo follows the proven enterprise pattern:

1. **web** (\`localhost:3000\`) - Public-facing customer app
   - Landing pages, marketing content, blog
   - Optimized for SEO and conversion

2. **platform** (\`localhost:3001\`) - Internal dashboard
   - Admin panel, user management
   - Analytics, settings, configuration
   - Authenticated access only

3. **api** (\`localhost:3001/api\`) - Backend services
   - REST API with Hono
   - Database operations, business logic
   - Shared across web and platform

## Getting Started

\`\`\`bash
bun install
bun dev
\`\`\`

## Development

- \`bun dev\` - Start all apps in development mode
- \`bun build\` - Build all apps for production
- \`bun lint\` - Lint all code with Biome
- \`bun format\` - Format all code with Biome

## Individual Apps

\`\`\`bash
cd apps/web && bun dev         # Start customer-facing app
cd apps/platform && bun dev    # Start admin dashboard
cd apps/api && bun dev         # Start backend API
\`\`\`

---

Built with ❤️ using Bun monorepo features
`;

  await writeFile(join(projectPath, 'README.md'), readmeContent);

  // Root tsconfig.json
  const tsconfigContent = {
    compilerOptions: {
      target: 'ESNext',
      lib: ['ESNext'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      skipLibCheck: true,
    },
    include: ['apps/*/src/**/*', 'packages/*/src/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

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
      dependencies: context.database === 'supabase'
        ? {
            '@supabase/supabase-js': '^2.48.1',
            'drizzle-orm': '^0.38.0',
            'postgres': '^3.4.5',
          }
        : {
            'drizzle-orm': '^0.38.0',
          },
      devDependencies: {
        'drizzle-kit': '^0.30.1',
        '@types/bun': 'latest',
        'typescript': '^5.7.2',
      },
    };

    await writeFile(
      join(dbPackagePath, 'package.json'),
      JSON.stringify(dbPackageJson, null, 2)
    );

    // Setup database files
    if (context.database === 'postgres-drizzle') {
      await setupPostgresDrizzle(dbPackagePath, context, true);
    } else if (context.database === 'supabase') {
      await setupSupabase(dbPackagePath, context, true);
    } else if (context.database === 'sqlite-drizzle') {
      await setupSQLiteDrizzle(dbPackagePath, context, true);
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
    const dockerCompose = `version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: ../../Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      ${context.database === 'supabase' ? '- NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}\n      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}' : ''}
    restart: unless-stopped

  platform:
    build:
      context: ./apps/platform
      dockerfile: ../../Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      ${context.database === 'supabase' ? '- NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}\n      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}' : ''}
    restart: unless-stopped

  api:
    build:
      context: ./apps/api
      dockerfile: ../../Dockerfile
    ports:
      - "3002:3001"
    environment:
      - NODE_ENV=production
      ${context.database && context.database !== 'none' && context.database !== 'supabase' ? `- DATABASE_URL=\${DATABASE_URL}` : ''}
    ${context.database && context.database !== 'none' && context.database !== 'supabase' ? 'depends_on:\n      - db' : ''}
    restart: unless-stopped

  ${context.database && context.database !== 'none' && context.database !== 'supabase' ? `db:
    image: ${context.database === 'sqlite-drizzle' ? 'alpine:latest' : 'postgres:16-alpine'}
    ${context.database !== 'sqlite-drizzle' ? `environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${context.projectName}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"` : 'volumes:\n      - sqlite_data:/data'}
    restart: unless-stopped
` : ''}
${context.database && context.database !== 'none' && context.database !== 'supabase' ? `volumes:
  ${context.database === 'sqlite-drizzle' ? 'sqlite_data:' : 'postgres_data:'}` : ''}
`;

    await writeFile(join(projectPath, 'docker-compose.yml'), dockerCompose);
  }

  // Setup CI/CD for monorepo (with matrix builds for each app)
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }
}
