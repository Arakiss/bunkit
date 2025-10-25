import type { PresetConfig } from './types';
import type { PresetType } from '@bunkit/core';

/**
 * Get configuration for a preset
 */
export function getPresetConfig(preset: PresetType): PresetConfig {
  switch (preset) {
    case 'minimal':
      return getMinimalPreset();
    case 'web':
      return getWebPreset();
    case 'api':
      return getApiPreset();
    case 'full':
      return getFullPreset();
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

function getMinimalPreset(): PresetConfig {
  return {
    name: 'minimal',
    description: 'Minimal Bun project',
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
      typescript: '^5.7.2',
    },
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
    },
  };
}

function getWebPreset(): PresetConfig {
  return {
    name: 'web',
    description: 'Next.js 15 with React 19',
    files: [],
    dependencies: {
      react: '^19.1.0',
      'react-dom': '^19.1.0',
      next: '^15.5.6',
    },
    devDependencies: {
      '@types/react': '^19.1.0',
      '@types/react-dom': '^19.1.0',
      '@types/node': '^22.10.6',
      typescript: '^5.7.2',
    },
    scripts: {
      dev: 'next dev --turbopack',
      build: 'next build',
      start: 'next start',
    },
  };
}

function getApiPreset(): PresetConfig {
  return {
    name: 'api',
    description: 'Hono API with Bun',
    files: [],
    dependencies: {
      hono: '^4.7.12',
    },
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.7.2',
    },
    scripts: {
      dev: 'bun run --hot src/index.ts',
      start: 'bun run src/index.ts',
    },
  };
}

function getFullPreset(): PresetConfig {
  return {
    name: 'full',
    description: 'Full-stack monorepo with Next.js, Hono, and shared packages',
    files: [],
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.7.2',
    },
    scripts: {
      dev: 'bun run --filter "*" dev',
      build: 'bun run --filter "*" build',
    },
  };
}
