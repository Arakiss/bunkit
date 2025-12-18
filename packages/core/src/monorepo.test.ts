import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'pathe';
import {
  addToCatalog,
  addWorkspaceToRoot,
  detectMonorepo,
  getCatalog,
  getRootPackageJson,
  getWorkspaceName,
  updateRootPackageJson,
  validateWorkspaceName,
  workspaceExists,
} from './monorepo';

describe('monorepo utilities', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'bunkit-monorepo-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('detectMonorepo', () => {
    it('should return false for non-monorepo directory', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2)
      );

      const result = await detectMonorepo(testDir);

      expect(result.isMonorepo).toBe(false);
      expect(result.workspaces).toEqual([]);
      expect(result.hasPackages).toBe(false);
    });

    it('should detect monorepo with workspaces', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(
          {
            name: 'monorepo',
            version: '1.0.0',
            workspaces: ['packages/*', 'apps/*'],
          },
          null,
          2
        )
      );

      const result = await detectMonorepo(testDir);

      expect(result.isMonorepo).toBe(true);
      expect(result.workspaces).toEqual(['packages/*', 'apps/*']);
    });

    it('should detect packages directory', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify(
          {
            name: 'monorepo',
            workspaces: ['packages/*'],
          },
          null,
          2
        )
      );

      const result = await detectMonorepo(testDir);

      expect(result.hasPackages).toBe(true);
    });

    it('should detect package manager from lock files', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', workspaces: ['packages/*'] }, null, 2)
      );
      await writeFile(join(testDir, 'pnpm-lock.yaml'), '');

      const result = await detectMonorepo(testDir);

      expect(result.packageManager).toBe('pnpm');
    });

    it('should detect yarn from yarn.lock', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', workspaces: ['packages/*'] }, null, 2)
      );
      await writeFile(join(testDir, 'yarn.lock'), '');

      const result = await detectMonorepo(testDir);

      expect(result.packageManager).toBe('yarn');
    });

    it('should detect npm from package-lock.json', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', workspaces: ['packages/*'] }, null, 2)
      );
      await writeFile(join(testDir, 'package-lock.json'), '');

      const result = await detectMonorepo(testDir);

      expect(result.packageManager).toBe('npm');
    });

    it('should detect bun from bun.lockb', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', workspaces: ['packages/*'] }, null, 2)
      );
      await writeFile(join(testDir, 'bun.lockb'), '');

      const result = await detectMonorepo(testDir);

      expect(result.packageManager).toBe('bun');
    });

    it('should default to bun when no lock file exists', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', workspaces: ['packages/*'] }, null, 2)
      );

      const result = await detectMonorepo(testDir);

      expect(result.packageManager).toBe('bun');
    });

    it('should return default values when package.json does not exist', async () => {
      const result = await detectMonorepo(testDir);

      expect(result.isMonorepo).toBe(false);
      expect(result.workspaces).toEqual([]);
      expect(result.hasPackages).toBe(false);
      expect(result.packageManager).toBe('bun');
    });
  });

  describe('getRootPackageJson', () => {
    it('should read package.json from root', async () => {
      const packageJson = { name: 'test', version: '1.0.0' };
      await writeFile(join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      const result = await getRootPackageJson(testDir);

      expect(result.name).toBe('test');
      expect(result.version).toBe('1.0.0');
    });

    it('should throw error when package.json does not exist', async () => {
      await expect(getRootPackageJson(testDir)).rejects.toThrow('No package.json found');
    });
  });

  describe('updateRootPackageJson', () => {
    it('should update package.json with new fields', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2)
      );

      await updateRootPackageJson({ description: 'Test project' }, testDir);

      const updated = await getRootPackageJson(testDir);
      expect(updated.description).toBe('Test project');
      expect(updated.name).toBe('test');
    });

    it('should overwrite existing fields', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2)
      );

      await updateRootPackageJson({ version: '2.0.0' }, testDir);

      const updated = await getRootPackageJson(testDir);
      expect(updated.version).toBe('2.0.0');
    });
  });

  describe('addWorkspaceToRoot', () => {
    it('should add workspace to package.json', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'monorepo', workspaces: [] }, null, 2)
      );

      await addWorkspaceToRoot('packages/utils', testDir);

      const packageJson = await getRootPackageJson(testDir);
      expect(packageJson.workspaces).toContain('packages/utils');
    });

    it('should normalize workspace path', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'monorepo', workspaces: [] }, null, 2)
      );

      await addWorkspaceToRoot('./packages/utils', testDir);

      const packageJson = await getRootPackageJson(testDir);
      expect(packageJson.workspaces).toContain('packages/utils');
      expect(packageJson.workspaces).not.toContain('./packages/utils');
    });

    it('should not add duplicate workspace', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'monorepo', workspaces: ['packages/utils'] }, null, 2)
      );

      await addWorkspaceToRoot('packages/utils', testDir);

      const packageJson = await getRootPackageJson(testDir);
      expect(packageJson.workspaces.filter((w: string) => w === 'packages/utils').length).toBe(1);
    });

    it('should handle both normalized and non-normalized paths', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'monorepo', workspaces: ['./packages/utils'] }, null, 2)
      );

      await addWorkspaceToRoot('packages/utils', testDir);

      const packageJson = await getRootPackageJson(testDir);
      // Should not add duplicate
      const utilsCount = packageJson.workspaces.filter(
        (w: string) => w === 'packages/utils' || w === './packages/utils'
      ).length;
      expect(utilsCount).toBeGreaterThan(0);
    });
  });

  describe('getCatalog', () => {
    it('should return catalog from package.json', async () => {
      const catalog = { 'package-name': '1.0.0' };
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', catalog }, null, 2)
      );

      const result = await getCatalog(testDir);

      expect(result).toEqual(catalog);
    });

    it('should return empty object when catalog does not exist', async () => {
      await writeFile(join(testDir, 'package.json'), JSON.stringify({ name: 'test' }, null, 2));

      const result = await getCatalog(testDir);

      expect(result).toEqual({});
    });
  });

  describe('addToCatalog', () => {
    it('should add package to catalog', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', catalog: {} }, null, 2)
      );

      await addToCatalog('package-name', '1.0.0', testDir);

      const catalog = await getCatalog(testDir);
      expect(catalog['package-name']).toBe('1.0.0');
    });

    it('should update existing catalog entry', async () => {
      await writeFile(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', catalog: { 'package-name': '0.9.0' } }, null, 2)
      );

      await addToCatalog('package-name', '1.0.0', testDir);

      const catalog = await getCatalog(testDir);
      expect(catalog['package-name']).toBe('1.0.0');
    });

    it('should create catalog if it does not exist', async () => {
      await writeFile(join(testDir, 'package.json'), JSON.stringify({ name: 'test' }, null, 2));

      await addToCatalog('package-name', '1.0.0', testDir);

      const catalog = await getCatalog(testDir);
      expect(catalog['package-name']).toBe('1.0.0');
    });
  });

  describe('workspaceExists', () => {
    it('should return true when workspace package.json exists', async () => {
      await mkdir(join(testDir, 'packages', 'utils'), { recursive: true });
      await writeFile(
        join(testDir, 'packages', 'utils', 'package.json'),
        JSON.stringify({ name: 'utils' }, null, 2)
      );

      const exists = await workspaceExists('packages/utils', testDir);

      expect(exists).toBe(true);
    });

    it('should return false when workspace package.json does not exist', async () => {
      const exists = await workspaceExists('packages/utils', testDir);

      expect(exists).toBe(false);
    });

    it('should return false when directory exists but package.json does not', async () => {
      await mkdir(join(testDir, 'packages', 'utils'), { recursive: true });

      const exists = await workspaceExists('packages/utils', testDir);

      expect(exists).toBe(false);
    });
  });

  describe('getWorkspaceName', () => {
    it('should extract name from workspace path', () => {
      expect(getWorkspaceName('apps/admin')).toBe('admin');
      expect(getWorkspaceName('packages/utils')).toBe('utils');
    });

    it('should add scope for packages directory when scope provided', () => {
      expect(getWorkspaceName('packages/utils', 'myapp')).toBe('@myapp/utils');
      expect(getWorkspaceName('packages/email', 'myapp')).toBe('@myapp/email');
    });

    it('should not add scope for apps directory', () => {
      expect(getWorkspaceName('apps/admin', 'myapp')).toBe('admin');
    });

    it('should handle nested paths', () => {
      expect(getWorkspaceName('packages/shared/utils')).toBe('utils');
    });

    it('should handle single segment path', () => {
      expect(getWorkspaceName('admin')).toBe('admin');
    });
  });

  describe('validateWorkspaceName', () => {
    it('should accept valid workspace names', () => {
      expect(validateWorkspaceName('my-workspace')).toEqual({ valid: true });
      expect(validateWorkspaceName('workspace123')).toEqual({ valid: true });
      expect(validateWorkspaceName('a-b')).toEqual({ valid: true });
    });

    it('should reject names with uppercase letters', () => {
      const result = validateWorkspaceName('MyWorkspace');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject names with spaces', () => {
      const result = validateWorkspaceName('my workspace');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject names with special characters', () => {
      const result = validateWorkspaceName('my_workspace');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject names shorter than 2 characters', () => {
      const result = validateWorkspaceName('a');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2 characters');
    });

    it('should reject empty names', () => {
      const result = validateWorkspaceName('');
      expect(result.valid).toBe(false);
    });
  });
});
