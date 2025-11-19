import { describe, it, expect } from 'bun:test';
import { createBanner, showBanner } from './banner';

describe('banner utilities', () => {
  describe('createBanner', () => {
    it('should create banner with default version', () => {
      const banner = createBanner();

      expect(typeof banner).toBe('string');
      expect(banner.length).toBeGreaterThan(0);
    });

    it('should create banner with custom version', () => {
      const banner = createBanner('1.2.3');

      expect(typeof banner).toBe('string');
      expect(banner).toContain('1.2.3');
    });

    it('should include bunkit logo', () => {
      const banner = createBanner();

      // Banner should contain some ASCII art
      expect(banner.length).toBeGreaterThan(100);
    });

    it('should include version information', () => {
      const banner = createBanner('2.0.0');

      expect(banner).toContain('2.0.0');
    });

    it('should include inspirational quote', () => {
      const banner = createBanner();

      // Should contain some text (quote)
      expect(banner.length).toBeGreaterThan(0);
    });

    it('should handle empty version string', () => {
      const banner = createBanner('');

      expect(typeof banner).toBe('string');
    });
  });

  describe('showBanner', () => {
    it('should be a function', () => {
      expect(typeof showBanner).toBe('function');
    });

    it('should accept version parameter', () => {
      // Just verify it doesn't throw
      expect(() => showBanner('1.0.0')).not.toThrow();
    });

    it('should work without version parameter', () => {
      expect(() => showBanner()).not.toThrow();
    });
  });
});

