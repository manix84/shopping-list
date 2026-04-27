import { describe, expect, it } from 'vitest';
import { UK_CONFIG } from './uk';

describe('UK config', () => {
  it('includes the baby food aisle', () => {
    const cupboard = UK_CONFIG.groups.find((group) => group.key === 'food_cupboard');
    const babyFood = cupboard?.sections.find((section) => section.key === 'baby_food');
    const cereal = cupboard?.sections.find((section) => section.key === 'cereal');
    const drinks = cupboard?.sections.find((section) => section.key === 'drinks');
    const freezers = UK_CONFIG.groups.find((group) => group.key === 'food_freezers');
    const frozenTreats = freezers?.sections.find((section) => section.key === 'frozen_ice_cream');
    const frozenFruit = freezers?.sections.find((section) => section.key === 'frozen_fruit');
    const frozenMeals = freezers?.sections.find((section) => section.key === 'frozen_meals');

    expect(UK_CONFIG.code).toBe('uk');
    expect(babyFood?.label).toBe('Baby Food');
    expect(babyFood?.keywords).toContain('baby rice');
    expect(cereal?.label).toBe('Cereal Aisle');
    expect(cereal?.keywords).toContain('weetos');
    expect(cereal?.keywords).toContain('crunch clusters');
    expect(drinks?.label).toBe('Drinks');
    expect(drinks?.keywords).toContain('pepsi max');
    expect(drinks?.keywords).toContain('zero sprite');
    expect(drinks?.keywords).toContain('cherry pepsi max');
    expect(drinks?.keywords).toContain('lime coke zero');
    expect(frozenTreats?.keywords).toContain('ice lollies');
    expect(frozenFruit?.keywords).toContain('frozen summer fruits');
    expect(frozenFruit?.keywords).toContain('frozen cherries');
    expect(frozenMeals?.keywords).toContain('frozen garlic bread');
  });
});
