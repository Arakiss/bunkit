import {
  cp,
  mkdir,
  readFile as nodeReadFile,
  writeFile as nodeWriteFile,
  readdir,
  stat,
} from 'node:fs/promises';
import { glob } from 'fast-glob';
import { basename, dirname, resolve } from 'pathe';
import type { FileOperationResult } from './types';

/**
 * Check if a directory exists
 */
export async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

/**
 * Copy file or directory recursively
 */
export async function copyPath(source: string, destination: string): Promise<void> {
  await cp(source, destination, {
    recursive: true,
    force: false,
    errorOnExist: false,
  });
}

/**
 * Write file with content, creating directories if needed
 */
export async function writeFile(path: string, content: string): Promise<FileOperationResult> {
  try {
    await ensureDirectory(dirname(path));
    await nodeWriteFile(path, content, 'utf-8');
    return { path, success: true };
  } catch (error) {
    return {
      path,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Read file content
 */
export async function readFile(path: string): Promise<string> {
  return nodeReadFile(path, 'utf-8');
}

/**
 * Find files matching patterns
 */
export async function findFiles(
  patterns: string | string[],
  options?: { cwd?: string; ignore?: string[] }
): Promise<string[]> {
  return glob(patterns, {
    cwd: options?.cwd || process.cwd(),
    ignore: options?.ignore || ['**/node_modules/**', '**/.git/**'],
    dot: true,
  });
}

/**
 * Get project name from path
 */
export function getProjectName(path: string): string {
  return basename(resolve(path));
}

/**
 * Create package name from project name
 */
export function createPackageName(name: string, scope?: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '');

  return scope ? `@${scope}/${sanitized}` : sanitized;
}

/**
 * Check if directory is empty
 */
export async function isDirectoryEmpty(path: string): Promise<boolean> {
  if (!(await directoryExists(path))) {
    return true;
  }

  const files = await readdir(path);
  return files.length === 0;
}
