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
export type DatabaseType = 'postgres-drizzle' | 'supabase' | 'sqlite-drizzle' | 'none';

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
  database: z.enum(['postgres-drizzle', 'supabase', 'sqlite-drizzle', 'none']).optional(),

  // Code quality
  codeQuality: z.enum(['ultracite', 'biome']).default('ultracite'),

  // TypeScript configuration
  tsStrictness: z.enum(['strict', 'moderate', 'loose']).default('strict'),

  // UI & Styling
  uiLibrary: z.enum(['shadcn', 'none']).optional(),
  cssFramework: z.enum(['tailwind', 'vanilla', 'css-modules']).optional(),

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
  codeQuality?: CodeQualityType;
  tsStrictness?: TypeScriptStrictness;
  uiLibrary?: UILibrary;
  cssFramework?: CSSFramework;
  testing?: TestingFramework;
  docker?: boolean;
  cicd?: boolean;
  envExample?: boolean;
  pathAliases?: boolean;

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
