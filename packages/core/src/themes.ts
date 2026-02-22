import type {
  ShadcnBaseColor,
  ShadcnIconLibrary,
  ShadcnMenuAccent,
  ShadcnMenuColor,
  ShadcnStyle,
} from './types';

/**
 * Theme preset names for simplified shadcn/ui configuration.
 * Instead of asking 7 individual prompts, users pick one theme.
 */
export type ThemePresetName = 'modern-clean' | 'bold-vibrant' | 'minimalist' | 'elegant' | 'custom';

/**
 * Resolved shadcn/ui options from a theme preset
 */
export interface ResolvedThemeOptions {
  shadcnStyle: ShadcnStyle;
  shadcnBaseColor: ShadcnBaseColor;
  shadcnIconLibrary: ShadcnIconLibrary;
  shadcnMenuAccent: ShadcnMenuAccent;
  shadcnMenuColor: ShadcnMenuColor;
  shadcnRadius: string;
}

/**
 * Theme preset definitions mapping preset names to shadcn/ui configuration.
 *
 * Each preset bundles sensible defaults for style, color, icons, menus, and radius
 * so users don't need to answer 7 separate prompts.
 */
export const THEME_PRESETS: Record<Exclude<ThemePresetName, 'custom'>, ResolvedThemeOptions> = {
  'modern-clean': {
    shadcnStyle: 'radix-maia',
    shadcnBaseColor: 'zinc',
    shadcnIconLibrary: 'iconoir',
    shadcnMenuAccent: 'subtle',
    shadcnMenuColor: 'default',
    shadcnRadius: '0.625rem',
  },
  'bold-vibrant': {
    shadcnStyle: 'radix-vega',
    shadcnBaseColor: 'neutral',
    shadcnIconLibrary: 'iconoir',
    shadcnMenuAccent: 'bold',
    shadcnMenuColor: 'default',
    shadcnRadius: '0.5rem',
  },
  minimalist: {
    shadcnStyle: 'radix-nova',
    shadcnBaseColor: 'slate',
    shadcnIconLibrary: 'iconoir',
    shadcnMenuAccent: 'subtle',
    shadcnMenuColor: 'muted',
    shadcnRadius: '0.375rem',
  },
  elegant: {
    shadcnStyle: 'radix-lyra',
    shadcnBaseColor: 'stone',
    shadcnIconLibrary: 'iconoir',
    shadcnMenuAccent: 'subtle',
    shadcnMenuColor: 'default',
    shadcnRadius: '0.75rem',
  },
};

/**
 * Resolve a theme preset name to its full shadcn/ui configuration.
 * Returns `null` for 'custom' — the caller should prompt for individual options.
 */
export function resolveThemeToShadcnOptions(theme: ThemePresetName): ResolvedThemeOptions | null {
  if (theme === 'custom') {
    return null;
  }
  return THEME_PRESETS[theme];
}
