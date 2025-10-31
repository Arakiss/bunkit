import { join } from 'pathe';
import { writeFile, ensureDirectory, type WorkspacePreset } from '@bunkit/core';

/**
 * Build Next.js workspace
 */
export async function buildNextJsWorkspace(
  workspacePath: string,
  workspaceName: string
): Promise<void> {
  // Create directories
  await ensureDirectory(join(workspacePath, 'src/app'));
  await ensureDirectory(join(workspacePath, 'public'));

  // src/app/layout.tsx
  const layoutContent = `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${workspaceName}',
  description: 'Built with bunkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;

  await writeFile(join(workspacePath, 'src/app/layout.tsx'), layoutContent);

  // src/app/page.tsx
  const pageContent = `export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          ${workspaceName}
        </h1>
        <p className="text-gray-600">
          Built with Next.js 16 and bunkit
        </p>
      </div>
    </main>
  )
}
`;

  await writeFile(join(workspacePath, 'src/app/page.tsx'), pageContent);

  // src/app/globals.css
  const globalsCssContent = `@import "tailwindcss";
`;

  await writeFile(join(workspacePath, 'src/app/globals.css'), globalsCssContent);

  // next.config.ts
  const nextConfigContent = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;

  await writeFile(join(workspacePath, 'next.config.ts'), nextConfigContent);

  // tailwind.config.ts
  const tailwindConfigContent = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;

  await writeFile(join(workspacePath, 'tailwind.config.ts'), tailwindConfigContent);

  // tsconfig.json
  const tsconfigContent = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/dev/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  await writeFile(join(workspacePath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

  // README.md
  const readmeContent = `# ${workspaceName}

Next.js workspace in bunkit monorepo.

## Development

\`\`\`bash
bun dev
\`\`\`

## Build

\`\`\`bash
bun build
\`\`\`
`;

  await writeFile(join(workspacePath, 'README.md'), readmeContent);
}

/**
 * Build Hono API workspace
 */
export async function buildHonoWorkspace(
  workspacePath: string,
  workspaceName: string
): Promise<void> {
  // Create directories
  await ensureDirectory(join(workspacePath, 'src/routes'));
  await ensureDirectory(join(workspacePath, 'src/middleware'));

  // src/index.ts
  const indexContent = `import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.get('/', (context) => {
  return context.json({
    message: '${workspaceName} API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (context) => {
  return context.json({ status: 'ok' });
});

export default app;

// Development server
if (import.meta.main) {
  const server = Bun.serve({
    fetch: app.fetch,
    port: 3001,
    development: {
      hmr: true,
    },
  });

  console.log(\`🚀 \${server.url}\`);
}
`;

  await writeFile(join(workspacePath, 'src/index.ts'), indexContent);

  // tsconfig.json
  const tsconfigContent = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      isolatedModules: true,
      types: ['bun-types'],
    },
    include: ['src/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(join(workspacePath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

  // README.md
  const readmeContent = `# ${workspaceName}

Hono API workspace in bunkit monorepo.

## Development

\`\`\`bash
bun dev
\`\`\`

## Test

\`\`\`bash
curl http://localhost:3001
\`\`\`
`;

  await writeFile(join(workspacePath, 'README.md'), readmeContent);
}

/**
 * Build library workspace (shared package)
 */
export async function buildLibraryWorkspace(
  workspacePath: string,
  workspaceName: string
): Promise<void> {
  // Create directories
  await ensureDirectory(join(workspacePath, 'src'));

  // src/index.ts
  const indexContent = `/**
 * ${workspaceName} - Shared library
 */

export function example() {
  return 'Hello from ${workspaceName}';
}
`;

  await writeFile(join(workspacePath, 'src/index.ts'), indexContent);

  // tsconfig.json
  const tsconfigContent = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      outDir: './dist',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  await writeFile(join(workspacePath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

  // README.md
  const readmeContent = `# ${workspaceName}

Shared library in bunkit monorepo.

## Usage

\`\`\`typescript
import { example } from '${workspaceName}';

example(); // "Hello from ${workspaceName}"
\`\`\`

## Build

\`\`\`bash
bun run build
\`\`\`
`;

  await writeFile(join(workspacePath, 'README.md'), readmeContent);
}

/**
 * Build workspace based on preset
 */
export async function buildWorkspace(
  workspacePath: string,
  workspaceName: string,
  preset: WorkspacePreset
): Promise<void> {
  switch (preset) {
    case 'nextjs':
      await buildNextJsWorkspace(workspacePath, workspaceName);
      break;
    case 'hono':
      await buildHonoWorkspace(workspacePath, workspaceName);
      break;
    case 'library':
      await buildLibraryWorkspace(workspacePath, workspaceName);
      break;
    default:
      throw new Error(`Unknown workspace preset: ${preset}`);
  }
}
