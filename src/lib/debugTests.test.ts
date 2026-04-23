import { describe, expect, it } from 'vitest';
import { COUNTRY_CONFIGS } from '../config/countries';
import { runMatcherTests, runQuantityTests, runStorageTests } from './debugTests';

describe('debug checks', () => {
  it('all matcher checks pass', () => {
    expect(runMatcherTests(COUNTRY_CONFIGS.uk).every((test) => test.passed)).toBe(true);
  });

  it('all quantity checks pass', () => {
    expect(runQuantityTests().every((test) => test.passed)).toBe(true);
  });

  it('storage checks pass', () => {
    expect(runStorageTests().every((test) => test.passed)).toBe(true);
  });
});
