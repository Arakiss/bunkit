import { execa } from 'execa';
import { logger } from './logger';

/**
 * Install dependencies using bun
 */
export async function installDependencies(
  cwd: string,
  packages?: string[]
): Promise<void> {
  logger.step('Installing dependencies...');

  try {
    if (packages && packages.length > 0) {
      await execa('bun', ['add', ...packages], { cwd, stdio: 'inherit' });
    } else {
      await execa('bun', ['install'], { cwd, stdio: 'inherit' });
    }
    logger.success('Dependencies installed');
  } catch (error) {
    logger.error('Failed to install dependencies');
    throw error;
  }
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
