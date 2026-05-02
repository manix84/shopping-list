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

  it('is available for every country profile', () => {
    expect(supportsIngredientMode(UK_CONFIG)).toBe(true);
    expect(supportsIngredientMode(CA_CONFIG)).toBe(true);
  });

  it('switches country profiles between baseline and cooking display', () => {
    expect(withIngredientModeDisplay(CA_CONFIG, false).measurement).toEqual({
      unitSystem: 'canadian-customary',
      displayMode: 'metric',
    });
    expect(withIngredientModeDisplay(CA_CONFIG, true).measurement).toEqual({
      unitSystem: 'canadian-customary',
      displayMode: 'cooking',
    });
    expect(withIngredientModeDisplay(UK_CONFIG, true).measurement).toEqual({
      unitSystem: 'metric',
      displayMode: 'cooking',
    });
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
