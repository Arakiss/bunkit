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
import { setupEnhancedHono } from '../generators/hono';
import { setupBunSecrets } from '../generators/secrets';
import { generateBunfigContent } from '../generators/bunfig';
import { setupUltracite, setupBiome } from '../generators/ultracite';
import { setupDocker } from '../generators/docker';
import { setupGitHubActions } from '../generators/cicd';
import { setupShadcnMonorepo } from '../generators/shadcn';
import { setupVSCodeDebug } from '../generators/debug';
import { setupTooling } from '../generators/tooling';
import { buildNextJsWorkspace } from './workspace';
import { buildHonoWorkspace } from './workspace';

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
 * Build enterprise monorepo preset files
 * Structure designed for enterprise SaaS with multiple apps and services
 */
export async function buildEnterprisePreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create enterprise monorepo structure
  await ensureDirectory(join(projectPath, 'apps/web'));          // Marketing/Landing site Next.js app
  await ensureDirectory(join(projectPath, 'apps/app'));          // Main SaaS product Next.js app
  await ensureDirectory(join(projectPath, 'apps/platform'));     // Admin/Dashboard Next.js app
  await ensureDirectory(join(projectPath, 'apps/service-identity')); // Identity service API
  await ensureDirectory(join(projectPath, 'packages/types'));
  await ensureDirectory(join(projectPath, 'packages/utils'));
  await ensureDirectory(join(projectPath, 'packages/ui'));       // Shared UI components

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
      react: '^19.1.0',
      'react-dom': '^19.1.0',
      next: '^16.0.0',

      // Backend
      hono: '^4.7.12',

      // Database
      'drizzle-orm': '^0.38.0',
      'drizzle-kit': '^0.30.1',
      postgres: '^3.4.5',
      '@supabase/supabase-js': '^2.48.1',

      // Styling
      tailwindcss: '^4.1.7',
      autoprefixer: '^10.4.20',
      postcss: '^8.5.1',
      '@tailwindcss/postcss': '^4.1.7',

      // UI
      '@radix-ui/react-slot': '^1.2.3',
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.3.1',
      'iconoir-react': '^7.11.0',
      'lucide-react': '^0.468.0',

      // Code Quality
      '@biomejs/biome': '^2.3.0',
      ultracite: '^6.3.4',

      // Testing
      vitest: '^2.0.0',
      '@vitest/ui': '^2.0.0',

      // Types
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      '@types/node': '^22.10.6',
      typescript: '^5.9.3',
    },
  };

  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(rootPackageJson, null, 2)
  );

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
      dev: 'next dev -p 3000',
      build: 'next build',
      start: 'next start -p 3000',
      lint: 'biome check .',
      format: 'biome check --write .',
      debug: 'bun --inspect node_modules/.bin/next dev -p 3000',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev -p 3000',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev -p 3000',
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
      dev: 'next dev -p 3001',
      build: 'next build',
      start: 'next start -p 3001',
      lint: 'biome check .',
      format: 'biome check --write .',
      debug: 'bun --inspect node_modules/.bin/next dev -p 3001',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev -p 3001',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev -p 3001',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/utils`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
      ...(context.database && context.database !== 'none' ? { [`@${context.packageName}/db`]: 'workspace:*' } : {}),
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
      dev: 'next dev -p 3002',
      build: 'next build',
      start: 'next start -p 3002',
      lint: 'biome check .',
      format: 'biome check --write .',
      debug: 'bun --inspect node_modules/.bin/next dev -p 3002',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev -p 3002',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev -p 3002',
    },
    dependencies: {
      react: 'catalog:',
      'react-dom': 'catalog:',
      next: 'catalog:',
      [`@${context.packageName}/types`]: 'workspace:*',
      [`@${context.packageName}/utils`]: 'workspace:*',
      [`@${context.packageName}/ui`]: 'workspace:*',
      ...(context.database && context.database !== 'none' ? { [`@${context.packageName}/db`]: 'workspace:*' } : {}),
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
      ...(context.database && context.database !== 'none' ? { [`@${context.packageName}/db`]: 'workspace:*' } : {}),
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

  // Setup shadcn/ui if configured
  if (context.uiLibrary === 'shadcn') {
    await setupShadcnMonorepo(projectPath, context);
  }

  // Setup shared tooling (TypeScript configs)
  await setupTooling(projectPath, context);

  // Setup VSCode debugging
  await setupVSCodeDebug(projectPath, context);

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

  // Create README
  const readmeContent = `# ${context.projectName}

Enterprise monorepo created with [bunkit](https://github.com/Arakiss/bunkit) 🍞

## Architecture

This monorepo follows enterprise patterns with multiple applications and services:

\`\`\`
${context.projectName}/
├── apps/
│   ├── web/               # Marketing/Landing site (port 3000)
│   ├── app/               # Main SaaS product (port 3002)
│   ├── platform/          # Admin/Dashboard (port 3001)
│   └── service-identity/  # Identity service API (port 3003)
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Shared utilities
│   ├── ui/                # Shared UI components (shadcn/ui)
│   ${context.database && context.database !== 'none' ? '└── db/                # Shared database schema' : ''}
└── tooling/
    └── typescript/        # Shared TypeScript configurations
\`\`\`

## Applications

### Web (\`apps/web\`) - Port 3000

Marketing site and landing pages - your public-facing website.

- Landing pages, blog, marketing content
- Optimized for SEO and conversion
- Public access

\`\`\`bash
bun run dev:web
# Or: cd apps/web && bun dev
\`\`\`

### App (\`apps/app\`) - Port 3002

Main SaaS product application - your core product.

- Customer-facing features
- User dashboard and functionality
- Authenticated user access

\`\`\`bash
bun run dev:app
# Or: cd apps/app && bun dev
\`\`\`

### Platform (\`apps/platform\`) - Port 3001

Admin dashboard and internal tools for managing the platform.

- User management
- Analytics and reporting
- System configuration
- Authenticated admin access only

\`\`\`bash
bun run dev:platform
# Or: cd apps/platform && bun dev
\`\`\`

### Service Identity (\`apps/service-identity\`) - Port 3003

Identity and authentication service API.

- User authentication
- User management endpoints
- Identity verification
- Shared across web, app, and platform

\`\`\`bash
bun run dev:identity
# Or: cd apps/service-identity && bun dev
\`\`\`

## Getting Started

\`\`\`bash
# Install all dependencies
bun install

# Start all apps in development
bun dev

# Start individual apps
bun run dev:web         # Start marketing site
bun run dev:app         # Start main product app
bun run dev:platform    # Start admin dashboard
bun run dev:identity    # Start identity service

# Build all apps
bun build

# Lint and format
bun lint
bun format
\`\`\`

## Adding More Services

You can easily add more services using bunkit:

\`\`\`bash
# Add a new service API
bunkit add workspace --name apps/service-payments --preset hono

# Add a new Next.js app
bunkit add workspace --name apps/docs --preset nextjs

# Add shared packages
bunkit add package --name @${context.packageName}/email --type library
\`\`\`

## Development Workflow

1. **Shared Code**: Place shared types, utilities, and components in \`packages/\`
2. **Service Communication**: Services communicate via HTTP APIs
3. **Type Safety**: Use shared types from \`@${context.packageName}/types\`
4. **UI Components**: Use shared components from \`@${context.packageName}/ui\`

## Production Deployment

Each app and service can be deployed independently:

- \`apps/web\` → Deploy to your marketing domain (e.g., www.example.com)
- \`apps/app\` → Deploy to your main product domain (e.g., app.example.com)
- \`apps/platform\` → Deploy to your admin subdomain (e.g., admin.example.com)
- \`apps/service-identity\` → Deploy as microservice (e.g., api.example.com)

---

Built with ❤️ using Bun monorepo features
`;

  await writeFile(join(projectPath, 'README.md'), readmeContent);

  // Root tsconfig.json (references tooling)
  const tsconfigContent = {
    extends: './tooling/typescript/base.json',
    compilerOptions: {
      // Can override base config here if needed
    },
    include: ['apps/*/src/**/*', 'packages/*/src/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );
}

