import { afterEach, describe, expect, it, vi } from 'vitest';
import { UK_CONFIG } from '../../config/countries/uk';
import { STORAGE_KEY, localStorageRepository } from './localStorageRepository';
import { parseItems } from '../parser';
import { createWindowMock } from '../../test/testUtils';

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
    });
    expect(loaded.items).toHaveLength(0);
  });

  it('saves, loads, and clears records', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    const input = 'small milk\nbananas x2';
    const record = {
      input,
      items: parseItems(input, UK_CONFIG),
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk' as const,
    };

    localStorageRepository.save(record);
    expect(windowMock.localStorage.getItem(STORAGE_KEY)).toContain('"countryCode":"uk"');

    const loaded = localStorageRepository.load();
    expect(loaded).toMatchObject({
      input,
      updatedAt: record.updatedAt,
      countryCode: 'uk',
    });
    expect(loaded.items).toHaveLength(2);

    localStorageRepository.clear();
    expect(windowMock.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
