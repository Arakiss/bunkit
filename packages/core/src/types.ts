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
 * Project configuration schema
 */
export const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  preset: z.enum(['minimal', 'web', 'api', 'full']),
  path: z.string(),
  features: z.array(z.string()).optional(),
  git: z.boolean().default(true),
  install: z.boolean().default(true),
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
