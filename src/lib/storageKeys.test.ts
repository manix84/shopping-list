import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import { hasLocalStorageValue, readLocalStorageValue } from './storageKeys';

describe('storage key helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the current key and removes legacy keys', () => {
    const windowMock = createWindowMock({
      storageSeed: {
        'shoppingList:test': 'current',
        'smart-shopping-list-test-v1': 'legacy',
      },
    });
    vi.stubGlobal('window', windowMock);

    expect(readLocalStorageValue('shoppingList:test', ['smart-shopping-list-test-v1'])).toBe('current');
    expect(windowMock.localStorage.getItem('shoppingList:test')).toBe('current');
    expect(windowMock.localStorage.getItem('smart-shopping-list-test-v1')).toBeNull();
  });

  it('migrates a legacy key to the current key and removes the legacy key', () => {
    const windowMock = createWindowMock({
      storageSeed: {
        'smart-shopping-list-test-v1': 'legacy',
      },
    });
    vi.stubGlobal('window', windowMock);

    expect(readLocalStorageValue('shoppingList:test', ['smart-shopping-list-test-v1'])).toBe('legacy');
    expect(windowMock.localStorage.getItem('shoppingList:test')).toBe('legacy');
    expect(windowMock.localStorage.getItem('smart-shopping-list-test-v1')).toBeNull();
  });

  it('returns the legacy value if migration is blocked', () => {
    const windowMock = createWindowMock({
      storageSeed: {
        'smart-shopping-list-test-v1': 'legacy',
      },
    });
    vi.spyOn(windowMock.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.stubGlobal('window', windowMock);

    expect(readLocalStorageValue('shoppingList:test', ['smart-shopping-list-test-v1'])).toBe('legacy');
  });

  it('returns null when localStorage reads throw', () => {
    const windowMock = createWindowMock();
    vi.spyOn(windowMock.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.stubGlobal('window', windowMock);

    expect(readLocalStorageValue('shoppingList:test', ['smart-shopping-list-test-v1'])).toBeNull();
    expect(hasLocalStorageValue('shoppingList:test', ['smart-shopping-list-test-v1'])).toBe(false);
  });

  it('returns null when window is unavailable', () => {
    expect(readLocalStorageValue('shoppingList:test', ['smart-shopping-list-test-v1'])).toBeNull();
  });
});
