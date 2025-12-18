import { type DatabaseType, ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { setupBetterAuth, setupNextAuth } from '../generators/auth';
import { setupBunFullstack } from '../generators/bun-fullstack';
import { setupBunServeNative } from '../generators/bun-serve';
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
import { setupTooling } from '../generators/tooling';
import { setupBiome, setupUltracite } from '../generators/ultracite';

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
 * Build monorepo with Bun.serve() preset files
 * Full-stack monorepo without Next.js (Bun.serve() + HTML imports)
 */
export async function buildMonorepoBunPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create monorepo structure
  await ensureDirectory(join(projectPath, 'apps/web')); // Frontend with HTML imports
  await ensureDirectory(join(projectPath, 'apps/api')); // Backend API with Bun.serve()
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
      format: context.codeQuality === 'biome' ? 'biome check --write .' : 'ultracite fix .',
      test: 'bun test',
      'dev:web': 'bun run --filter "@*/web" dev',
      'dev:api': 'bun run --filter "@*/api" dev',
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
      react: '^19.2.3',
      'react-dom': '^19.2.3',

      // Database
      'drizzle-orm': '^0.45.1',
      'drizzle-kit': '^0.31.8',
      postgres: '^3.4.7',
      '@supabase/supabase-js': '^2.88.0',
      '@prisma/client': '^7.2.0',
      prisma: '^7.2.0',
      mysql2: '^3.16.0',

      // Auth
      'better-auth': '^1.4.7',
      'next-auth': '^4.24.13',
      '@auth/drizzle-adapter': '^1.11.1',

      // Styling
      tailwindcss: '^4.1.18',
      autoprefixer: '^10.4.23',
      postcss: '^8.5.6',

      // TypeScript
      typescript: '^5.9.3',
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      '@types/node': '^25.0.3',
    },
  };

  await writeFile(join(projectPath, 'package.json'), JSON.stringify(rootPackageJson, null, 2));

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

  await writeFile(join(apiPath, 'package.json'), JSON.stringify(apiPackageJson, null, 2));

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

  await writeFile(join(webPath, 'package.json'), JSON.stringify(webPackageJson, null, 2));

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

  // Setup shared tooling (TypeScript configs)
  await setupTooling(projectPath, context);

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

  // Generate README.md with author attribution
  await generateMonorepoReadme(projectPath, context, 'bun');

  // Root tsconfig.json (references tooling)
  const tsconfigContent = {
    extends: './tooling/typescript/base.json',
    compilerOptions: {
      // Can override base config here if needed
    },
    include: ['apps/*/src/**/*', 'packages/*/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(join(projectPath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
}
