import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  THEME_STORAGE_KEY,
  defaultThemeMode,
  getResolvedTheme,
  getThemeLabel,
  loadThemeMode,
  saveThemeMode,
} from './themePreference';

describe('theme preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to system', () => {
    expect(defaultThemeMode()).toBe('system');
  });

  it('loads and saves locally', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    saveThemeMode('dark');
    expect(windowMock.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(loadThemeMode()).toBe('dark');
  });

  it('falls back when the saved theme is invalid or storage is unavailable', () => {
    vi.stubGlobal('window', createWindowMock({ storageSeed: { [THEME_STORAGE_KEY]: 'sepia' } }));
    expect(loadThemeMode()).toBe('system');

    vi.unstubAllGlobals();
    expect(loadThemeMode()).toBe('system');
    expect(() => saveThemeMode('dark')).not.toThrow();
  });

  it('resolves theme from system preference', () => {
    vi.stubGlobal('window', createWindowMock({ prefersDark: true }));
    expect(getResolvedTheme('system')).toBe('dark');
    expect(getResolvedTheme('light')).toBe('light');
  });

  it('resolves system theme to light when dark preference is unavailable', () => {
    expect(getResolvedTheme('system')).toBe('light');
  });

  it('formats labels', () => {
    expect(getThemeLabel('system')).toBe('System preference');
    expect(getThemeLabel('dark')).toBe('Dark');
  });
});
