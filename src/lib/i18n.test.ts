import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  LOCALE_STORAGE_KEY,
  applyDocumentLocale,
  createMessages,
  defaultLocale,
  getBrowserLocale,
  loadLocale,
  saveLocale,
} from './i18n';

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
