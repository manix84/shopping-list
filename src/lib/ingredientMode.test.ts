import { afterEach, describe, expect, it, vi } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import {
  INGREDIENT_MODE_STORAGE_KEY,
  MEASUREMENT_DISPLAY_MODE_STORAGE_KEY,
  isMeasurementDisplayMode,
  loadIngredientMode,
  loadMeasurementDisplayMode,
  saveIngredientMode,
  saveMeasurementDisplayMode,
  withIngredientModeDisplay,
  withMeasurementDisplayMode,
} from './ingredientMode';

describe('measurement display mode preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('recognizes supported measurement display modes', () => {
    expect(isMeasurementDisplayMode('metric')).toBe(true);
    expect(isMeasurementDisplayMode('imperial')).toBe(true);
    expect(isMeasurementDisplayMode('cooking')).toBe(true);
    expect(isMeasurementDisplayMode('cups')).toBe(false);
    expect(isMeasurementDisplayMode(null)).toBe(false);
  });

  it('switches country profiles between display modes', () => {
    expect(withMeasurementDisplayMode(CA_CONFIG, 'metric').measurement).toEqual({
      unitSystem: 'canadian-customary',
      displayMode: 'metric',
    });
    expect(withMeasurementDisplayMode(CA_CONFIG, 'imperial').measurement).toEqual({
      unitSystem: 'canadian-customary',
      displayMode: 'imperial',
    });
    expect(withMeasurementDisplayMode(UK_CONFIG, 'cooking').measurement).toEqual({
      unitSystem: 'metric',
      displayMode: 'cooking',
    });
  });

  it('keeps the old boolean ingredient display semantics', () => {
    const imperialConfig = withMeasurementDisplayMode(UK_CONFIG, 'imperial');

    expect(withIngredientModeDisplay(imperialConfig, true).measurement).toEqual({
      unitSystem: 'metric',
      displayMode: 'cooking',
    });
    expect(withIngredientModeDisplay(imperialConfig, false).measurement).toEqual({
      unitSystem: 'metric',
      displayMode: 'metric',
    });
  });

  it('persists the measurement display mode', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    expect(loadMeasurementDisplayMode()).toBe('metric');
    saveMeasurementDisplayMode('imperial');
    expect(storage.get(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY)).toBe('imperial');
    expect(loadMeasurementDisplayMode()).toBe('imperial');
  });

  it('migrates the old ingredient mode toggle when no display mode is stored', () => {
    const storage = new Map<string, string>([[INGREDIENT_MODE_STORAGE_KEY, 'true']]);
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    expect(loadMeasurementDisplayMode()).toBe('cooking');
  });

  it('keeps the old boolean ingredient mode storage wrappers working', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    saveIngredientMode(true);
    expect(storage.get(INGREDIENT_MODE_STORAGE_KEY)).toBe('true');
    expect(storage.get(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY)).toBe('cooking');
    expect(loadIngredientMode()).toBe(true);

    saveIngredientMode(false);
    expect(storage.get(INGREDIENT_MODE_STORAGE_KEY)).toBe('false');
    expect(storage.get(MEASUREMENT_DISPLAY_MODE_STORAGE_KEY)).toBe('metric');
    expect(loadIngredientMode()).toBe(false);
  });
});
