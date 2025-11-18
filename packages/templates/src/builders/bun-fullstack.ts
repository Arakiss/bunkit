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
      react: '^19.1.0',
      'react-dom': '^19.1.0',
    },
    devDependencies: {
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
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

  // Create README
  const readmeContent = `# ${context.projectName}

Full-stack application built with Bun.serve() + HTML imports.

## Features

- ⚡ **Zero framework overhead** - No Next.js, just Bun
- 🔥 **Hot Module Replacement** - Native HMR with \`bun --hot\`
- 📦 **HTML imports** - Full-stack bundling with Bun
- 🚀 **Ultra-fast** - Native Bun performance
- 🛡️ **Type-safe** - Full TypeScript support

## Getting Started

\`\`\`bash
# Development with hot reload
bun run dev

# Build for production
bun run build

# Production
bun run start

# Debugging
bun run debug
\`\`\`

## Project Structure

\`\`\`
src/
├── index.ts          # Main server entry point
├── app/
│   ├── index.html   # HTML entry point
│   └── client.tsx   # React client code
├── routes/           # API route handlers
├── middleware/       # Middleware functions
└── utils/            # Utility functions
\`\`\`

## Development vs Production

**Development (\`bun --hot\`):**
- Assets bundled on-demand at runtime
- Hot module replacement enabled
- Fast iterative development

**Production (\`bun build\`):**
- Pre-built manifest with optimized assets
- Zero runtime bundling overhead
- Ideal for deployment

## API Routes

- \`GET /\` - Serves the React app
- \`GET /health\` - Health check
- \`GET /api/version\` - API version info
${context.database && context.database !== 'none' ? '- `GET /api/users` - List users' : ''}

## Environment Variables

\`\`\`bash
PORT=3000              # Server port (default: 3000)
HOSTNAME=0.0.0.0       # Server hostname (default: 0.0.0.0)
NODE_ENV=development   # Environment mode
\`\`\`

Built with [bunkit](https://github.com/Arakiss/bunkit) 🍞
`;

  await writeFile(join(projectPath, 'README.md'), readmeContent);
}

