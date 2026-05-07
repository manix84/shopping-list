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
    ['fr', 'moutarde de dijon', 'sauces'],
    ['fr', 'pizza surgelée', 'frozen_meals'],
    ['de', 'brötchen', 'bakery_counter'],
    ['de', 'quark', 'chilled_milk_juice_cream'],
    ['de', 'tomatenketchup', 'sauces'],
    ['de', 'tiefkühlpizza', 'frozen_meals'],
    ['it', 'prosciutto', 'deli_counter'],
    ['it', 'olio extravergine', 'cooking_ingredients'],
    ['it', 'maionese', 'sauces'],
    ['it', 'pizza surgelata', 'frozen_meals'],
    ['be', 'pistolet', 'bakery_counter'],
    ['be', 'trappist', 'alcohol'],
    ['be', 'andalouse', 'sauces'],
    ['be', 'diepvriesfrieten', 'frozen_veg'],
    ['es', 'jamón serrano', 'deli_counter'],
    ['es', 'aceite de oliva', 'cooking_ingredients'],
    ['es', 'salsa barbacoa', 'sauces'],
    ['es', 'croquetas congeladas', 'frozen_meals'],
    ['ro', 'cozonac', 'bakery_counter'],
    ['ro', 'mălai', 'pantry'],
    ['ro', 'muștar', 'sauces'],
    ['ro', 'legume congelate', 'frozen_veg'],
    ['mx', 'tortillas de maíz', 'bakery_counter'],
    ['mx', 'frijoles refritos', 'tinned_jarred'],
    ['mx', 'salsa macha', 'cooking_ingredients'],
    ['mx', 'taquitos congelados', 'frozen_meals'],
    ['nl', 'hagelslag', 'pantry'],
    ['nl', 'ketjap', 'cooking_ingredients'],
    ['nl', 'mayonaise', 'sauces'],
    ['nl', 'diepvriespizza', 'frozen_meals'],
  ] as const)('routes %s item "%s" to %s', (countryCode, input, expectedSection) => {
    expect(detectSection(input, COUNTRY_CONFIGS[countryCode])).toBe(expectedSection);
  });

  it.each([
    ['fr', 'food_freezers', 'Surgelés', 'household', 'Maison et entretien'],
    ['de', 'food_freezers', 'Tiefkühlkost', 'household', 'Haushalt'],
    ['it', 'food_freezers', 'Surgelati', 'household', 'Casa e pulizia'],
    ['be', 'food_freezers', 'Diepvries / Surgelés', 'household', 'Huishouden / Maison'],
    ['es', 'food_freezers', 'Congelados', 'household', 'Hogar y limpieza'],
    ['ro', 'food_freezers', 'Congelate', 'household', 'Casă și curățenie'],
    ['mx', 'food_pantry', 'Abarrotes', 'household', 'Hogar y limpieza'],
    ['nl', 'food_freezers', 'Diepvries', 'household', 'Huishouden'],
  ] as const)(
    'localizes store labels for %s',
    (countryCode, groupKey, expectedGroupLabel, sectionKey, expectedSectionLabel) => {
      const config = COUNTRY_CONFIGS[countryCode];
      const group = config.groups.find((candidate) => candidate.key === groupKey);
      const section = config.groups
        .flatMap((candidate) => candidate.sections)
        .find((candidate) => candidate.key === sectionKey);

      expect(group?.label).toBe(expectedGroupLabel);
      expect(section?.label).toBe(expectedSectionLabel);
    },
  );
});
