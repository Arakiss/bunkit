import {
  type AuthProvider,
  type CodeQualityType,
  type CSSFramework,
  createProject,
  createTemplateContext,
  type DatabaseType,
  getDeprecatedAliasInfo,
  getRemovedPresetInfo,
  installDependencies,
  type PresetType,
  type ProjectConfig,
  resolveThemeToShadcnOptions,
  type ShadcnBase,
  type ShadcnBaseColor,
  type ShadcnIconLibrary,
  type ShadcnMenuAccent,
  type ShadcnMenuColor,
  type ShadcnStyle,
  type SupabaseFeature,
  type SupabasePreset,
  type TestingFramework,
  type ThemePresetName,
  type TypeScriptStrictness,
  type UILibrary,
  validateProjectName,
} from '@bunkit/core';
import {
  buildApiPreset,
  buildFullPresetV2,
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
  // v2.0.0: Enterprise mode and theme preset
  enterprise?: boolean;
  theme?: ThemePresetName;
  // shadcn/ui specific options (for --theme custom or direct CLI flags)
  shadcnStyle?: ShadcnStyle;
  shadcnBase?: ShadcnBase;
  shadcnBaseColor?: ShadcnBaseColor;
  shadcnIconLibrary?: ShadcnIconLibrary;
  shadcnMenuAccent?: ShadcnMenuAccent;
  shadcnMenuColor?: ShadcnMenuColor;
  shadcnRadius?: string;
  shadcnRtl?: boolean;
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
 * Normalize preset: resolve aliases and check for removed presets
 */
function normalizePresetForComparison(preset: PresetType): PresetType {
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
 * Enhanced init command with maximum customization (v2.0.0)
 *
 * New flow: ~8-10 prompts instead of ~25
 * - 5 presets (down from 8)
 * - Theme presets replace 7 individual shadcn prompts
 * - Advanced config gate hides rarely-used options
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
  // 2. PRESET (5 options, down from 8)
  // ====================
  let preset = getOptionValue<PresetType>('BUNKIT_PRESET', options.preset);

  // Handle removed presets
  if (preset) {
    const removedInfo = getRemovedPresetInfo(preset);
    if (removedInfo) {
      throw new Error(`${removedInfo.message}\n\nSuggested alternative: ${removedInfo.suggestion}`);
    }
    // Handle deprecated aliases
    const aliasInfo = getDeprecatedAliasInfo(preset);
    if (aliasInfo) {
      p.log.warn(chalk.yellow(`⚠️  ${aliasInfo.warning}`));
      preset = aliasInfo.canonical as PresetType;
    }
  }

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
          hint: 'Next.js 16 + React 19 + Tailwind CSS 4 - production-ready web app',
        },
        {
          value: 'hono-api',
          label: '🚀 Hono API Server',
          hint: 'Hono 4 + Bun.serve() - full-featured API with middleware ecosystem',
        },
        {
          value: 'nextjs-monorepo',
          label: '📦 Next.js Monorepo',
          hint: 'Next.js + Hono + shared packages - SaaS architecture (--enterprise for more)',
        },
        {
          value: 'bun-monorepo',
          label: '🔥 Bun Monorepo',
          hint: 'Full-stack monorepo with Bun.serve() - no Next.js',
        },
      ],
    })) as PresetType;

    if (p.isCancel(preset)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  const normalizedPreset = normalizePresetForComparison(preset);

  // ====================
  // 3. ENTERPRISE MODE (only for nextjs-monorepo)
  // ====================
  let enterprise = getOptionValue<boolean>('BUNKIT_ENTERPRISE', options.enterprise, false);

  if (enterprise === undefined && normalizedPreset === 'nextjs-monorepo') {
    if (!isNonInteractive) {
      enterprise = (await p.confirm({
        message: '🏢 Enable enterprise features? (adds apps/app, service-identity, packages/db)',
        initialValue: false,
      })) as boolean;

      if (p.isCancel(enterprise)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      enterprise = false;
    }
  }

  // ====================
  // 4. DATABASE (for api/monorepo presets)
  // ====================
  let database: DatabaseType | undefined = getOptionValue<DatabaseType>(
    'BUNKIT_DATABASE',
    options.database
  );

  if (
    !database &&
    (normalizedPreset === 'hono-api' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo')
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
  // 4a. SUPABASE CONFIGURATION (if Supabase selected)
  // ====================
  let supabasePreset: SupabasePreset | undefined;
  let supabaseFeatures: SupabaseFeature[] | undefined;
  let supabaseWithDrizzle: boolean | undefined;

  if (database === 'supabase' || database === 'supabase-drizzle') {
    supabaseWithDrizzle = database === 'supabase-drizzle';

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
          .map((feature) => feature.trim()) as SupabaseFeature[];
      } else if (options.supabaseFeatures) {
        availableFeatures = Array.isArray(options.supabaseFeatures)
          ? options.supabaseFeatures
          : (String(options.supabaseFeatures)
              .split(',')
              .map((feature) => feature.trim()) as SupabaseFeature[]);
      }

      if (!availableFeatures && !isNonInteractive) {
        const selectedFeatures = (await p.multiselect({
          message: '✨ Select Supabase features to include',
          options: [
            {
              value: 'auth',
              label: 'Authentication',
              hint: 'User authentication and authorization',
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
              hint: 'Serverless functions deployed at the edge',
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
  // 5. AUTH (for backend presets, skip if Supabase selected)
  // ====================
  let auth: AuthProvider | undefined = getOptionValue<AuthProvider>(
    'BUNKIT_AUTH',
    options.auth as AuthProvider | undefined,
    'none'
  );

  if (
    !auth &&
    (normalizedPreset === 'hono-api' ||
      normalizedPreset === 'nextjs-monorepo' ||
      normalizedPreset === 'bun-monorepo')
  ) {
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
  // 6. THEME (for presets with web UI — replaces 7 individual shadcn prompts)
  // ====================
  let theme: ThemePresetName | undefined = getOptionValue<ThemePresetName>(
    'BUNKIT_THEME',
    options.theme
  );
  let cssFramework: CSSFramework | undefined = getOptionValue<CSSFramework>(
    'BUNKIT_CSS_FRAMEWORK',
    options.cssFramework
  );
  let uiLibrary: UILibrary | undefined = getOptionValue<UILibrary>(
    'BUNKIT_UI_LIBRARY',
    options.uiLibrary
  );

  // shadcn/ui options (populated from theme preset or custom prompts)
  let shadcnStyle: ShadcnStyle | undefined = options.shadcnStyle;
  let shadcnBaseColor: ShadcnBaseColor | undefined = options.shadcnBaseColor;
  let shadcnIconLibrary: ShadcnIconLibrary | undefined = options.shadcnIconLibrary;
  let shadcnMenuAccent: ShadcnMenuAccent | undefined = options.shadcnMenuAccent;
  let shadcnMenuColor: ShadcnMenuColor | undefined = options.shadcnMenuColor;
  let shadcnRadius: string | undefined = options.shadcnRadius;
  let shadcnBase: ShadcnBase | undefined = options.shadcnBase;
  let shadcnRtl: boolean | undefined = options.shadcnRtl;

  const presetSupportsWeb =
    normalizedPreset === 'nextjs' ||
    normalizedPreset === 'nextjs-monorepo' ||
    normalizedPreset === 'bun-monorepo';

  if (presetSupportsWeb) {
    // Default to tailwind + shadcn for web presets
    cssFramework = cssFramework || 'tailwind';
    uiLibrary = uiLibrary || 'shadcn';

    if (!theme && uiLibrary === 'shadcn') {
      if (!isNonInteractive) {
        theme = (await p.select({
          message: '🎨 Theme',
          options: [
            {
              value: 'modern-clean',
              label: 'Modern Clean (Recommended)',
              hint: 'Radix Maia + Zinc + Iconoir - clean, professional design',
            },
            {
              value: 'bold-vibrant',
              label: 'Bold Vibrant',
              hint: 'Radix Vega + Neutral + Iconoir - strong colors and contrast',
            },
            {
              value: 'minimalist',
              label: 'Minimalist',
              hint: 'Radix Nova + Slate + Iconoir - subtle accents and clean lines',
            },
            {
              value: 'elegant',
              label: 'Elegant',
              hint: 'Radix Lyra + Stone + Iconoir - refined typography and spacing',
            },
            {
              value: 'custom',
              label: 'Custom',
              hint: 'Choose individual shadcn/ui style, color, icons, and more',
            },
          ],
        })) as ThemePresetName;

        if (p.isCancel(theme)) {
          p.cancel('Operation cancelled.');
          process.exit(0);
        }
      } else {
        theme = 'modern-clean';
      }
    }

    // Resolve theme to shadcn options
    if (theme && theme !== 'custom') {
      const resolved = resolveThemeToShadcnOptions(theme);
      if (resolved) {
        shadcnStyle = resolved.shadcnStyle;
        shadcnBaseColor = resolved.shadcnBaseColor;
        shadcnIconLibrary = resolved.shadcnIconLibrary;
        shadcnMenuAccent = resolved.shadcnMenuAccent;
        shadcnMenuColor = resolved.shadcnMenuColor;
        shadcnRadius = resolved.shadcnRadius;
        shadcnBase = shadcnStyle?.startsWith('base-') ? 'base-ui' : 'radix';
      }
    } else if (theme === 'custom' && !isNonInteractive) {
      // Custom theme: ask individual shadcn questions
      shadcnStyle = (await p.select({
        message: '🎨 shadcn/ui visual style',
        options: [
          { value: 'radix-maia', label: 'Maia — Radix', hint: 'Modern, clean design' },
          { value: 'radix-vega', label: 'Vega — Radix', hint: 'Bold, vibrant design' },
          { value: 'radix-nova', label: 'Nova — Radix', hint: 'Minimalist design' },
          { value: 'radix-lyra', label: 'Lyra — Radix', hint: 'Elegant design' },
          { value: 'radix-mira', label: 'Mira — Radix', hint: 'Playful design' },
          { value: 'base-maia', label: 'Maia — Base UI', hint: 'Clean, Base UI primitives' },
          { value: 'base-vega', label: 'Vega — Base UI', hint: 'Bold, Base UI primitives' },
          { value: 'base-nova', label: 'Nova — Base UI', hint: 'Minimalist, Base UI' },
          { value: 'base-lyra', label: 'Lyra — Base UI', hint: 'Elegant, Base UI' },
          { value: 'base-mira', label: 'Mira — Base UI', hint: 'Playful, Base UI' },
          { value: 'new-york', label: 'New York (Legacy)', hint: 'Classic modern aesthetic' },
          { value: 'default', label: 'Default (Legacy)', hint: 'Classic design' },
        ],
      })) as ShadcnStyle;

      if (p.isCancel(shadcnStyle)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      shadcnBaseColor = (await p.select({
        message: '🎨 Base color theme',
        options: [
          { value: 'zinc', label: 'Zinc', hint: 'Neutral gray - versatile, modern' },
          { value: 'neutral', label: 'Neutral', hint: 'Pure neutral - no color cast' },
          { value: 'gray', label: 'Gray', hint: 'Warm gray palette' },
          { value: 'slate', label: 'Slate', hint: 'Cool gray - bluer tone' },
          { value: 'stone', label: 'Stone', hint: 'Warm beige-gray - earthy' },
        ],
      })) as ShadcnBaseColor;

      if (p.isCancel(shadcnBaseColor)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      shadcnIconLibrary = (await p.select({
        message: '🔣 Icon library',
        options: [
          { value: 'iconoir', label: 'Iconoir (Recommended)', hint: '1600+ tree-shakeable icons' },
          { value: 'phosphor', label: 'Phosphor', hint: 'Modern icon library' },
          { value: 'lucide', label: 'Lucide', hint: 'Classic choice' },
        ],
      })) as ShadcnIconLibrary;

      if (p.isCancel(shadcnIconLibrary)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      // Auto-infer base from style
      shadcnBase = shadcnStyle?.startsWith('base-') ? 'base-ui' : 'radix';
      shadcnMenuAccent = 'subtle';
      shadcnMenuColor = 'default';
      shadcnRadius = '0.625rem';
      shadcnRtl = false;
    }
  }

  // ====================
  // 7. ADVANCED CONFIGURATION (default: No)
  // ====================
  let codeQuality: CodeQualityType | undefined = getOptionValue<CodeQualityType>(
    'BUNKIT_CODE_QUALITY',
    options.codeQuality
  );
  let tsStrictness: TypeScriptStrictness | undefined = getOptionValue<TypeScriptStrictness>(
    'BUNKIT_TS_STRICTNESS',
    options.tsStrictness
  );
  let testing: TestingFramework | undefined = getOptionValue<TestingFramework>(
    'BUNKIT_TESTING',
    options.testing
  );
  let docker = getOptionValue<boolean>('BUNKIT_DOCKER', options.docker);
  let cicd = getOptionValue<boolean>('BUNKIT_CICD', options.cicd);
  let redis = getOptionValue<boolean>('BUNKIT_REDIS', options.redis);
  let useBunSecrets = getOptionValue<boolean>('BUNKIT_USE_BUN_SECRETS', options.useBunSecrets);

  // Only show advanced prompt if none of these were set via CLI/env
  const hasAdvancedFlags =
    codeQuality !== undefined ||
    tsStrictness !== undefined ||
    testing !== undefined ||
    docker !== undefined ||
    cicd !== undefined ||
    redis !== undefined ||
    useBunSecrets !== undefined;

  if (!hasAdvancedFlags && !isNonInteractive) {
    const showAdvanced = (await p.confirm({
      message: '⚙️  Configure advanced options? (code quality, testing, Docker, CI/CD, Redis)',
      initialValue: false,
    })) as boolean;

    if (p.isCancel(showAdvanced)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    if (showAdvanced) {
      // 7a. Code quality
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
            hint: 'Standard Biome configuration - fast, reliable, zero-config',
          },
        ],
      })) as CodeQualityType;

      if (p.isCancel(codeQuality)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      // 7b. Testing
      testing = (await p.select({
        message: '🧪 Testing framework',
        options: [
          {
            value: 'bun-test',
            label: 'Bun Test (Recommended)',
            hint: 'Built-in - fast, Jest-compatible, zero config',
          },
          {
            value: 'vitest',
            label: 'Vitest',
            hint: 'Vite-powered - ESM-first, popular ecosystem',
          },
          { value: 'none', label: 'None', hint: 'Skip testing setup' },
        ],
      })) as TestingFramework;

      if (p.isCancel(testing)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      // 7c. TypeScript strictness
      tsStrictness = (await p.select({
        message: '🔒 TypeScript strictness',
        options: [
          { value: 'strict', label: 'Strict (Recommended)', hint: 'Maximum type safety' },
          { value: 'moderate', label: 'Moderate', hint: 'Balanced type checking' },
          { value: 'loose', label: 'Loose', hint: 'Minimal - quick prototyping' },
        ],
      })) as TypeScriptStrictness;

      if (p.isCancel(tsStrictness)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      // 7d. Docker, CI/CD, Redis, Bun.secrets
      const infraChoices = (await p.multiselect({
        message: '🏗️  Infrastructure options (select any)',
        options: [
          { value: 'docker', label: 'Docker', hint: 'Dockerfile and docker-compose' },
          {
            value: 'cicd',
            label: 'GitHub Actions CI/CD',
            hint: 'Automated testing and deployment',
          },
          ...(normalizedPreset !== 'minimal' && normalizedPreset !== 'nextjs'
            ? [
                {
                  value: 'redis' as const,
                  label: 'Redis',
                  hint: 'Cache and session store',
                },
              ]
            : []),
          {
            value: 'bun-secrets',
            label: 'Bun.secrets',
            hint: 'Use Bun.secrets API instead of .env',
          },
        ],
        required: false,
      })) as string[];

      if (p.isCancel(infraChoices)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      docker = infraChoices.includes('docker');
      cicd = infraChoices.includes('cicd');
      redis = infraChoices.includes('redis');
      useBunSecrets = infraChoices.includes('bun-secrets');
    }
  }

  // Apply defaults for any unset advanced options
  codeQuality = codeQuality || 'ultracite';
  tsStrictness = tsStrictness || 'strict';
  testing = testing || 'bun-test';
  docker = docker || false;
  cicd = cicd || false;
  redis = redis || false;
  useBunSecrets = useBunSecrets || false;

  // ====================
  // 8. INSTALL DEPENDENCIES
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
  // 9. GIT INIT
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
  // 10. CONFIRM SUMMARY
  // ====================
  if (!isNonInteractive) {
    const configSummary = [
      '',
      `${chalk.bold.cyan('📦 Project Configuration')}`,
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold('Project Name:')} ${chalk.cyan(projectName)}`,
      `${chalk.bold('Preset:')} ${chalk.cyan(preset)}${enterprise ? chalk.yellow(' + Enterprise') : ''}`,
      '',
      database && database !== 'none'
        ? [
            `${chalk.bold.yellow('🗄️  Database')}`,
            `  ${chalk.bold('Type:')} ${chalk.cyan(database)}`,
            (database === 'supabase' || database === 'supabase-drizzle') && supabasePreset
              ? `  ${chalk.bold('Preset:')} ${chalk.cyan(supabasePreset)}`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      '',
      auth && auth !== 'none' ? `${chalk.bold('Auth:')} ${chalk.cyan(auth)}` : '',
      '',
      theme ? `${chalk.bold('Theme:')} ${chalk.cyan(theme)}` : '',
      '',
      `${chalk.bold.yellow('🛠️  Development Tools')}`,
      `  ${chalk.bold('Code Quality:')} ${chalk.cyan(codeQuality)}`,
      `  ${chalk.bold('TypeScript:')} ${chalk.cyan(tsStrictness)}`,
      `  ${chalk.bold('Testing:')} ${chalk.cyan(testing)}`,
      '',
      docker || cicd || redis
        ? [
            `${chalk.bold.yellow('🚀 Infrastructure')}`,
            docker ? `  ${chalk.bold('Docker:')} ${chalk.green('✓')}` : '',
            cicd ? `  ${chalk.bold('CI/CD:')} ${chalk.green('✓')}` : '',
            redis ? `  ${chalk.bold('Redis:')} ${chalk.green('✓')}` : '',
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
  console.log('');

  const spinner = p.spinner();
  spinner.start(`${chalk.cyan('🔨')} Creating project structure...`);

  try {
    const config: ProjectConfig = {
      name: projectName as string,
      preset: preset as PresetType,
      path: projectName as string,
      git: shouldInitGit as boolean,
      install: shouldInstall as boolean,
      enterprise,
      theme,
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
      shadcnStyle,
      shadcnBase,
      shadcnBaseColor,
      shadcnIconLibrary,
      shadcnMenuAccent,
      shadcnMenuColor,
      shadcnRadius,
      shadcnRtl: shadcnRtl || false,
      supabasePreset,
      supabaseFeatures,
      supabaseWithDrizzle,
    };

    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    spinner.message(`${chalk.cyan('📝')} Generating project files...`);

    // Build preset — 5 canonical presets
    switch (normalizedPreset) {
      case 'minimal':
        await buildMinimalPreset(projectPath, context);
        break;
      case 'nextjs':
        await buildWebPreset(projectPath, context);
        break;
      case 'hono-api':
        await buildApiPreset(projectPath, context);
        break;
      case 'nextjs-monorepo':
        await buildFullPresetV2(projectPath, context);
        break;
      case 'bun-monorepo':
        await buildMonorepoBunPreset(projectPath, context);
        break;
      default:
        throw new Error(
          `Unknown preset: ${preset}. Valid presets: minimal, nextjs, hono-api, nextjs-monorepo, bun-monorepo`
        );
    }

    spinner.stop(`${chalk.green('✅')} Project structure created successfully!`);

    // Install dependencies
    const isMonorepoPreset =
      normalizedPreset === 'nextjs-monorepo' || normalizedPreset === 'bun-monorepo';

    if (shouldInstall && !isMonorepoPreset) {
      const additionalDeps: Record<string, string> = {};

      if (database && database !== 'none') {
        Object.assign(additionalDeps, getDatabaseDependencies(database));
      }

      if (codeQuality) {
        Object.assign(additionalDeps, getCodeQualityDependencies(codeQuality));
      }

      if (testing === 'vitest') {
        additionalDeps.vitest = VERSIONS.vitest;
        additionalDeps['@vitest/ui'] = VERSIONS['@vitest/ui'];
      }

      if (uiLibrary === 'shadcn') {
        additionalDeps['class-variance-authority'] = VERSIONS['class-variance-authority'];
        additionalDeps.clsx = VERSIONS.clsx;
        additionalDeps['tailwind-merge'] = VERSIONS['tailwind-merge'];
      }

      if (Object.keys(additionalDeps).length > 0) {
        await installDependencies(projectPath, additionalDeps);
      } else {
        await installDependencies(projectPath);
      }
    } else if (shouldInstall && isMonorepoPreset) {
      await installDependencies(projectPath);
    }

    // Install default shadcn/ui components
    if (
      shouldInstall &&
      uiLibrary === 'shadcn' &&
      (normalizedPreset === 'nextjs' || isMonorepoPreset)
    ) {
      const componentSpinner = p.spinner();
      componentSpinner.start(
        `${chalk.cyan('🧩')} Installing default shadcn/ui components (button, card)...`
      );
      try {
        if (isMonorepoPreset) {
          await installDefaultShadcnComponents(join(projectPath, 'packages/ui'), { silent: true });
        } else {
          await installDefaultShadcnComponents(projectPath, { silent: true });
        }
        componentSpinner.stop(`${chalk.green('✅')} Default components installed`);
      } catch (_error) {
        componentSpinner.stop(`${chalk.yellow('⚠️')}  Could not install automatically`);
        p.note('Install manually: bunx shadcn@latest add button card', 'Component Installation');
      }
    }

    const getDevCommand = () => {
      if (isMonorepoPreset || normalizedPreset === 'nextjs') return 'bun dev';
      return 'bun run dev';
    };

    const getPresetEmoji = () => {
      switch (normalizedPreset) {
        case 'minimal':
          return '⚡';
        case 'nextjs':
          return '🌐';
        case 'hono-api':
          return '🚀';
        case 'nextjs-monorepo':
          return enterprise ? '🏢' : '📦';
        case 'bun-monorepo':
          return '🔥';
        default:
          return '✨';
      }
    };

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
      isMonorepoPreset
        ? `  ${chalk.dim('•')} Add workspaces: ${chalk.cyan('bunkit add workspace')}`
        : '',
      `  ${chalk.dim('•')} Read the ${chalk.cyan('README.md')} for project-specific documentation`,
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

    const projectSummary = [
      `${chalk.bold.green('✨ Project created successfully!')}`,
      '',
      `${chalk.dim('Project location:')} ${chalk.cyan(join(process.cwd(), projectName))}`,
      `${chalk.dim('Preset:')} ${chalk.cyan(preset)}${enterprise ? ' + Enterprise' : ''}`,
      database && database !== 'none' ? `${chalk.dim('Database:')} ${chalk.cyan(database)}` : '',
      theme ? `${chalk.dim('Theme:')} ${chalk.cyan(theme)}` : '',
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
    spinner.stop(`${chalk.red('❌')} Failed to create project`);

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
