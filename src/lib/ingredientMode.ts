import type { CountryConfig } from '../types';

export const INGREDIENT_MODE_STORAGE_KEY = 'smart-shopping-list-ingredient-mode-v1';

export const supportsIngredientMode = (config: CountryConfig): boolean =>
  config.measurement.unitSystem !== 'metric';

export const withIngredientModeDisplay = (
  config: CountryConfig,
  enabled: boolean,
): CountryConfig => {
  if (!supportsIngredientMode(config)) return config;

  return {
    ...config,
    measurement: {
      ...config.measurement,
      displayMode: enabled ? 'source' : 'metric',
    },
  };
};

export const loadIngredientMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(INGREDIENT_MODE_STORAGE_KEY) === 'true';
};

export const saveIngredientMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INGREDIENT_MODE_STORAGE_KEY, String(enabled));
};
