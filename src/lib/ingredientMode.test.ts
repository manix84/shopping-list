import { afterEach, describe, expect, it, vi } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import {
  INGREDIENT_MODE_STORAGE_KEY,
  MEASUREMENT_DISPLAY_MODE_STORAGE_KEY,
  isMeasurementDisplayMode,
  loadMeasurementDisplayMode,
  saveMeasurementDisplayMode,
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
});
