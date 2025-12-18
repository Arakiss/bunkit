/**
 * Presets module - Single source of truth for all bunkit presets
 */

// Registry - canonical preset definitions
export {
  PresetRegistry,
  PRESET_DEFINITIONS,
  type PresetDefinition,
  type PresetCapabilities,
  type WorkspaceStructure,
} from './registry';

// Custom presets - user-defined presets saved to disk
export {
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  getCustomPreset,
  listCustomPresets,
  type CustomPreset,
} from './custom';
