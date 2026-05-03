import { describe, expect, it } from 'vitest';
import { detectSection } from '../../lib/sections';
import { COUNTRY_CONFIGS, isCountryCode } from './index';

const expectedCountries = ['fr', 'de', 'it', 'be', 'es', 'ro', 'mx', 'nl'] as const;

describe('international country configs', () => {
  it('registers the additional country profiles', () => {
    for (const countryCode of expectedCountries) {
      expect(isCountryCode(countryCode)).toBe(true);
      expect(COUNTRY_CONFIGS[countryCode].measurement).toEqual({
        unitSystem: 'metric',
        displayMode: 'metric',
      });
      expect(COUNTRY_CONFIGS[countryCode].groups.length).toBeGreaterThan(0);
    }
  });

  it.each([
    ['fr', 'baguette', 'bakery_counter'],
    ['fr', 'moutarde de dijon', 'tinned_jarred'],
    ['de', 'brötchen', 'bakery_counter'],
    ['de', 'quark', 'chilled_milk_juice_cream'],
    ['it', 'prosciutto', 'deli_counter'],
    ['it', 'olio extravergine', 'cooking_ingredients'],
    ['be', 'pistolet', 'bakery_counter'],
    ['be', 'trappist', 'alcohol'],
    ['es', 'jamón serrano', 'deli_counter'],
    ['es', 'aceite de oliva', 'cooking_ingredients'],
    ['ro', 'cozonac', 'bakery_counter'],
    ['ro', 'mălai', 'pantry'],
    ['mx', 'tortillas de maíz', 'bakery_counter'],
    ['mx', 'frijoles refritos', 'tinned_jarred'],
    ['nl', 'hagelslag', 'pantry'],
    ['nl', 'ketjap', 'cooking_ingredients'],
  ] as const)('routes %s item "%s" to %s', (countryCode, input, expectedSection) => {
    expect(detectSection(input, COUNTRY_CONFIGS[countryCode])).toBe(expectedSection);
  });
});
