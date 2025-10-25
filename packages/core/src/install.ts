import { execa } from 'execa';
import { join } from 'pathe';
import fs from 'fs-extra';
import { logger } from './logger';

/**
 * Install dependencies using bun
 */
export async function installDependencies(
  cwd: string,
  packages?: string[] | Record<string, string>
): Promise<void> {
  logger.step('Installing dependencies...');

  try {
    // If packages is a Record (catalog references), update package.json first
    if (packages && typeof packages === 'object' && !Array.isArray(packages)) {
      await addDependenciesToPackageJson(cwd, packages);
      await execa('bun', ['install'], { cwd, stdio: 'inherit' });
    }
    // If packages is a string array, use bun add
    else if (packages && Array.isArray(packages) && packages.length > 0) {
      await execa('bun', ['add', ...packages], { cwd, stdio: 'inherit' });
    }
    // No packages specified, just install
    else {
      await execa('bun', ['install'], { cwd, stdio: 'inherit' });
    }
    logger.success('Dependencies installed');
  } catch (error) {
    logger.error('Failed to install dependencies');
    throw error;
  }
}

/**
 * Add dependencies to package.json with catalog references
 */
async function addDependenciesToPackageJson(
  cwd: string,
  dependencies: Record<string, string>
): Promise<void> {
  const packageJsonPath = join(cwd, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Merge dependencies
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...dependencies,
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Add development dependencies
 */
export async function installDevDependencies(
  cwd: string,
  packages: string[]
): Promise<void> {
  if (packages.length === 0) return;

  logger.step('Installing dev dependencies...');

  try {
    await execa('bun', ['add', '-d', ...packages], { cwd, stdio: 'inherit' });
    logger.success('Dev dependencies installed');
  } catch (error) {
    logger.error('Failed to install dev dependencies');
    throw error;
  }
}

/**
 * Check if bun is available
 */
export async function isBunAvailable(): Promise<boolean> {
  try {
    await execa('bun', ['--version']);
    return true;
  } catch {
    return false;
  }
}
