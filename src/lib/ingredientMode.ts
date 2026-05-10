import type { CountryConfig, MeasurementDisplayMode } from '../types';
import { readLocalStorageValue } from './storageKeys';

export const MEASUREMENT_DISPLAY_MODE_STORAGE_KEY = 'shoppingList:measurementDisplayMode';
const LEGACY_MEASUREMENT_DISPLAY_MODE_STORAGE_KEYS = ['smart-shopping-list-measurement-display-mode-v1'] as const;
export const LEGACY_INGREDIENT_MODE_STORAGE_KEY = 'smart-shopping-list-ingredient-mode-v1';
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

const loadLegacyIngredientMode = (): MeasurementDisplayMode | undefined => {
  const raw = window.localStorage.getItem(LEGACY_INGREDIENT_MODE_STORAGE_KEY);
  if (raw === null) { return undefined; }

  try {
    window.localStorage.removeItem(LEGACY_INGREDIENT_MODE_STORAGE_KEY);
  } catch {
    // Non-fatal: migration should still use the legacy value when cleanup is blocked.
  }

  return raw === 'true' ? 'cooking' : 'metric';
};

export const loadMeasurementDisplayMode = (): MeasurementDisplayMode => {
  if (typeof window === 'undefined') { return 'metric'; }

  const storedMode = readLocalStorageValue(
    MEASUREMENT_DISPLAY_MODE_STORAGE_KEY,
    LEGACY_MEASUREMENT_DISPLAY_MODE_STORAGE_KEYS,
  );
  if (isMeasurementDisplayMode(storedMode)) { return storedMode; }

  const legacyIngredientMode = loadLegacyIngredientMode();
  if (legacyIngredientMode) {
    window.localStorage.setItem(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY, legacyIngredientMode);
    return legacyIngredientMode;
  }

  return 'metric';
};

export const saveMeasurementDisplayMode = (mode: MeasurementDisplayMode): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY, mode);
};

export const loadIngredientMode = (): boolean => loadMeasurementDisplayMode() === 'cooking';

export const saveIngredientMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') { return; }

  saveMeasurementDisplayMode(enabled ? 'cooking' : 'metric');
};
