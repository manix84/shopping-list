import type { ThemeMode } from '../types';

export const THEME_STORAGE_KEY = 'smart-shopping-list-theme-v1';

export const defaultThemeMode = (): ThemeMode => 'system';

export const loadThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') { return defaultThemeMode(); }

  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : defaultThemeMode();
};

export const saveThemeMode = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
};

export const getResolvedTheme = (mode: ThemeMode): 'light' | 'dark' =>
  mode === 'system'
    ? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : mode;

export const getThemeLabel = (mode: ThemeMode): string =>
  mode === 'system' ? 'System preference' : mode.charAt(0).toUpperCase() + mode.slice(1);
