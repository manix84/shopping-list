import { describe, expect, it } from 'vitest';
import { COUNTRY_CONFIGS } from '../config/countries';
import {
  runCountQuantityTests,
  runMatcherTests,
  runStateTests,
  runStorageTests,
  runUnitQuantityTests,
  runVariantTests,
} from './debugTests';
import { parseItems } from './parser';
import { createUuidV7 } from './uuid';

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

  it('all variant checks pass', () => {
    expect(runVariantTests(COUNTRY_CONFIGS.uk).every((test) => test.passed)).toBe(true);
  });

  it('storage checks pass', () => {
    expect(runStorageTests().every((test) => test.passed)).toBe(true);
  });

  it('state checks pass for a live parsed list', () => {
    const input = 'strawberry ice-cream\nbananas x2';
    const items = parseItems(input, COUNTRY_CONFIGS.uk).map((item, index) => ({ ...item, checked: index === 0 }));

    expect(
      runStateTests({
        input,
        items,
        config: COUNTRY_CONFIGS.uk,
        countryCode: 'uk',
        activeListId: createUuidV7(),
        isServerBackedList: true,
        checkedTotal: 1,
      }).every((test) => test.passed),
    ).toBe(true);
  });
});
