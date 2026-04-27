import { describe, expect, it } from 'vitest';
import { COUNTRY_CONFIGS } from '../config/countries';
import { runCountQuantityTests, runMatcherTests, runStorageTests, runUnitQuantityTests } from './debugTests';

describe('debug checks', () => {
  it('all matcher checks pass', () => {
    expect(runMatcherTests(COUNTRY_CONFIGS.uk).every((test) => test.passed)).toBe(true);
  });

  it('all count quantity checks pass', () => {
    expect(runCountQuantityTests().every((test) => test.passed)).toBe(true);
  });

  it('all unit quantity checks pass', () => {
    expect(runUnitQuantityTests().every((test) => test.passed)).toBe(true);
  });

  it('storage checks pass', () => {
    expect(runStorageTests().every((test) => test.passed)).toBe(true);
  });
});
