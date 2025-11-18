import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Setup shared tooling directory with TypeScript configurations
 */
export async function setupTooling(projectPath: string, context: TemplateContext): Promise<void> {
  await ensureDirectory(join(projectPath, 'tooling/typescript'));

  // Base TypeScript config for monorepo root
  const baseTsConfig = {
    compilerOptions: {
      target: 'ESNext',
      lib: ['ESNext'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: context.tsStrictness === 'strict',
      skipLibCheck: true,
      noEmit: true,
      composite: false,
      declaration: false,
      declarationMap: false,
    },
  };

  // Next.js app base config
  const nextjsBaseConfig = {
    extends: '../../tooling/typescript/base.json',
    compilerOptions: {
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
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/dev/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  // API/Hono base config
  const apiBaseConfig = {
    extends: '../../tooling/typescript/base.json',
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
      skipLibCheck: true,
      types: ['bun'],
      paths: {
        '@/*': ['./src/*'],
      },
    },
  };

  // Library/package base config
  const libraryBaseConfig = {
    extends: '../../tooling/typescript/base.json',
    compilerOptions: {
      target: 'ESNext',
      lib: ['ESNext'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      declaration: true,
      declarationMap: true,
      outDir: './dist',
      rootDir: './src',
      composite: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  // Write base config
  await writeFile(
    join(projectPath, 'tooling/typescript/base.json'),
    JSON.stringify(baseTsConfig, null, 2)
  );

  // Write Next.js base config
  await writeFile(
    join(projectPath, 'tooling/typescript/nextjs.json'),
    JSON.stringify(nextjsBaseConfig, null, 2)
  );

  // Write API base config
  await writeFile(
    join(projectPath, 'tooling/typescript/api.json'),
    JSON.stringify(apiBaseConfig, null, 2)
  );

  // Write library base config
  await writeFile(
    join(projectPath, 'tooling/typescript/library.json'),
    JSON.stringify(libraryBaseConfig, null, 2)
  );

  // README for tooling
  const toolingReadme = `# Tooling

Shared configuration files for the monorepo.

## TypeScript Configurations

- \`base.json\` - Base TypeScript configuration
- \`nextjs.json\` - Configuration for Next.js applications
- \`api.json\` - Configuration for API/Hono services
- \`library.json\` - Configuration for shared packages/libraries

## Usage

Extend these configurations in your workspace \`tsconfig.json\`:

\`\`\`json
{
  "extends": "../../tooling/typescript/nextjs.json",
  "compilerOptions": {
    // Override specific options if needed
  }
}
\`\`\`
`;

  await writeFile(join(projectPath, 'tooling/README.md'), toolingReadme);
}

