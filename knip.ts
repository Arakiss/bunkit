import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    // CLI entry point
    'packages/cli/src/index.ts',

    // Package exports
    'packages/core/src/index.ts',
    'packages/templates/src/index.ts',
    'packages/generators/src/index.ts',

    // Test files
    'packages/*/src/**/*.test.ts',
  ],

  project: [
    'packages/*/src/**/*.{ts,tsx,js,jsx}',
    '!**/*.test.{ts,tsx,js,jsx}',
    '!**/*.spec.{ts,tsx,js,jsx}',
  ],

  ignore: ['node_modules/**', 'dist/**', 'build/**', '.changeset/**', 'packages/*/dist/**'],

  // Suppress catalog entries warning - these are template versions, not direct deps
  rules: {
    unlisted: 'warn',
    unresolved: 'error',
  },

  // Ignore dependencies that are used dynamically or in templates
  ignoreDependencies: [
    // These are template dependencies scaffolded into generated projects
    // They appear in package.json catalog but are not imported by bunkit itself
    'react',
    'react-dom',
    'next',
    'hono',
    'drizzle-orm',
    'drizzle-kit',
    'postgres',
    'mysql2',
    '@prisma/client',
    'prisma',
    '@supabase/supabase-js',
    'better-auth',
    'next-auth',
    '@auth/drizzle-adapter',
    'ultracite',
    '@biomejs/biome',
    'tailwindcss',
    'autoprefixer',
    'postcss',
    '@tailwindcss/postcss',
    '@radix-ui/react-slot',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'lucide-react',
    'iconoir-react',
    'tw-animate-css',
    'vitest',
    '@vitest/ui',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'typescript',
    '@clack/prompts',
    'commander',
    'fs-extra',
    'consola',
    'defu',
    'ora',
  ],
};

export default config;
