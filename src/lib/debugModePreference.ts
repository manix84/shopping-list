import type { DebugSettings } from '../types';
import { readLocalStorageValue } from './storageKeys';

export const DEBUG_MODE_STORAGE_KEY = 'shoppingList:debugMode';
export const DEBUG_SETTINGS_STORAGE_KEY = 'shoppingList:debugSettings';
const LEGACY_DEBUG_MODE_STORAGE_KEYS = ['smart-shopping-list-debug-mode-v1'] as const;
const LEGACY_DEBUG_SETTINGS_STORAGE_KEYS = ['smart-shopping-list-debug-settings-v1'] as const;

export const defaultDebugSettings = (): DebugSettings => ({
  forceLocalStorage: false,
  pauseBackendHeartbeat: false,
  disableAutoBackendReconnect: false,
  showPwaInstallPrompts: false,
  disablePwaSplash: false,
  disableEasterEggs: false,
  verboseConsoleDiagnostics: false,
});

export const loadDebugMode = (): boolean => {
  if (typeof window === 'undefined') { return false; }
  return readLocalStorageValue(DEBUG_MODE_STORAGE_KEY, LEGACY_DEBUG_MODE_STORAGE_KEYS) === 'true';
};

export const saveDebugMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(DEBUG_MODE_STORAGE_KEY, String(enabled));
};

export const loadDebugSettings = (): DebugSettings => {
  const fallback = defaultDebugSettings();
  if (typeof window === 'undefined') { return fallback; }

  try {
    const raw = readLocalStorageValue(DEBUG_SETTINGS_STORAGE_KEY, LEGACY_DEBUG_SETTINGS_STORAGE_KEYS);
    if (!raw) { return fallback; }

    const parsed = JSON.parse(raw) as Partial<Record<keyof DebugSettings, unknown>>;
    return {
      forceLocalStorage: parsed.forceLocalStorage === true,
      pauseBackendHeartbeat: parsed.pauseBackendHeartbeat === true,
      disableAutoBackendReconnect: parsed.disableAutoBackendReconnect === true,
      showPwaInstallPrompts: parsed.showPwaInstallPrompts === true,
      disablePwaSplash: parsed.disablePwaSplash === true,
      disableEasterEggs: parsed.disableEasterEggs === true,
      verboseConsoleDiagnostics: parsed.verboseConsoleDiagnostics === true,
    };
  } catch {
    return fallback;
  }
};

export const saveDebugSettings = (settings: DebugSettings): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(DEBUG_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};
