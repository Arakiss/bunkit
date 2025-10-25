/**
 * Template rendering and management for bunkit
 */
export { renderTemplate } from './render';
export { getPresetConfig } from './presets';
export { buildMinimalPreset } from './builders/minimal';
export { buildWebPreset } from './builders/web';
export { buildApiPreset } from './builders/api';
export { buildFullPreset } from './builders/full';
export type { PresetConfig } from './types';
