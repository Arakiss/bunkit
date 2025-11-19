import { join } from 'pathe';
import { readFile, writeFile, ensureDirectory } from './fs';
import type { ProjectConfig } from './types';

export interface CustomPreset {
  name: string;
  description: string;
  config: ProjectConfig;
  createdAt: string;
  updatedAt: string;
}

function getPresetsDir(): string {
  return join(process.env.HOME || process.env.USERPROFILE || '.', '.bunkit');
}

function getPresetsFile(): string {
  return join(getPresetsDir(), 'presets.json');
}

/**
 * Load all custom presets from disk
 */
export async function loadCustomPresets(): Promise<Record<string, CustomPreset>> {
  try {
    const presetsDir = getPresetsDir();
    await ensureDirectory(presetsDir);
    const content = await readFile(getPresetsFile());
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist or is invalid - return empty object
    return {};
  }
}

/**
 * Save a custom preset
 */
export async function saveCustomPreset(preset: CustomPreset): Promise<void> {
  await ensureDirectory(getPresetsDir());
  const presets = await loadCustomPresets();
  
  const existing = presets[preset.name];
  presets[preset.name] = {
    ...preset,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await writeFile(getPresetsFile(), JSON.stringify(presets, null, 2));
}

/**
 * Delete a custom preset
 */
export async function deleteCustomPreset(name: string): Promise<boolean> {
  const presets = await loadCustomPresets();
  if (!presets[name]) {
    return false;
  }
  
  delete presets[name];
  await writeFile(getPresetsFile(), JSON.stringify(presets, null, 2));
  return true;
}

/**
 * Get a custom preset by name
 */
export async function getCustomPreset(name: string): Promise<CustomPreset | null> {
  const presets = await loadCustomPresets();
  return presets[name] || null;
}

/**
 * List all custom presets
 */
export async function listCustomPresets(): Promise<CustomPreset[]> {
  const presets = await loadCustomPresets();
  return Object.values(presets);
}

