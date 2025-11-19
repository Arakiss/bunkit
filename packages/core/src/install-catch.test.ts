import { describe, it, expect, mock } from 'bun:test';

// Mock execa to throw error BEFORE importing install module
mock.module('execa', () => ({
  execa: async () => {
    throw new Error('Command failed');
  },
}));

describe('install utilities - catch blocks', () => {
  it('should return false when bun command fails (catch block lines 82-83)', async () => {
    const { isBunAvailable } = await import('./install');
    const available = await isBunAvailable();
    expect(available).toBe(false);
  });
});

