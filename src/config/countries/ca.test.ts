import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from './ca';

describe('Canada config', () => {
  it('includes the Canadian-specific aisles', () => {
    const pantry = CA_CONFIG.groups.find((group) => group.key === 'food_pantry');
    const snacks = pantry?.sections.find((section) => section.key === 'snacks');
    const cereal = pantry?.sections.find((section) => section.key === 'cereal');
    const drinks = pantry?.sections.find((section) => section.key === 'drinks');

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
  });
});
