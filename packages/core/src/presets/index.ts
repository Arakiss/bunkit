/**
 * Presets module - Single source of truth for all bunkit presets
 */

// Custom presets - user-defined presets saved to disk
export {
  type CustomPreset,
  deleteCustomPreset,
  getCustomPreset,
  listCustomPresets,
  loadCustomPresets,
  saveCustomPreset,
} from './custom';
// Registry - canonical preset definitions
export {
  PRESET_DEFINITIONS,
  type PresetCapabilities,
  type PresetDefinition,
  PresetRegistry,
  type WorkspaceStructure,
} from './registry';
