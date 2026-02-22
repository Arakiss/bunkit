import type { PresetType } from '@bunkit/core';
import type { PresetConfig } from './types';

/**
 * Normalize preset name (handle aliases to primary names)
 * Maps all aliases to their primary names for internal processing
 */
function normalizePreset(preset: PresetType): PresetType {
  // Map aliases to primary names
  const aliasMap: Record<string, PresetType> = {
    web: 'nextjs',
    api: 'hono-api',
    full: 'nextjs-monorepo',
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
    case 'nextjs-monorepo':
      return getFullPreset();
    case 'bun-monorepo':
      return getMonorepoBunPreset();
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
      react: '^19.2.3',
      'react-dom': '^19.2.3',
      next: '^16.0.10',
    },
    devDependencies: {
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      '@types/node': '^25.0.3',
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
      hono: '^4.11.1',
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
