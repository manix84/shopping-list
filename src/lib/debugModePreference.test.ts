import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  DEBUG_MODE_STORAGE_KEY,
  DEBUG_SETTINGS_STORAGE_KEY,
  defaultDebugSettings,
  loadDebugMode,
  loadDebugSettings,
  saveDebugMode,
  saveDebugSettings,
} from './debugModePreference';

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

  it('loads default debug settings when nothing is saved', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    expect(loadDebugSettings()).toEqual(defaultDebugSettings());
  });

  it('round-trips debug settings through local storage', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);
    const settings = {
      ...defaultDebugSettings(),
      forceLocalStorage: true,
      pauseBackendHeartbeat: true,
      disableAutoBackendReconnect: true,
      showPwaInstallPrompts: true,
      disablePwaSplash: true,
      disableEasterEggs: true,
      verboseConsoleDiagnostics: true,
    };

    saveDebugSettings(settings);

    expect(JSON.parse(windowMock.localStorage.getItem(DEBUG_SETTINGS_STORAGE_KEY) ?? '{}')).toEqual(settings);
    expect(loadDebugSettings()).toEqual(settings);
  });

  it('falls back to default debug settings when saved JSON is malformed', () => {
    const windowMock = createWindowMock({
      storageSeed: { [DEBUG_SETTINGS_STORAGE_KEY]: '{not-json' },
    });
    vi.stubGlobal('window', windowMock);

    expect(loadDebugSettings()).toEqual(defaultDebugSettings());
  });

  it('only loads explicit true debug settings as enabled', () => {
    const windowMock = createWindowMock({
      storageSeed: {
        [DEBUG_SETTINGS_STORAGE_KEY]: JSON.stringify({
          forceLocalStorage: true,
          pauseBackendHeartbeat: 'true',
          disableAutoBackendReconnect: 1,
          showPwaInstallPrompts: false,
          disablePwaSplash: null,
          disableEasterEggs: true,
          verboseConsoleDiagnostics: 'yes',
        }),
      },
    });
    vi.stubGlobal('window', windowMock);

    expect(loadDebugSettings()).toEqual({
      ...defaultDebugSettings(),
      forceLocalStorage: true,
      disableEasterEggs: true,
    });
  });
});
