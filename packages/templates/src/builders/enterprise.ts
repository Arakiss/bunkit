import { type DatabaseType, ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { setupBetterAuth, setupNextAuth } from '../generators/auth';
import { generateBunfigContent } from '../generators/bunfig';
import { setupGitHubActions } from '../generators/cicd';
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
import { setupVSCodeDebug } from '../generators/debug';
import { setupDocker } from '../generators/docker';
import { generateMonorepoReadme } from '../generators/readme';
import { setupBunSecrets } from '../generators/secrets';
import { setupShadcnMonorepo } from '../generators/shadcn';
import { setupTooling } from '../generators/tooling';
import { setupBiome, setupUltracite } from '../generators/ultracite';
import { buildHonoWorkspace, buildNextJsWorkspace } from './workspace';

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

/**
 * Build enterprise monorepo preset files
 * Structure designed for enterprise SaaS with multiple apps and services
 */
export async function buildEnterprisePreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create enterprise monorepo structure
  await ensureDirectory(join(projectPath, 'apps/web')); // Marketing/Landing site Next.js app
  await ensureDirectory(join(projectPath, 'apps/app')); // Main SaaS product Next.js app
  await ensureDirectory(join(projectPath, 'apps/platform')); // Admin/Dashboard Next.js app
  await ensureDirectory(join(projectPath, 'apps/service-identity')); // Identity service API
  await ensureDirectory(join(projectPath, 'packages/types'));
  await ensureDirectory(join(projectPath, 'packages/utils'));
  await ensureDirectory(join(projectPath, 'packages/ui')); // Shared UI components

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
      'dev:web': 'bun run --filter @*/web dev',
      'dev:app': 'bun run --filter @*/app dev',
      'dev:platform': 'bun run --filter @*/platform dev',
      'dev:identity': 'bun run --filter @*/service-identity dev',
      debug: 'bun --inspect apps/service-identity/src/index.ts',
      'debug:brk': 'bun --inspect-brk apps/service-identity/src/index.ts',
      'debug:wait': 'bun --inspect-wait apps/service-identity/src/index.ts',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
      ...(context.codeQuality === 'biome' ? { '@biomejs/biome': 'catalog:' } : {}),
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
      '@biomejs/biome': '^2.3.10',
      ultracite: '^6.4.2',

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

  // Build Next.js workspaces
  await buildNextJsWorkspace(join(projectPath, 'apps/web'), 'web');
  await buildNextJsWorkspace(join(projectPath, 'apps/app'), 'app');
  await buildNextJsWorkspace(join(projectPath, 'apps/platform'), 'platform');

  // Build Hono service workspace
  await buildHonoWorkspace(join(projectPath, 'apps/service-identity'), 'service-identity');

  // Create package.json files for each app
  const webPackageJson = {
    name: `@${context.packageName}/web`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev -p ${PORT:-3000}',
      build: 'next build',
      start: 'next start -p ${PORT:-3000}',
      lint: 'biome check .',
      format: 'biome check --write .',
      debug: 'bun --inspect node_modules/.bin/next dev -p ${PORT:-3000}',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev -p ${PORT:-3000}',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev -p ${PORT:-3000}',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/utils`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@types/node': 'catalog:',
      typescript: 'catalog:',
      tailwindcss: 'catalog:',
      '@tailwindcss/postcss': 'catalog:',
    },
  };

  const platformPackageJson = {
    name: `@${context.packageName}/platform`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev -p ${PORT:-3001}',
      build: 'next build',
      start: 'next start -p ${PORT:-3001}',
      lint: 'biome check .',
      format: 'biome check --write .',
      debug: 'bun --inspect node_modules/.bin/next dev -p ${PORT:-3001}',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev -p ${PORT:-3001}',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev -p ${PORT:-3001}',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/utils`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
      ...(context.database && context.database !== 'none'
        ? { [`@${context.packageName}/db`]: 'workspace:*' }
        : {}),
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@types/node': 'catalog:',
      typescript: 'catalog:',
      tailwindcss: 'catalog:',
      '@tailwindcss/postcss': 'catalog:',
    },
  };

  const appPackageJson = {
    name: `@${context.packageName}/app`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev -p ${PORT:-3002}',
      build: 'next build',
      start: 'next start -p ${PORT:-3002}',
      lint: 'biome check .',
      format: 'biome check --write .',
      debug: 'bun --inspect node_modules/.bin/next dev -p ${PORT:-3002}',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev -p ${PORT:-3002}',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev -p ${PORT:-3002}',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/utils`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
      ...(context.database && context.database !== 'none'
        ? { [`@${context.packageName}/db`]: 'workspace:*' }
        : {}),
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      '@types/node': 'catalog:',
      typescript: 'catalog:',
      tailwindcss: 'catalog:',
      '@tailwindcss/postcss': 'catalog:',
    },
  };

  const serviceIdentityPackageJson = {
    name: `@${context.packageName}/service-identity`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
      test: 'bun test',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies: {
      hono: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/utils`]: 'workspace:*',
      ...(context.database && context.database !== 'none'
        ? { [`@${context.packageName}/db`]: 'workspace:*' }
        : {}),
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
  };

  await writeFile(
    join(projectPath, 'apps/web/package.json'),
    JSON.stringify(webPackageJson, null, 2)
  );

  await writeFile(
    join(projectPath, 'apps/app/package.json'),
    JSON.stringify(appPackageJson, null, 2)
  );

  await writeFile(
    join(projectPath, 'apps/platform/package.json'),
    JSON.stringify(platformPackageJson, null, 2)
  );

  await writeFile(
    join(projectPath, 'apps/service-identity/package.json'),
    JSON.stringify(serviceIdentityPackageJson, null, 2)
  );

  // Setup database if configured
  if (context.database && context.database !== 'none') {
    await databaseSetupMap[context.database](projectPath, context, true);
  }

  // Setup Redis if configured
  if (context.redis) {
    await setupRedis(projectPath, context, true);
  }

  // Setup authentication if configured
  if (context.auth && context.auth !== 'none') {
    if (context.auth === 'better-auth') {
      await setupBetterAuth(projectPath, context, true);
    } else if (context.auth === 'nextauth') {
      await setupNextAuth(projectPath, context, true);
    }
  }

  // Setup Bun.secrets if configured
  if (context.useBunSecrets) {
    await setupBunSecrets(projectPath, context);
  }

  // Setup code quality
  if (context.codeQuality === 'ultracite') {
    await setupUltracite(projectPath, context);
  } else {
    await setupBiome(projectPath, context);
  }

  // Setup Docker if configured
  if (context.docker) {
    await setupDocker(projectPath, context);
  }

  // Setup CI/CD if configured
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }

  // Setup shadcn/ui for enterprise preset (always included with Tailwind)
  // Enterprise presets should always have shadcn/ui configured for shared UI components
  if (
    context.cssFramework === 'tailwind' &&
    (context.uiLibrary === 'shadcn' || context.uiLibrary === undefined)
  ) {
    // Ensure uiLibrary is set to shadcn for enterprise preset
    const enterpriseContext = {
      ...context,
      uiLibrary: 'shadcn' as const,
      shadcnStyle: context.shadcnStyle || 'new-york',
      shadcnBaseColor: context.shadcnBaseColor || 'zinc',
      shadcnRadius: context.shadcnRadius || '0.625rem',
    };
    await setupShadcnMonorepo(projectPath, enterpriseContext);
  }

  // Setup shared tooling (TypeScript configs)
  await setupTooling(projectPath, context);

  // Setup VSCode debugging
  await setupVSCodeDebug(projectPath, context);

  // Create shared types package
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

  await ensureDirectory(join(projectPath, 'packages/types/src'));
  await writeFile(join(projectPath, 'packages/types/src/index.ts'), typesContent);

  // Create shared utils package
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
  return date.toISOString();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;

  await ensureDirectory(join(projectPath, 'packages/utils/src'));
  await writeFile(join(projectPath, 'packages/utils/src/index.ts'), utilsContent);

  // Create service-identity API structure
  await ensureDirectory(join(projectPath, 'apps/service-identity/src/routes'));
  await ensureDirectory(join(projectPath, 'apps/service-identity/src/middleware'));

  const serviceIdentityIndex = `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'identity' });
});

// Identity routes
app.get('/api/identity/users', async (c) => {
  // TODO: Implement user listing
  return c.json({ users: [] });
});

app.get('/api/identity/users/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement user retrieval
  return c.json({ id, user: null });
});

export default {
  port: 3003,
  fetch: app.fetch,
};
`;

  await writeFile(join(projectPath, 'apps/service-identity/src/index.ts'), serviceIdentityIndex);

  // Generate README.md with author attribution
  await generateMonorepoReadme(projectPath, context, 'enterprise');

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
}
