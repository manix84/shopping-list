import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import { DEBUG_MODE_STORAGE_KEY, loadDebugMode, saveDebugMode } from './debugModePreference';

describe('debug mode preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to disabled', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    expect(loadDebugMode()).toBe(false);
  });

  it('loads and saves enabled debug mode', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    saveDebugMode(true);

    expect(windowMock.localStorage.getItem(DEBUG_MODE_STORAGE_KEY)).toBe('true');
    expect(loadDebugMode()).toBe(true);
  });

  it('loads false values as disabled', () => {
    const windowMock = createWindowMock({
      storageSeed: { [DEBUG_MODE_STORAGE_KEY]: 'false' },
    });
    vi.stubGlobal('window', windowMock);

    expect(loadDebugMode()).toBe(false);
  });
});
