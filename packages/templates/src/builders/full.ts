import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

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
}
