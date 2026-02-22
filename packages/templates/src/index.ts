/**
 * Template rendering and management for bunkit
 */

// Builders
export { buildApiPreset } from './builders/api';
export { buildFullPresetV2 } from './builders/full-v2';
export { buildMinimalPreset } from './builders/minimal';
export { buildMonorepoBunPreset } from './builders/monorepo-bun';
export { buildWebPreset } from './builders/web';
export { buildWorkspace } from './builders/workspace';
export {
  getAuthDependencies,
  setupBetterAuth,
  setupNextAuth,
} from './generators/auth';
export { setupBunFullstack } from './generators/bun-fullstack';
export { setupBunServeNative } from './generators/bun-serve';
export { generateBunfigContent } from './generators/bunfig';
export { setupGitHubActions } from './generators/cicd';
// Generators
export {
  getDatabaseDependencies,
  setupMySQLDrizzle,
  setupMySQLPrisma,
  setupPostgresDrizzle,
  setupPostgresPrisma,
  setupRedis,
  setupSQLiteDrizzle,
  setupSQLitePrisma,
  setupSupabaseDrizzle,
  setupSupabaseOnly,
  setupSupabasePrisma,
} from './generators/database';
export { setupVSCodeDebug } from './generators/debug';
export { setupDocker } from './generators/docker';
export { setupEnhancedHono } from './generators/hono';
export {
  generateBunApiReadme,
  generateBunFullstackReadme,
  generateHonoApiReadme,
  generateMinimalReadme,
  generateMonorepoReadme,
  generateNextjsReadme,
  generateReadmeFooter,
} from './generators/readme';
export { setupBunSecrets } from './generators/secrets';
export { setupShadcnMonorepo, setupShadcnWeb } from './generators/shadcn';
export {
  createShadcnExample,
  DEFAULT_SHADCN_COMPONENTS,
  installDefaultShadcnComponents,
  installShadcnComponents,
} from './generators/shadcn-components';
export { createShadcnDocs } from './generators/shadcn-docs';
export { setupTooling } from './generators/tooling';
export {
  getCodeQualityDependencies,
  setupBiome,
  setupUltracite,
} from './generators/ultracite';
export { getPresetConfig } from './presets';
export { renderTemplate } from './render';
// Shared Utilities (New Architecture)
export * from './shared';
export type { PresetConfig } from './types';
