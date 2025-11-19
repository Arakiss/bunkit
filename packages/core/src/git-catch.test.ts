import { describe, it, expect, mock } from 'bun:test';

// Mock execa to throw error BEFORE importing git module
mock.module('execa', () => ({
  execa: async () => {
    throw new Error('Command failed');
  },
}));

describe('git utilities - catch blocks', () => {
  it('should return false when git command fails (catch block line 10)', async () => {
    const { isGitAvailable } = await import('./git');
    const available = await isGitAvailable();
    expect(available).toBe(false);
  });

  it('should return empty object when git config fails (catch block lines 53-54)', async () => {
    const { getGitUser } = await import('./git');
    const user = await getGitUser();
    expect(user).toEqual({});
  });
});

