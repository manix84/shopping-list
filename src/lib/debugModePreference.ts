export const DEBUG_MODE_STORAGE_KEY = 'smart-shopping-list-debug-mode-v1';

export const loadDebugMode = (): boolean => {
  if (typeof window === 'undefined') { return false; }
  return window.localStorage.getItem(DEBUG_MODE_STORAGE_KEY) === 'true';
};

export const saveDebugMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(DEBUG_MODE_STORAGE_KEY, String(enabled));
};
