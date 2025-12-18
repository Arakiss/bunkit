import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { logger } from './logger';

describe('logger', () => {
  let originalDebug: string | undefined;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let logCalls: unknown[][] = [];
  let errorCalls: unknown[][] = [];

  beforeEach(() => {
    originalDebug = process.env.DEBUG;
    originalConsoleLog = console.log;
    originalConsoleError = console.error;

    logCalls = [];
    errorCalls = [];

    console.log = mock((...args: unknown[]) => {
      logCalls.push(args);
    });
    console.error = mock((...args: unknown[]) => {
      errorCalls.push(args);
    });
  });

  afterEach(() => {
    if (originalDebug) {
      process.env.DEBUG = originalDebug;
    } else {
      delete process.env.DEBUG;
    }
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Test info message');
      expect(logCalls.length).toBeGreaterThan(0);
    });
  });

  describe('success', () => {
    it('should log success message', () => {
      logger.success('Test success message');
      expect(logCalls.length).toBeGreaterThan(0);
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Test warning message');
      expect(logCalls.length).toBeGreaterThan(0);
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Test error message');
      expect(errorCalls.length).toBeGreaterThan(0);
    });
  });

  describe('step', () => {
    it('should log step message', () => {
      logger.step('Test step message');
      expect(logCalls.length).toBeGreaterThan(0);
    });
  });

  describe('debug', () => {
    it('should log debug message when DEBUG is set', () => {
      process.env.DEBUG = 'true';
      logger.debug('Test debug message');
      expect(logCalls.length).toBeGreaterThan(0);
    });

    it('should not log debug message when DEBUG is not set', () => {
      delete process.env.DEBUG;
      const beforeCalls = logCalls.length;
      logger.debug('Test debug message');
      expect(logCalls.length).toBe(beforeCalls);
    });
  });

  describe('dim', () => {
    it('should log dimmed message', () => {
      logger.dim('Test dim message');
      expect(logCalls.length).toBeGreaterThan(0);
    });
  });

  describe('br', () => {
    it('should log a blank line', () => {
      logger.br();
      expect(logCalls.length).toBeGreaterThan(0);
    });
  });
});
