import { z } from 'zod';

/**
 * Preset types for project scaffolding
 */
export type PresetType = 'minimal' | 'web' | 'api' | 'full';

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
 */
export type ShadcnStyle = 'new-york' | 'default';

/**
 * shadcn/ui base color options
 */
export type ShadcnBaseColor = 'neutral' | 'gray' | 'zinc' | 'stone' | 'slate';

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
  preset: z.enum(['minimal', 'web', 'api', 'full']),
  path: z.string(),
  features: z.array(z.string()).optional(),
  git: z.boolean().default(true),
  install: z.boolean().default(true),

  // Database configuration
  database: z.enum([
    'postgres-drizzle', 
    'postgres-prisma',
    'mysql-drizzle',
    'mysql-prisma',
    'supabase', 
    'supabase-drizzle',
    'supabase-prisma',
    'sqlite-drizzle',
    'sqlite-prisma',
    'none'
  ]).optional(),

  // Authentication configuration
  auth: z.enum(['supabase', 'better-auth', 'nextauth', 'none']).optional(),
  
  // Redis configuration (optional, for caching)
  redis: z.boolean().default(false),
  
  // Use Bun.secrets for credentials
  useBunSecrets: z.boolean().default(false),

  // Supabase configuration (only if database is supabase or supabase-drizzle)
  supabasePreset: z.enum(['full-stack', 'auth-only', 'database-only', 'custom']).optional(),
  supabaseFeatures: z.array(z.enum(['auth', 'storage', 'realtime', 'edge-functions', 'database'])).optional(),
  supabaseWithDrizzle: z.boolean().optional(), // For supabase preset, whether to include Drizzle

  // Code quality
  codeQuality: z.enum(['ultracite', 'biome']).default('ultracite'),

  // TypeScript configuration
  tsStrictness: z.enum(['strict', 'moderate', 'loose']).default('strict'),

  // UI & Styling
  uiLibrary: z.enum(['shadcn', 'none']).optional(),
  cssFramework: z.enum(['tailwind', 'vanilla', 'css-modules']).optional(),
  
  // shadcn/ui specific options
  shadcnStyle: z.enum(['new-york', 'default']).optional(),
  shadcnBaseColor: z.enum(['neutral', 'gray', 'zinc', 'stone', 'slate']).optional(),
  shadcnRadius: z.string().optional(), // e.g., "0.5rem", "0.625rem"

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

      // shadcn/ui specific options
      shadcnStyle?: ShadcnStyle;
      shadcnBaseColor?: ShadcnBaseColor;
      shadcnRadius?: string;

      // Supabase specific options
      supabasePreset?: SupabasePreset;
      supabaseFeatures?: SupabaseFeature[];
      supabaseWithDrizzle?: boolean;

  [key: string]: unknown;
}

/**
 * File operation result
 */
export interface FileOperationResult {
  path: string;
  success: boolean;
  error?: string;
}
