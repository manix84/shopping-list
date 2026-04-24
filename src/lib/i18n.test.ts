import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  applyDocumentLocale,
  createMessages,
  defaultLocale,
  getBrowserLocale,
  isLocaleCode,
  loadLocale,
  saveLocale,
} from './i18n';

const flattenMessageKeys = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object') return [prefix];

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    flattenMessageKeys(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
};

const flattenMessageValues = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(flattenMessageValues);
};

describe('i18n', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to browser language', () => {
    expect(getBrowserLocale('es-MX')).toBe('es');
    expect(getBrowserLocale('en-GB')).toBe('en');
  });

  it('creates translated message bundles', () => {
    expect(createMessages('en').app.title).toBe('Smart Shopping List');
    expect(createMessages('es').app.title).toBe('Lista de la compra inteligente');
  });

  it('keeps every locale message bundle in the same shape', () => {
    const englishKeys = flattenMessageKeys(createMessages('en')).sort();

    for (const locale of SUPPORTED_LOCALES) {
      expect(flattenMessageKeys(createMessages(locale)).sort()).toEqual(englishKeys);
    }
  });

  it('does not expose blank display strings', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(flattenMessageValues(createMessages(locale)).every((message) => message.trim().length > 0)).toBe(true);
    }
  });

  it('includes translations for backend, sharing, and sections UI', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const messages = createMessages(locale);

      expect(messages.backendStatus.connected).toBeTruthy();
      expect(messages.sharing.createFailed).toBeTruthy();
      expect(messages.pages.edit.sharingTitle).toBeTruthy();
      expect(messages.pages.sections.title).toBeTruthy();
      expect(messages.pages.debug.backendTitle).toBeTruthy();
      expect(messages.pages.debug.databaseExpected).toBeTruthy();
    }
  });

  it('validates locales from the supported locale list', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(isLocaleCode(locale)).toBe(true);
    }

    expect(isLocaleCode('fr')).toBe(false);
    expect(isLocaleCode(undefined)).toBe(false);
  });

  it('loads and saves locale locally', () => {
    const windowMock = createWindowMock({ language: 'es-ES' });
    vi.stubGlobal('window', windowMock);

    expect(defaultLocale()).toBe('es');
    expect(loadLocale()).toBe('es');

    saveLocale('en');
    expect(windowMock.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('applies the document language', () => {
    const documentMock = { documentElement: { lang: '' } } as Document;
    vi.stubGlobal('document', documentMock);

    applyDocumentLocale('es');

    expect(documentMock.documentElement.lang).toBe('es');
  });
});
