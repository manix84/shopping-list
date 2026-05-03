import { afterEach, describe, expect, it, vi } from 'vitest';
import { UK_CONFIG } from '../../config/countries/uk';
import { STORAGE_KEY, hasStoredShoppingListRecord, localStorageRepository } from './localStorageRepository';
import { parseItems } from '../parser';
import { createWindowMock } from '../../test/testUtils';
import { isUuidV7 } from '../uuid';

describe('localStorageRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads a blank record when storage is empty', () => {
    vi.stubGlobal('window', createWindowMock());

    const loaded = localStorageRepository.load();

    expect(loaded).toMatchObject({
      input: '',
      countryCode: 'uk',
      serverBacked: false,
    });
    expect(isUuidV7(loaded.listId)).toBe(true);
    expect(loaded.items).toHaveLength(0);
  });

  it('saves, loads, and clears records', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    const input = 'small milk\nbananas x2';
    const record = {
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
      serverBacked: true,
      input,
      items: parseItems(input, UK_CONFIG),
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk' as const,
    };

    localStorageRepository.save(record);
    expect(windowMock.localStorage.getItem(STORAGE_KEY)).toContain('"countryCode":"uk"');

    const loaded = localStorageRepository.load();
    expect(loaded).toMatchObject({
      listId: record.listId,
      serverBacked: true,
      input,
      updatedAt: record.updatedAt,
      countryCode: 'uk',
    });
    expect(loaded.items).toHaveLength(2);

    localStorageRepository.clear();
    expect(windowMock.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('falls back to a blank record when stored JSON is invalid', () => {
    vi.stubGlobal('window', createWindowMock({ storageSeed: { [STORAGE_KEY]: 'not json' } }));

    const loaded = localStorageRepository.load();

    expect(loaded).toMatchObject({
      input: '',
      countryCode: 'uk',
      serverBacked: false,
    });
    expect(loaded.items).toHaveLength(0);
  });

  it('reports whether a local record exists', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    expect(hasStoredShoppingListRecord()).toBe(false);
    windowMock.localStorage.setItem(STORAGE_KEY, '{}');
    expect(hasStoredShoppingListRecord()).toBe(true);
  });

  it('no-ops without a browser window', () => {
    expect(hasStoredShoppingListRecord()).toBe(false);
    expect(() => localStorageRepository.save({
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
      serverBacked: false,
      input: '',
      items: [],
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk',
    })).not.toThrow();
    expect(() => localStorageRepository.clear()).not.toThrow();
    expect(localStorageRepository.load()).toMatchObject({ input: '', countryCode: 'uk' });
  });
});
