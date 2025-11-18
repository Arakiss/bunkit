import type { PresetConfig } from './types';
import type { PresetType } from '@bunkit/core';

/**
 * Normalize preset name (handle aliases to primary names)
 * Maps all aliases to their primary names for internal processing
 */
function normalizePreset(preset: PresetType): PresetType {
  // Map aliases to primary names
  const aliasMap: Record<string, PresetType> = {
    'web': 'nextjs',
    'api': 'hono-api',
    'full': 'nextjs-monorepo',
    'monorepo-nextjs': 'nextjs-monorepo',
    'monorepo-bun': 'bun-monorepo',
  };
  
  return (aliasMap[preset] || preset) as PresetType;
}

/**
 * Get configuration for a preset
 */
export function getPresetConfig(preset: PresetType): PresetConfig {
  const normalized = normalizePreset(preset);
  
  switch (normalized) {
    case 'minimal':
      return getMinimalPreset();
    case 'nextjs':
      return getWebPreset();
    case 'hono-api':
      return getApiPreset();
    case 'bun-api':
      return getBunApiPreset();
    case 'bun-fullstack':
      return getBunFullstackPreset();
    case 'nextjs-monorepo':
      return getFullPreset();
    case 'bun-monorepo':
      return getMonorepoBunPreset();
    case 'enterprise-monorepo':
      return getEnterprisePreset();
    default:
      throw new Error(`Unknown preset: ${preset} (normalized: ${normalized})`);
  }
}

function getMinimalPreset(): PresetConfig {
  return {
    name: 'minimal',
    description: 'Single-file Bun project - perfect for CLIs and scripts',
    files: [
      {
        path: 'src/index.ts',
        content: `console.log('Hello from <%= projectName %>!');`,
        template: true,
      },
    ],
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
    },
  };
}

function getWebPreset(): PresetConfig {
  return {
    name: 'nextjs',
    description: 'Next.js 16 + React 19 - Production-ready web application',
    files: [],
    dependencies: {
      react: '^19.1.0',
      'react-dom': '^19.1.0',
      next: '^16.0.0',
    },
    devDependencies: {
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      '@types/node': '^22.10.6',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
  };
}

function getApiPreset(): PresetConfig {
  return {
    name: 'hono-api',
    description: 'Hono 4 + Bun.serve() - Full-featured API with middleware ecosystem',
    files: [],
    dependencies: {
      hono: '^4.7.12',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
    },
  };
}

function getBunApiPreset(): PresetConfig {
  return {
    name: 'bun-api',
    description: 'Bun.serve() native routing - Ultra-fast API with zero dependencies',
    files: [],
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
    },
  };
}

function getBunFullstackPreset(): PresetConfig {
  return {
    name: 'bun-fullstack',
    description: 'Bun.serve() + HTML imports - Full-stack app without Next.js',
    files: [],
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
    scripts: {
      dev: 'bun run --hot src/index.ts',
      build: 'bun build src/index.ts --outdir ./dist --target bun',
      start: 'bun run dist/index.js',
    },
  };
}

function getFullPreset(): PresetConfig {
  return {
    name: 'nextjs-monorepo',
    description: 'Monorepo with Next.js + Hono - Enterprise SaaS architecture',
    files: [],
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'bun run --filter "*" dev',
      build: 'bun run --filter "*" build',
    },
  };
}

function getMonorepoBunPreset(): PresetConfig {
  return {
    name: 'bun-monorepo',
    description: 'Monorepo with Bun.serve() - Full-stack without Next.js',
    files: [],
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'bun run --filter "*" dev',
      build: 'bun run --filter "*" build',
    },
  };
}

function getEnterprisePreset(): PresetConfig {
  return {
    name: 'enterprise-monorepo',
    description: 'Enterprise monorepo with multiple Next.js apps and services',
    files: [],
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
    scripts: {
      dev: 'bun run --filter "*" dev',
      build: 'bun run --filter "*" build',
    },
  };
}
