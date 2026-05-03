import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTRY_CONFIGS } from '../config/countries';
import { createWindowMock } from '../test/testUtils';
import {
  runCountQuantityTests,
  runConfigTests,
  runMatcherTests,
  runMeasurementTests,
  runStateTests,
  runStorageTests,
  runUnitQuantityTests,
  runVariantTests,
} from './debugTests';
import { parseItems } from './parser';
import { STORAGE_KEY } from './repository/localStorageRepository';
import { THEME_STORAGE_KEY } from './themePreference';
import { createUuidV7 } from './uuid';

describe('debug checks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('all config checks pass', () => {
    const failures = Object.entries(COUNTRY_CONFIGS).flatMap(([code, config]) =>
      runConfigTests(config)
        .filter((test) => !test.passed)
        .map((test) => `${code}: ${test.title} (${test.actual})`),
    );

    expect(failures).toEqual([]);
  });

  it('all matcher checks pass', () => {
    expect(runMatcherTests(COUNTRY_CONFIGS.uk).every((test) => test.passed)).toBe(true);
  });

  it('all count quantity checks pass', () => {
    expect(runCountQuantityTests().every((test) => test.passed)).toBe(true);
  });

  it('all unit quantity checks pass', () => {
    expect(runUnitQuantityTests().every((test) => test.passed)).toBe(true);
  });

  it('all measurement checks pass', () => {
    expect(runMeasurementTests().every((test) => test.passed)).toBe(true);
  });

  it('all variant checks pass', () => {
    expect(runVariantTests(COUNTRY_CONFIGS.uk).every((test) => test.passed)).toBe(true);
  });

  it('storage checks pass', () => {
    expect(runStorageTests().every((test) => test.passed)).toBe(true);
  });

  it('storage checks exercise and restore browser local storage', () => {
    const windowMock = createWindowMock({
      storageSeed: {
        [THEME_STORAGE_KEY]: 'light',
        [STORAGE_KEY]: 'previous-record',
      },
    });
    vi.stubGlobal('window', windowMock);

    const results = runStorageTests();

    expect(results.map((test) => test.title)).toEqual([
      'Storage codec round-trip',
      'UUIDv7 list identity',
      'Theme preference round-trip',
      'Local storage round-trip',
    ]);
    expect(results.every((test) => test.passed)).toBe(true);
    expect(windowMock.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(windowMock.localStorage.getItem(STORAGE_KEY)).toBe('previous-record');
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

  it('state checks report malformed state without throwing', () => {
    const input = 'milk';
    const [item] = parseItems(input, COUNTRY_CONFIGS.uk);
    const malformedItems = [
      {
        ...item,
        id: '',
        checked: true,
        matchedSection: 'produce' as const,
        variant: 'ghost',
      },
    ];

    const results = runStateTests({
      input,
      items: malformedItems,
      config: COUNTRY_CONFIGS.uk,
      countryCode: 'fr',
      activeListId: '',
      isServerBackedList: false,
      checkedTotal: 2,
    });

    expect(results.filter((test) => !test.passed).map((test) => test.title)).toEqual([
      'Parser state parity',
      'Required item metadata',
      'Section assignments',
      'Progress counters',
      'Country profile',
      'List identity',
    ]);
  });
});
