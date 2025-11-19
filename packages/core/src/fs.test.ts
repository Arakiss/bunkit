import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, rm, writeFile as fsWriteFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join, resolve } from 'pathe';
import {
  directoryExists,
  fileExists,
  ensureDirectory,
  isDirectoryEmpty,
  createPackageName,
  copyPath,
  writeFile,
  readFile,
  findFiles,
  getProjectName,
} from './fs';

describe('fs utilities', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'bunkit-fs-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('directoryExists', () => {
    it('should return true for existing directory', async () => {
      expect(await directoryExists(testDir)).toBe(true);
    });

    it('should return false for non-existent directory', async () => {
      expect(await directoryExists(join(testDir, 'nonexistent'))).toBe(false);
    });

    it('should return false for files', async () => {
      const filePath = join(testDir, 'file.txt');
      await writeFile(filePath, 'content');
      expect(await directoryExists(filePath)).toBe(false);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = join(testDir, 'test.txt');
      await writeFile(filePath, 'content');
      expect(await fileExists(filePath)).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      expect(await fileExists(join(testDir, 'nonexistent.txt'))).toBe(false);
    });

    it('should return false for directories', async () => {
      expect(await fileExists(testDir)).toBe(false);
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', async () => {
      const dirPath = join(testDir, 'new-dir');
      await ensureDirectory(dirPath);
      expect(await directoryExists(dirPath)).toBe(true);
    });

    it('should not fail if directory already exists', async () => {
      const dirPath = join(testDir, 'existing-dir');
      await ensureDirectory(dirPath);
      await ensureDirectory(dirPath); // Call again
      expect(await directoryExists(dirPath)).toBe(true);
    });

    it('should create nested directories', async () => {
      const nestedPath = join(testDir, 'level1', 'level2', 'level3');
      await ensureDirectory(nestedPath);
      expect(await directoryExists(nestedPath)).toBe(true);
    });
  });

  describe('isDirectoryEmpty', () => {
    it('should return true for empty directory', async () => {
      const emptyDir = join(testDir, 'empty');
      await ensureDirectory(emptyDir);
      expect(await isDirectoryEmpty(emptyDir)).toBe(true);
    });

    it('should return false for directory with files', async () => {
      await writeFile(join(testDir, 'file.txt'), 'content');
      expect(await isDirectoryEmpty(testDir)).toBe(false);
    });

    it('should return true for non-existent directory', async () => {
      expect(await isDirectoryEmpty(join(testDir, 'nonexistent'))).toBe(true);
    });
  });

  describe('createPackageName', () => {
    it('should convert project name to valid package name', () => {
      expect(createPackageName('my-project')).toBe('my-project');
      expect(createPackageName('My Project')).toBe('my-project');
      expect(createPackageName('my_awesome_project')).toBe('my-awesome-project');
    });

    it('should handle special characters', () => {
      expect(createPackageName('my.project')).toBe('my-project');
      expect(createPackageName('my@project')).toBe('my-project');
    });

    it('should handle scoped packages when scope is provided', () => {
      expect(createPackageName('package', 'scope')).toBe('@scope/package');
      expect(createPackageName('my-package', 'scope')).toBe('@scope/my-package');
    });

    it('should sanitize scoped package names', () => {
      // Note: createPackageName sanitizes the name, so @ gets removed
      expect(createPackageName('@scope/package')).toBe('scope-package');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(createPackageName('-my-project-')).toBe('my-project');
      expect(createPackageName('--my-project--')).toBe('my-project');
    });

    it('should handle empty strings', () => {
      expect(createPackageName('')).toBe('');
    });
  });

  describe('copyPath', () => {
    it('should copy a file to destination', async () => {
      const sourceFile = join(testDir, 'source.txt');
      const destFile = join(testDir, 'dest.txt');
      await fsWriteFile(sourceFile, 'file content');

      await copyPath(sourceFile, destFile);

      expect(await fileExists(destFile)).toBe(true);
      const content = await Bun.file(destFile).text();
      expect(content).toBe('file content');
    });

    it('should copy a directory recursively', async () => {
      const sourceDir = join(testDir, 'source');
      const destDir = join(testDir, 'dest');
      await mkdir(sourceDir, { recursive: true });
      await fsWriteFile(join(sourceDir, 'file1.txt'), 'content1');
      await mkdir(join(sourceDir, 'subdir'), { recursive: true });
      await fsWriteFile(join(sourceDir, 'subdir', 'file2.txt'), 'content2');

      await copyPath(sourceDir, destDir);

      expect(await directoryExists(destDir)).toBe(true);
      expect(await fileExists(join(destDir, 'file1.txt'))).toBe(true);
      expect(await fileExists(join(destDir, 'subdir', 'file2.txt'))).toBe(true);
    });

    it('should not overwrite existing files by default', async () => {
      const sourceFile = join(testDir, 'source.txt');
      const destFile = join(testDir, 'dest.txt');
      await fsWriteFile(sourceFile, 'new content');
      await fsWriteFile(destFile, 'existing content');

      await copyPath(sourceFile, destFile);

      // Should not overwrite, so original content should remain
      const content = await Bun.file(destFile).text();
      expect(content).toBe('existing content');
    });
  });

  describe('writeFile', () => {
    it('should write file content successfully', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'test content';

      const result = await writeFile(filePath, content);

      expect(result.success).toBe(true);
      expect(result.path).toBe(filePath);
      expect(await fileExists(filePath)).toBe(true);
      const writtenContent = await Bun.file(filePath).text();
      expect(writtenContent).toBe(content);
    });

    it('should create parent directories if they do not exist', async () => {
      const filePath = join(testDir, 'nested', 'deep', 'file.txt');
      const content = 'content';

      const result = await writeFile(filePath, content);

      expect(result.success).toBe(true);
      expect(await fileExists(filePath)).toBe(true);
    });

    it('should handle empty content', async () => {
      const filePath = join(testDir, 'empty.txt');
      const result = await writeFile(filePath, '');

      expect(result.success).toBe(true);
      const content = await Bun.file(filePath).text();
      expect(content).toBe('');
    });

    it('should handle special characters in content', async () => {
      const filePath = join(testDir, 'special.txt');
      const content = 'Line 1\nLine 2\tTabbed\nUnicode: 🚀';

      const result = await writeFile(filePath, content);

      expect(result.success).toBe(true);
      const writtenContent = await Bun.file(filePath).text();
      expect(writtenContent).toBe(content);
    });

    it('should return error result on failure', async () => {
      // Try to write to a path that would require root permissions (on Unix)
      // Or use an invalid path
      const invalidPath = '/root/invalid/path/file.txt';

      const result = await writeFile(invalidPath, 'content');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const filePath = join(testDir, 'read.txt');
      const content = 'file content';
      await fsWriteFile(filePath, content);

      const result = await readFile(filePath);

      expect(result).toBe(content);
    });

    it('should read empty file', async () => {
      const filePath = join(testDir, 'empty.txt');
      await fsWriteFile(filePath, '');

      const result = await readFile(filePath);

      expect(result).toBe('');
    });

    it('should read file with special characters', async () => {
      const filePath = join(testDir, 'special.txt');
      const content = 'Line 1\nLine 2\tTabbed\nUnicode: 🚀';
      await fsWriteFile(filePath, content);

      const result = await readFile(filePath);

      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', async () => {
      const filePath = join(testDir, 'nonexistent.txt');

      await expect(readFile(filePath)).rejects.toThrow();
    });
  });

  describe('findFiles', () => {
    beforeEach(async () => {
      // Create test file structure
      await mkdir(join(testDir, 'src'), { recursive: true });
      await mkdir(join(testDir, 'src', 'components'), { recursive: true });
      await mkdir(join(testDir, 'node_modules', 'dep'), { recursive: true });
      await fsWriteFile(join(testDir, 'src', 'index.ts'), 'content');
      await fsWriteFile(join(testDir, 'src', 'utils.ts'), 'content');
      await fsWriteFile(join(testDir, 'src', 'components', 'Button.tsx'), 'content');
      await fsWriteFile(join(testDir, 'package.json'), '{}');
      await fsWriteFile(join(testDir, 'node_modules', 'dep', 'index.js'), 'content');
    });

    it('should find files matching pattern', async () => {
      const files = await findFiles('**/*.ts', { cwd: testDir });

      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.includes('index.ts'))).toBe(true);
      expect(files.some(f => f.includes('utils.ts'))).toBe(true);
    });

    it('should ignore node_modules by default', async () => {
      const files = await findFiles('**/*.js', { cwd: testDir });

      expect(files.some(f => f.includes('node_modules'))).toBe(false);
    });

    it('should respect custom ignore patterns', async () => {
      const files = await findFiles('**/*.ts', {
        cwd: testDir,
        ignore: ['**/src/**'],
      });

      expect(files.some(f => f.includes('src'))).toBe(false);
    });

    it('should find files with multiple patterns', async () => {
      const files = await findFiles(['**/*.ts', '**/*.tsx'], { cwd: testDir });

      expect(files.some(f => f.includes('index.ts'))).toBe(true);
      expect(files.some(f => f.includes('Button.tsx'))).toBe(true);
    });

    it('should find dotfiles when dot option is enabled', async () => {
      await fsWriteFile(join(testDir, '.env'), 'content');
      const files = await findFiles('**/.env', { cwd: testDir });

      expect(files.length).toBeGreaterThan(0);
    });

    it('should return empty array when no files match', async () => {
      const files = await findFiles('**/*.nonexistent', { cwd: testDir });

      expect(files).toEqual([]);
    });
  });

  describe('getProjectName', () => {
    it('should extract project name from absolute path', () => {
      const path = '/home/user/projects/my-project';
      expect(getProjectName(path)).toBe('my-project');
    });

    it('should extract project name from relative path', () => {
      const path = './my-project';
      const name = getProjectName(path);
      expect(name).toBeTruthy();
    });

    it('should handle nested paths', () => {
      const path = '/home/user/projects/nested/deep/my-project';
      expect(getProjectName(path)).toBe('my-project');
    });

    it('should handle path with trailing slash', () => {
      const path = '/home/user/projects/my-project/';
      expect(getProjectName(path)).toBe('my-project');
    });

    it('should handle current directory', () => {
      const name = getProjectName('.');
      expect(name).toBeTruthy();
    });
  });
});

