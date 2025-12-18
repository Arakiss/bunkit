/**
 * Shared Package.json Builder
 *
 * Single source of truth for generating package.json files.
 * Handles both monorepo root and workspace packages.
 */

import { writeFile } from '@bunkit/core';
import { join } from 'pathe';

export interface PackageJsonOptions {
  name: string;
  version?: string;
  private?: boolean;
  description?: string;
  main?: string;
  types?: string;
  exports?: Record<string, string | Record<string, string>>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[];
  catalog?: Record<string, string>;
}

/**
 * Generate a package.json file
 */
export async function writePackageJson(
  directory: string,
  options: PackageJsonOptions
): Promise<void> {
  const packageJson: Record<string, unknown> = {
    name: options.name,
    version: options.version ?? '0.0.0',
  };

  if (options.private !== undefined) {
    packageJson.private = options.private;
  }

  if (options.description) {
    packageJson.description = options.description;
  }

  if (options.main) {
    packageJson.main = options.main;
  }

  if (options.types) {
    packageJson.types = options.types;
  }

  if (options.exports) {
    packageJson.exports = options.exports;
  }

  if (options.workspaces) {
    packageJson.workspaces = options.workspaces;
  }

  if (options.scripts && Object.keys(options.scripts).length > 0) {
    packageJson.scripts = options.scripts;
  }

  if (options.dependencies && Object.keys(options.dependencies).length > 0) {
    packageJson.dependencies = options.dependencies;
  }

  if (options.devDependencies && Object.keys(options.devDependencies).length > 0) {
    packageJson.devDependencies = options.devDependencies;
  }

  if (options.peerDependencies && Object.keys(options.peerDependencies).length > 0) {
    packageJson.peerDependencies = options.peerDependencies;
  }

  if (options.catalog && Object.keys(options.catalog).length > 0) {
    packageJson.catalog = options.catalog;
  }

  await writeFile(join(directory, 'package.json'), JSON.stringify(packageJson, null, 2));
}

/**
 * Generate monorepo root package.json
 */
export async function writeMonorepoRootPackageJson(
  projectPath: string,
  projectName: string,
  catalog: Record<string, string>,
  options: {
    hasWeb?: boolean;
    hasPlatform?: boolean;
    hasApi?: boolean;
    codeQuality?: 'ultracite' | 'biome';
  } = {}
): Promise<void> {
  const scripts: Record<string, string> = {
    dev: 'bun run --filter "*" dev',
    build: 'bun run --filter "*" build',
    lint: options.codeQuality === 'ultracite' ? 'ultracite check .' : 'biome check .',
    format: options.codeQuality === 'ultracite' ? 'ultracite fix .' : 'biome format --write .',
    test: 'bun test',
  };

  if (options.hasWeb) {
    scripts['dev:web'] = 'bun run --filter "@*/web" dev';
  }
  if (options.hasPlatform) {
    scripts['dev:platform'] = 'bun run --filter "@*/platform" dev';
  }
  if (options.hasApi) {
    scripts['dev:api'] = 'bun run --filter "@*/api" dev';
    scripts.debug = 'bun --inspect apps/api/src/index.ts';
    scripts['debug:brk'] = 'bun --inspect-brk apps/api/src/index.ts';
    scripts['debug:wait'] = 'bun --inspect-wait apps/api/src/index.ts';
  }

  await writePackageJson(projectPath, {
    name: `${projectName}-monorepo`,
    version: '0.0.0',
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts,
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
    catalog,
  });
}

/**
 * Generate Next.js app package.json for monorepo
 *
 * CRITICAL: Must include ALL dependencies that the app uses,
 * including those from packages, due to Bun isolated installs.
 */
export async function writeNextjsAppPackageJson(
  appPath: string,
  scopeName: string,
  appName: string,
  options: {
    usesUi?: boolean;
    usesTypes?: boolean;
  } = {}
): Promise<void> {
  const dependencies: Record<string, string> = {
    react: 'catalog:',
    'react-dom': 'catalog:',
    next: 'catalog:',
    // CRITICAL: Must include iconoir-react here for Bun isolated installs
    // since the app imports icons directly (not through @scope/ui)
    'iconoir-react': 'catalog:',
  };

  // Add workspace dependencies
  if (options.usesTypes) {
    dependencies[`@${scopeName}/types`] = 'workspace:*';
  }
  if (options.usesUi) {
    dependencies[`@${scopeName}/ui`] = 'workspace:*';
  }

  // CRITICAL: Must include Tailwind deps here for Bun isolated installs
  const devDependencies: Record<string, string> = {
    '@types/react': 'catalog:',
    '@types/react-dom': 'catalog:',
    '@types/node': 'catalog:',
    typescript: 'catalog:',
    // Tailwind CSS 4 - MUST be here, not just in packages/ui
    tailwindcss: 'catalog:',
    '@tailwindcss/postcss': 'catalog:',
    postcss: 'catalog:',
  };

  await writePackageJson(appPath, {
    name: `@${scopeName}/${appName}`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      debug: 'bun --inspect node_modules/.bin/next dev',
      'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev',
      'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev',
    },
    dependencies,
    devDependencies,
  });
}

/**
 * Generate Hono API app package.json for monorepo
 */
export async function writeHonoApiPackageJson(
  appPath: string,
  scopeName: string,
  options: {
    usesTypes?: boolean;
    usesDb?: boolean;
  } = {}
): Promise<void> {
  const dependencies: Record<string, string> = {
    hono: 'catalog:',
  };

  // Add workspace dependencies
  if (options.usesTypes) {
    dependencies[`@${scopeName}/types`] = 'workspace:*';
  }
  if (options.usesDb) {
    dependencies[`@${scopeName}/db`] = 'workspace:*';
  }

  await writePackageJson(appPath, {
    name: `@${scopeName}/api`,
    version: '0.0.0',
    private: true,
    scripts: {
      dev: 'bun --hot src/index.ts',
      build: 'bun build src/index.ts --outdir dist --target bun',
      start: 'bun dist/index.js',
      debug: 'bun --inspect src/index.ts',
      'debug:brk': 'bun --inspect-brk src/index.ts',
      'debug:wait': 'bun --inspect-wait src/index.ts',
    },
    dependencies,
    devDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
  });
}

/**
 * Generate UI package package.json for monorepo
 *
 * This is the shared shadcn/ui component library.
 * USES iconoir-react, NOT lucide-react.
 */
export async function writeUiPackageJson(
  packagePath: string,
  scopeName: string
): Promise<void> {
  await writePackageJson(packagePath, {
    name: `@${scopeName}/ui`,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      '.': './src/index.ts',
      './components': './src/components/index.ts',
      './lib/utils': './src/lib/utils.ts',
      './hooks': './src/hooks/index.ts',
      './globals.css': './src/styles/globals.css',
      './postcss.config': './postcss.config.mjs',
    },
    scripts: {
      build: 'tsc --noEmit',
      lint: 'tsc --noEmit',
    },
    dependencies: {
      // Radix UI primitives
      '@radix-ui/react-slot': 'catalog:',
      // Styling utilities
      'class-variance-authority': 'catalog:',
      clsx: 'catalog:',
      'tailwind-merge': 'catalog:',
      // Icons - ONLY iconoir, NOT lucide
      'iconoir-react': 'catalog:',
      // Tailwind CSS 4
      tailwindcss: 'catalog:',
      '@tailwindcss/postcss': 'catalog:',
      postcss: 'catalog:',
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      typescript: 'catalog:',
    },
    peerDependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
  });
}

/**
 * Generate types package package.json for monorepo
 */
export async function writeTypesPackageJson(
  packagePath: string,
  scopeName: string
): Promise<void> {
  await writePackageJson(packagePath, {
    name: `@${scopeName}/types`,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      '.': './src/index.ts',
    },
    scripts: {
      build: 'tsc --noEmit',
      lint: 'tsc --noEmit',
    },
    devDependencies: {
      typescript: 'catalog:',
    },
  });
}

/**
 * Generate utils package package.json for monorepo
 */
export async function writeUtilsPackageJson(
  packagePath: string,
  scopeName: string
): Promise<void> {
  await writePackageJson(packagePath, {
    name: `@${scopeName}/utils`,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      '.': './src/index.ts',
    },
    scripts: {
      build: 'tsc --noEmit',
      lint: 'tsc --noEmit',
    },
    devDependencies: {
      typescript: 'catalog:',
    },
  });
}
