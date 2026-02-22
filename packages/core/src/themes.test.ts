import { describe, expect, it } from 'bun:test';
import { resolveThemeToShadcnOptions, THEME_PRESETS } from './themes';

describe('themes', () => {
  describe('THEME_PRESETS', () => {
    it('should have 4 theme presets', () => {
      expect(Object.keys(THEME_PRESETS)).toHaveLength(4);
    });

    it('should contain modern-clean, bold-vibrant, minimalist, elegant', () => {
      expect(THEME_PRESETS['modern-clean']).toBeDefined();
      expect(THEME_PRESETS['bold-vibrant']).toBeDefined();
      expect(THEME_PRESETS.minimalist).toBeDefined();
      expect(THEME_PRESETS.elegant).toBeDefined();
    });

    it('should have all required fields in each preset', () => {
      for (const [_name, preset] of Object.entries(THEME_PRESETS)) {
        expect(preset.shadcnStyle).toBeDefined();
        expect(preset.shadcnBaseColor).toBeDefined();
        expect(preset.shadcnIconLibrary).toBeDefined();
        expect(preset.shadcnMenuAccent).toBeDefined();
        expect(preset.shadcnMenuColor).toBeDefined();
        expect(preset.shadcnRadius).toBeDefined();
        // All presets use iconoir (bunkit default)
        expect(preset.shadcnIconLibrary).toBe('iconoir');
      }
    });
  });

  describe('resolveThemeToShadcnOptions', () => {
    it('should resolve modern-clean to radix-maia + zinc', () => {
      const resolved = resolveThemeToShadcnOptions('modern-clean');
      expect(resolved).not.toBeNull();
      expect(resolved?.shadcnStyle).toBe('radix-maia');
      expect(resolved?.shadcnBaseColor).toBe('zinc');
      expect(resolved?.shadcnMenuAccent).toBe('subtle');
      expect(resolved?.shadcnRadius).toBe('0.625rem');
    });

    it('should resolve bold-vibrant to radix-vega + neutral', () => {
      const resolved = resolveThemeToShadcnOptions('bold-vibrant');
      expect(resolved).not.toBeNull();
      expect(resolved?.shadcnStyle).toBe('radix-vega');
      expect(resolved?.shadcnBaseColor).toBe('neutral');
      expect(resolved?.shadcnMenuAccent).toBe('bold');
    });

    it('should resolve minimalist to radix-nova + slate', () => {
      const resolved = resolveThemeToShadcnOptions('minimalist');
      expect(resolved).not.toBeNull();
      expect(resolved?.shadcnStyle).toBe('radix-nova');
      expect(resolved?.shadcnBaseColor).toBe('slate');
      expect(resolved?.shadcnMenuColor).toBe('muted');
    });

    it('should resolve elegant to radix-lyra + stone', () => {
      const resolved = resolveThemeToShadcnOptions('elegant');
      expect(resolved).not.toBeNull();
      expect(resolved?.shadcnStyle).toBe('radix-lyra');
      expect(resolved?.shadcnBaseColor).toBe('stone');
    });

    it('should return null for custom theme', () => {
      const resolved = resolveThemeToShadcnOptions('custom');
      expect(resolved).toBeNull();
    });
  });
});
