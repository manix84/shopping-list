import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  I18nProvider,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  applyDocumentLocale,
  createMessages,
  defaultLocale,
  getDocumentLocale,
  getBrowserLocale,
  getRouteViewLabel,
  isLocaleCode,
  loadLocale,
  resolveLocale,
  saveLocale,
  useI18n,
} from './i18n';

const flattenMessageKeys = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object') { return [prefix]; }

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    flattenMessageKeys(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
};

const flattenMessageValues = (value: unknown): string[] => {
  if (typeof value === 'string') { return [value]; }
  if (!value || typeof value !== 'object') { return []; }
  return Object.values(value).flatMap(flattenMessageValues);
};

describe('i18n', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to browser language', () => {
    expect(getBrowserLocale('es-MX')).toBe('es');
    expect(getBrowserLocale('fr-FR')).toBe('fr');
    expect(getBrowserLocale('de-DE')).toBe('de');
    expect(getBrowserLocale('nl-NL')).toBe('nl');
    expect(getBrowserLocale('it-IT')).toBe('it');
    expect(getBrowserLocale('ro-RO')).toBe('ro');
    expect(getBrowserLocale('en-GB')).toBe('en');
  });

  it('falls back to English for unsupported browser languages', () => {
    expect(getBrowserLocale('pt-BR')).toBe('en');
    expect(getBrowserLocale('')).toBe('en');
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

    expect(isLocaleCode('xx')).toBe(false);
    expect(isLocaleCode(undefined)).toBe(false);
    expect(resolveLocale('nl')).toBe('nl');
    expect(resolveLocale('pirate')).toBe('en');
  });

  it('uses the saved locale before browser defaults and ignores invalid saved values', () => {
    const windowMock = createWindowMock({ language: 'fr-FR' });
    vi.stubGlobal('window', windowMock);

    windowMock.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    expect(loadLocale()).toBe('de');

    windowMock.localStorage.setItem(LOCALE_STORAGE_KEY, 'xx');
    expect(loadLocale()).toBe('fr');
  });

  it('loads and saves locale locally', () => {
    const windowMock = createWindowMock({ language: 'es-ES' });
    vi.stubGlobal('window', windowMock);

    expect(defaultLocale()).toBe('es');
    expect(loadLocale()).toBe('es');

    saveLocale('fr');
    expect(windowMock.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
  });

  it('applies the document language', () => {
    const documentMock = { documentElement: { lang: '' } } as Document;
    vi.stubGlobal('document', documentMock);

    applyDocumentLocale('pi');

    expect(documentMock.documentElement.lang).toBe('en-x-pirate');
    expect(getDocumentLocale('en')).toBe('en-GB');
    expect(getDocumentLocale('es')).toBe('es');
  });

  it('returns localized route view labels', () => {
    const messages = createMessages('en');

    expect(getRouteViewLabel('default', messages)).toBe(messages.pages.route.viewDefault);
    expect(getRouteViewLabel('comfortable', messages)).toBe(messages.pages.route.viewComfortable);
    expect(getRouteViewLabel('compact', messages)).toBe(messages.pages.route.viewCompact);
  });

  it('provides i18n context through the hook', () => {
    const messages = createMessages('en');
    const Component = () => {
      const i18n = useI18n();
      return createElement('span', null, i18n.messages.app.title);
    };

    expect(
      renderToString(
        createElement(
          I18nProvider,
          { value: { locale: 'en', messages, setLocale: () => undefined } },
          createElement(Component),
        ),
      ),
    ).toContain('Smart Shopping List');
  });

  it('throws when the i18n hook is used outside its provider', () => {
    const Component = () => {
      useI18n();
      return null;
    };

    expect(() => renderToString(createElement(Component))).toThrow('useI18n must be used within an I18nProvider');
  });
});
