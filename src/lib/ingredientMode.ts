import type { CountryConfig, MeasurementDisplayMode } from '../types';

export const MEASUREMENT_DISPLAY_MODE_STORAGE_KEY = 'smart-shopping-list-measurement-display-mode-v1';
export const INGREDIENT_MODE_STORAGE_KEY = 'smart-shopping-list-ingredient-mode-v1';
export const MEASUREMENT_DISPLAY_MODES: MeasurementDisplayMode[] = ['metric', 'imperial', 'cooking'];

export const supportsIngredientMode = (_config: CountryConfig): boolean => true;

export const withMeasurementDisplayMode = (
  config: CountryConfig,
  displayMode: MeasurementDisplayMode,
): CountryConfig => {
  return {
    ...config,
    measurement: {
      ...config.measurement,
      displayMode,
    },
  };
};

export const withIngredientModeDisplay = (
  config: CountryConfig,
  enabled: boolean,
): CountryConfig => withMeasurementDisplayMode(config, enabled ? 'cooking' : 'metric');

export const isMeasurementDisplayMode = (value: unknown): value is MeasurementDisplayMode =>
  typeof value === 'string' && MEASUREMENT_DISPLAY_MODES.includes(value as MeasurementDisplayMode);

export const loadMeasurementDisplayMode = (): MeasurementDisplayMode => {
  if (typeof window === 'undefined') return 'metric';

  const storedMode = window.localStorage.getItem(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY);
  if (isMeasurementDisplayMode(storedMode)) return storedMode;

  return window.localStorage.getItem(INGREDIENT_MODE_STORAGE_KEY) === 'true' ? 'cooking' : 'metric';
};

export const saveMeasurementDisplayMode = (mode: MeasurementDisplayMode): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY, mode);
};

export const loadIngredientMode = (): boolean => loadMeasurementDisplayMode() === 'cooking';

export const saveIngredientMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(INGREDIENT_MODE_STORAGE_KEY, String(enabled));
  saveMeasurementDisplayMode(enabled ? 'cooking' : 'metric');
};
