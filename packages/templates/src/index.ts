/**
 * Template rendering and management for bunkit
 */
export { renderTemplate } from './render';
export { getPresetConfig } from './presets';
export { buildMinimalPreset } from './builders/minimal';
export { buildWebPreset } from './builders/web';
export { buildApiPreset } from './builders/api';
export { buildFullPreset } from './builders/full';
export { buildWorkspace } from './builders/workspace';
export type { PresetConfig } from './types';

// Generators
export {
  setupPostgresDrizzle,
  setupSupabase,
  setupSQLiteDrizzle,
  getDatabaseDependencies,
} from './generators/database';
export {
  setupUltracite,
  setupBiome,
  getCodeQualityDependencies,
} from './generators/ultracite';
export { setupDocker } from './generators/docker';
export { setupGitHubActions } from './generators/cicd';
