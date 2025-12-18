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
import { setupBunSecrets } from '../generators/secrets';
import { generateBunfigContent } from '../generators/bunfig';
import { setupUltracite, setupBiome } from '../generators/ultracite';
import { setupDocker } from '../generators/docker';
import { setupGitHubActions } from '../generators/cicd';
import { setupVSCodeDebug } from '../generators/debug';
import { generateBunApiReadme } from '../generators/readme';

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
 * Build Bun.serve() native API preset files
 * Ultra-fast API with zero dependencies using Bun's native routing
 */
export async function buildBunApiPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Setup Bun.serve() native routing
  await setupBunServeNative(projectPath, context, false);

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
  await setupVSCodeDebug(projectPath, context, 'api');

  // Create package.json
  const packageJson = {
    name: context.packageName,
    version: '0.1.0',
    description: context.description,
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
  };

  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create bunfig.toml
  const bunfigContent = generateBunfigContent(context);
  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // Generate README.md with author attribution
  await generateBunApiReadme(projectPath, context);
}

