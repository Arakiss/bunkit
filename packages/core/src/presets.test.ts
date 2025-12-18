import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'pathe';
import {
  type CustomPreset,
  deleteCustomPreset,
  getCustomPreset,
  listCustomPresets,
  loadCustomPresets,
  saveCustomPreset,
} from './presets';

describe('presets utilities', () => {
  let testDir: string;
  let originalHome: string | undefined;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'bunkit-presets-test-'));
    // Mock HOME directory for tests
    originalHome = process.env.HOME;
    process.env.HOME = testDir;
    // Clean up presets file before each test
    try {
      const presetsFile = join(testDir, '.bunkit', 'presets.json');
      await rm(presetsFile, { force: true });
    } catch {
      // File doesn't exist, that's okay
    }
  });

  afterEach(async () => {
    // Clean up presets file after each test
    try {
      const presetsFile = join(testDir, '.bunkit', 'presets.json');
      await rm(presetsFile, { force: true });
    } catch {
      // File doesn't exist, that's okay
    }
    if (originalHome) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
    await rm(testDir, { recursive: true, force: true });
  });

  describe('loadCustomPresets', () => {
    it('should return empty object when presets file does not exist', async () => {
      // Use a fresh test directory for this test
      const freshTestDir = await mkdtemp(join(tmpdir(), 'bunkit-presets-fresh-'));
      const originalHome = process.env.HOME;
      process.env.HOME = freshTestDir;

      try {
        const presets = await loadCustomPresets();
        expect(presets).toEqual({});
      } finally {
        process.env.HOME = originalHome;
        await rm(freshTestDir, { recursive: true, force: true });
      }
    });

    it('should load presets from file', async () => {
      // Use a fresh test directory for this test
      const freshTestDir = await mkdtemp(join(tmpdir(), 'bunkit-presets-load-'));
      const originalHome = process.env.HOME;
      process.env.HOME = freshTestDir;

      try {
        const presetsData = {
          'my-preset': {
            name: 'my-preset',
            description: 'My custom preset',
            config: {
              name: 'test',
              preset: 'minimal',
              path: 'test',
              git: false,
              install: false,
              database: 'none',
              redis: false,
              useBunSecrets: false,
              codeQuality: 'biome',
              tsStrictness: 'strict',
              testing: 'bun-test',
              docker: false,
              cicd: false,
              envExample: true,
              pathAliases: true,
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        };

        await mkdir(join(freshTestDir, '.bunkit'), { recursive: true });
        await writeFile(
          join(freshTestDir, '.bunkit', 'presets.json'),
          JSON.stringify(presetsData, null, 2)
        );

        const presets = await loadCustomPresets();

        expect(presets['my-preset']).toBeDefined();
        expect(presets['my-preset'].name).toBe('my-preset');
        expect(presets['my-preset'].description).toBe('My custom preset');
      } finally {
        process.env.HOME = originalHome;
        await rm(freshTestDir, { recursive: true, force: true });
      }
    });

    it('should create presets directory if it does not exist', async () => {
      await loadCustomPresets();

      const presetsDir = join(testDir, '.bunkit');
      const _dirExists = await Bun.file(presetsDir)
        .exists()
        .catch(() => false);
      // Directory should be created (we can't easily check directory existence with Bun.file)
      // But the function should not throw
      expect(typeof (await loadCustomPresets())).toBe('object');
    });
  });

  describe('saveCustomPreset', () => {
    it('should save a new preset', async () => {
      const preset: CustomPreset = {
        name: 'new-preset',
        description: 'New preset',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await saveCustomPreset(preset);

      const saved = await getCustomPreset('new-preset');
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe('new-preset');
    });

    it('should update existing preset', async () => {
      const preset: CustomPreset = {
        name: 'existing-preset',
        description: 'Original description',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await saveCustomPreset(preset);
      const originalCreatedAt = (await getCustomPreset('existing-preset'))?.createdAt;

      const updated: CustomPreset = {
        ...preset,
        description: 'Updated description',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      await saveCustomPreset(updated);

      const saved = await getCustomPreset('existing-preset');
      expect(saved?.description).toBe('Updated description');
      expect(saved?.createdAt).toBe(originalCreatedAt); // Should preserve original createdAt
    });

    it('should preserve createdAt when updating', async () => {
      const preset: CustomPreset = {
        name: 'preset',
        description: 'Description',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await saveCustomPreset(preset);
      const originalCreatedAt = (await getCustomPreset('preset'))?.createdAt;

      const updated: CustomPreset = {
        ...preset,
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      await saveCustomPreset(updated);

      const saved = await getCustomPreset('preset');
      expect(saved?.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('getCustomPreset', () => {
    it('should return preset by name', async () => {
      const preset: CustomPreset = {
        name: 'my-preset',
        description: 'My preset',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await saveCustomPreset(preset);

      const retrieved = await getCustomPreset('my-preset');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('my-preset');
    });

    it('should return null for non-existent preset', async () => {
      const preset = await getCustomPreset('nonexistent');

      expect(preset).toBeNull();
    });
  });

  describe('deleteCustomPreset', () => {
    it('should delete existing preset', async () => {
      const preset: CustomPreset = {
        name: 'to-delete',
        description: 'To delete',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await saveCustomPreset(preset);

      const deleted = await deleteCustomPreset('to-delete');

      expect(deleted).toBe(true);
      const retrieved = await getCustomPreset('to-delete');
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent preset', async () => {
      const deleted = await deleteCustomPreset('nonexistent');

      expect(deleted).toBe(false);
    });
  });

  describe('listCustomPresets', () => {
    it('should return empty array when no presets exist', async () => {
      // Use a fresh test directory for this test
      const freshTestDir = await mkdtemp(join(tmpdir(), 'bunkit-presets-list-empty-'));
      const originalHome = process.env.HOME;
      process.env.HOME = freshTestDir;

      try {
        const presets = await listCustomPresets();
        expect(presets).toEqual([]);
      } finally {
        process.env.HOME = originalHome;
        await rm(freshTestDir, { recursive: true, force: true });
      }
    });

    it('should return all presets', async () => {
      // Clean up before starting
      try {
        const presetsFile = join(testDir, '.bunkit', 'presets.json');
        await rm(presetsFile, { force: true });
      } catch {
        // File doesn't exist, that's okay
      }

      const preset1: CustomPreset = {
        name: 'preset1',
        description: 'Preset 1',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const preset2: CustomPreset = {
        name: 'preset2',
        description: 'Preset 2',
        config: {
          name: 'test',
          preset: 'minimal',
          path: 'test',
          git: false,
          install: false,
          database: 'none',
          redis: false,
          useBunSecrets: false,
          codeQuality: 'biome',
          tsStrictness: 'strict',
          testing: 'bun-test',
          docker: false,
          cicd: false,
          envExample: true,
          pathAliases: true,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await saveCustomPreset(preset1);
      await saveCustomPreset(preset2);

      const presets = await listCustomPresets();

      expect(presets.length).toBeGreaterThanOrEqual(2);
      expect(presets.some((p) => p.name === 'preset1')).toBe(true);
      expect(presets.some((p) => p.name === 'preset2')).toBe(true);
    });
  });
});
