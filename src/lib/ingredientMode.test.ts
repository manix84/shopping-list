import { afterEach, describe, expect, it, vi } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import {
  INGREDIENT_MODE_STORAGE_KEY,
  loadIngredientMode,
  saveIngredientMode,
  supportsIngredientMode,
  withIngredientModeDisplay,
} from './ingredientMode';

describe('ingredient mode preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is available for cup and spoon country profiles only', () => {
    expect(supportsIngredientMode(UK_CONFIG)).toBe(false);
    expect(supportsIngredientMode(CA_CONFIG)).toBe(true);
  });

  it('switches cup and spoon countries between metric and source display', () => {
    expect(withIngredientModeDisplay(CA_CONFIG, false).measurement).toEqual({
      unitSystem: 'canadian-customary',
      displayMode: 'metric',
    });
    expect(withIngredientModeDisplay(CA_CONFIG, true).measurement).toEqual({
      unitSystem: 'canadian-customary',
      displayMode: 'source',
    });
    expect(withIngredientModeDisplay(UK_CONFIG, true)).toBe(UK_CONFIG);
  });

  it('persists the ingredient mode toggle', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    expect(loadIngredientMode()).toBe(false);
    saveIngredientMode(true);
    expect(storage.get(INGREDIENT_MODE_STORAGE_KEY)).toBe('true');
    expect(loadIngredientMode()).toBe(true);
  });
});
