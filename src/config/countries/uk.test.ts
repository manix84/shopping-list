import { describe, expect, it } from 'vitest';
import { UK_CONFIG } from './uk';

describe('UK config', () => {
  it('includes the baby food aisle', () => {
    const cupboard = UK_CONFIG.groups.find((group) => group.key === 'food_cupboard');
    const babyFood = cupboard?.sections.find((section) => section.key === 'baby_food');
    const cereal = cupboard?.sections.find((section) => section.key === 'cereal');

    expect(UK_CONFIG.code).toBe('uk');
    expect(babyFood?.label).toBe('Baby Food');
    expect(babyFood?.keywords).toContain('baby rice');
    expect(cereal?.label).toBe('Cereal Aisle');
    expect(cereal?.keywords).toContain('weetos');
    expect(cereal?.keywords).toContain('crunch clusters');
  });
});
