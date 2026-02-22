import { describe, expect, it } from 'bun:test';
import {
  DEPRECATED_ALIASES,
  getDeprecatedAliasInfo,
  getRemovedPresetInfo,
  REMOVED_PRESETS,
} from './migration';

describe('migration', () => {
  describe('REMOVED_PRESETS', () => {
    it('should have entries for bun-api, bun-fullstack, enterprise-monorepo', () => {
      expect(REMOVED_PRESETS['bun-api']).toBeDefined();
      expect(REMOVED_PRESETS['bun-fullstack']).toBeDefined();
      expect(REMOVED_PRESETS['enterprise-monorepo']).toBeDefined();
    });

    it('should have message and suggestion for each removed preset', () => {
      for (const [_name, info] of Object.entries(REMOVED_PRESETS)) {
        expect(info.message).toBeTruthy();
        expect(info.suggestion).toBeTruthy();
        expect(info.message).toContain('removed');
      }
    });

    it('should suggest hono-api for bun-api', () => {
      expect(REMOVED_PRESETS['bun-api'].suggestion).toBe('hono-api');
    });

    it('should suggest bun-monorepo for bun-fullstack', () => {
      expect(REMOVED_PRESETS['bun-fullstack'].suggestion).toBe('bun-monorepo');
    });

    it('should suggest nextjs-monorepo for enterprise-monorepo', () => {
      expect(REMOVED_PRESETS['enterprise-monorepo'].suggestion).toBe('nextjs-monorepo');
    });
  });

  describe('DEPRECATED_ALIASES', () => {
    it('should have entries for web, api, full, monorepo-nextjs, monorepo-bun', () => {
      expect(DEPRECATED_ALIASES.web).toBeDefined();
      expect(DEPRECATED_ALIASES.api).toBeDefined();
      expect(DEPRECATED_ALIASES.full).toBeDefined();
      expect(DEPRECATED_ALIASES['monorepo-nextjs']).toBeDefined();
      expect(DEPRECATED_ALIASES['monorepo-bun']).toBeDefined();
    });

    it('should map web to nextjs', () => {
      expect(DEPRECATED_ALIASES.web.canonical).toBe('nextjs');
    });

    it('should map api to hono-api', () => {
      expect(DEPRECATED_ALIASES.api.canonical).toBe('hono-api');
    });

    it('should map full to nextjs-monorepo', () => {
      expect(DEPRECATED_ALIASES.full.canonical).toBe('nextjs-monorepo');
    });

    it('should have warning messages for all aliases', () => {
      for (const [_name, info] of Object.entries(DEPRECATED_ALIASES)) {
        expect(info.warning).toBeTruthy();
        expect(info.warning).toContain('deprecated');
      }
    });
  });

  describe('getRemovedPresetInfo', () => {
    it('should return info for removed presets', () => {
      const info = getRemovedPresetInfo('bun-api');
      expect(info).not.toBeNull();
      expect(info?.suggestion).toBe('hono-api');
    });

    it('should return null for valid presets', () => {
      expect(getRemovedPresetInfo('nextjs')).toBeNull();
      expect(getRemovedPresetInfo('hono-api')).toBeNull();
      expect(getRemovedPresetInfo('minimal')).toBeNull();
    });
  });

  describe('getDeprecatedAliasInfo', () => {
    it('should return info for deprecated aliases', () => {
      const info = getDeprecatedAliasInfo('web');
      expect(info).not.toBeNull();
      expect(info?.canonical).toBe('nextjs');
    });

    it('should return null for canonical preset names', () => {
      expect(getDeprecatedAliasInfo('nextjs')).toBeNull();
      expect(getDeprecatedAliasInfo('hono-api')).toBeNull();
      expect(getDeprecatedAliasInfo('minimal')).toBeNull();
    });
  });
});
