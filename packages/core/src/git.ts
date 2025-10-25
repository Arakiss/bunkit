import { execa } from 'execa';

/**
 * Check if git is available
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    await execa('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize git repository
 */
export async function initGit(cwd: string): Promise<void> {
  await execa('git', ['init'], { cwd });
  await execa('git', ['add', '-A'], { cwd });
  await execa(
    'git',
    ['commit', '-m', 'Initial commit from bunkit', '--no-verify'],
    { cwd }
  );
}

/**
 * Check if directory is a git repository
 */
export async function isGitRepository(cwd: string): Promise<boolean> {
  try {
    await execa('git', ['rev-parse', '--git-dir'], { cwd });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get git user configuration
 */
export async function getGitUser(): Promise<{ name?: string; email?: string }> {
  try {
    const { stdout: name } = await execa('git', ['config', 'user.name']);
    const { stdout: email } = await execa('git', ['config', 'user.email']);
    return { name, email };
  } catch {
    return {};
  }
}
