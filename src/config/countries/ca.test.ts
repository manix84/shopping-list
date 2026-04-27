import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from './ca';

describe('Canada config', () => {
  it('includes the Canadian-specific aisles', () => {
    const pantry = CA_CONFIG.groups.find((group) => group.key === 'food_pantry');
    const snacks = pantry?.sections.find((section) => section.key === 'snacks');
    const cereal = pantry?.sections.find((section) => section.key === 'cereal');
    const drinks = pantry?.sections.find((section) => section.key === 'drinks');
    const freezers = CA_CONFIG.groups.find((group) => group.key === 'food_freezers');
    const frozenTreats = freezers?.sections.find((section) => section.key === 'frozen_ice_cream');
    const frozenFruit = freezers?.sections.find((section) => section.key === 'frozen_fruit');
    const frozenMeals = freezers?.sections.find((section) => section.key === 'frozen_meals');

    expect(CA_CONFIG.code).toBe('ca');
    expect(CA_CONFIG.label).toBe('Canada');
    expect(snacks?.keywords).toContain('ketchup chips');
    expect(cereal?.keywords).toContain('shreddies');
    expect(cereal?.keywords).toContain('vector cereal');
    expect(drinks?.keywords).toContain('pop');
    expect(drinks?.keywords).toContain('canada dry');
    expect(drinks?.keywords).toContain('lemon pepsi zero');
    expect(drinks?.keywords).not.toContain('lemon pepsi max');
    expect(drinks?.keywords).toContain('coke zero cherry');
    expect(frozenTreats?.keywords).toContain('frozen yogurt');
    expect(frozenFruit?.keywords).toContain('summer fruits');
    expect(frozenMeals?.keywords).toContain('frozen perogies');
  });
});
