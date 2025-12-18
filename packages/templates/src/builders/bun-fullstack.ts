import { type DatabaseType, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { setupBetterAuth, setupNextAuth } from '../generators/auth';
import { setupBunFullstack } from '../generators/bun-fullstack';
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
import { generateBunFullstackReadme } from '../generators/readme';
import { setupBunSecrets } from '../generators/secrets';
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
 * Build Bun.serve() full-stack preset files
 * Full-stack app with HTML imports (no Next.js)
 */
export async function buildBunFullstackPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Setup Bun.serve() full-stack with HTML imports
  await setupBunFullstack(projectPath, context);

  // Setup database if configured
  if (context.database) {
    await databaseSetupMap[context.database](projectPath, context, false);
  }

  // Setup Redis if configured
  if (context.redis) {
    await setupRedis(projectPath, context, false);
  }

  // Setup authentication if configured
  if (context.auth === 'better-auth') {
    await setupBetterAuth(projectPath, context, false);
  } else if (context.auth === 'nextauth') {
    await setupNextAuth(projectPath, context, false);
  }

  // Setup Bun.secrets if configured
  if (context.useBunSecrets) {
    await setupBunSecrets(projectPath, context, false);
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
  await setupVSCodeDebug(projectPath, context, 'web');

  // Create package.json
  const packageJson = {
    name: context.packageName,
    version: '0.1.0',
    description: context.description,
    scripts: {
      dev: 'bun run --hot src/index.ts',
      build: 'bun build src/index.ts --outdir ./dist --target bun',
      start: 'bun run dist/index.js',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies: {
      react: '^19.2.3',
      'react-dom': '^19.2.3',
    },
    devDependencies: {
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
  };

  await writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Create bunfig.toml
  const bunfigContent = generateBunfigContent(context);
  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // Generate README.md with author attribution
  await generateBunFullstackReadme(projectPath, context);
}
