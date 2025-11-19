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
 * Initialize git repository with main branch as default
 */
export async function initGit(cwd: string): Promise<void> {
  // Initialize git repository with main as default branch
  await execa('git', ['init', '--initial-branch=main'], { cwd });
  await execa('git', ['add', '-A'], { cwd });
  try {
    await execa(
      'git',
      ['commit', '-m', 'Initial commit from bunkit', '--no-verify'],
      { cwd }
    );
  } catch {
    // If there are no files to commit, that's okay
    // The repository is still initialized
  }
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
