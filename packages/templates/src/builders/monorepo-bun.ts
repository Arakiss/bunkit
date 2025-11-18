import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext, type DatabaseType } from '@bunkit/core';
import {
  setupPostgresDrizzle,
  setupPostgresPrisma,
  setupMySQLDrizzle,
  setupMySQLPrisma,
  setupSupabaseOnly,
  setupSupabaseDrizzle,
  setupSupabasePrisma,
  setupSQLiteDrizzle,
  setupSQLitePrisma,
  setupRedis,
} from '../generators/database';
import {
  setupBetterAuth,
  setupNextAuth,
} from '../generators/auth';
import { setupBunServeNative } from '../generators/bun-serve';
import { setupBunFullstack } from '../generators/bun-fullstack';
import { setupBunSecrets } from '../generators/secrets';
import { generateBunfigContent } from '../generators/bunfig';
import { setupUltracite, setupBiome } from '../generators/ultracite';
import { setupDocker } from '../generators/docker';
import { setupGitHubActions } from '../generators/cicd';
import { setupVSCodeDebug } from '../generators/debug';

// Database setup function map
const databaseSetupMap: Record<DatabaseType, (path: string, context: TemplateContext, isMonorepo: boolean) => Promise<void>> = {
  'postgres-drizzle': setupPostgresDrizzle,
  'postgres-prisma': setupPostgresPrisma,
  'mysql-drizzle': setupMySQLDrizzle,
  'mysql-prisma': setupMySQLPrisma,
  'supabase': setupSupabaseOnly,
  'supabase-drizzle': setupSupabaseDrizzle,
  'supabase-prisma': setupSupabasePrisma,
  'sqlite-drizzle': setupSQLiteDrizzle,
  'sqlite-prisma': setupSQLitePrisma,
  'none': async () => {}, // No-op
};

/**
 * Build monorepo with Bun.serve() preset files
 * Full-stack monorepo without Next.js (Bun.serve() + HTML imports)
 */
export async function buildMonorepoBunPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create monorepo structure
  await ensureDirectory(join(projectPath, 'apps/web'));      // Frontend with HTML imports
  await ensureDirectory(join(projectPath, 'apps/api'));      // Backend API with Bun.serve()
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
      lint: context.codeQuality === 'biome' ? 'biome check .' : 'ultracite check .',
      format: context.codeQuality === 'biome' ? 'biome check --write .' : 'ultracite format .',
      test: 'bun test',
      debug: 'bun --inspect apps/api/src/index.ts',
      'debug:brk': 'bun --inspect-brk apps/api/src/index.ts',
      'debug:wait': 'bun --inspect-wait apps/api/src/index.ts',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
      ...(context.codeQuality === 'biome' ? { '@biomejs/biome': 'catalog:' } : {}),
    },
    catalog: {
      // Frontend
      react: '^19.1.0',
      'react-dom': '^19.1.0',

      // Database
      'drizzle-orm': '^0.38.0',
      'drizzle-kit': '^0.30.1',
      'postgres': '^3.4.5',
      '@supabase/supabase-js': '^2.48.1',
      '@prisma/client': '^6.19.0',
      prisma: '^6.19.0',
      mysql2: '^3.11.5',

      // Auth
      'better-auth': '^1.3.34',
      'next-auth': '^4.24.13',
      '@auth/drizzle-adapter': '^2.4.0',

      // Styling
      tailwindcss: '^4.1.7',
      autoprefixer: '^10.4.20',
      postcss: '^8.5.1',

      // TypeScript
      typescript: '^5.9.3',
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      '@types/node': '^22.10.6',
    },
  };

  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(rootPackageJson, null, 2)
  );

  // Setup API app with Bun.serve() native
  const apiPath = join(projectPath, 'apps/api');
  await setupBunServeNative(apiPath, context, true);

  // Create API app package.json
  const apiPackageJson = {
    name: `@${context.packageName}/api`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies: {
      [`@${context.packageName}/types`]: 'workspace:*',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
  };

  await writeFile(
    join(apiPath, 'package.json'),
    JSON.stringify(apiPackageJson, null, 2)
  );

  // Setup Web app with Bun.serve() + HTML imports
  const webPath = join(projectPath, 'apps/web');
  await setupBunFullstack(webPath, context);

  // Create Web app package.json
  const webPackageJson = {
    name: `@${context.packageName}/web`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'bun run --hot src/index.ts',
      build: 'bun build src/index.ts --outdir ./dist --target bun',
      start: 'bun run dist/index.js',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
  };

  await writeFile(
    join(webPath, 'package.json'),
    JSON.stringify(webPackageJson, null, 2)
  );

  // Setup database if configured
  if (context.database && context.database !== 'none') {
    await databaseSetupMap[context.database](join(projectPath, 'packages/db'), context, true);
  }

  // Setup Redis if configured
  if (context.redis) {
    await setupRedis(join(projectPath, 'packages'), context, true);
  }

  // Setup authentication if configured
  if (context.auth === 'better-auth') {
    await setupBetterAuth(join(projectPath, 'packages'), context, true);
  } else if (context.auth === 'nextauth') {
    await setupNextAuth(join(projectPath, 'packages'), context, true);
  }

  // Setup Bun.secrets if configured
  if (context.useBunSecrets) {
    await setupBunSecrets(join(projectPath, 'packages'), context, true);
  }

  // Setup code quality
  if (context.codeQuality === 'biome') {
    await setupBiome(projectPath, context);
  } else {
    await setupUltracite(projectPath, context);
  }

  // Setup Docker if configured
  if (context.docker) {
    await setupDocker(projectPath, context);
  }

  // Setup CI/CD if configured
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }

  // Setup VSCode debugging
  await setupVSCodeDebug(projectPath, context, 'full');

  // Create bunfig.toml
  const bunfigContent = generateBunfigContent(context);
  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // Create shared types package
  const typesPackageJson = {
    name: `@${context.packageName}/types`,
    version: '0.0.0',
    private: true,
    main: './index.ts',
    types: './index.ts',
    scripts: {},
    devDependencies: {
      typescript: 'catalog:',
    },
  };

  await ensureDirectory(join(projectPath, 'packages/types'));
  await writeFile(
    join(projectPath, 'packages/types/package.json'),
    JSON.stringify(typesPackageJson, null, 2)
  );

  const typesIndex = `// Shared types across the monorepo
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
`;

  await writeFile(join(projectPath, 'packages/types/index.ts'), typesIndex);

  // Create shared utils package
  const utilsPackageJson = {
    name: `@${context.packageName}/utils`,
    version: '0.0.0',
    private: true,
    main: './index.ts',
    types: './index.ts',
    scripts: {},
    dependencies: {},
    devDependencies: {
      typescript: 'catalog:',
    },
  };

  await ensureDirectory(join(projectPath, 'packages/utils'));
  await writeFile(
    join(projectPath, 'packages/utils/package.json'),
    JSON.stringify(utilsPackageJson, null, 2)
  );

  const utilsIndex = `// Shared utilities across the monorepo
export function formatDate(date: Date): string {
  return date.toISOString();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;

  await writeFile(join(projectPath, 'packages/utils/index.ts'), utilsIndex);

  // Create README
  const readmeContent = `# ${context.projectName}

Full-stack monorepo built with Bun.serve() - no Next.js, just pure Bun performance.

## Structure

\`\`\`
apps/
├── api/          # Bun.serve() native API server
└── web/          # Bun.serve() + HTML imports frontend

packages/
├── types/        # Shared TypeScript types
├── utils/        # Shared utilities
${context.database && context.database !== 'none' ? '└── db/          # Shared database schema' : ''}
\`\`\`

## Features

- ⚡ **Zero framework overhead** - No Next.js, just Bun
- 🔥 **Hot Module Replacement** - Native HMR with \`bun --hot\`
- 📦 **HTML imports** - Full-stack bundling with Bun
- 🚀 **Ultra-fast** - Native Bun performance
- 🛡️ **Type-safe** - Shared types across workspaces

## Getting Started

\`\`\`bash
# Install dependencies
bun install

# Run all apps in development
bun run dev

# Build all apps
bun run build

# Debug API
bun run debug
\`\`\`

## Apps

### API (\`apps/api\`)

Bun.serve() native API server with zero dependencies.

\`\`\`bash
cd apps/api
bun run dev
\`\`\`

### Web (\`apps/web\`)

Full-stack app with HTML imports and React.

\`\`\`bash
cd apps/web
bun run dev
\`\`\`

Built with [bunkit](https://github.com/Arakiss/bunkit) 🍞
`;

  await writeFile(join(projectPath, 'README.md'), readmeContent);
}

