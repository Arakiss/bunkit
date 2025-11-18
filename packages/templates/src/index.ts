/**
 * Template rendering and management for bunkit
 */
export { renderTemplate } from './render';
export { getPresetConfig } from './presets';
export { buildMinimalPreset } from './builders/minimal';
export { buildWebPreset } from './builders/web';
export { buildApiPreset } from './builders/api';
export { buildBunApiPreset } from './builders/bun-api';
export { buildBunFullstackPreset } from './builders/bun-fullstack';
export { buildFullPreset } from './builders/full';
export { buildMonorepoBunPreset } from './builders/monorepo-bun';
export { buildEnterprisePreset } from './builders/enterprise';
export { buildWorkspace } from './builders/workspace';
export type { PresetConfig } from './types';

// Generators
export {
  setupPostgresDrizzle,
  setupPostgresPrisma,
  setupMySQLDrizzle,
  setupMySQLPrisma,
  setupSupabaseOnly,
  setupSupabaseDrizzle,
  setupSupabasePrisma,
  setupSQLiteDrizzle,
  setupSQLitePrisma,
  setupRedis,
  getDatabaseDependencies,
} from './generators/database';
export {
  setupBetterAuth,
  setupNextAuth,
  getAuthDependencies,
} from './generators/auth';
export { setupEnhancedHono } from './generators/hono';
export { setupBunServeNative } from './generators/bun-serve';
export { setupBunFullstack } from './generators/bun-fullstack';
export { setupBunSecrets } from './generators/secrets';
export { generateBunfigContent } from './generators/bunfig';
export {
  setupUltracite,
  setupBiome,
  getCodeQualityDependencies,
} from './generators/ultracite';
export { setupDocker } from './generators/docker';
export { setupGitHubActions } from './generators/cicd';
export { setupVSCodeDebug } from './generators/debug';
export { setupShadcnWeb, setupShadcnMonorepo } from './generators/shadcn';
export { setupTooling } from './generators/tooling';
export {
  installShadcnComponents,
  installDefaultShadcnComponents,
  createShadcnExample,
  DEFAULT_SHADCN_COMPONENTS,
} from './generators/shadcn-components';
export { createShadcnDocs } from './generators/shadcn-docs';
