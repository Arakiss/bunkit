import { join } from 'pathe';
import { fileExists, readFile, writeFile } from './fs';

/**
 * Workspace preset types
 */
export type WorkspacePreset = 'nextjs' | 'hono' | 'library';

/**
 * Package type for shared packages
 */
export type PackageType = 'library' | 'utils' | 'types' | 'config';

/**
 * Monorepo detection result
 */
export interface MonorepoInfo {
  isMonorepo: boolean;
  rootPath: string;
  workspaces: string[];
  hasPackages: boolean;
  packageManager: 'bun' | 'npm' | 'pnpm' | 'yarn';
}

/**
 * Detect if current directory is a monorepo
 */
export async function detectMonorepo(cwd: string = process.cwd()): Promise<MonorepoInfo> {
  const packageJsonPath = join(cwd, 'package.json');

  if (!(await fileExists(packageJsonPath))) {
    return {
      isMonorepo: false,
      rootPath: cwd,
      workspaces: [],
      hasPackages: false,
      packageManager: 'bun',
    };
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath));
  const workspaces = packageJson.workspaces || [];
  const isMonorepo = workspaces.length > 0;

  // Detect package manager
  let packageManager: 'bun' | 'npm' | 'pnpm' | 'yarn' = 'bun';
  if (await fileExists(join(cwd, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (await fileExists(join(cwd, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (await fileExists(join(cwd, 'package-lock.json'))) {
    packageManager = 'npm';
  } else if (await fileExists(join(cwd, 'bun.lockb'))) {
    packageManager = 'bun';
  }

  return {
    isMonorepo,
    rootPath: cwd,
    workspaces,
    hasPackages: workspaces.some((w: string) => w.includes('packages')),
    packageManager,
  };
}

/**
 * Get package.json from root
 */
export async function getRootPackageJson(cwd: string = process.cwd()): Promise<any> {
  const packageJsonPath = join(cwd, 'package.json');

  if (!(await fileExists(packageJsonPath))) {
    throw new Error('No package.json found in root directory');
  }

  return JSON.parse(await readFile(packageJsonPath));
}

/**
 * Update root package.json
 */
export async function updateRootPackageJson(
  updates: any,
  cwd: string = process.cwd()
): Promise<void> {
  const packageJsonPath = join(cwd, 'package.json');
  const packageJson = await getRootPackageJson(cwd);

  const updated = {
    ...packageJson,
    ...updates,
  };

  await writeFile(packageJsonPath, JSON.stringify(updated, null, 2) + '\n');
}

/**
 * Add workspace to root package.json
 */
export async function addWorkspaceToRoot(
  workspacePath: string,
  cwd: string = process.cwd()
): Promise<void> {
  const packageJson = await getRootPackageJson(cwd);
  const workspaces = packageJson.workspaces || [];

  // Normalize workspace path (remove leading ./)
  const normalizedPath = workspacePath.replace(/^\.\//, '');

  // Check if already exists
  if (workspaces.includes(normalizedPath) || workspaces.includes(`./${normalizedPath}`)) {
    return;
  }

  // Add to workspaces
  workspaces.push(normalizedPath);

  await updateRootPackageJson({ workspaces }, cwd);
}

/**
 * Get catalog from root package.json
 */
export async function getCatalog(cwd: string = process.cwd()): Promise<Record<string, string>> {
  const packageJson = await getRootPackageJson(cwd);
  return packageJson.catalog || {};
}

/**
 * Add dependency to catalog
 */
export async function addToCatalog(
  packageName: string,
  version: string,
  cwd: string = process.cwd()
): Promise<void> {
  const packageJson = await getRootPackageJson(cwd);
  const catalog = packageJson.catalog || {};

  catalog[packageName] = version;

  await updateRootPackageJson({ catalog }, cwd);
}

/**
 * Check if workspace exists
 */
export async function workspaceExists(
  workspacePath: string,
  cwd: string = process.cwd()
): Promise<boolean> {
  const fullPath = join(cwd, workspacePath);
  return fileExists(join(fullPath, 'package.json'));
}

/**
 * Get workspace name from path
 * apps/admin -> admin
 * packages/email -> @myapp/email (needs scope)
 */
export function getWorkspaceName(workspacePath: string, scope?: string): string {
  const parts = workspacePath.split('/');
  const name = parts[parts.length - 1];

  // If it's a package, add scope
  if (scope && workspacePath.startsWith('packages/')) {
    return `@${scope}/${name}`;
  }

  return name;
}

/**
 * Validate workspace name
 */
export function validateWorkspaceName(name: string): { valid: boolean; error?: string } {
  // Must be lowercase and can contain letters, numbers, hyphens
  const regex = /^[a-z0-9-]+$/;

  if (!regex.test(name)) {
    return {
      valid: false,
      error: 'Workspace name must be lowercase and contain only letters, numbers, and hyphens',
    };
  }

  if (name.length < 2) {
    return {
      valid: false,
      error: 'Workspace name must be at least 2 characters long',
    };
  }

  return { valid: true };
}
