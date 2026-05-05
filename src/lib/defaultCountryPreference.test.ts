import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  DEFAULT_COUNTRY_STORAGE_KEY,
  defaultCountryCode,
  inferDefaultCountryCode,
  loadDefaultCountryPreference,
  saveDefaultCountryPreference,
} from './defaultCountryPreference';

describe('default country preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('infers the country from browser language preferences', () => {
    const windowMock = createWindowMock({ language: 'en-GB', languages: ['en-CA', 'en-US'] });
    vi.stubGlobal('navigator', windowMock.navigator);

    expect(inferDefaultCountryCode()).toBe('ca');
  });

  it('falls back to timezone when browser language has no supported region', () => {
    const windowMock = createWindowMock({ language: 'en' });
    vi.stubGlobal('navigator', windowMock.navigator);
    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'Europe/Rome' }),
      }),
    });

    expect(inferDefaultCountryCode()).toBe('it');
  });

  it('loads and saves a user preference', () => {
    const windowMock = createWindowMock({ language: 'en-US' });
    vi.stubGlobal('window', windowMock);

    expect(loadDefaultCountryPreference()).toBeUndefined();

    saveDefaultCountryPreference('nl');

    expect(windowMock.localStorage.getItem(DEFAULT_COUNTRY_STORAGE_KEY)).toBe('nl');
    expect(loadDefaultCountryPreference()).toBe('nl');
  });

  it('uses a saved preference before detected defaults', () => {
    const windowMock = createWindowMock({
      language: 'en-US',
      storageSeed: { [DEFAULT_COUNTRY_STORAGE_KEY]: 'fr' },
    });
    vi.stubGlobal('window', windowMock);
    vi.stubGlobal('navigator', windowMock.navigator);

    expect(defaultCountryCode()).toBe('fr');
  });

  it('ignores invalid saved preferences', () => {
    const windowMock = createWindowMock({
      language: 'en-US',
      storageSeed: { [DEFAULT_COUNTRY_STORAGE_KEY]: 'xx' },
    });
    vi.stubGlobal('window', windowMock);
    vi.stubGlobal('navigator', windowMock.navigator);

    expect(loadDefaultCountryPreference()).toBeUndefined();
    expect(defaultCountryCode()).toBe('us');
  });
});
