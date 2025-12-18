import {
  type AuthProvider,
  type CodeQualityType,
  type CSSFramework,
  createProject,
  createTemplateContext,
  type DatabaseType,
  installDependencies,
  type PresetType,
  type ProjectConfig,
  type ShadcnBaseColor,
  type ShadcnStyle,
  type SupabaseFeature,
  type SupabasePreset,
  type TestingFramework,
  type TypeScriptStrictness,
  type UILibrary,
  validateProjectName,
} from '@bunkit/core';
import {
  buildApiPreset,
  buildBunApiPreset,
  buildBunFullstackPreset,
  buildEnterprisePreset,
  buildFullPreset,
  buildMinimalPreset,
  buildMonorepoBunPreset,
  buildWebPreset,
  getCodeQualityDependencies,
  getDatabaseDependencies,
  installDefaultShadcnComponents,
} from '@bunkit/templates';
import * as p from '@clack/prompts';
import boxen from 'boxen';
import chalk from 'chalk';
import { join } from 'pathe';

/**
 * Dependency versions for single repos (not monorepos)
 * Monorepos use catalog: references from root package.json
 */
const VERSIONS = {
  vitest: '^2.0.0',
  '@vitest/ui': '^2.0.0',
  'class-variance-authority': '^0.7.1',
  clsx: '^2.1.1',
  'tailwind-merge': '^3.3.1',
} as const;

/**
 * Enhanced options for fully customizable init command
 */
interface EnhancedInitOptions {
  name?: string;
  preset?: PresetType;
  database?: DatabaseType;
  codeQuality?: CodeQualityType;
  tsStrictness?: TypeScriptStrictness;
  uiLibrary?: UILibrary;
  cssFramework?: CSSFramework;
  testing?: TestingFramework;
  docker?: boolean;
  cicd?: boolean;
  git?: boolean;
  install?: boolean;
  nonInteractive?: boolean;
  // Auth and infrastructure
  auth?: AuthProvider;
  redis?: boolean;
  useBunSecrets?: boolean;
  // shadcn/ui specific options
  shadcnStyle?: ShadcnStyle;
  shadcnBaseColor?: ShadcnBaseColor;
  shadcnRadius?: string;

  // Supabase specific options
  supabasePreset?: SupabasePreset;
  supabaseFeatures?: SupabaseFeature[];
  supabaseWithDrizzle?: boolean;
}

/**
 * Get value with priority: env var > option > default
 */
function getOptionValue<T>(envVar: string, option: T | undefined, defaultValue?: T): T | undefined {
  const envValue = process.env[envVar];

  // Handle boolean env vars
  if (envValue !== undefined) {
    if (envValue === 'true') return true as T;
    if (envValue === 'false') return false as T;
    return envValue as T;
  }

  return option ?? defaultValue;
}

/**
 * Enhanced init command with maximum customization
 */
export async function enhancedInitCommand(options: EnhancedInitOptions = {}) {
  const isNonInteractive =
    process.env.BUNKIT_NON_INTERACTIVE === 'true' || options.nonInteractive === true;

  // ====================
  // 1. PROJECT NAME
  // ====================
  let projectName = getOptionValue<string>('BUNKIT_PROJECT_NAME', options.name);

  if (!projectName) {
    if (isNonInteractive) {
      throw new Error(
        'Project name is required in non-interactive mode. ' +
          'Provide it via BUNKIT_PROJECT_NAME env var or --name flag.'
      );
    }

    projectName = (await p.text({
      message: '📦 Project name',
      placeholder: 'my-awesome-project',
      validate: (value) => {
        const result = validateProjectName(value);
        if (!result.valid) return result.error;
      },
    })) as string;

    if (p.isCancel(projectName)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  } else {
    const result = validateProjectName(projectName);
    if (!result.valid) {
      throw new Error(`Invalid project name: ${result.error}`);
    }
  }

  // ====================
  // 2. PRESET
  // ====================
  let preset = getOptionValue<PresetType>('BUNKIT_PRESET', options.preset);

  // Helper function to normalize preset for comparisons
  const normalizePresetForComparison = (p: PresetType): PresetType => {
    const aliasMap: Record<string, PresetType> = {
      web: 'nextjs',
      api: 'hono-api',
      full: 'nextjs-monorepo',
      'monorepo-nextjs': 'nextjs-monorepo',
      'monorepo-bun': 'bun-monorepo',
    };
    return (aliasMap[p] || p) as PresetType;
  };

  if (!preset) {
    if (isNonInteractive) {
      throw new Error(
        'Preset is required in non-interactive mode. ' +
          'Provide it via BUNKIT_PRESET env var or --preset flag.'
      );
    }

    preset = (await p.select({
      message: '🎨 Select project preset',
      options: [
        {
          value: 'minimal',
          label: '⚡ Minimal',
          hint: 'Single-file Bun project - perfect for CLIs and scripts',
        },
        {
          value: 'nextjs',
          label: '🌐 Next.js Application',
          hint: 'Next.js 16 + React 19 + Tailwind CSS 4 - production-ready web app (single repo)',
        },
        {
          value: 'hono-api',
          label: '🚀 Hono API Server',
          hint: 'Hono 4 + Bun.serve() - full-featured API with middleware ecosystem (single repo)',
        },
        {
          value: 'bun-api',
          label: '⚡ Bun Native API',
          hint: 'Bun.serve() native routing - ultra-fast API with zero dependencies (single repo)',
        },
        {
          value: 'bun-fullstack',
          label: '🔥 Bun Full-Stack',
          hint: 'Bun.serve() + HTML imports - full-stack app without Next.js (single repo)',
        },
        {
          value: 'nextjs-monorepo',
          label: '📦 Next.js Monorepo',
          hint: 'Next.js + Hono + shared packages - enterprise SaaS architecture',
        },
        {
          value: 'bun-monorepo',
          label: '🔥 Bun Monorepo',
          hint: 'Full-stack monorepo with Bun.serve() - no Next.js',
        },
        {
          value: 'enterprise-monorepo',
          label: '🏢 Enterprise Monorepo',
          hint: 'Multiple Next.js apps + services - platform, app, service-identity',
        },
      ],
    })) as PresetType;

    if (p.isCancel(preset)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // ====================
  // 3. DATABASE (only for api/full presets)
  // ====================
  let database: DatabaseType | undefined = getOptionValue<DatabaseType>(
    'BUNKIT_DATABASE',
    options.database
  );

  const normalizedPreset = normalizePresetForComparison(preset);
  if (
    !database &&
    (normalizedPreset === 'hono-api' ||
      normalizedPreset === 'bun-api' ||
      normalizedPreset === 'bun-fullstack' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo' ||
      normalizedPreset === 'enterprise-monorepo')
  ) {
    if (!isNonInteractive) {
      database = (await p.select({
        message: '🗄️  Database configuration',
        options: [
          {
            value: 'postgres-drizzle',
            label: 'PostgreSQL + Drizzle ORM',
            hint: 'Production-ready PostgreSQL with type-safe Drizzle ORM queries',
          },
          {
            value: 'postgres-prisma',
            label: 'PostgreSQL + Prisma ORM',
            hint: 'PostgreSQL with Prisma - popular ORM with great DX and migrations',
          },
          {
            value: 'mysql-drizzle',
            label: 'MySQL + Drizzle ORM',
            hint: 'MySQL with Drizzle ORM using Bun native MySQL client',
          },
          {
            value: 'mysql-prisma',
            label: 'MySQL + Prisma ORM',
            hint: 'MySQL with Prisma - popular ORM with great DX and migrations',
          },
          {
            value: 'supabase',
            label: 'Supabase (Client Only)',
            hint: 'Supabase JS client only - Auth, Storage, Realtime without ORM',
          },
          {
            value: 'supabase-drizzle',
            label: 'Supabase + Drizzle ORM',
            hint: 'Full Supabase stack with Drizzle ORM for type-safe database queries',
          },
          {
            value: 'supabase-prisma',
            label: 'Supabase + Prisma ORM',
            hint: 'Full Supabase stack with Prisma ORM for type-safe database queries',
          },
          {
            value: 'sqlite-drizzle',
            label: 'SQLite + Drizzle ORM',
            hint: 'Local-first embedded database - perfect for prototypes and local development',
          },
          {
            value: 'sqlite-prisma',
            label: 'SQLite + Prisma ORM',
            hint: 'SQLite with Prisma - great for local development and prototyping',
          },
          {
            value: 'none',
            label: 'None',
            hint: 'Skip database setup - add later if needed',
          },
        ],
      })) as DatabaseType;

      if (p.isCancel(database)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      database = 'none';
    }
  }

  // ====================
  // SUPABASE CONFIGURATION (if Supabase selected)
  // ====================
  let supabasePreset: SupabasePreset | undefined;
  let supabaseFeatures: SupabaseFeature[] | undefined;
  let supabaseWithDrizzle: boolean | undefined;

  if (database === 'supabase' || database === 'supabase-drizzle') {
    // Determine if using Drizzle based on database selection
    supabaseWithDrizzle = database === 'supabase-drizzle';

    // Get preset selection
    const presetEnv = process.env.BUNKIT_SUPABASE_PRESET;
    supabasePreset = (presetEnv || options.supabasePreset) as SupabasePreset | undefined;

    if (!supabasePreset && !isNonInteractive) {
      supabasePreset = (await p.select({
        message: '🎯 Supabase configuration preset',
        options: [
          {
            value: 'full-stack',
            label: 'Full Stack (Recommended)',
            hint: 'Complete Supabase setup - Auth, Storage, Realtime, and Database',
          },
          {
            value: 'auth-only',
            label: 'Auth Only',
            hint: 'Authentication only - perfect for simple apps with external data',
          },
          {
            value: 'database-only',
            label: 'Database Only',
            hint: 'PostgreSQL database access only - no Auth, Storage, or Realtime',
          },
          {
            value: 'custom',
            label: 'Custom',
            hint: 'Manually select Supabase features to include',
          },
        ],
      })) as SupabasePreset;

      if (p.isCancel(supabasePreset)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else if (!supabasePreset) {
      supabasePreset = 'full-stack';
    }

    // Map preset to features
    if (supabasePreset === 'full-stack') {
      supabaseFeatures = ['auth', 'storage', 'realtime', 'database'];
    } else if (supabasePreset === 'auth-only') {
      supabaseFeatures = ['auth'];
    } else if (supabasePreset === 'database-only') {
      supabaseFeatures = ['database'];
    } else {
      // Custom - let user select features
      const availableFeaturesEnv = process.env.BUNKIT_SUPABASE_FEATURES;
      let availableFeatures: SupabaseFeature[] | undefined;

      if (availableFeaturesEnv) {
        availableFeatures = availableFeaturesEnv
          .split(',')
          .map((f) => f.trim()) as SupabaseFeature[];
      } else if (options.supabaseFeatures) {
        availableFeatures = Array.isArray(options.supabaseFeatures)
          ? options.supabaseFeatures
          : (String(options.supabaseFeatures)
              .split(',')
              .map((f) => f.trim()) as SupabaseFeature[]);
      }

      if (!availableFeatures && !isNonInteractive) {
        const selectedFeatures = (await p.multiselect({
          message: '✨ Select Supabase features to include',
          options: [
            {
              value: 'auth',
              label: 'Authentication',
              hint: 'User authentication and authorization (sign up, sign in, sessions)',
            },
            {
              value: 'storage',
              label: 'Storage',
              hint: 'File storage and CDN for images, documents, and media',
            },
            {
              value: 'realtime',
              label: 'Realtime',
              hint: 'Real-time subscriptions and live updates via WebSockets',
            },
            {
              value: 'edge-functions',
              label: 'Edge Functions',
              hint: 'Serverless functions deployed at the edge for low latency',
            },
            {
              value: 'database',
              label: 'Database',
              hint: 'PostgreSQL database access via Supabase client',
            },
          ],
        })) as SupabaseFeature[];

        if (p.isCancel(selectedFeatures)) {
          p.cancel('Operation cancelled.');
          process.exit(0);
        }

        supabaseFeatures = selectedFeatures.length > 0 ? selectedFeatures : ['auth', 'database'];
      } else {
        supabaseFeatures = availableFeatures || ['auth', 'database'];
      }
    }
  }

  // ====================
  // 4. CODE QUALITY
  // ====================
  let codeQuality = getOptionValue<CodeQualityType>(
    'BUNKIT_CODE_QUALITY',
    options.codeQuality,
    'ultracite' // Default to Ultracite (AI-optimized)
  );

  if (!codeQuality) {
    if (!isNonInteractive) {
      codeQuality = (await p.select({
        message: '🤖 Code quality tool',
        options: [
          {
            value: 'ultracite',
            label: 'Ultracite (Recommended)',
            hint: 'AI-optimized Biome preset - syncs rules for Cursor, Claude Code, Windsurf, Zed',
          },
          {
            value: 'biome',
            label: 'Biome',
            hint: 'Standard Biome configuration - fast, reliable, zero-config linting and formatting',
          },
        ],
      })) as CodeQualityType;

      if (p.isCancel(codeQuality)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      codeQuality = 'ultracite';
    }
  }

  // ====================
  // 5. TYPESCRIPT STRICTNESS
  // ====================
  let tsStrictness = getOptionValue<TypeScriptStrictness>(
    'BUNKIT_TS_STRICTNESS',
    options.tsStrictness,
    'strict' // Default to strict
  );

  if (!tsStrictness) {
    if (!isNonInteractive) {
      tsStrictness = (await p.select({
        message: '🔒 TypeScript strictness level',
        options: [
          {
            value: 'strict',
            label: 'Strict (Recommended)',
            hint: 'Maximum type safety - catches bugs early, prevents runtime errors',
          },
          {
            value: 'moderate',
            label: 'Moderate',
            hint: 'Balanced type checking - good safety without excessive strictness',
          },
          {
            value: 'loose',
            label: 'Loose',
            hint: 'Minimal type checking - quick prototyping, easier migration from JavaScript',
          },
        ],
      })) as TypeScriptStrictness;

      if (p.isCancel(tsStrictness)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      tsStrictness = 'strict';
    }
  }

  // ====================
  // 6. CSS FRAMEWORK (only for web/full presets)
  // ====================
  let cssFramework: CSSFramework | undefined = getOptionValue<CSSFramework>(
    'BUNKIT_CSS_FRAMEWORK',
    options.cssFramework
  );

  if (
    !cssFramework &&
    (normalizedPreset === 'nextjs' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'enterprise-monorepo')
  ) {
    if (!isNonInteractive) {
      cssFramework = (await p.select({
        message: '🎨 CSS framework',
        options: [
          {
            value: 'tailwind',
            label: 'Tailwind CSS 4 (Recommended)',
            hint: 'Utility-first CSS framework - fast, modern, with OKLCH colors and @theme',
          },
          {
            value: 'vanilla',
            label: 'Vanilla CSS',
            hint: 'Plain CSS files - full control, no framework dependencies',
          },
          {
            value: 'css-modules',
            label: 'CSS Modules',
            hint: 'Scoped CSS with automatic class name generation - prevents style conflicts',
          },
        ],
      })) as CSSFramework;

      if (p.isCancel(cssFramework)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      cssFramework = 'tailwind';
    }
  }

  // ====================
  // 7. UI LIBRARY (only for web/full presets with Tailwind)
  // ====================
  let uiLibrary: UILibrary | undefined = getOptionValue<UILibrary>(
    'BUNKIT_UI_LIBRARY',
    options.uiLibrary
  );

  if (
    !uiLibrary &&
    (normalizedPreset === 'nextjs' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'enterprise-monorepo') &&
    cssFramework === 'tailwind'
  ) {
    if (!isNonInteractive) {
      uiLibrary = (await p.select({
        message: '🧩 UI component library',
        options: [
          {
            value: 'shadcn',
            label: 'shadcn/ui (Recommended)',
            hint: '64+ accessible components, fully customizable, production-ready',
          },
          {
            value: 'none',
            label: 'None',
            hint: 'Skip UI library - build custom components or add later',
          },
        ],
      })) as UILibrary;

      if (p.isCancel(uiLibrary)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      uiLibrary = 'shadcn';
    }
  }

  // ====================
  // 7a. SHADCN/UI STYLE (only if shadcn/ui selected)
  // ====================
  let shadcnStyle: ShadcnStyle | undefined = getOptionValue<ShadcnStyle>(
    'BUNKIT_SHADCN_STYLE',
    options.shadcnStyle
  );

  if (!shadcnStyle && uiLibrary === 'shadcn') {
    if (!isNonInteractive) {
      shadcnStyle = (await p.select({
        message: '🎨 shadcn/ui component style',
        options: [
          {
            value: 'new-york',
            label: 'New York (Recommended)',
            hint: 'Modern design aesthetic - rounded corners, subtle shadows, clean look',
          },
          {
            value: 'default',
            label: 'Default',
            hint: 'Classic design aesthetic - sharper edges, higher contrast, traditional look',
          },
        ],
      })) as ShadcnStyle;

      if (p.isCancel(shadcnStyle)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shadcnStyle = 'new-york';
    }
  }

  // ====================
  // 7b. SHADCN/UI BASE COLOR (only if shadcn/ui selected)
  // ====================
  let shadcnBaseColor: ShadcnBaseColor | undefined = getOptionValue<ShadcnBaseColor>(
    'BUNKIT_SHADCN_BASE_COLOR',
    options.shadcnBaseColor
  );

  if (!shadcnBaseColor && uiLibrary === 'shadcn') {
    if (!isNonInteractive) {
      shadcnBaseColor = (await p.select({
        message: '🎨 shadcn/ui base color theme',
        options: [
          {
            value: 'zinc',
            label: 'Zinc (Recommended)',
            hint: 'Neutral gray palette - versatile, modern, works with any accent color',
          },
          {
            value: 'neutral',
            label: 'Neutral',
            hint: 'Pure neutral palette - no color cast, perfect grayscale',
          },
          {
            value: 'gray',
            label: 'Gray',
            hint: 'Warm gray palette - slightly warmer tone than zinc',
          },
          {
            value: 'slate',
            label: 'Slate',
            hint: 'Cool gray palette - slightly bluer tone, modern and crisp',
          },
          {
            value: 'stone',
            label: 'Stone',
            hint: 'Warm beige-gray palette - earthy, natural, organic feel',
          },
        ],
      })) as ShadcnBaseColor;

      if (p.isCancel(shadcnBaseColor)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shadcnBaseColor = 'zinc';
    }
  }

  // ====================
  // 7c. SHADCN/UI RADIUS (only if shadcn/ui selected)
  // ====================
  let shadcnRadius: string | undefined = getOptionValue<string>(
    'BUNKIT_SHADCN_RADIUS',
    options.shadcnRadius
  );

  if (!shadcnRadius && uiLibrary === 'shadcn') {
    if (!isNonInteractive) {
      const radiusInput = await p.text({
        message: '📐 Component border radius',
        placeholder: '0.625rem (default)',
        initialValue: '0.625rem',
        validate: (value) => {
          if (!value.trim()) {
            return 'Radius cannot be empty';
          }
          // Basic validation for CSS values
          if (!/^\d+(\.\d+)?(rem|px|em|%)$/.test(value.trim())) {
            return 'Please enter a valid CSS value (e.g., 0.5rem, 8px)';
          }
        },
      });

      if (p.isCancel(radiusInput)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      shadcnRadius = radiusInput as string;
    } else {
      shadcnRadius = '0.625rem';
    }
  }

  // ====================
  // 8. TESTING FRAMEWORK
  // ====================
  let testing = getOptionValue<TestingFramework>(
    'BUNKIT_TESTING',
    options.testing,
    'bun-test' // Default to bun:test
  );

  if (!testing) {
    if (!isNonInteractive) {
      testing = (await p.select({
        message: '🧪 Testing framework',
        options: [
          {
            value: 'bun-test',
            label: 'Bun Test (Recommended)',
            hint: 'Built-in testing framework - fast, Jest-compatible, zero configuration',
          },
          {
            value: 'vitest',
            label: 'Vitest',
            hint: 'Vite-powered testing framework - fast, ESM-first, popular ecosystem choice',
          },
          {
            value: 'none',
            label: 'None',
            hint: 'Skip testing setup - add testing framework later if needed',
          },
        ],
      })) as TestingFramework;

      if (p.isCancel(testing)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      testing = 'bun-test';
    }
  }

  // ====================
  // 9. DOCKER SUPPORT
  // ====================
  let docker = getOptionValue<boolean>('BUNKIT_DOCKER', options.docker, false);

  if (docker === undefined) {
    if (!isNonInteractive) {
      docker = (await p.confirm({
        message: '🐳 Include Docker configuration',
        initialValue: false,
      })) as boolean;

      if (p.isCancel(docker)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      docker = false;
    }
  }

  // ====================
  // 10. CI/CD
  // ====================
  let cicd = getOptionValue<boolean>('BUNKIT_CICD', options.cicd, false);

  if (cicd === undefined) {
    if (!isNonInteractive) {
      cicd = (await p.confirm({
        message: '⚙️  Include GitHub Actions CI/CD workflow',
        initialValue: false,
      })) as boolean;

      if (p.isCancel(cicd)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      cicd = false;
    }
  }

  // ====================
  // 10. REDIS (only for api/full/bun-api/bun-fullstack/monorepo-bun presets)
  // ====================
  let redis = getOptionValue<boolean>('BUNKIT_REDIS', options.redis, false);

  if (
    !redis &&
    (normalizedPreset === 'hono-api' ||
      normalizedPreset === 'bun-api' ||
      normalizedPreset === 'bun-fullstack' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo' ||
      normalizedPreset === 'enterprise-monorepo')
  ) {
    if (!isNonInteractive) {
      redis = (await p.confirm({
        message: '🔴 Redis cache/session store',
        initialValue: false,
      })) as boolean;

      if (p.isCancel(redis)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    }
  }

  // ====================
  // 11. AUTHENTICATION (only for api/full/bun-api/bun-fullstack/monorepo-bun presets)
  // ====================
  let auth: AuthProvider | undefined = getOptionValue<AuthProvider>(
    'BUNKIT_AUTH',
    options.auth as AuthProvider | undefined,
    'none'
  );

  if (
    !auth &&
    (normalizedPreset === 'hono-api' ||
      normalizedPreset === 'bun-api' ||
      normalizedPreset === 'bun-fullstack' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo' ||
      normalizedPreset === 'enterprise-monorepo')
  ) {
    // Skip auth prompt if Supabase is selected (Supabase includes auth)
    if (
      database &&
      (database === 'supabase' || database === 'supabase-drizzle' || database === 'supabase-prisma')
    ) {
      auth = 'supabase';
    } else if (!isNonInteractive) {
      auth = (await p.select({
        message: '🔐 Authentication system',
        options: [
          {
            value: 'none',
            label: 'None',
            hint: 'Skip authentication - add later if needed',
          },
          {
            value: 'better-auth',
            label: 'better-auth',
            hint: 'Modern auth library - flexible, type-safe, supports multiple providers',
          },
          {
            value: 'nextauth',
            label: 'NextAuth.js',
            hint: 'Popular Next.js auth solution - great for Next.js apps',
          },
        ],
      })) as AuthProvider;

      if (p.isCancel(auth)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      auth = 'none';
    }
  }

  // ====================
  // 12. BUN.SECRETS (for all presets)
  // ====================
  let useBunSecrets = getOptionValue<boolean>(
    'BUNKIT_USE_BUN_SECRETS',
    options.useBunSecrets,
    false
  );

  if (!useBunSecrets) {
    if (!isNonInteractive) {
      useBunSecrets = (await p.confirm({
        message:
          '🔑 Use Bun.secrets for environment variables (Use Bun.secrets API instead of .env files)',
        initialValue: false,
      })) as boolean;

      if (p.isCancel(useBunSecrets)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    }
  }

  // ====================
  // 13. INSTALL DEPENDENCIES
  // ====================
  let shouldInstall = getOptionValue<boolean>('BUNKIT_INSTALL', options.install, true);

  if (shouldInstall === undefined) {
    if (!isNonInteractive) {
      shouldInstall = (await p.confirm({
        message: '📥 Install dependencies after project creation',
        initialValue: true,
      })) as boolean;

      if (p.isCancel(shouldInstall)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shouldInstall = true;
    }
  }

  // ====================
  // 14. GIT INIT
  // ====================
  let shouldInitGit = getOptionValue<boolean>('BUNKIT_GIT', options.git, true);

  if (shouldInitGit === undefined) {
    if (!isNonInteractive) {
      shouldInitGit = (await p.confirm({
        message: '🔧 Initialize Git repository',
        initialValue: true,
      })) as boolean;

      if (p.isCancel(shouldInitGit)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shouldInitGit = true;
    }
  }

  // ====================
  // SHOW CONFIGURATION SUMMARY
  // ====================
  if (!isNonInteractive) {
    // Build configuration summary with better formatting
    const configSummary = [
      '',
      `${chalk.bold.cyan('📦 Project Configuration')}`,
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold('Project Name:')} ${chalk.cyan(projectName)}`,
      `${chalk.bold('Preset:')} ${chalk.cyan(preset)}`,
      '',
      database && database !== 'none'
        ? [
            `${chalk.bold.yellow('🗄️  Database')}`,
            `  ${chalk.bold('Type:')} ${chalk.cyan(database)}`,
            (database === 'supabase' || database === 'supabase-drizzle') && supabasePreset
              ? `  ${chalk.bold('Preset:')} ${chalk.cyan(supabasePreset)}`
              : '',
            (database === 'supabase' || database === 'supabase-drizzle') && supabaseFeatures
              ? `  ${chalk.bold('Features:')} ${chalk.cyan(supabaseFeatures.join(', '))}`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      '',
      normalizedPreset === 'hono-api' ||
      normalizedPreset === 'bun-api' ||
      normalizedPreset === 'bun-fullstack' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo' ||
      normalizedPreset === 'enterprise-monorepo'
        ? [
            `${chalk.bold.yellow('🔐 Authentication & Infrastructure')}`,
            auth && auth !== 'none'
              ? `  ${chalk.bold('Auth:')} ${chalk.cyan(auth)}`
              : `  ${chalk.bold('Auth:')} ${chalk.dim('None')}`,
            redis
              ? `  ${chalk.bold('Redis:')} ${chalk.green('✓ Enabled')}`
              : `  ${chalk.bold('Redis:')} ${chalk.dim('Disabled')}`,
            useBunSecrets
              ? `  ${chalk.bold('Bun.secrets:')} ${chalk.green('✓ Enabled')}`
              : `  ${chalk.bold('Bun.secrets:')} ${chalk.dim('Disabled')}`,
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      '',
      `${chalk.bold.yellow('🛠️  Development Tools')}`,
      `  ${chalk.bold('Code Quality:')} ${chalk.cyan(codeQuality)}`,
      `  ${chalk.bold('TypeScript:')} ${chalk.cyan(tsStrictness)}`,
      `  ${chalk.bold('Testing:')} ${chalk.cyan(testing)}`,
      '',
      cssFramework
        ? [
            `${chalk.bold.yellow('🎨 Styling')}`,
            `  ${chalk.bold('CSS Framework:')} ${chalk.cyan(cssFramework)}`,
            uiLibrary ? `  ${chalk.bold('UI Library:')} ${chalk.cyan(uiLibrary)}` : '',
            uiLibrary === 'shadcn' && shadcnStyle
              ? `  ${chalk.bold('  Style:')} ${chalk.cyan(shadcnStyle)}`
              : '',
            uiLibrary === 'shadcn' && shadcnBaseColor
              ? `  ${chalk.bold('  Base Color:')} ${chalk.cyan(shadcnBaseColor)}`
              : '',
            uiLibrary === 'shadcn' && shadcnRadius
              ? `  ${chalk.bold('  Radius:')} ${chalk.cyan(shadcnRadius)}`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      '',
      docker || cicd
        ? [
            `${chalk.bold.yellow('🚀 Deployment')}`,
            docker ? `  ${chalk.bold('Docker:')} ${chalk.green('✓ Enabled')}` : '',
            cicd ? `  ${chalk.bold('CI/CD:')} ${chalk.green('✓ Enabled')}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    console.log(
      '\n' +
        boxen(configSummary, {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          title: '📋 Configuration Summary',
          titleAlignment: 'left',
          borderColor: 'cyan',
          borderStyle: 'round',
          dimBorder: false,
        })
    );

    const confirm = await p.confirm({
      message: 'Confirm project configuration',
      initialValue: true,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // ====================
  // CREATE PROJECT
  // ====================
  console.log(''); // Add spacing before creation starts

  const s = p.spinner();
  s.start(`${chalk.cyan('🔨')} Creating project structure...`);

  try {
    const config: ProjectConfig = {
      name: projectName as string,
      preset: preset as PresetType,
      path: projectName as string,
      git: shouldInitGit as boolean,
      install: shouldInstall as boolean,
      database,
      redis: redis as boolean,
      useBunSecrets: useBunSecrets as boolean,
      auth: auth as AuthProvider,
      codeQuality: codeQuality as CodeQualityType,
      tsStrictness: tsStrictness as TypeScriptStrictness,
      uiLibrary,
      cssFramework,
      testing: testing as TestingFramework,
      docker: docker as boolean,
      cicd: cicd as boolean,
      envExample: true,
      pathAliases: true,
      // shadcn/ui specific options
      shadcnStyle,
      shadcnBaseColor,
      shadcnRadius,

      // Supabase specific options
      supabasePreset,
      supabaseFeatures,
      supabaseWithDrizzle,
    };

    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    s.message(`${chalk.cyan('📝')} Generating project files...`);

    switch (preset) {
      case 'minimal':
        await buildMinimalPreset(projectPath, context);
        break;
      case 'web':
      case 'nextjs':
        await buildWebPreset(projectPath, context);
        break;
      case 'api':
      case 'hono-api':
        await buildApiPreset(projectPath, context);
        break;
      case 'bun-api':
        await buildBunApiPreset(projectPath, context);
        break;
      case 'bun-fullstack':
        await buildBunFullstackPreset(projectPath, context);
        break;
      case 'full':
      case 'monorepo-nextjs':
        await buildFullPreset(projectPath, context);
        break;
      case 'monorepo-bun':
        await buildMonorepoBunPreset(projectPath, context);
        break;
      case 'enterprise-monorepo':
        await buildEnterprisePreset(projectPath, context);
        break;
    }

    // Additional setup based on options
    if (database && database !== 'none') {
      const dbName =
        database === 'postgres-drizzle'
          ? 'PostgreSQL + Drizzle ORM'
          : database === 'supabase'
            ? 'Supabase (Client Only)'
            : database === 'supabase-drizzle'
              ? 'Supabase + Drizzle ORM'
              : database === 'sqlite-drizzle'
                ? 'SQLite + Drizzle ORM'
                : database;
      s.message(`${chalk.cyan('🗄️')}  Configuring ${dbName}...`);
      // Database setup will be handled in template builders
    }

    if (uiLibrary === 'shadcn') {
      s.message(`${chalk.cyan('🎨')}  Setting up shadcn/ui components...`);
    }

    if (codeQuality === 'ultracite') {
      s.message(`${chalk.cyan('🤖')}  Configuring Ultracite for AI editors...`);
      // Ultracite setup will be handled in template builders
    }

    if (docker) {
      s.message(`${chalk.cyan('🐳')}  Adding Docker configuration...`);
      // Docker setup will be handled in template builders
    }

    if (cicd) {
      s.message(`${chalk.cyan('⚙️')}  Adding GitHub Actions CI/CD workflow...`);
      // CI/CD setup will be handled in template builders
    }

    s.stop(`${chalk.green('✅')} Project structure created successfully!`);

    // Calculate additional dependencies based on configuration
    // NOTE: For 'full' preset (monorepo), dependencies are handled by workspace catalog
    // Only install additional deps for single-repo presets
    if (shouldInstall && preset !== 'full') {
      const additionalDeps: Record<string, string> = {};

      // Database dependencies
      if (database && database !== 'none') {
        Object.assign(additionalDeps, getDatabaseDependencies(database));
      }

      // Code quality dependencies
      if (codeQuality) {
        Object.assign(additionalDeps, getCodeQualityDependencies(codeQuality));
      }

      // Testing framework dependencies
      if (testing === 'vitest') {
        additionalDeps.vitest = VERSIONS.vitest;
        additionalDeps['@vitest/ui'] = VERSIONS['@vitest/ui'];
      }

      // UI library dependencies
      if (uiLibrary === 'shadcn') {
        additionalDeps['class-variance-authority'] = VERSIONS['class-variance-authority'];
        additionalDeps.clsx = VERSIONS.clsx;
        additionalDeps['tailwind-merge'] = VERSIONS['tailwind-merge'];
      }

      // Install base dependencies + additional ones
      if (Object.keys(additionalDeps).length > 0) {
        await installDependencies(projectPath, additionalDeps);
      } else {
        await installDependencies(projectPath);
      }
    } else if (
      shouldInstall &&
      (normalizedPreset === 'nextjs-monorepo' || normalizedPreset === 'enterprise-monorepo')
    ) {
      // For monorepo, just run bun install to install from catalog
      await installDependencies(projectPath);
    }

    // Install default shadcn/ui components if shadcn/ui is configured
    if (
      shouldInstall &&
      uiLibrary === 'shadcn' &&
      (normalizedPreset === 'nextjs' ||
        normalizedPreset === 'bun-fullstack' ||
        normalizedPreset === 'nextjs-monorepo' ||
        normalizedPreset === 'bun-monorepo' ||
        normalizedPreset === 'enterprise-monorepo')
    ) {
      const componentSpinner = p.spinner();
      componentSpinner.start(
        `${chalk.cyan('🧩')} Installing default shadcn/ui components (button, card)...`
      );
      try {
        if (
          normalizedPreset === 'nextjs-monorepo' ||
          normalizedPreset === 'bun-monorepo' ||
          normalizedPreset === 'enterprise-monorepo'
        ) {
          // For monorepos, install components in packages/ui
          await installDefaultShadcnComponents(join(projectPath, 'packages/ui'), {
            silent: true,
          });
        } else {
          // For single-repo, install in project root
          await installDefaultShadcnComponents(projectPath, {
            silent: true,
          });
        }
        componentSpinner.stop(`${chalk.green('✅')} Default components installed`);
      } catch (_error) {
        // Non-critical - user can install manually
        componentSpinner.stop(`${chalk.yellow('⚠️')}  Could not install automatically`);
        p.note('Install manually: bunx shadcn@latest add button card', 'Component Installation');
      }
    }

    const getDevCommand = () => {
      if (
        normalizedPreset === 'nextjs-monorepo' ||
        normalizedPreset === 'bun-monorepo' ||
        normalizedPreset === 'enterprise-monorepo' ||
        normalizedPreset === 'nextjs'
      )
        return 'bun dev';
      return 'bun run dev';
    };

    const getPresetEmoji = () => {
      switch (preset) {
        case 'minimal':
          return '⚡';
        case 'web':
          return '🌐';
        case 'api':
          return '🚀';
        case 'bun-api':
          return '⚡';
        case 'bun-fullstack':
          return '🔥';
        case 'full':
          return '📦';
        case 'monorepo-bun':
          return '🔥';
        default:
          return '✨';
      }
    };

    // Build comprehensive next steps with tips
    const nextStepsContent = [
      `${chalk.bold.cyan('📁 Navigate to your project')}`,
      `${chalk.cyan('cd')} ${chalk.bold(projectName)}`,
      '',
      shouldInstall
        ? ''
        : [
            `${chalk.bold.cyan('📦 Install dependencies')}`,
            `${chalk.cyan('bun install')}`,
            '',
          ].join('\n'),
      `${chalk.bold.cyan('🚀 Start development')}`,
      `${chalk.cyan(getDevCommand())} ${chalk.dim('# Start development server')}`,
      '',
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold.yellow('💡 Quick Tips')}`,
      '',
      database && database !== 'none'
        ? `  ${chalk.dim('•')} Configure your database connection in ${chalk.cyan('.env')}`
        : '',
      uiLibrary === 'shadcn'
        ? `  ${chalk.dim('•')} Add more components: ${chalk.cyan('bunkit add component --all')}`
        : '',
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo' ||
      normalizedPreset === 'enterprise-monorepo'
        ? `  ${chalk.dim('•')} Add workspaces: ${chalk.cyan('bunkit add workspace')}`
        : '',
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo' ||
      normalizedPreset === 'enterprise-monorepo'
        ? `  ${chalk.dim('•')} Add packages: ${chalk.cyan('bunkit add package')}`
        : '',
      `  ${chalk.dim('•')} Read the ${chalk.cyan('README.md')} for project-specific documentation`,
      database === 'supabase' || database === 'supabase-drizzle'
        ? `  ${chalk.dim('•')} Check ${chalk.cyan('SHADCN.md')} for shadcn/ui usage guide`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    console.log(
      '\n' +
        boxen(nextStepsContent, {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          title: `${getPresetEmoji()} Next Steps`,
          titleAlignment: 'left',
          borderColor: 'green',
          borderStyle: 'round',
          dimBorder: false,
        })
    );

    // Show project summary
    const projectSummary = [
      `${chalk.bold.green('✨ Project created successfully!')}`,
      '',
      `${chalk.dim('Project location:')} ${chalk.cyan(join(process.cwd(), projectName))}`,
      `${chalk.dim('Preset:')} ${chalk.cyan(preset)}`,
      database && database !== 'none' ? `${chalk.dim('Database:')} ${chalk.cyan(database)}` : '',
      uiLibrary ? `${chalk.dim('UI Library:')} ${chalk.cyan(uiLibrary)}` : '',
      '',
      `${chalk.dim('Happy coding! 🎉')}`,
    ]
      .filter(Boolean)
      .join('\n');

    console.log(
      '\n' +
        boxen(projectSummary, {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          borderColor: 'green',
          borderStyle: 'round',
          dimBorder: true,
        })
    );
  } catch (error) {
    s.stop(`${chalk.red('❌')} Failed to create project`);

    const errorMessage = (error as Error).message;
    const errorBox = [
      `${chalk.bold.red('Error occurred during project creation')}`,
      '',
      chalk.red(errorMessage),
      '',
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold.yellow('💡 Troubleshooting Tips')}`,
      '',
      `  ${chalk.dim('•')} Check if the directory already exists`,
      `  ${chalk.dim('•')} Ensure you have write permissions`,
      `  ${chalk.dim('•')} Verify your internet connection (for dependency installation)`,
      `  ${chalk.dim('•')} Try running with ${chalk.cyan('--no-install')} to skip dependency installation`,
      '',
      `${chalk.dim('Need help?')} ${chalk.cyan('https://github.com/Arakiss/bunkit/issues')}`,
    ].join('\n');

    console.log(
      '\n' +
        boxen(errorBox, {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          borderColor: 'red',
          borderStyle: 'round',
        })
    );

    p.cancel('Operation cancelled due to error');
    process.exit(1);
  }
}
