import { z } from 'zod';

/**
 * Preset types for project scaffolding
 *
 * Naming convention: {framework}-{architecture}
 * - Framework: nextjs, hono-api, bun-api, bun-fullstack
 * - Architecture: (none) = single repo, monorepo = monorepo
 *
 * Presets:
 * - minimal: Single-file Bun project - perfect for CLIs and scripts
 * - nextjs: Next.js 16 + React 19 - Production-ready web application (single repo)
 * - hono-api: Hono 4 + Bun.serve() - Full-featured API with middleware ecosystem (single repo)
 * - bun-api: Bun.serve() native routing - Ultra-fast API with zero dependencies (single repo)
 * - bun-fullstack: Bun.serve() + HTML imports - Full-stack app without Next.js (single repo)
 * - nextjs-monorepo: Monorepo with Next.js + Hono - Enterprise SaaS architecture
 * - bun-monorepo: Monorepo with Bun.serve() - Full-stack without Next.js
 * - enterprise-monorepo: Enterprise monorepo with multiple Next.js apps and services
 *
 * Aliases (for backwards compatibility):
 * - web → nextjs
 * - api → hono-api
 * - full → nextjs-monorepo
 * - monorepo-nextjs → nextjs-monorepo
 * - monorepo-bun → bun-monorepo
 */
export type PresetType =
  | 'minimal'
  | 'nextjs' // Next.js single repo (primary name)
  | 'web' // Alias for nextjs (backwards compatibility)
  | 'hono-api' // Hono API single repo (primary name)
  | 'api' // Alias for hono-api (backwards compatibility)
  | 'bun-api' // Bun.serve() native API single repo
  | 'bun-fullstack' // Bun.serve() + HTML imports single repo
  | 'nextjs-monorepo' // Next.js + Hono monorepo (primary name)
  | 'full' // Alias for nextjs-monorepo (backwards compatibility)
  | 'monorepo-nextjs' // Alias for nextjs-monorepo (backwards compatibility)
  | 'bun-monorepo' // Bun.serve() monorepo (primary name)
  | 'monorepo-bun' // Alias for bun-monorepo (backwards compatibility)
  | 'enterprise-monorepo'; // Enterprise monorepo with multiple apps and services

/**
 * Feature types that can be added to projects
 */
export type FeatureType = 'auth' | 'database' | 'ui' | 'payments' | 'email' | 'storage';

/**
 * Database options
 */
export type DatabaseType =
  | 'postgres-drizzle'
  | 'postgres-prisma'
  | 'mysql-drizzle'
  | 'mysql-prisma'
  | 'supabase'
  | 'supabase-drizzle'
  | 'supabase-prisma'
  | 'sqlite-drizzle'
  | 'sqlite-prisma'
  | 'none';

/**
 * ORM options
 */
export type ORMType = 'drizzle' | 'prisma';

/**
 * Authentication provider options
 */
export type AuthProvider = 'supabase' | 'better-auth' | 'nextauth' | 'none';

/**
 * Supabase feature options
 */
export type SupabaseFeature = 'auth' | 'storage' | 'realtime' | 'edge-functions' | 'database';

/**
 * Supabase preset options
 */
export type SupabasePreset = 'full-stack' | 'auth-only' | 'database-only' | 'custom';

/**
 * Code quality options
 */
export type CodeQualityType = 'ultracite' | 'biome';

/**
 * TypeScript strictness levels
 */
export type TypeScriptStrictness = 'strict' | 'moderate' | 'loose';

/**
 * UI library options
 */
export type UILibrary = 'shadcn' | 'none';

/**
 * shadcn/ui style options
 *
 * As of February 2026, shadcn/ui offers visual styles for both Radix UI and Base UI:
 *
 * Radix UI styles:
 * - radix-maia: Modern, clean design with soft shadows
 * - radix-vega: Bold, vibrant design with stronger colors
 * - radix-nova: Minimalist design with subtle accents
 * - radix-lyra: Elegant design with refined typography
 * - radix-mira: Playful design with rounded elements
 *
 * Base UI styles (January 2026+):
 * - base-maia: Modern, clean design using Base UI primitives
 * - base-vega: Bold, vibrant design using Base UI primitives
 * - base-nova: Minimalist design using Base UI primitives
 * - base-lyra: Elegant design using Base UI primitives
 * - base-mira: Playful design using Base UI primitives
 *
 * Legacy styles (still supported):
 * - new-york: Modern aesthetic with rounded corners
 * - default: Classic aesthetic with sharper edges
 */
export type ShadcnStyle =
  | 'radix-maia'
  | 'radix-vega'
  | 'radix-nova'
  | 'radix-lyra'
  | 'radix-mira'
  | 'base-maia'
  | 'base-vega'
  | 'base-nova'
  | 'base-lyra'
  | 'base-mira'
  | 'new-york'
  | 'default';

/**
 * shadcn/ui base UI foundation options
 *
 * Choose the underlying component library:
 * - radix: Radix UI primitives (default, most popular)
 * - base-ui: Base UI from MUI (alternative)
 */
export type ShadcnBase = 'radix' | 'base-ui';

/**
 * shadcn/ui icon library options
 *
 * - iconoir: Iconoir Icons (bunkit default - 1600+ icons, tree-shakeable)
 * - phosphor: Phosphor Icons (shadcn/ui default for modern styles)
 * - lucide: Lucide Icons (classic shadcn/ui)
 */
export type ShadcnIconLibrary = 'phosphor' | 'lucide' | 'iconoir';

/**
 * shadcn/ui base color options
 */
export type ShadcnBaseColor = 'neutral' | 'gray' | 'zinc' | 'stone' | 'slate';

/**
 * shadcn/ui menu accent style
 */
export type ShadcnMenuAccent = 'subtle' | 'bold';

/**
 * shadcn/ui menu color style
 */
export type ShadcnMenuColor = 'default' | 'muted';

/**
 * CSS framework options
 */
export type CSSFramework = 'tailwind' | 'vanilla' | 'css-modules';

/**
 * Testing framework options
 */
export type TestingFramework = 'bun-test' | 'vitest' | 'none';

/**
 * Project configuration schema
 */
export const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  preset: z.enum([
    'minimal',
    'nextjs',
    'web', // Alias for nextjs
    'hono-api',
    'api', // Alias for hono-api
    'bun-api',
    'bun-fullstack',
    'nextjs-monorepo',
    'full', // Alias for nextjs-monorepo
    'monorepo-nextjs', // Alias for nextjs-monorepo
    'bun-monorepo',
    'monorepo-bun', // Alias for bun-monorepo
    'enterprise-monorepo',
  ]),
  path: z.string(),
  features: z.array(z.string()).optional(),
  git: z.boolean().default(true),
  install: z.boolean().default(true),

  // Database configuration
  database: z
    .enum([
      'postgres-drizzle',
      'postgres-prisma',
      'mysql-drizzle',
      'mysql-prisma',
      'supabase',
      'supabase-drizzle',
      'supabase-prisma',
      'sqlite-drizzle',
      'sqlite-prisma',
      'none',
    ])
    .optional(),

  // Authentication configuration
  auth: z.enum(['supabase', 'better-auth', 'nextauth', 'none']).optional(),

  // Redis configuration (optional, for caching)
  redis: z.boolean().default(false),

  // Use Bun.secrets for credentials
  useBunSecrets: z.boolean().default(false),

  // Supabase configuration (only if database is supabase or supabase-drizzle)
  supabasePreset: z.enum(['full-stack', 'auth-only', 'database-only', 'custom']).optional(),
  supabaseFeatures: z
    .array(z.enum(['auth', 'storage', 'realtime', 'edge-functions', 'database']))
    .optional(),
  supabaseWithDrizzle: z.boolean().optional(), // For supabase preset, whether to include Drizzle

  // Code quality
  codeQuality: z.enum(['ultracite', 'biome']).default('ultracite'),

  // TypeScript configuration
  tsStrictness: z.enum(['strict', 'moderate', 'loose']).default('strict'),

  // UI & Styling
  uiLibrary: z.enum(['shadcn', 'none']).optional(),
  cssFramework: z.enum(['tailwind', 'vanilla', 'css-modules']).optional(),

  // shadcn/ui specific options (December 2025 - new create feature)
  shadcnStyle: z
    .enum([
      'radix-maia',
      'radix-vega',
      'radix-nova',
      'radix-lyra',
      'radix-mira',
      'base-maia',
      'base-vega',
      'base-nova',
      'base-lyra',
      'base-mira',
      'new-york',
      'default',
    ])
    .optional(),
  shadcnBase: z.enum(['radix', 'base-ui']).optional(),
  shadcnBaseColor: z.enum(['neutral', 'gray', 'zinc', 'stone', 'slate']).optional(),
  shadcnIconLibrary: z.enum(['phosphor', 'lucide', 'iconoir']).optional(),
  shadcnMenuAccent: z.enum(['subtle', 'bold']).optional(),
  shadcnMenuColor: z.enum(['default', 'muted']).optional(),
  shadcnRadius: z.string().optional(), // e.g., "0.5rem", "0.625rem"
  shadcnRtl: z.boolean().optional(), // RTL support (February 2026+)

  // Testing
  testing: z.enum(['bun-test', 'vitest', 'none']).default('bun-test'),

  // Additional options
  docker: z.boolean().default(false),
  cicd: z.boolean().default(false),
  envExample: z.boolean().default(true),
  pathAliases: z.boolean().default(true),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

/**
 * Feature configuration schema
 */
export const FeatureConfigSchema = z.object({
  name: z.enum(['auth', 'database', 'ui', 'payments', 'email', 'storage']),
  provider: z.string().optional(),
  options: z.record(z.any()).optional(),
});

export type FeatureConfig = z.infer<typeof FeatureConfigSchema>;

/**
 * Template context for EJS rendering
 */
export interface TemplateContext {
  projectName: string;
  packageName: string;
  description: string;
  author?: string;
  license: string;
  features: string[];
  supportsTypeScript: boolean;

  // Configuration options
  database?: DatabaseType;
  auth?: AuthProvider;
  redis?: boolean;
  useBunSecrets?: boolean;
  codeQuality?: CodeQualityType;
  tsStrictness?: TypeScriptStrictness;
  uiLibrary?: UILibrary;
  cssFramework?: CSSFramework;
  testing?: TestingFramework;
  docker?: boolean;
  cicd?: boolean;
  envExample?: boolean;
  pathAliases?: boolean;

  // shadcn/ui specific options (December 2025 - new create feature)
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

  [key: string]: unknown;
}

/**
 * Infer the shadcn base (radix or base-ui) from a style name.
 * Styles prefixed with "base-" use Base UI; everything else uses Radix.
 */
export function inferShadcnBase(style: ShadcnStyle | undefined): 'radix' | 'base-ui' {
  if (style?.startsWith('base-')) {
    return 'base-ui';
  }
  return 'radix';
}

/**
 * Check if a style is a modern shadcn/ui style (December 2025+ radix-* or January 2026+ base-*).
 * Modern styles use tw-animate-css, shadcn/tailwind.css, and support menuColor/menuAccent.
 */
export function isModernShadcnStyle(style: ShadcnStyle | undefined): boolean {
  if (!style) return false;
  return style.startsWith('radix-') || style.startsWith('base-');
}

/**
 * File operation result
 */
export interface FileOperationResult {
  path: string;
  success: boolean;
  error?: string;
}
