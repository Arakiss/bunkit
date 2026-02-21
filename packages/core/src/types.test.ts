import { describe, expect, it } from 'bun:test';
import { inferShadcnBase, isModernShadcnStyle } from './types';

describe('inferShadcnBase', () => {
  it('should return "base-ui" for Base UI styles', () => {
    expect(inferShadcnBase('base-maia')).toBe('base-ui');
    expect(inferShadcnBase('base-vega')).toBe('base-ui');
    expect(inferShadcnBase('base-nova')).toBe('base-ui');
    expect(inferShadcnBase('base-lyra')).toBe('base-ui');
    expect(inferShadcnBase('base-mira')).toBe('base-ui');
  });

  it('should return "radix" for Radix styles', () => {
    expect(inferShadcnBase('radix-maia')).toBe('radix');
    expect(inferShadcnBase('radix-vega')).toBe('radix');
    expect(inferShadcnBase('radix-nova')).toBe('radix');
    expect(inferShadcnBase('radix-lyra')).toBe('radix');
    expect(inferShadcnBase('radix-mira')).toBe('radix');
  });

  it('should return "radix" for legacy styles', () => {
    expect(inferShadcnBase('new-york')).toBe('radix');
    expect(inferShadcnBase('default')).toBe('radix');
  });

  it('should return "radix" for undefined', () => {
    expect(inferShadcnBase(undefined)).toBe('radix');
  });
});

describe('isModernShadcnStyle', () => {
  it('should return true for Radix modern styles', () => {
    expect(isModernShadcnStyle('radix-maia')).toBe(true);
    expect(isModernShadcnStyle('radix-vega')).toBe(true);
    expect(isModernShadcnStyle('radix-nova')).toBe(true);
    expect(isModernShadcnStyle('radix-lyra')).toBe(true);
    expect(isModernShadcnStyle('radix-mira')).toBe(true);
  });

  it('should return true for Base UI modern styles', () => {
    expect(isModernShadcnStyle('base-maia')).toBe(true);
    expect(isModernShadcnStyle('base-vega')).toBe(true);
    expect(isModernShadcnStyle('base-nova')).toBe(true);
    expect(isModernShadcnStyle('base-lyra')).toBe(true);
    expect(isModernShadcnStyle('base-mira')).toBe(true);
  });

  it('should return false for legacy styles', () => {
    expect(isModernShadcnStyle('new-york')).toBe(false);
    expect(isModernShadcnStyle('default')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isModernShadcnStyle(undefined)).toBe(false);
  });
});
